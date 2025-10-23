import React from "react";
import { Button } from "@/components/ui/button";

// --- RAZORPAY CONSTANTS ---
// 🛑 IMPORTANT: Use your actual Razorpay Key ID here. The Key Secret MUST stay on the server.
const RAZORPAY_KEY_ID = "rzp_test_RQ4jbxUogklAk4";

// 🚨 Backend Endpoints (Must match server.js)
const BACKEND_ORDER_URL = "http://localhost:5000/api/razorpay/order";
const BACKEND_VERIFY_URL = "http://localhost:5000/api/razorpay/verify";

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

// --- REAL API FUNCTION: Call the local Node.js Server to Create Order ---
const createRazorpayOrder = async (orderPayload, totalAmount) => {
  const response = await fetch(BACKEND_ORDER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: totalAmount.toFixed(2),
      currency: "INR",
      receipt: orderPayload.orderId, // Firebase ID
      customerPhone: orderPayload.customerInfo.phone,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message ||
        "Server failed to create Razorpay Order. Check console/backend logs."
    );
  }

  return result;
};

const RazorpayInitiator = ({
  onSaveOrderToDb,
  totalAmount,
  onOrderError,
  isProcessing,
  setIsProcessing,
  customerInfo,
  onOrderSuccess,
  userId,
  appId,
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
      // --- STEP 1: SAVE THE ORDER TO THE DATABASE (Get internal ID) ---
      const saveResult = await onSaveOrderToDb();
      const orderPayload = saveResult.orderData;
      const firebaseOrderId = saveResult.orderId;

      orderPayload.orderId = firebaseOrderId;

      // 2. Call the backend API to create the Razorpay Order (Get external ID)
      const initResult = await createRazorpayOrder(orderPayload, totalAmount);

      // 3. Configure Razorpay Checkout Options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: initResult.amount, // Amount in paise
        currency: initResult.currency,
        name: "Vaishali's Crochet Store",
        description: `Order ID: ${firebaseOrderId}`,
        order_id: initResult.orderId, // Razorpay Order ID from backend
        handler: async function (response) {
          // 4. CRITICAL SECURITY STEP: Server Verification
          setIsProcessing(true); // Re-engage processing state for server check

          const verificationData = {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            firebaseOrderId: firebaseOrderId, // Your internal reference
            customerEmail: customerInfo.email,
            userId: userId,
            appId: appId,
          };
          // 🔥 CRITICAL FRONTEND DEBUG LOG
          console.log("PAYLOAD SENT TO SERVER:", verificationData);
          // You should see this in your browser's DevTools console!
          // 🔥 END DEBUG LOG

          try {
            const verificationResponse = await fetch(BACKEND_VERIFY_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(verificationData),
            });

            const verificationResult = await verificationResponse.json();

            if (verificationResult.verified) {
              // Payment is PROVEN legit! ✅
              console.log(`Payment Verified! Order: ${firebaseOrderId}`);
              onOrderSuccess(firebaseOrderId, verificationData.paymentId);
            } else {
              // FAILED: The signature check failed. Potential fraud!
              console.error("Payment FAILED SERVER VERIFICATION!");
              onOrderError(
                "Payment successful, but failed security check. Contact support."
              );
            }
          } catch (error) {
            console.error("Verification API call failed:", error);
            onOrderError(
              "Error communicating with server for payment verification."
            );
          } finally {
            // Ensure we stop the spinner if verification fails
            setIsProcessing(false);
          }
        },
        prefill: {
          name: customerInfo?.fullName || orderPayload.customerInfo?.fullName,
          contact: customerInfo?.phone || orderPayload.customerInfo?.phone,
        },
        theme: {
          color: "#ea580c", // Tailwind orange-600
        },
        modal: {
          // Optional: Allows the user to click again if they dismiss the popup
          ondismiss: () => {
            console.log("Razorpay popup closed or dismissed.");
            setIsProcessing(false);
          },
        },
      };

      // 5. Open the Razorpay Checkout Modal
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      // We keep setIsProcessing(true) until the user finishes or dismisses the modal
    } catch (e) {
      console.error("Error during payment initiation:", e);
      onOrderError(
        e.message || "Failed to initiate payment. Check server connection."
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
      {isProcessing
        ? "Contacting Payment Gateway..."
        : `Place Order and Pay ₹${totalAmount.toFixed(2)}`}
    </Button>
  );
};

export default RazorpayInitiator;
