import React from "react";
import { calculateSubTotal } from "@/lib/cartUtils";

function getShippingCost(pincode) {
  if (!pincode || pincode.length < 3) return null;
  const prefix = pincode.substring(0, 2);
  if (["40", "41", "42", "43", "44"].includes(prefix)) return 80.0;
  return 100.0;
}

const OrderSummary = ({ cartItems, customerInfo }) => {
  const subtotal = calculateSubTotal(cartItems);
  const pincode = customerInfo?.pincode || null;
  const shipping = getShippingCost(pincode);
  const totalAmount = shipping !== null ? subtotal + shipping : null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-5 border-b pb-3">
        <span className="text-orange-600 font-extrabold mr-2">2.</span>
        Order Summary
      </h2>

      {/* 🧾 Updated Item List Layout */}
      <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto mb-4">
        {cartItems.map((item) => (
          <div key={item.id} className="py-3">
            {/* 🔹 Row 1: Item name + total price */}
            <div className="flex justify-between items-start">
              
              {/* --- 🛠️ FIX START --- */}
              {/* We use flex, min-w-0, and truncate to fix the long text */}
              <div className="flex min-w-0 mr-4"> 
                <span className="text-sm font-medium text-gray-900 leading-snug truncate">
                  {item.productname}
                </span>
                <span className="text-sm font-medium text-gray-900 leading-snug flex-shrink-0">
                  &nbsp;({item.name})
                </span>
              </div>
              {/* --- 🛠️ FIX END --- */}

              <p className="text-sm font-semibold text-gray-900 flex-shrink-0"> {/* Added flex-shrink-0 here too */}
                ₹{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>

            {/* 🔹 Row 2: Quantity × Unit price */}
            <p className="mt-1 text-xs text-gray-500 text-start">
              {item.quantity} × ₹{item.price.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* 💰 Price Summary */}
      <div className="space-y-2 pt-4 border-t border-gray-200 text-sm">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal:</span>
          <span className="font-medium">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Shipping (Est.):</span>
          <span className="font-medium">
            {shipping ? `₹${shipping.toFixed(2)}` : "..."}
          </span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3 mt-2">
          <span>Total (Est.):</span>
          <span className="text-green-600">
            {totalAmount ? `₹${totalAmount.toFixed(2)}` : "..."}
          </span>
        </div>
      </div>

      {/* 📦 Note below total */}
      <p className="text-xs text-gray-500 pt-4 mt-4 border-t border-gray-100 leading-relaxed">
        {shipping
          ? `Shipping cost is estimated based on your pincode (${pincode}).`
          : "Shipping will be calculated after you provide your address."}
        <br />
        Final pricing and taxes will appear on the secure Razorpay screen.
      </p>
    </div>
  );
};

export default OrderSummary;