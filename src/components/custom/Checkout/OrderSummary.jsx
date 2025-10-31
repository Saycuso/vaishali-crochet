import React from 'react';
// 🛠️ Import the subtotal calculator
import { calculateSubTotal } from "@/lib/cartUtils"; 

// --- 🛠️ NEW: Shipping Logic (copied from backend) ---
function getShippingCost(pincode) {
  if (!pincode || pincode.length < 3) {
    // We can't calculate shipping without a pincode, so show '...'
    return null; 
  }
  // Maharashtra pincodes start with 40, 41, 42, 43, 44
  const firstTwoDigits = pincode.substring(0, 2);
  if (["40", "41", "42", "43", "44"].includes(firstTwoDigits)) {
    return 80.0; // Maharashtra rate
  }
  return 100.0; // Rest of India rate
}
// --- 🛠️ END NEW LOGIC ---


const OrderSummary = ({ cartItems, customerInfo }) => { 
  
  // --- 🛠️ NEW: Price Calculation ---
  const subtotal = calculateSubTotal(cartItems);
  // Get pincode from customerInfo, default to null if not available
  const pincode = customerInfo?.pincode || null;
  const shipping = getShippingCost(pincode);
  // Only calculate total if shipping is known
  const totalAmount = shipping !== null ? subtotal + shipping : null;
  // ------------------------------

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
        
        {/* --- 🛠️ RE-ADDED PRICE CALCULATION BLOCK --- */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between text-gray-600 text-sm">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600 text-sm">
            <span>Shipping (Est.):</span>
            {/* Show calculated shipping or '...' if pincode is missing */}
            <span>
              {shipping ? `₹${shipping.toFixed(2)}` : '...'}
            </span>
          </div>
          <div className="flex justify-between text-xl font-bold pt-2 border-t mt-2">
            <span>Order Total (Est.):</span>
            <span className="text-green-600">
              {/* Show calculated total or '...' */}
              {totalAmount ? `₹${totalAmount.toFixed(2)}` : '...'}
            </span>
          </div>
        </div>
        {/* --- 🛠️ END FIX --- */}

        {/* --- 🛠️ Updated Shipping Info Box --- */}
        <div className="space-y-2 pt-4 border-t">
          <p className="text-sm text-gray-600">
            {shipping 
              ? `Shipping is calculated based on your pincode (${pincode}).` 
              : "Shipping will be calculated after you provide your address."}
            <br/>
            The final amount will be securely calculated and shown on the Razorpay screen.
          </p>
        </div>
        {/* --- 🛠️ END FIX --- */}

      </div>
    </div>
  );
};

export default OrderSummary;