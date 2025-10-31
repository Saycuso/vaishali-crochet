import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/firebase"; // Removed 'app' as it's not used here
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Package,
  MapPin,
  ChevronLeft,
} from "lucide-react";
import OrderDateDisplay from "@/components/ui/orderdatedisplay";
import { Button } from "@/components/ui/button";

// const appId = app.options.appId; // No longer needed

// --- 🛠️ FIX: Updated STATUS_MAP ---
const STATUS_MAP = {
  // Backend statuses
  created: { label: "Payment Pending", color: "bg-yellow-100 text-yellow-700" },
  captured: { label: "Payment Confirmed", color: "bg-green-100 text-green-700" },
  failed_out_of_stock: { label: "Failed (Out of Stock)", color: "bg-red-100 text-red-700" },
  
  // Fallback/Manual statuses
  Processing: { label: "Processing Order", color: "bg-orange-100 text-orange-700" },
  Shipped: { label: "Shipped", color: "bg-blue-100 text-blue-700" },
  Delivered: { label: "Delivered", color: "bg-indigo-100 text-indigo-700" },
  Cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
  Pending: { label: "Awaiting Payment", color: "bg-yellow-100 text-yellow-700" },
};
// ------------------------------

const OrderTrackingDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setError("No Order ID provided.");
      setIsLoading(false);
      return;
    }

    const fetchOrder = async (userId) => {
      try {
        // --- 🛠️ FIX: Updated Firestore path ---
        const orderDocPath = `users/${userId}/orders/${orderId}`;
        // ------------------------------------
        
        const docRef = doc(db, orderDocPath);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError(`Order ${orderId} not found.`);
        }
      } catch (err) {
        console.error("Order Detail Fetch Error:", err);
        setError("Failed to load order details. Check console.");
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchOrder(user.uid);
      } else {
        setIsLoading(false);
        navigate("/login", {
          state: { from: `/orderstrackingpage/${orderId}` },
        });
      }
    });
    return () => unsubscribe();
  }, [orderId, navigate]);

  // This is a fallback calculation, but the 'order.totalAmount' is preferred
  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        <p className="mt-4 text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md shadow-lg border-red-400">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "Order not found."}</p>
            <Button
              onClick={() => navigate("/orderstrackingpage")}
              className="mt-4 w-full"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use "Processing" as the final fallback
  const orderStatus = STATUS_MAP[order.status] || STATUS_MAP.Processing;
  // Use the pre-calculated totalAmount from the order, or fall back to client-side calculation
  const totalAmount = order.totalAmount || calculateTotal(order.items || []);

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4">
      <div className="max-w-md mx-auto rounded-lg overflow-hidden shadow-md bg-white border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white relative">
          <button
            onClick={() => navigate("/orderstrackingpage")}
            className="absolute left-3 top-3 bg-white/20 hover:bg-white/30 rounded-full p-1.5"
          >
            <ChevronLeft className="h-4 w-4 text-white" />
          </button>

          <div className="mt-6 text-center">
            <h1 className="text-lg font-semibold">Order Details</h1>
            <p className="text-xs mt-0.5 opacity-90">
              #{order.id.substring(order.id.length - 10)}
            </p>
            <div className="text-xs opacity-80 flex justify-center gap-1 items-center">
              <OrderDateDisplay timestamp={order.createdAt} />
            </div>
            <Badge
              className={`mt-2 ${orderStatus.color} text-xs px-2 py-0.5 rounded-full font-medium`}
            >
              {orderStatus.label}
            </Badge>
          </div>
        </div>
        
        {/* --- 🛠️ ADDED PAYMENT PENDING MESSAGE --- */}
        {(order.status === 'created' || order.status === 'Pending') && (
          <div className="p-4 border-b bg-yellow-50 border-yellow-200">
            <CardContent className="p-0">
              <p className="text-sm font-medium text-yellow-800 text-center">
                This payment was not completed. To buy these items, please go back
                and place a new order.
              </p>
            </CardContent>
          </div>
        )}
        {/* --- 🛠️ END OF BLOCK --- */}


        {/* Total Paid */}
        <div className="p-4 border-b">
          <h2 className="text-sm font-medium text-gray-600">Total Paid</h2>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ₹{totalAmount.toFixed(2)}
          </p>
        </div>

        {/* Items */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <Package className="h-4 w-4 mr-1 text-orange-500" /> Items Purchased
          </h3>
          <ul className="space-y-2">
            {order.items.map((item, i) => (
              <li
                key={i}
                className="flex gap-3 border rounded-lg p-2 hover:shadow-sm transition"
              >
                <img
                  src={item.thumbnail || "https://via.placeholder.com/100"}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md border"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm leading-tight">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                  </p>
                  <p className="text-xs font-medium text-gray-700 mt-0.5">
                    Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Contact */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold mb-2 text-gray-800 flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-orange-500" /> Shipping &
            Contact
          </h3>
          <div className="space-y-3 text-sm text-gray-700 m-4">
            <div className="flex gap-2">
              <p className="font-semibold text-gray-800 item-start flex">
                Name:
              </p>
              <p className="flex items-start gap-2">
                {order.customerInfo?.name || "N/A"}
              </p>
            </div>
            <div className="flex gap-2">
              <p className="font-semibold text-gray-800 item-start flex">
                Phone:{" "}
              </p>
              <p className="flex items-start">
                {order.customerInfo?.phone || "N/A"}
              </p>
            </div>
            <div className="flex gap-2">
              <p className="font-semibold text-gray-800 flex items-start">
                Email:
              </p>
              <p className="break-all flex items-start">
                {order.customerInfo?.email || "N/A"}
              </p>
            </div>
            <div className="flex">
              <p className="font-semibold text-gray-800 flex items-start">
                Address:
              </p>
              <p className="flex items-start">
                {order.customerInfo?.address || "N/A"},{" "}
                {order.customerInfo?.pincode || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Payment ID */}
        {order.paymentId && (
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              Payment ID
            </h3>
            <p className="text-xs bg-gray-50 border rounded-md p-2 text-gray-700 break-all">
              {order.paymentId}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingDetails;