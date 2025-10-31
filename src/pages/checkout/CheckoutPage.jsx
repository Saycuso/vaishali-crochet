import React, { useEffect } from "react";
import { useCheckoutLogic } from "@/hooks/useCheckoutData";
import { Button } from "@/components/ui/button";
import CheckoutAddress from "@/components/custom/Checkout/CheckoutAddress";
import OrderSummary from "@/components/custom/Checkout/OrderSummary";
import RazorpayInitiator from "@/components/paytm/RazorPayInitiator";

const CheckoutPage = ({ db }) => {
  const {
    isLoading,
    user,
    userId,
    customerInfo,
    cartItems,
    isProcessing,
    orderError,
    appId,
    navigate,
    setOrderError,
    setIsProcessing,
    handleOrderSuccess,
  } = useCheckoutLogic({ db });

  useEffect(() => {
    console.log(`user ${userId} and appId ${appId}`);
  }, [appId, userId]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-xl text-gray-600">
          Loading user session and profile...
        </h1>
      </div>
    );
  }

  if (user && !customerInfo) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-xl text-gray-600">
          Fetching profile details or redirecting to setup...
        </h1>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center h-screen pt-40">
        <h1 className="text-3xl font-bold text-gray-800">
          Your Cart is Empty!
        </h1>
        <p className="mt-4 text-gray-600">
          Please add items to your cart before checking out.
        </p>
        <Button
          className="mt-6 bg-orange-600 hover:bg-orange-700"
          onClick={() => navigate("/shop")}
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffdfb] to-[#f8f8f8] p-4 sm:p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Progress bar for checkout flow */}
        <div className="w-full h-1 bg-orange-100 rounded-full overflow-hidden">
          <div className="w-3/4 h-1 bg-orange-500 rounded-full transition-all duration-500"></div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 text-center mt-2">
          Final Checkout
        </h1>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* LEFT - Address */}
          <div className="md:w-3/5">
            <CheckoutAddress customerInfo={customerInfo} />
          </div>

          {/* RIGHT - Summary + Payment */}
          <div className="md:w-2/5 flex flex-col gap-6">
            <OrderSummary cartItems={cartItems} customerInfo={customerInfo} />

            <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-gray-100 sticky bottom-4">
              {orderError && (
                <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-lg">
                  {orderError}
                </div>
              )}

              <RazorpayInitiator
                onOrderError={setOrderError}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                customerInfo={customerInfo}
                cartItems={cartItems}
                onOrderSuccess={handleOrderSuccess}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
