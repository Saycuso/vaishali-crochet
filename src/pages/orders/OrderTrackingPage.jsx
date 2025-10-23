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
import { Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

// The new component for each order summary card
import OrderHistoryListCard from "./OrderHistoryListCard";

const appId = app.options.appId;

// The STATUS_MAP and helper functions like calculateTotal are removed
// as they are now handled inside OrderListCard or OrderTrackingDetail.

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
        navigate("/login", { state: { from: "/orderstrackingpage" } });
        return;
      }

      const userId = user.uid;

      // 2. Set up Firestore Realtime Listener (onSnapshot)
      const ordersSubCollectionPath = `artifacts/${appId}/users/${userId}/orders`;
      const ordersColRef = collection(db, ordersSubCollectionPath);
      // Order by createdAt timestamp, newest first
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
              // Ensure status defaults to 'Processing' if not explicitly set
              status: data.status || "Processing",
            });
          });

          // Sort is less necessary now that Firebase query uses "desc"
          // but keeping the logic for safety on non-timestamp fields.
          // fetchedOrders.sort(
          //   (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
          // );

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

  // --- Render Order List (Renders the clean summary cards) ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-8 flex items-center justify-center space-x-3">
        <Package className="h-8 w-8 text-orange-600" />
        <span>Your Order History</span>
      </h1>

      <div className="space-y-6 max-w-3xl mx-auto">
        {orders.map((order) => {
          // Pass the entire order object to the new summary card component
          return <OrderHistoryListCard key={order.id} order={order} />;
        })}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
