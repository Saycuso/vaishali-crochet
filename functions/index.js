const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const logger = require("firebase-functions/logger");

// --- 🛠️ ADDED NODEMAILER ---
const nodemailer = require("nodemailer");

// Initialize Firebase Admin SDK and Firestore
admin.initializeApp();
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// Helper function to verify the signature
function verifyRazorpaySignature(body, signature) {
  const secret = process.env.RAZORPAY_SECRET;
  if (!secret) {
    logger.error("RAZORPAY_SECRET is not configured!");
    return false;
  }
  const expectedSignature = crypto.createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");
  return expectedSignature === signature;
}


// -----------------------------------------------------------
// 2. CREATE ORDER FUNCTION (Cart Compatible)
// -----------------------------------------------------------
exports.createOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required.");
  }

  // Initialize Razorpay *inside* the function for lazy loading
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  const {totalAmountInPaise, customerInfo, items, shipping, subtotal} = data;
  const currency = "INR";

  if (!totalAmountInPaise || !items || items.length === 0 || !customerInfo) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required cart data (amount, items, or customer info).",
    );
  }

  const options = {
    amount: totalAmountInPaise,
    currency: currency,
    receipt: `receipt_${context.auth.uid}_${Date.now()}`,
    payment_capture: 1,
    notes: {userId: context.auth.uid, itemCount: items.length,
    },
  };

  try {
    const order = await razorpay.orders.create(options);

    await db.collection("users").doc(context.auth.uid).collection("orders").doc(order.id).set({
      userId: context.auth.uid,
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
    logger.error("Razorpay Order Creation Failed:", error);
    throw new functions.https.HttpsError("internal", "Order creation failed.");
  }
});


// -----------------------------------------------------------
// 3. VERIFY PAYMENT + ATOMIC STOCK DEDUCTION + SEND EMAIL
// -----------------------------------------------------------
exports.verifyAndDeductStock = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required.");
  }

  const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = data;
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  // 1. Signature Verification
  if (!verifyRazorpaySignature(body, razorpay_signature)) {
    logger.warn("Signature verification failed for order:", razorpay_order_id);
    throw new functions.https.HttpsError(
        "unauthenticated",
        "Verification failed. Potential fraud.",
    );
  }

  const orderRef = db.collection("users").doc(context.auth.uid).collection("orders").doc(razorpay_order_id);
  let customerEmail = ""; // Variable to hold email for sending

  try {
    // 2. ATOMIC STOCK DEDUCTION TRANSACTION
    await db.runTransaction(async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists) throw new Error("Order not found.");

      const orderData = orderDoc.data();
      if (orderData.status === "captured") return; // Already processed

      // --- 🛠️ ADDED --- Store customer email for later
      customerEmail = orderData.customerInfo.email;

      for (const item of orderData.items) {
        const productRef = db.collection("products").doc(item.productId);
        const productDoc = await transaction.get(productRef);

        const currentStock = productDoc.data().stockQuantity;
        const quantityToDeduct = item.quantity;

        if (currentStock < quantityToDeduct) {
          transaction.update(orderRef, {status: "failed_out_of_stock", failedItem: item.productId});
          throw new Error(`Insufficient stock for product: ${item.productId}`);
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

    // --- 🛠️ 3. SEND CONFIRMATION EMAIL (Added from your old server.js) ---
    if (customerEmail) {
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
        from: "\"Vaishali's Crochet Store\" <reactretro510@gmail.com>", // You can set this as an env variable too
        to: customerEmail,
        subject: `Order Confirmation #${razorpay_order_id}`,
        html: `
          <h1>Order Confirmation</h1>
          <p>Thank you for your order from Vaishali's Crochet Store!</p>
          <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
          <p><strong>Payment ID (Razorpay):</strong> ${razorpay_payment_id}</p>
          <p>We have successfully verified your payment and your order is now being processed.</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Email sent for Order: ${razorpay_order_id}`);
    }
    // --- 🛠️ END OF EMAIL LOGIC ---

    return {status: "success", orderId: razorpay_order_id};
  } catch (error) {
    logger.error("Stock Deduction or Email Failed:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

