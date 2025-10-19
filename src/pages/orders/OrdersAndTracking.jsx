import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { auth, db, app } from "@/firebase";
import { useNavigate } from "react-router-dom";
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
  CalendarDays, 
  MapPin, 
  Phone, 
  User, 
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const appId = app.options.appId;

// Define the Order Status map for consistent styling
const STATUS_MAP = {
  Paid: {
    label: "Payment Confirmed",
    color: "bg-green-500 hover:bg-green-600",
  },
  Processing: {
    label: "Processing Order",
    color: "bg-orange-500 hover:bg-orange-600",
  },
  Shipped: { label: "Shipped", color: "bg-blue-500 hover:bg-blue-600" },
  Delivered: { label: "Delivered", color: "bg-indigo-500 hover:bg-indigo-600" },
  Cancelled: { label: "Cancelled", color: "bg-red-500 hover:bg-red-600" },
  Pending: {
    label: "Awaiting Payment",
    color: "bg-yellow-500 hover:bg-yellow-600",
  },
};

const OrderTrackingPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Set up Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // If user is not logged in, redirect to login
        navigate("/login", { state: { from: "/orderstracking" } });
        return;
      }

      const userId = user.uid;

      // 2. Set up Firestore Realtime Listener (onSnapshot)
      // Query the root 'orders' collection for documents where 'userId' field matches current UID.
      // NOTE: We assume your order data saving process includes the 'userId' field in the root of the document.
      const ordersSubCollectionPath = `artifacts/${appId}/users/${userId}/orders`;
      const ordersColRef = collection(db, ordersSubCollectionPath);
      const q = query(ordersColRef, orderBy("createdAt"));

      const unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const fetchedOrders = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            fetchedOrders.push({
              id: doc.id,
              ...data,
              // Ensure status defaults to 'Processing' if not explicitly set
              status: data.status || "Processing",
            });
          });

          // Sort orders by creation date, newest first
          fetchedOrders.sort(
            (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
          );

          setOrders(fetchedOrders);
          setIsLoading(false);
          setError(null);
        },
        (err) => {
          // Error handling for the Firestore listener
          console.error("Firestore Order Fetch Error:", err);
          setError("Failed to load order history. Please try again.");
          setIsLoading(false);
        }
      );

      // Cleanup the Firestore listener when the component unmounts or auth changes
      return () => unsubscribeSnapshot();
    });

    // Cleanup the Auth listener
    return () => unsubscribeAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        <p className="mt-4 text-gray-600">Loading your order history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md shadow-lg border-red-400">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 w-full bg-red-600 hover:bg-red-700"
            >
              Try Reloading
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-orange-600">
              No Orders Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-gray-600">
              It looks like you haven't placed any orders yet. Start shopping to
              see your history here!
            </CardDescription>
            <Button
              onClick={() => navigate("/")}
              className="mt-6 w-full bg-orange-600 hover:bg-orange-700"
            >
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper function to format Firebase Timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    // Check if it's a Firestore Timestamp object with toDate() method
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // --- Render Order List ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 flex items-center justify-center space-x-3">
        <Package className="h-8 w-8 text-orange-600" />
        <span>Your Order History</span>
      </h1>

      <div className="space-y-6 max-w-3xl mx-auto">
        {orders.map((order) => {
          const orderStatus = STATUS_MAP[order.status] || STATUS_MAP.Processing;
          const totalAmount = calculateTotal(order.items || []);

          return (
            <Card
              key={order.id}
              className="shadow-lg border-t-4 border-orange-500 transition-all hover:shadow-xl"
            >
              <CardHeader className="flex flex-row justify-between space-y-0 p-4 sm:p-6 bg-gray-50 border-b border-gray-100">
                <div className="space-y-1">
                  <CardTitle className="text-md items-start font-bold text-gray-900 flex flex-col">
                    <span className="text-xl items-start">Order ID</span>
                    <span className="text-sm items-start text-gray">#{order.id.substring(order.id.length - 15)}</span>
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500 flex items-center space-x-1 ml-7">
                    <CalendarDays className="h-4 w-4" />
                    <span>{formatDate(order.createdAt)}</span>
                  </CardDescription>
                </div>
                <Badge
                  className={`text-white font-medium px-3 py-1 ${orderStatus.color} shadow-md transition-all text-sm`}
                >
                  {orderStatus.label}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 pt-4 sm:p-6 sm:pt-4">
                {/* Order Summary with Total and Items */}
                <div className="mb-4">
                  <div className="flex justify-between items-baseline text-lg font-bold text-gray-900 mb-3 border-b pb-2">
                    <span className="text-gray-600">Order Total:</span>
                    <span className="text-xl font-extrabold text-orange-600">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* Item List with Images */}
                  <h3 className="text-md font-semibold mb-3 text-gray-700 flex items-center space-x-2">
                    <Package className="h-4 w-4 text-gray-600" />
                    <span>Items Ordered ({order.items?.length || 0})</span>
                  </h3>
                  <ul className="space-y-3 border border-gray-200 p-3 rounded-lg bg-white shadow-inner">
                    {(order.items || []).map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center space-x-3 pb-2 border-b last:border-b-0 border-gray-100"
                      >
                        {/* Image for each item */}
                        <img
                          src={
                            item.thumbnail || "https://via.placeholder.com/60"
                          } // Use item.image or a placeholder
                          alt={item.name}
                          className="h-16 w-16 object-cover rounded-md border border-gray-200 shadow-sm"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity} | Price: ₹
                            {item.price.toFixed(2)} each
                          </p>
                        </div>
                        
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Shipping Address and Contact Info */}
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                  <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span>Shipping Details</span>
                  </h3>
                  <div className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200 shadow-inner space-y-1">
                    <p className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{order.customerInfo?.fullName || "N/A"}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{order.customerInfo?.phone || "N/A"}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{order.customerInfo?.email || "N/A"}</span>{" "}
                      {/* Display customer email */}
                    </p>
                    <p className="ml-6">
                      {order.customerInfo?.address || "N/A"},{" "}
                      {order.customerInfo?.pincode || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Payment ID (Optional to display to user, good for support) */}
                {order.paymentId && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-md font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                      <span>Payment Information</span>
                    </h3>
                    <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200 shadow-inner">
                      <span className="font-medium">Payment ID:</span>{" "}
                      {order.paymentId}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
