import React from "react";
import { Button } from "../ui/button";
import { app, auth } from "@/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Loader2 } from "lucide-react";

// --- 🛠️ UPDATED: Robust loadScript function ---
const loadScript = (src) => {
  return new Promise((resolve) => {
    // Check if the script is already on the page
    const existingScript = document.querySelector(`script[src="${src}"]`);
    
    if (existingScript) {
      // If it exists, assume it's loaded or loading
      // We can add a check for its loaded state if needed, but for now this is fine
      resolve(true);
      return;
    }

    // If not, create and append it
    const script = document.createElement("script");
    script.src = src;
    
    script.onload = () => {
      resolve(true);
    };
    
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      resolve(false);
    };
    
    document.body.appendChild(script);
  });
};
// --- 🛠️ END OF UPDATE ---

// --- 1. INITIALIZE FIREBASE FUNCTIONS ---
const functions = getFunctions(app, "us-central1");
const createOrderFunction = httpsCallable(functions, "createOrder");
const verifyPaymentFunction = httpsCallable(functions, "verifyAndDeductStock");

const RazorpayInitiator = ({
  onOrderError,
  isProcessing,
  setIsProcessing,
  customerInfo,
  onOrderSuccess,
  cartItems,
}) => {
  const handleInitiatePayment = async () => {
    onOrderError(null);
    setIsProcessing(true);

    // 0. Load the Razorpay script
    const scriptLoaded = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    if (!scriptLoaded) {
      onOrderError("Razorpay SDK failed to load. Check your ad blocker or network.");
      setIsProcessing(false);
      return;
    }

    try {
      if (!auth.currentUser) {
        throw new Error("User is not logged in. Please log in again.");
      }
      await auth.currentUser.getIdToken(true);

      // --- STEP 1: PREPARE DATA (Prices removed) ---
      const orderData = {
        customerInfo: customerInfo,
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          thumbnail: item.images[0] || item?.variants[0]?.images[0],
        })),
      };

      // --- STEP 2: Call the 'createOrder' Cloud Function ---
      const result = await createOrderFunction(orderData);
      const { orderId, amount, currency, key_id } = result.data;

      // --- STEP 3: CONFIGURE RAZORPAY POPUP ---
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: "Vaishalis crochet",
        description: `Order ID: ${orderId}`,
        order_id: orderId,
        handler: async function (response) {
          setIsProcessing(true); 

          const verificationData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };

          try {
            if (auth.currentUser) {
                await auth.currentUser.getIdToken(true);
            }
            const verifyResult = await verifyPaymentFunction(verificationData);

            if (verifyResult.data.status === "success") {
              console.log(
                `Payment Verified! Order: ${verifyResult.data.orderId}`
              );
              onOrderSuccess(
                verifyResult.data.orderId,
                response.razorpay_payment_id
              );
            } else {
              onOrderError("Payment successful, but verification failed.");
              setIsProcessing(false); 
            }
          } catch (error) {
            console.error("Verification Function Failed:", error);
            let msg = error.message || "An unknown verification error occurred.";
            if (error.details && error.details.message) {
              msg = error.details.message;
            }
            onOrderError(`Verification Error: ${msg}`);
            setIsProcessing(false);
          }
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone,
        },
        theme: {
          color: "#ea580c",
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
      let msg = e.message || "Failed to initiate payment.";
      if (e.details && e.details.message) {
        msg = e.details.message;
      }
      onOrderError(msg); 
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handleInitiatePayment}
      className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg transition-all duration-200 py-3 text-lg"
      size="lg"
      disabled={isProcessing || cartItems.length === 0}
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Processing Payment...
        </>
      ) : (
        `Place Order and Pay`
      )}
    </Button>
  );
};

export default RazorpayInitiator;