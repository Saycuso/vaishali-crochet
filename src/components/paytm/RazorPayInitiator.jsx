import React from "react";
import { Button } from "../ui/button";
import { app, auth } from "@/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Loader2 } from "lucide-react";

// ... (loadScript function is fine)

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
}) => {
  const handleInitiatePayment = async () => {
    onOrderError(null);
    setIsProcessing(true);

    // ... (loadScript logic is fine)

    try {
      if (!auth.currentUser) {
        throw new Error("User is not logged in. Please log in again.");
      }
      await auth.currentUser.getIdToken(true);

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

      const result = await createOrderFunction(orderData);
      const { orderId, amount, currency, key_id } = result.data;

      const options = {
        key: key_id,
        amount: amount, 
        currency: currency,
        name: "Vaishalis crochet",
        description: `Order ID: ${orderId}`,
        order_id: orderId,
        handler: async function (response) {
          setIsProcessing(true); 
          const verificationData = { /* ... */ };

          try {
            if (auth.currentUser) {
                await auth.currentUser.getIdToken(true);
            }
            const verifyResult = await verifyPaymentFunction(verificationData);

            if (verifyResult.data.status === "success") {
              console.log(`Payment Verified! Order: ${verifyResult.data.orderId}`);
              onOrderSuccess(
                verifyResult.data.orderId,
                response.razorpay_payment_id
              );
            } else {
              onOrderError("Payment successful, but verification failed.");
              setIsProcessing(false); 
            }
          } catch (error) {
            // --- 🛠️ FIX for [Object Object] ---
            console.error("Verification Function Failed:", error);
            // Get the clean error message from the Firebase function
            let msg = error.message || "An unknown verification error occurred.";
            // The full error from a callable function is in error.details.message
            if (error.details && error.details.message) {
              msg = error.details.message;
            }
            onOrderError(`Verification Error: ${msg}`);
            setIsProcessing(false);
            // --- 🛠️ END FIX ---
          }
        },
        prefill: { /* ... */ },
        theme: { /* ... */ },
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
      // --- 🛠️ FIX for [Object Object] ---
      console.error("Error during payment initiation:", e);
      let msg = e.message || "Failed to initiate payment.";
      if (e.details && e.details.message) {
        msg = e.details.message;
      }
      onOrderError(msg); // Just show the clean error
      setIsProcessing(false);
      // --- 🛠️ END FIX ---
    }
  };

  return (
    <Button
      onClick={handleInitiatePayment}
      className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg ..."
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