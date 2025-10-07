import React, { useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

const OrderSuccessPage = () => {
  const { orderId } = useParams(); // Gets the Firebase Order ID from the URL path
  const [searchParams] = useSearchParams(); // Reads query parameters
  const navigate = useNavigate();

  const status = searchParams.get("status");
  const paymentId = searchParams.get("paymentId");

  useEffect(() => {
    // Optional: If orderId or status is missing, redirect to home or a safe page
    if (!orderId || status !== 'success') {
        navigate("/");
    }
  }, [orderId, status, navigate]);

  return (
    <div className="max-w-xl mx-auto p-10 bg-white shadow-xl rounded-lg mt-20 text-center">
      <h1 className="text-4xl font-bold text-green-600 mb-4">
        Order Placed Successfully! 🎉
      </h1>
      <p className="text-gray-700 mb-2">
        Thank you for your purchase. We are processing your order.
      </p>
      <div className="mt-6 p-4 border rounded-md bg-green-50 text-left">
        <p className="font-semibold text-gray-800">
          Your Order ID (Firebase): <span className="text-green-700">{orderId}</span>
        </p>
        <p className="text-sm text-gray-600">
          Payment ID (Razorpay): {paymentId}
        </p>
      </div>
      <button
        onClick={() => navigate("/shop")}
        className="mt-8 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition duration-200"
      >
        Continue Shopping
      </button>
    </div>
  );
};

export default OrderSuccessPage;