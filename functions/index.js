// --- 🛠️ IMPORT V2 FUNCTIONS ---
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");

const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const logger = require("firebase-functions/logger");
const nodemailer = require("nodemailer");

// Initialize Firebase Admin SDK and Firestore
admin.initializeApp();
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// --- 🛠️ SET GLOBAL REGION ---
setGlobalOptions({region: "us-central1"});

// Helper function to verify the signature
function verifyRazorpaySignature(body, signature) {
  const secret = process.env.RAZORPAY_SECRET;
  if (!secret) {
    logger.error("RAZORPAY_SECRET is not configured or loaded!");
    return false;
  }
  const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");
  return expectedSignature === signature;
}

// -----------------------------------------------------------
// 2. CREATE ORDER FUNCTION (V2 SYNTAX)
// -----------------------------------------------------------
exports.createOrder = onCall(
    {secrets: ["RAZORPAY_ID", "RAZORPAY_SECRET"]},
    async (request) => {
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "Login required.");
      }

      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
      });

      const data = request.data;
      const uid = request.auth.uid;
      const {totalAmountInPaise, customerInfo, items, shipping, subtotal} =
      data;
      const currency = "INR";

      if (!totalAmountInPaise || !items || items.length === 0 || !customerInfo) {
        throw new HttpsError(
            "invalid-argument",
            "Missing required cart data (amount, items, or customer info).",
        );
      }

      const options = {
        amount: totalAmountInPaise,
        currency: currency,
        receipt: `${uid}_${Date.now().toString().slice(-10)}`,
        payment_capture: 1,
        notes: {userId: uid, itemCount: items.length},
      };

      try {
        const order = await razorpay.orders.create(options);

        await db
            .collection("users")
            .doc(uid)
            .collection("orders")
            .doc(order.id)
            .set({
              userId: uid,
              orderId: order.id,
              items: items,
              customerInfo: customerInfo,
              totalAmount: totalAmountInPaise / 100,
              subtotal: subtotal,
              shipping: shipping,
              status: "created",
              createdAt: FieldValue.serverTimestamp(),
            });

        return {
          orderId: order.id,
          currency: order.currency,
          amount: order.amount,
          key_id: process.env.RAZORPAY_ID,
        };
      } catch (error) {
      // --- 🛠️ UPDATED CATCH BLOCK ---
        logger.error("Razorpay Order Creation Failed:", error);

        let errorMessage = "Order creation failed.";
        if (error && error.description) {
          errorMessage = error.description; // Razorpay errors often have this
        } else if (error && error.message) {
          errorMessage = error.message;
        } else if (error) {
          errorMessage = error.toString();
        }

        throw new HttpsError("internal", errorMessage);
      // --- 🛠️ END OF UPDATE ---
      }
    },
);

// -----------------------------------------------------------
// 3. VERIFY PAYMENT + ATOMIC STOCK DEDUCTION + SEND EMAIL (V2 SYNTAX)
// -----------------------------------------------------------
exports.verifyAndDeductStock = onCall(
    {
      secrets: [
        "RAZORPAY_SECRET",
        "BREVO_HOST",
        "BREVO_USER",
        "BREVO_PASS",
      ],
    },
    async (request) => {
      if (!request.auth) {
        throw new HttpsError("unauthenticated", "Login required.");
      }

      const data = request.data;
      const uid = request.auth.uid;
      const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = data;
      const body = razorpay_order_id + "|" + razorpay_payment_id;

      if (!verifyRazorpaySignature(body, razorpay_signature)) {
        logger.warn(
            "Signature verification failed for order:",
            razorpay_order_id,
        );
        throw new HttpsError(
            "unauthenticated",
            "Verification failed. Potential fraud.",
        );
      }

      const orderRef = db
          .collection("users")
          .doc(uid)
          .collection("orders")
          .doc(razorpay_order_id);
      let customerEmail = "";

      try {
        await db.runTransaction(async (transaction) => {
          const orderDoc = await transaction.get(orderRef);
          if (!orderDoc.exists) throw new Error("Order not found.");
          const orderData = orderDoc.data();
          if (orderData.status === "captured") return;
          customerEmail = orderData.customerInfo.email;
          for (const item of orderData.items) {
            const productRef = db.collection("Products").doc(item.productId);
            const productDoc = await transaction.get(productRef);

            if (!productDoc.exists) {
              throw new Error(`Product not found: ${item.productId}`);
            }

            const currentStock = productDoc.data().stockQuantity;
            const quantityToDeduct = item.quantity;

            if (currentStock < quantityToDeduct) {
              transaction.update(orderRef, {
                status: "failed_out_of_stock",
                failedItem: item.productId,
              });
              throw new Error(
                  `Insufficient stock for product: ${item.productId}`,
              );
            }

            const newStock = currentStock - quantityToDeduct;
            transaction.update(productRef, {
              stockQuantity: newStock,
            });
          }
          transaction.update(orderRef, {
            status: "captured",
            paymentId: razorpay_payment_id,
            verifiedAt: FieldValue.serverTimestamp(),
          });
        });

        // --- 3. SEND CONFIRMATION EMAIL ---
        if (customerEmail) {
          if (
            !process.env.BREVO_HOST ||
          !process.env.BREVO_USER ||
          !process.env.BREVO_PASS
          ) {
            logger.warn(
                `Brevo email secrets not set for order: ${razorpay_order_id}. Skipping email.`,
            );
          } else {
            const transporter = nodemailer.createTransport({
              host: process.env.BREVO_HOST,
              port: 587,
              secure: false,
              auth: {
                user: process.env.BREVO_USER,
                pass: process.env.BREVO_PASS,
              },
            });

            const mailOptions = {
              from: "\"Vaishali's Crochet Store\" <reactretro510@gmail.com>",
              to: customerEmail,
              subject: `Order Confirmation #${razorpay_order_id}`,
              html: `
              <h1>Order Confirmation</h1>
              <p>Thank you for your order!</p>
              <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
            `,
            };

            await transporter.sendMail(mailOptions);
            logger.info(`Email sent for Order: ${razorpay_order_id}`);
          }
        }

        return {status: "success", orderId: razorpay_order_id};
      } catch (error) {
      // --- 🛠️ UPDATED CATCH BLOCK ---
        logger.error("Stock Deduction or Email Failed:", error);

        let errorMessage = "Verification failed.";
        if (error && error.description) {
          errorMessage = error.description;
        } else if (error && error.message) {
          errorMessage = error.message;
        } else if (error) {
          errorMessage = error.toString();
        }

        throw new HttpsError("internal", errorMessage);
      // --- 🛠️ END OF UPDATE ---
      }
    },
);