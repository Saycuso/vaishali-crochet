/* eslint-disable no-unused-vars */
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

const ADMIN_UIDS = [
  "tCtCJFrbLSOjovxpSmpCrpXw4du2",
  "dMH1JKeZw9Yh9xTuwheWmc8Vhux2",
];

// --- Helper Functions (No changes) ---
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

// --- 🛠️ 1. UPDATED createOrder ---
// This function now understands 'variantIndex'
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
      // This array will hold the final, verified items for the order
      const verifiedItems = [];

      const productPromises = items.map(async (item) => {
        // Your frontend MUST send productId, quantity, and variantIndex
        if (!item.productId || !item.quantity) {
          logger.error("Malformed item in cart:", item);
          throw new HttpsError("invalid-argument", "Malformed item in cart. Missing productId or quantity.");
        }

        const productRef = db.collection("Products").doc(item.productId);
        const productDoc = await productRef.get();
        if (!productDoc.exists) {
          throw new HttpsError("not-found", `Product ${item.productId} not found.`);
        }

        const productData = productDoc.data();
        let price;
        let stock;
        const itemData = {...item}; // Copy item data

        // Check if this is a variable product or simple product
        if (item.variantIndex !== null && item.variantIndex !== undefined) {
          // --- It's a VARIABLE product ---
          if (!productData.variants || !productData.variants[item.variantIndex]) {
            throw new HttpsError("not-found", `Variant ${item.variantIndex} for product ${item.productId} not found.`);
          }
          const variant = productData.variants[item.variantIndex];
          price = variant.price;
          stock = variant.stockQuantity;
          // Add variant details to the order item
          itemData.name = productData.name; // Main product name
          itemData.variantName = variant.name; // Variant name
          itemData.images = variant.images; // Variant images
        } else {
          // --- It's a SIMPLE product ---
          price = productData.price;
          stock = productData.stockQuantity;
          // Add product details to the order item
          itemData.name = productData.name;
          itemData.images = productData.images;
        }

        // Final checks
        if (price === undefined) throw new HttpsError("internal", `Price for ${item.productId} is not set.`);
        if (stock === undefined) throw new HttpsError("internal", `Stock for ${item.productId} is not set.`);
        if (stock < item.quantity) throw new HttpsError("invalid-argument", `Not enough stock for ${productData.name}.`);

        subtotal += price * item.quantity;
        itemData.price = price; // Store the *verified* price
        verifiedItems.push(itemData);
      });

      await Promise.all(productPromises);

      const shipping = getShippingCost(customerInfo.pincode);
      const totalAmount = subtotal + shipping;
      const totalAmountInPaise = Math.round(totalAmount * 100);

      // Check for NaN or 0 amount, which Razorpay rejects
      if (!totalAmountInPaise || totalAmountInPaise <= 0) {
        logger.error("Invalid order amount:", totalAmountInPaise);
        throw new HttpsError("internal", "Total amount is invalid. Check product prices.");
      }

      const options = {
        amount: totalAmountInPaise,
        currency,
        receipt: `${uid}_${Date.now().toString().slice(-10)}`,
        payment_capture: 1,
        notes: {userId: uid, itemCount: items.length},
      };

      try {
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_ID,
          key_secret: process.env.RAZORPAY_SECRET,
        });

        const order = await razorpay.orders.create(options);

        const orderData = {
          userId: uid,
          orderId: order.id,
          items: verifiedItems, // 👈 Use the new verified items array
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

// --- 🛠️ 2. UPDATED verifyAndDeductStock ---
// This function now understands 'variantIndex'
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

            const productData = productDoc.data();
            const quantityToDeduct = item.quantity;
            const variantIndex = item.variantIndex; // 👈 Get variantIndex from the order item

            if (variantIndex !== null && variantIndex !== undefined) {
              // --- It's a VARIABLE product ---
              const variants = productData.variants;
              if (!variants || !variants[variantIndex]) {
                throw new Error(`Variant ${variantIndex} not found for ${item.productId}`);
              }

              const currentStock = variants[variantIndex].stockQuantity;
              if (currentStock < quantityToDeduct) {
                transaction.update(userOrderRef, {status: "failed_out_of_stock", failedItem: item.productId});
                transaction.update(adminOrderRef, {status: "failed_out_of_stock", failedItem: item.productId});
                throw new Error(`Insufficient stock for product variant: ${item.variantName}`);
              }

              // Update stock *inside* the array
              variants[variantIndex].stockQuantity = currentStock - quantityToDeduct;
              transaction.update(productRef, {variants: variants}); // Write the whole array back
            } else {
              // --- It's a SIMPLE product ---
              const currentStock = productData.stockQuantity;
              if (currentStock < quantityToDeduct) {
                transaction.update(userOrderRef, {status: "failed_out_of_stock", failedItem: item.productId});
                transaction.update(adminOrderRef, {status: "failed_out_of_stock", failedItem: item.productId});
                throw new Error(`Insufficient stock for product: ${item.name}`);
              }

              const newStock = currentStock - quantityToDeduct;
              transaction.update(productRef, {stockQuantity: newStock}); // Update top-level stock
            }
          }

          const updateData = {
            status: "captured",
            paymentId: razorpay_payment_id,
            verifiedAt: FieldValue.serverTimestamp(),
          };

          transaction.update(userOrderRef, updateData);
          transaction.update(adminOrderRef, updateData);
        });

        // --- Email logic (no changes) ---
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

// --- 3. updateProductStock (No changes, your logic was already perfect) ---
exports.updateProductStock = onCall(
    {secrets: []},
    async (request) => {
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be logged in.");
      }
      if (!ADMIN_UIDS.includes(request.auth.uid)) {
        throw new HttpsError("permission-denied", "You must be an admin to do this.");
      }
      const {productId, newStock, variantIndex} = request.data;
      if (!productId || newStock === undefined || newStock < 0) {
        throw new HttpsError("invalid-argument", "Invalid product ID or stock quantity.");
      }
      const productRef = db.collection("Products").doc(productId);
      try {
        if (variantIndex === null || variantIndex === undefined) {
          await productRef.update({
            stockQuantity: Number(newStock),
          });
        } else {
          const docSnap = await productRef.get();
          if (!docSnap.exists) throw new Error("Product not found");

          const productData = docSnap.data();
          const variants = productData.variants;

          if (variants && variants[variantIndex]) {
            variants[variantIndex].stockQuantity = Number(newStock);
            await productRef.update({
              variants: variants,
            });
          } else {
            throw new Error("Variant index not found.");
          }
        }

        logger.info(`Stock updated for ${productId} to ${newStock} by admin ${request.auth.uid}`);
        return {status: "success", productId: productId, newStock: newStock};
      } catch (error) {
        logger.error("Stock Update Failed:", error);
        throw new HttpsError("internal", "Stock update failed: " + error.message);
      }
    },
);

exports.updateOrderStatus = onCall(
    {secrets: []}, // No secrets needed for this one
    async (request) => {
      // 1. Check for Admin Auth
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "You must be logged in.");
      }
      if (!ADMIN_UIDS.includes(request.auth.uid)) {
        throw new HttpsError("permission-denied", "You must be an admin to do this.");
      }

      // 2. Get data from the frontend
      const {orderId, newStatus} = request.data;
      if (!orderId || !newStatus) {
        throw new HttpsError("invalid-argument", "Missing orderId or newStatus.");
      }
      try {
        // 3. Get the Admin order to find the customer's UID
        const adminOrderRef = db.collection("orders").doc(orderId);
        const adminOrderDoc = await adminOrderRef.get();
        if (!adminOrderDoc.exists) {
          throw new HttpsError("not-found", "Order not found in admin collection.");
        }
        const userId = adminOrderDoc.data().userId;
        if (!userId) {
          throw new HttpsError("internal", "Order is missing a userId.");
        }
        // 4. Get the User's order reference
        const userOrderRef = db.collection("users").doc(userId).collection("orders").doc(orderId);
        const statusUpdate = {
          status: newStatus,
        };
        // 5. Update BOTH documents in parallel
        await Promise.all([
          adminOrderRef.update(statusUpdate),
          userOrderRef.update(statusUpdate),
        ]);
        logger.info(`Order ${orderId} status updated to ${newStatus} by admin ${request.auth.uid}`);
        return {status: "success", orderId: orderId, newStatus: newStatus};
      } catch (error) {
        logger.error("Order Status Update Failed:", error);
        throw new HttpsError("internal", "Order status update failed: " + error.message);
      }
    },
);