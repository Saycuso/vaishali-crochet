import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, ArrowRight, User } from "lucide-react"; // 👈 Added User icon
import OrderDateDisplay from "@/components/ui/orderdatedisplay";
import { STATUS_MAP } from "@/lib/statusConfig";

// --- We use a new Card component based on your UI ---
const AdminOrderCard = ({ order }) => {
  const navigate = useNavigate();
  const orderStatus = STATUS_MAP[order.status] || STATUS_MAP.Processing;

  const totalItems = order.items?.length || 0;
  const totalAmount =
    order.totalAmount || (order.subtotal || 0) + (order.shipping || 0);

  const firstItemThumbnail = order.items?.[0]?.thumbnail;
  const firstItemName = order.items?.[0]?.name;

  const handleCardClick = () => {
    // 🛠️ We can build an admin detail page later.
    // For now, let's just go to the customer-facing one.
    navigate(`/admin/orders/${order.id}`);
  };

  return (
    <Card
      key={order.id}
      onClick={handleCardClick}
      className="cursor-pointer border-l-4 border-orange-500 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 overflow-hidden gap-0"
    >
      {/* ID & Status */}
      <div className="flex items-center space-x-3 justify-between">
        <h3 className="text-md font-bold text-gray-800 truncate pt-2 pl-3 sm:pl-6">
          Order #{order.id.slice(-10).toUpperCase()}
        </h3>
        <Badge
          className={` sm:inline-flex px-3 py-1 text-xs font-semibold ${orderStatus.color} shadow-sm mt-2 mr-3`}
        >
          {orderStatus.label}
        </Badge>
      </div>

      <CardContent className="p-3 sm:p-6 flex justify-between items-center bg-white">
        {/* LEFT BLOCK: Image and Details */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* 1. PRODUCT IMAGE */}
          <div className="flex-shrink-0 relative h-16 w-16">
            <img
              src={firstItemThumbnail || "https://via.placeholder.com/64"}
              alt={firstItemName || "Order Item"}
              className="h-14 w-14 object-cover rounded-md border-2 border-white shadow-md absolute top-0 left-0 z-10"
            />
            {totalItems > 1 && (
              <div className="h-14 w-14 bg-gray-200 rounded-md border border-gray-300 absolute bottom-0 right-0 transform translate-x-1 translate-y-1">
              </div>
            )}
          </div>

          {/* 2. ORDER DETAILS */}
          <div className="flex flex-col min-w-0">
            <div className="flex flex-col text-sm text-gray-600 gap-1">
              {/* --- 🛠️ NEW: Added Customer Name --- */}
              <div className="flex items-center gap-1 font-semibold text-gray-800">
                <User className="h-4 w-4 text-orange-500" />
                <span>
                  {order.customerInfo?.name || "No Customer Name"}
                </span>
              </div>
              {/* ---------------------------------- */}
              <div className="flex items-center gap-1">
                <OrderDateDisplay className="text-orange-500" timestamp={order.createdAt} />
              </div>
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4 text-orange-500" />
                <span>
                  {totalItems} Item{totalItems !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT BLOCK: Total and Navigation */}
        <div className="flex items-center flex-shrink-0 ">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-500 mb-1">Total</p>
            <p className="text-xl font-extrabold text-orange-600">
              ₹{totalAmount.toFixed(2)}
            </p>
          </div>
          <ArrowRight className="h-6 w-6 text-orange-500 hidden sm:block" />
        </div>
      </CardContent>
    </Card>
  );
};


// --- This is the main page component ---
const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Note: We're NOT using useNavigate here because
  // the AdminRoute component will handle redirects.

  useEffect(() => {
    // 1. Fetch all orders from the root collection
    const ordersColRef = collection(db, "orders");
    const q = query(ordersColRef, orderBy("createdAt", "desc"));

    const unsubscribeSnapshot = onSnapshot(
      q,
      (snapshot) => {
        const fetchedOrders = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedOrders.push({
            id: doc.id,
            ...data,
            status: data.status || "created",
          });
        });
        setOrders(fetchedOrders);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore Admin Fetch Error:", err);
        setError("Failed to load order history.");
        setIsLoading(false);
      }
    );

    return () => unsubscribeSnapshot();
  }, []); // We only need to run this once

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        <p className="mt-4 text-gray-600">Loading all orders...</p>
      </div>
    );
  }
  
  if (error) {
    return (
       <div className="flex flex-col items-center justify-center min-h-[80vh]">
         <p className="text-red-500">{error}</p>
       </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <Package className="h-8 w-8" />
        Admin: All Orders
      </h1>

      {orders.length === 0 ? (
         <Card>
           <CardContent className="p-6">
             <p className="text-center text-gray-500">No orders found yet.</p>
           </CardContent>
         </Card>
      ) : (
        <div className="space-y-6 max-w-3xl mx-auto">
          {orders.map((order) => {
            // Render one card for each order
            return <AdminOrderCard key={order.id} order={order} />;
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;