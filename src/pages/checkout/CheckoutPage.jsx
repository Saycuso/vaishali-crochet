import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/hooks/useCartStore";
import { Button } from "@/components/ui/button";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { calculateSubTotal } from "@/lib/cartUtils";
import RazorpayInitiator from "@/components/paytm/RazorPayInitiator";

const SHIPPING_COST = 50.0;

const getProfileFromLocalStorage = () => {
  const savedProfile = localStorage.getItem("userProfile");

  if (savedProfile) {
    try {
      const profile = JSON.parse(savedProfile);
      if (profile.name && profile.phone && profile.address && profile.pincode) {
        return profile;
      }
    } catch (e) {
      console.error("Error parsing user profile from the local storage:", e);
    }
  }
  return null;
};

const CheckoutPage = ({ db }) => {
  const navigate = useNavigate();

  const cartItems = useCartStore((state) => state.cartItems);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = calculateSubTotal(cartItems);
  const totalAmount = subtotal + SHIPPING_COST;

  const [customerInfo, setCustomerInfo] = useState(null);
  const [isProfileCheckComplete, setIsProfileCheckComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState(null);

  useEffect(() => {
    console.log("CheckoutPage Loaded.");
    const profile = getProfileFromLocalStorage();

    if (profile) {
      setCustomerInfo(profile);
    }
    setIsProfileCheckComplete(true);
  }, []);

  useEffect(() => {
    if (isProfileCheckComplete) {
      if (cartItems.length === 0 && subtotal === 0) {
        console.log("Cart is empty, redirecting to the shop");
      }
      if (!customerInfo && cartItems.length > 0) {
        console.log("User details missing. Redirecting to login");
        navigate("/login", { state: { from: "/checkout" } });
      }
    }
  }, [isProfileCheckComplete, customerInfo, cartItems, subtotal, navigate]);

  // --- HANDLER: PLACE ORDER ---
  const handleSaveOrderToDb = async (currentCustomerInfo) => {
    setOrderError(null);

    if (cartItems.length === 0) {
      setOrderError("Cart is empty.");
      setIsProcessing(false);
      return;
    }

    if (!db) {
      // Should be caught by useEffect, but good for safety
      setOrderError("Database connection not initialized.");
      setIsProcessing(false);
      return;
    }
    const orderData = {
      customer: {
        fullName: currentCustomerInfo.name,
        phoneNo: currentCustomerInfo.phone,
        pincode: currentCustomerInfo.pincode,
        address: currentCustomerInfo.address,
      },
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      pricing: {
        subtotal: subtotal.toFixed(2),
        shipping: SHIPPING_COST.toFixed(2),
        total: totalAmount.toFixed(2),
      },
      status: "Pending Payement",
      payementMethod: "Paytm",
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, "orders"), orderData);
      return {
        orderId: docRef.id,
        orderData: orderData,
        // The phone is needed by the backend for CUST_ID
        customerPhone: customerInfo.phone,
      };
    } catch (e) {
      console.error("Error placing order:", e);
      setOrderError("Failed to save order to database.");
      throw e;
    }
  };
  const handleOrderSuccess = (firebaseOrderId, paymentId) => {
    clearCart(); 
    // Use navigate for clean React routing
    navigate(`/order-success/${firebaseOrderId}?status=success&paymentId=${paymentId}`);
};


  // Show loading/redirect state until the profile check is complete
  if (!isProfileCheckComplete) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-xl text-gray-600">Loading user details...</h1>
      </div>
    );
  }

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
  // If customer info is loading or not available, show a loading/redirect message
  if (!customerInfo) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-xl text-gray-600">
          Loading user details or redirecting to login...
        </h1>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-2">
          Final Checkout
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* LEFT COLUMN: CONFIRMATION DETAILS (READ-ONLY) */}
          <div className="md:w-3/5 bg-white p-6 rounded-xl shadow-lg h-fit">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
              1. Delivery Address
            </h2>

            <div className="space-y-4">
              <p className="text-lg font-bold text-gray-900">
                {customerInfo.name}
              </p>
              <p className="text-gray-700">{customerInfo.address}</p>
              <p className="text-gray-700">Pincode: {customerInfo.pincode}</p>
              <p className="text-gray-700">Phone: {customerInfo.phone}</p>

              <Button
                variant="link"
                onClick={() =>
                  navigate("/login", { state: { from: "/checkout" } })
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
                onSaveOrderToDb={()=> handleSaveOrderToDb(customerInfo)} // Pass the new save function
                onOrderError={setOrderError}
                clearCart={clearCart} // Pass the function to clear the cart AFTER success
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                customerInfo={customerInfo}
                onOrderSuccess={handleOrderSuccess}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY (UNCHANGED) */}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
