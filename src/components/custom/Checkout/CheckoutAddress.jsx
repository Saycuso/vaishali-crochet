import React from 'react';
import { Button } from "@/components/ui/button";
import RazorpayInitiator from "@/components/paytm/RazorPayInitiator";

const CheckoutAddress = ({ 
  customerInfo, 
  totalAmount, 
  orderError, 
  navigate,
  handleSaveOrderToDb,
  handleOrderSuccess,
  setIsProcessing,
  setOrderError,
  isProcessing,
  userId,
  appId
}) => {
  return (
    <div className="md:w-3/5 bg-white p-6 rounded-xl shadow-lg h-fit">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
        1. Delivery Address
      </h2>

      <div className="space-y-4">
        <p className="text-lg font-bold text-gray-900">
          {customerInfo?.name}
        </p>
        <p className="text-gray-700">{customerInfo?.address}</p>
        <p className="text-gray-700">Pincode: {customerInfo?.pincode}</p>
        <p className="text-gray-700">Phone: {customerInfo?.phone}</p>

        <Button
          variant="link"
          onClick={() =>
            navigate("/detailspage", { state: { from: "/checkout", isManualEdit: true } })
          }
          className="p-0 text-orange-600 hover:text-orange-700"
        >
          Change Details
        </Button>
      </div>

      {orderError && (
        <div className="p-3 mt-6 text-sm text-red-800 bg-red-100 rounded-lg">
          {orderError}
        </div>
      )}

      {/* PAYMENT BUTTON */}
      <div className="pt-6 border-t mt-6">
        <RazorpayInitiator
          totalAmount={totalAmount}
          customerPhone={customerInfo.phone}
          onSaveOrderToDb={() => handleSaveOrderToDb(customerInfo)}
          onOrderError={setOrderError}
          clearCart={() => { /* clearCart is handled inside handleOrderSuccess via the hook */ }}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          customerInfo={customerInfo}
          onOrderSuccess={handleOrderSuccess}
          userId = {userId}
          appId = {appId}
        />
      </div>
    </div>
  );
};

export default CheckoutAddress;