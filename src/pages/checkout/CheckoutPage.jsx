import React from "react";
import { useCheckoutLogic } from "@/hooks/useCheckoutData";
import { Button } from "@/components/ui/button";
import CheckoutAddress from "@/components/custom/Checkout/CheckoutAddress";
import OrderSummary from "@/components/custom/Checkout/OrderSummary";
// The db prop is assumed to be passed from the parent router/context
const CheckoutPage = ({ db }) => {
  // Use the custom hook to get all state and handlers
  const {
    isLoading,
    user,
    customerInfo,
    cartItems,
    subtotal,
    totalAmount,
    isProcessing,
    orderError,
    navigate,
    setOrderError,
    setIsProcessing,
    handleSaveOrderToDb,
    handleOrderSuccess,
  } = useCheckoutLogic({ db });

  // 1. LOADING STATE
  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-xl text-gray-600">Loading user session and profile...</h1>
      </div>
    );
  }

  // 2. REDIRECTING/PROFILE MISSING STATE (Should be brief)
  if (user && !customerInfo) {
    // The hook has initiated the redirect to /detailspage, so this is a temporary screen.
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-xl text-gray-600">
          Fetching profile details or redirecting to setup...
        </h1>
      </div>
    );
  }

  // 3. EMPTY CART STATE
  if (cartItems.length === 0 && subtotal === 0) {
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

  // 4. MAIN CHECKOUT RENDER (customerInfo is guaranteed to be present here)
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-2">
          Final Checkout
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* LEFT COLUMN: Delivery Address & Payment */}
          <CheckoutAddress
            customerInfo={customerInfo}
            totalAmount={totalAmount}
            orderError={orderError}
            navigate={navigate}
            handleSaveOrderToDb={handleSaveOrderToDb}
            handleOrderSuccess={handleOrderSuccess}
            setIsProcessing={setIsProcessing}
            setOrderError={setOrderError}
            isProcessing={isProcessing}
          />

          {/* RIGHT COLUMN: Order Summary */}
          <OrderSummary
            cartItems={cartItems}
            subtotal={subtotal}
            totalAmount={totalAmount}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;