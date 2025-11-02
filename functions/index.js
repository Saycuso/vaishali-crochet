const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const logger = require("firebase-functions/logger");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();
const {FieldValue} = admin.firestore;

setGlobalOptions({region: "us-central1"});

function getShippingCost(pincode) {
  if (!pincode || pincode.length < 3) return 100;
  const firstTwoDigits = pincode.substring(0, 2);
  if (["40", "41", "42", "43", "44"].includes(firstTwoDigits)) return 80;
  return 100;
}

function verifyRazorpaySignature(body, signature) {
  const secret = process.env.RAZORPAY_SECRET;
  if (!secret) return false;
  const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");
  return expectedSignature === signature;
}

exports.createOrder = onCall(
    {secrets: ["RAZORPAY_ID", "RAZORPAY_SECRET"]},
    async (request) => {
      if (!request.auth) throw new HttpsError("unauthenticated", "Login required.");

      const {uid} = request.auth;
      const {customerInfo, items} = request.data;
      const currency = "INR";

      if (!items || items.length === 0 || !customerInfo) {
        throw new HttpsError("invalid-argument", "Missing cart data.");
      }

      let subtotal = 0;
      const productPromises = items.map(async (item) => {
        const productRef = db.collection("Products").doc(item.productId);
        const productDoc = await productRef.get();
        if (!productDoc.exists) {
          throw new HttpsError("not-found", `Product ${item.productId} not found.`);
        }
        const price = productDoc.data().price;
        subtotal += price * item.quantity;
      });

      await Promise.all(productPromises);

      const shipping = getShippingCost(customerInfo.pincode);
      const totalAmount = subtotal + shipping;
      const totalAmountInPaise = Math.round(totalAmount * 100);

      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
      });

      const options = {
        amount: totalAmountInPaise,
        currency,
        receipt: `${uid}_${Date.now().toString().slice(-10)}`,
        payment_capture: 1,
        notes: {userId: uid, itemCount: items.length},
      };

      try {
        const order = await razorpay.orders.create(options);

        const orderData = {
          userId: uid,
          orderId: order.id,
          items,
          customerInfo,
          totalAmount,
          subtotal,
          shipping,
          status: "created",
          createdAt: FieldValue.serverTimestamp(),
        };

        const userOrderRef = db.collection("users").doc(uid).collection("orders").doc(order.id);
        await userOrderRef.set(orderData);

        const adminOrderRef = db.collection("orders").doc(order.id);
        await adminOrderRef.set(orderData);

        return {
          orderId: order.id,
          currency: order.currency,
          amount: order.amount,
          key_id: process.env.RAZORPAY_ID,
        };
      } catch (error) {
        logger.error("Razorpay Order Creation Failed:", error);
        let errorMessage = "Order creation failed.";
        if (error && error.description) errorMessage = error.description;
        else if (error && error.message) errorMessage = error.message;
        else if (error) errorMessage = error.toString();
        throw new HttpsError("internal", errorMessage);
      }
    },
);

exports.verifyAndDeductStock = onCall(
    {secrets: ["RAZORPAY_SECRET", "BREVO_HOST", "BREVO_USER", "BREVO_PASS"]},
    async (request) => {
      if (!request.auth) throw new HttpsError("unauthenticated", "Login required.");

      const {uid} = request.auth;
      const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = request.data;
      const body = razorpay_order_id + "|" + razorpay_payment_id;

      if (!verifyRazorpaySignature(body, razorpay_signature)) {
        logger.warn("Signature verification failed for order:", razorpay_order_id);
        throw new HttpsError("unauthenticated", "Verification failed. Potential fraud.");
      }

      const userOrderRef = db.collection("users").doc(uid).collection("orders").doc(razorpay_order_id);
      const adminOrderRef = db.collection("orders").doc(razorpay_order_id);
      let customerEmail = "";

      try {
        await db.runTransaction(async (transaction) => {
          const orderDoc = await transaction.get(userOrderRef);
          if (!orderDoc.exists) throw new Error("Order not found.");

          const orderData = orderDoc.data();
          if (orderData.status === "captured") return;

          customerEmail = orderData.customerInfo.email;

          for (const item of orderData.items) {
            const productRef = db.collection("Products").doc(item.productId);
            const productDoc = await transaction.get(productRef);

            if (!productDoc.exists) throw new Error(`Product not found: ${item.productId}`);

            const currentStock = productDoc.data().stockQuantity;
            const quantityToDeduct = item.quantity;

            if (currentStock < quantityToDeduct) {
              transaction.update(userOrderRef, {status: "failed_out_of_stock", failedItem: item.productId});
              transaction.update(adminOrderRef, {status: "failed_out_of_stock", failedItem: item.productId});
              throw new Error(`Insufficient stock for product: ${item.productId}`);
            }

            const newStock = currentStock - quantityToDeduct;
            transaction.update(productRef, {stockQuantity: newStock});
          }

          const updateData = {
            status: "captured",
            paymentId: razorpay_payment_id,
            verifiedAt: FieldValue.serverTimestamp(),
          };

          transaction.update(userOrderRef, updateData);
          transaction.update(adminOrderRef, updateData);
        });

        if (customerEmail) {
          if (!process.env.BREVO_HOST || !process.env.BREVO_USER || !process.env.BREVO_PASS) {
            logger.warn(`Brevo secrets not set for order: ${razorpay_order_id}. Skipping email.`);
          } else {
            const transporter = nodemailer.createTransport({
              host: process.env.BREVO_HOST,
              port: 587,
              secure: false,
              auth: {user: process.env.BREVO_USER, pass: process.env.BREVO_PASS},
            });

            const mailOptions = {
              from: "\"Vaishali's Crochet Store\" <reactretro510@gmail.com>",
              to: customerEmail,
              subject: `Order Confirmation #${razorpay_order_id}`,
              html: `<h1>Order Confirmation</h1><p>Thank you for your order!</p><p><strong>Order ID:</strong> ${razorpay_order_id}</p>`,
            };

            await transporter.sendMail(mailOptions);
            logger.info(`Email sent for Order: ${razorpay_order_id}`);
          }
        }

        return {status: "success", orderId: razorpay_order_id};
      } catch (error) {
        logger.error("Stock Deduction or Email Failed:", error);
        let errorMessage = "Verification failed.";
        if (error && error.description) errorMessage = error.description;
        else if (error && error.message) errorMessage = error.message;
        else if (error) errorMessage = error.toString();
        throw new HttpsError("internal", errorMessage);
      }
    },
);

exports.updateProductStock = onCall(
    {secrets: []},
    async (request) => {
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be logged in.");
      }

      const ADMIN_UIDS = [
        "tCtCJFrbLSOjovxpSmpCrpXw4du2", // <-- Your actual UID goes here
        "xhvNtNlEF2gWU5G3BVetiUbBTZH2", // <-- Your Mom's actual UID goes here
      ];

      if (!ADMIN_UIDS.includes(request.auth.uid)) {
        throw new HttpsError("permission-denied", "You must be an admin to do this.");
      }

      // --- 🛠️ NEW LOGIC ---
      const {productId, newStock, variantIndex} = request.data; // 👈 Get variantIndex

      if (!productId || newStock === undefined || newStock < 0) {
        throw new HttpsError("invalid-argument", "Invalid product ID or stock quantity.");
      }

      const productRef = db.collection("Products").doc(productId);

      try {
        if (variantIndex === null || variantIndex === undefined) {
        // This is a SIMPLE product. Update top-level stock.
          await productRef.update({
            stockQuantity: Number(newStock),
          });
        } else {
        // This is a VARIABLE product. Update the stock *inside* the array.
          const docSnap = await productRef.get();
          if (!docSnap.exists) throw new Error("Product not found");

          const productData = docSnap.data();
          const variants = productData.variants; // Get the whole array

          // Check if the index is valid
          if (variants && variants[variantIndex]) {
          // Update the stock at the specific index
            variants[variantIndex].stockQuantity = Number(newStock);

            // Write the entire modified 'variants' array back
            await productRef.update({
              variants: variants,
            });
          } else {
            throw new Error("Variant index not found.");
          }
        }
        // --- 🛠️ END NEW LOGIC ---

        logger.info(`Stock updated for ${productId} to ${newStock} by admin ${request.auth.uid}`);
        return {status: "success", productId: productId, newStock: newStock};
      } catch (error) {
        logger.error("Stock Update Failed:", error);
        throw new HttpsError("internal", "Stock update failed: " + error.message);
      }
    },
);