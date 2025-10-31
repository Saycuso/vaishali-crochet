import React from 'react';
// 🛠️ REMOVED: const SHIPPING_COST = 50.0;

// 🛠️ REMOVED: subtotal, totalAmount from props
const OrderSummary = ({ cartItems }) => { 
  return (
    <div className="md:w-2/5 flex flex-col space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3">
          2. Order Summary
        </h2>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mb-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-start text-sm border-b pb-2 last:border-b-0 last:pb-0"
            >
              <span className="text-gray-600 truncate pr-2">
                {item.quantity} x {item.name}
              </span>
              <span className="font-medium text-gray-800 flex-shrink-0">
                ₹{(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        
        {/* --- 🛠️ REMOVED PRICE CALCULATION BLOCK ---
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between text-gray-600 text-sm">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600 text-sm">
            <span>Shipping:</span>
            <span>₹{SHIPPING_COST.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold pt-2 border-t mt-2">
            <span>Order Total:</span>
            <span className="text-green-600">
              ₹{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
        */}

        {/* --- 🛠️ NEW: Shipping Info Box --- */}
        <div className="space-y-2 pt-4 border-t">
          <p className="text-sm text-gray-600">
            The final price, including your zone-based shipping (₹80 for MH, ₹100 for rest of India), will be calculated and shown on the Razorpay payment screen.
          </p>
        </div>
        {/* --- 🛠️ END FIX --- */}

      </div>
    </div>
  );
};

export default OrderSummary;