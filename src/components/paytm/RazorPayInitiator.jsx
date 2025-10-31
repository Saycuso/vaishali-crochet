import React from "react";
import { Button } from "../ui/button";
import { app, auth } from "@/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Loader2 } from "lucide-react";

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const functions = getFunctions(app, "us-central1");
const createOrderFunction = httpsCallable(functions, "createOrder");
const verifyPaymentFunction = httpsCallable(functions, "verifyAndDeductStock");

const RazorpayInitiator = ({
  // 🛠️ REMOVED totalAmount,
  onOrderError,
  isProcessing,
  setIsProcessing,
  customerInfo,
  onOrderSuccess,
  cartItems,
  // 🛠️ REMOVED subtotal,
  // The 'userId' and 'appId' props are not used in this component, so they are removed
}) => {
  const handleInitiatePayment = async () => {
    onOrderError(null);
    setIsProcessing(true);

    const scriptLoaded = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );
    if (!scriptLoaded) {
      onOrderError("Razorpay SDK failed to load.");
      setIsProcessing(false);
      return;
    }

    try {
      if (!auth.currentUser) {
        throw new Error("User is not logged in. Please log in again.");
      }
      await auth.currentUser.getIdToken(true);

      // --- 🛠️ STEP 1: PREPARE DATA (Prices removed) ---
      const orderData = {
        // totalAmountInPaise, subtotal, and shipping are now calculated ON THE SERVER
        customerInfo: customerInfo,
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price, // Ignored by backend, but good for logs
          quantity: item.quantity,
          thumbnail: item.images[0] || item?.variants[0]?.images[0],
        })),
      };
      // ------------------------------------------

      // --- STEP 2: Call the 'createOrder' Cloud Function ---
      const result = await createOrderFunction(orderData);
      // The 'amount' returned here is now the SECURE server-calculated amount
      const { orderId, amount, currency, key_id } = result.data;

      // --- STEP 3: CONFIGURE RAZORPAY POPUP ---
      const options = {
        key: key_id,
        amount: amount, // Use the SECURE amount from the server
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
            onOrderError(`Verification Error: ${error.message}`);
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
      // 🛠️ Updated disabled check
      disabled={isProcessing || cartItems.length === 0}
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Processing Payment...
        </>
      ) : (
        // 🛠️ Updated button text (no price)
        `Place Order and Pay`
      )}
    </Button>
  );
};

export default RazorpayInitiator;