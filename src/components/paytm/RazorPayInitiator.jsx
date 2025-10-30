import React from "react";
import { Button } from "../ui/button";
import { app, auth } from "@/firebase"; // 👈 1. IMPORTED 'auth'
import { getFunctions, httpsCallable } from "@firebase/functions"; // 👈 2. CORRECTED IMPORT PATH
import { Loader2 } from "lucide-react";

// --- Core Utility: Loads Razorpay Checkout Script ---
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// --- 1. INITIALIZE FIREBASE FUNCTIONS ---
const functions = getFunctions(app, "us-central1"); // Use your function's region
const createOrderFunction = httpsCallable(functions, "createOrder");
const verifyPaymentFunction = httpsCallable(functions, "verifyAndDeductStock");

const RazorpayInitiator = ({
  totalAmount,
  onOrderError,
  isProcessing,
  setIsProcessing,
  customerInfo,
  onOrderSuccess,

  // New props we just passed down
  cartItems,
  subtotal,
}) => {
  const handleInitiatePayment = async () => {
    onOrderError(null);
    setIsProcessing(true);

    // 0. Load the Razorpay script
    const scriptLoaded = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    if (!scriptLoaded) {
      onOrderError("Razorpay SDK failed to load.");
      setIsProcessing(false);
      return;
    }

    try {
      // --- 👇 3. ADDED TOKEN REFRESH LOGIC ---
      if (!auth.currentUser) {
        // This should ideally not be hit if your page logic is correct,
        // but it's a good safeguard.
        throw new Error("User is not logged in. Please log in again.");
      }
      // Force refresh the user's ID token to ensure it's not stale
      await auth.currentUser.getIdToken(true);
      // ------------------------------------

      // --- STEP 1: PREPARE DATA for the Cloud Function ---
      // We must match the database structure EXACTLY
      const orderData = {
        totalAmountInPaise: Math.round(totalAmount * 100),
        subtotal: subtotal,
        shipping: 50, // Assuming 50 is your shipping cost
        customerInfo: customerInfo,
        items: cartItems.map((item) => ({
          productId: item.id, // --- 🛠️ CRITICAL MAPPING ---
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          thumbnail: item.images[0] || item?.variants[0]?.images[0],
        })),
      };

      // --- STEP 2: Call the 'createOrder' Cloud Function ---
      // This function creates the Razorpay order AND saves the 'created' order to Firestore
      const result = await createOrderFunction(orderData);
      const { orderId, amount, currency, key_id } = result.data;

      // --- STEP 3: CONFIGURE RAZORPAY POPUP ---
      const options = {
        key: key_id, // Use the Key ID from the function
        amount: amount, // Amount in paise
        currency: currency,
        name: "Vaishalis crochet",
        description: `Order ID: ${orderId}`,
        order_id: orderId, // Razorpay Order ID

        // --- STEP 4: PAYMENT HANDLER ---
        handler: async function (response) {
          setIsProcessing(true); // Re-engage processing for verification

          const verificationData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };

          try {
            // --- 5. ADDED TOKEN REFRESH FOR VERIFICATION ---
            // Also refresh the token before the verify call
            if (auth.currentUser) {
                await auth.currentUser.getIdToken(true);
            }
            // --------------------------------------------

            // --- STEP 5: Call the 'verifyAndDeductStock' Cloud Function ---
            // This function verifies the signature AND atomically deducts stock
            const verifyResult = await verifyPaymentFunction(verificationData);

            if (verifyResult.data.status === "success") {
              // Payment is PROVEN legit! ✅ Stock is deducted!
              console.log(
                `Payment Verified! Order: ${verifyResult.data.orderId}`
              );
              onOrderSuccess(
                verifyResult.data.orderId,
                response.razorpay_payment_id
              );
            } else {
              // Should not happen if signature is valid, but good to have
              onOrderError("Payment successful, but verification failed.");
            }
          } catch (error) {
            console.error("Verification Function Failed:", error);
            // This error comes from our *own* backend
            onOrderError(`Verification Error: ${error.message}`);
          }
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone,
        },
        theme: {
          color: "#ea580c", // Tailwind orange-600
        },
        modal: {
          ondismiss: () => {
            console.log("Razorpay popup closed or dismissed.");
            setIsProcessing(false);
            onOrderError("Payment popup was closed.");
          },
        },
      };

      // 5. Open the Razorpay Checkout Modal
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (e) {
      console.error("Error during payment initiation:", e);
      onOrderError(
        e.message || "Failed to initiate payment. Check cloud function logs."
      );
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handleInitiatePayment}
      className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg transition-all duration-200 py-3 text-lg"
      size="lg"
      disabled={isProcessing || totalAmount <= 0}
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Processing Payment...
        </>
      ) : (
        `Place Order and Pay ₹${totalAmount.toFixed(2)}`
      )}
    </Button>
  );
};

export default RazorpayInitiator;