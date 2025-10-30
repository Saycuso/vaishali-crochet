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
// This ensures your functions deploy to 'us-central1'
// which your client app is already calling.
setGlobalOptions({region: "us-central1"});

// Helper function to verify the signature
function verifyRazorpaySignature(body, signature) {
  const secret = process.env.RAZORPAY_SECRET;
  if (!secret) {
    logger.error("RAZORPAY_SECRET is not configured!");
    return false;
  }
  const expectedSignature = crypto.createHmac("sha256", secret).update(body.toString()).digest("hex");
  return expectedSignature === signature;
}

// -----------------------------------------------------------
// 2. CREATE ORDER FUNCTION (V2 SYNTAX)
// -----------------------------------------------------------
exports.createOrder = onCall(async (request) => {
  // 🛠️ Auth data is now in 'request.auth'
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login required.");
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  // 🛠️ Client data is now in 'request.data'
  const data = request.data;
  // 🛠️ UID is now in 'request.auth.uid'
  const uid = request.auth.uid;

  const {totalAmountInPaise, customerInfo, items, shipping, subtotal} = data;
  const currency = "INR";

  if (!totalAmountInPaise || !items || items.length === 0 || !customerInfo) {
    throw new HttpsError("invalid-argument", "Missing required cart data (amount, items, or customer info).");
  }

  const options = {
    amount: totalAmountInPaise,
    currency: currency,
    receipt: `receipt_${uid}_${Date.now()}`, // 🛠️ Use uid
    payment_capture: 1,
    notes: {userId: uid, itemCount: items.length}, // 🛠️ Use uid
  };

  try {
    const order = await razorpay.orders.create(options);

    await db.collection("users").doc(uid).collection("orders").doc(order.id).set({userId: uid, // 🛠️ Use uid
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
    throw new HttpsError("internal", "Order creation failed.");
  }
});

// -----------------------------------------------------------
// 3. VERIFY PAYMENT + ATOMIC STOCK DEDUCTION + SEND EMAIL (V2 SYNTAX)
// -----------------------------------------------------------
exports.verifyAndDeductStock = onCall(async (request) => {
  // 🛠️ Auth data is now in 'request.auth'
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login required.");
  }

  // 🛠️ Client data is now in 'request.data'
  const data = request.data;
  // 🛠️ UID is now in 'request.auth.uid'
  const uid = request.auth.uid;

  const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = data;
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  // 1. Signature Verification
  if (!verifyRazorpaySignature(body, razorpay_signature)) {
    logger.warn("Signature verification failed for order:", razorpay_order_id);
    throw new HttpsError(
        "unauthenticated",
        "Verification failed. Potential fraud.",
    );
  }

  const orderRef = db
      .collection("users")
      .doc(uid)
      .collection("orders")
      .doc(razorpay_order_id); // 🛠️ Use uid
  let customerEmail = ""; // Variable to hold email for sending

  try {
    // 2. ATOMIC STOCK DEDUCTION TRANSACTION
    await db.runTransaction(async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists) throw new Error("Order not found.");

      const orderData = orderDoc.data();
      if (orderData.status === "captured") return; // Already processed

      customerEmail = orderData.customerInfo.email;

      for (const item of orderData.items) {
        const productRef = db.collection("products").doc(item.productId);
        const productDoc = await transaction.get(productRef);

        const currentStock = productDoc.data().stockQuantity;
        const quantityToDeduct = item.quantity;

        if (currentStock < quantityToDeduct) {
          transaction.update(orderRef, {
            status: "failed_out_of_stock",
            failedItem: item.productId,
          });
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

    // --- 🛠️ 3. SEND CONFIRMATION EMAIL (No changes needed here) ---
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
        from: "\"Vaishali's Crochet Store\" <reactretro510@gmail.com>",
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
    throw new HttpsError("internal", error.message);
  }
});
