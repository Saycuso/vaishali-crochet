import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db, app } from "@/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Package,
  MapPin,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";
import OrderDateDisplay from "@/components/ui/orderdatedisplay";
import { Button } from "@/components/ui/button";
import { STATUS_MAP } from "@/lib/statusConfig";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Initialize Functions ---
const functions = getFunctions(app, "us-central1");
const updateStatusFunction = httpsCallable(functions, "updateOrderStatus");

const AdminOrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- State for updates ---
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setError("No Order ID provided.");
      setIsLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderDocPath = `orders/${orderId}`;
        const docRef = doc(db, orderDocPath);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const orderData = { id: docSnap.id, ...docSnap.data() };
          setOrder(orderData);
          setNewStatus(orderData.status); // Set initial status
        } else {
          setError(`Order ${orderId} not found.`);
        }
      } catch (err) {
        console.error("Admin Order Detail Fetch Error:", err);
        setError("Failed to load order details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // --- Update Handler ---
  const handleUpdateStatus = async () => {
    if (newStatus === order.status) return;

    setIsUpdating(true);
    setUpdateError(null);
    try {
      await updateStatusFunction({
        orderId: order.id,
        newStatus: newStatus,
      });
      // Success! Update local state to match
      setOrder((prevOrder) => ({ ...prevOrder, status: newStatus }));
    } catch (err) {
      console.error("Failed to update status:", err);
      setUpdateError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

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
              onClick={() => navigate("/admin/orders")}
              className="mt-4 w-full"
            >
              Back to Admin Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const orderStatus = STATUS_MAP[order.status] || STATUS_MAP.Processing;
  const totalAmount = order.totalAmount || calculateTotal(order.items || []);
  const isPaid =
    order.status === "captured" ||
    order.status === "Shipped" ||
    order.status === "Delivered";

  return (
    // --- 🛠️ UI POLISH: Added responsive classes ---
    <div className="min-h-screen bg-gray-100 px-3 py-4 lg:py-8">
      <div
        className="max-w-md mx-auto rounded-lg overflow-hidden shadow-lg bg-white border border-gray-200
                   lg:max-w-2xl lg:shadow-xl"
      >
        {/* ------------------------------------------- */}

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 lg:p-6 text-white relative">
          <button
            onClick={() => navigate("/admin/orders")}
            className="absolute left-3 top-3 lg:left-5 lg:top-5 bg-white/20 hover:bg-white/30 rounded-full p-1.5"
          >
            <ChevronLeft className="h-4 w-4 text-white" />
          </button>
          <div className="mt-6 text-center">
            <h1 className="text-lg lg:text-xl font-semibold">Order Details</h1>
            <p className="text-xs mt-0.5 opacity-90">
              #{order.id.substring(order.id.length - 10)}
            </p>
            <div className="text-xs opacity-80 flex justify-center gap-1 items-center">
              <OrderDateDisplay timestamp={order.createdAt} />
            </div>
            <Badge
              className={`mt-3 ${orderStatus.color} text-xs px-2 py-0.5 rounded-full font-medium`}
            >
              {orderStatus.label}
            </Badge>
          </div>
        </div>

        {/* Payment Pending/Failed Message */}
        {!isPaid && (
          <div className="p-4 lg:px-8 border-b bg-yellow-50 border-yellow-200">
            <CardContent className="p-0">
              <p className="text-sm font-medium text-yellow-800 text-center">
                This payment was not completed.
              </p>
            </CardContent>
          </div>
        )}

        {/* Total Paid/Amount */}
        <div className="p-4 lg:px-8 border-b">
          <h2 className="text-sm font-medium text-gray-600">
            {isPaid ? "Total Paid" : "Total Amount"}
          </h2>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
            ₹{totalAmount.toFixed(2)}
          </p>
        </div>

        {/* --- UPDATE STATUS SECTION --- */}
        <div className="p-4 lg:px-8 border-b bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">
            Update Order Status
          </h3>
          <div className="flex gap-2">
            <Select onValueChange={setNewStatus} defaultValue={order.status}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(STATUS_MAP).map((key) => (
                  <SelectItem key={key} value={key}>
                    {STATUS_MAP[key].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleUpdateStatus}
              disabled={isUpdating || newStatus === order.status}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
          {updateError && (
            <p className="text-xs text-red-600 mt-2">{updateError}</p>
          )}
        </div>

        {/* Items */}
        <div className="p-4 lg:px-8 border-b">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
            <Package className="h-4 w-4 mr-1 text-orange-500" /> Items Purchased
          </h3>
          <ul className="space-y-2">
            {order.items.map((item, i) => (
              <li
                key={i}
                className="flex gap-3 border rounded-lg p-2"
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
        <div className="p-4 lg:px-8 border-b">
          <h3 className="text-sm font-semibold mb-2 text-gray-800 flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-orange-500" /> Shipping &
            Contact
          </h3>
          <div className="space-y-3 text-sm text-gray-700 m-4">
            <div className="flex gap-2">
              <p className="font-semibold text-gray-800">Name:</p>
              <p>{order.customerInfo?.name || "N/A"}</p>
            </div>
            <div className="flex gap-2">
              <p className="font-semibold text-gray-800">Phone:</p>
              <p>{order.customerInfo?.phone || "N/A"}</p>
            </div>
            <div className="flex gap-2">
              <p className="font-semibold text-gray-800">Email:</p>
              <p className="break-all">{order.customerInfo?.email || "N/A"}</p>
            </div>
            <div className="flex">
              <p className="font-semibold text-gray-800 mr-2">Address:</p>
              <p>
                {order.customerInfo?.address || "N/A"},{" "}
                {order.customerInfo?.pincode || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Payment ID */}
        {order.paymentId && isPaid && (
          <div className="p-4 lg:px-8">
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

export default AdminOrderDetailPage;