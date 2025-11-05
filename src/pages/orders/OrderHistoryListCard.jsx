import React from "react";
import { useNavigate } from "react-router-dom";
import { Package, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import OrderDateDisplay from "@/components/ui/orderdatedisplay";

// --- 🛠️ FIX: Updated STATUS_MAP ---
const STATUS_MAP = {
  // Backend statuses
  created: { label: "Payment Pending", color: "bg-yellow-500 text-white" },
  captured: { label: "Confirmed", color: "bg-green-500 text-white" },
  failed_out_of_stock: { label: "Failed (Out of Stock)", color: "bg-red-500 text-white" },
  
  // Fallback/Manual statuses
  Processing: { label: "Processing", color: "bg-orange-500 text-white" },
  Shipped: { label: "Shipped", color: "bg-blue-500 text-white" },
  Delivered: { label: "Delivered", color: "bg-indigo-500 text-white" },
  Cancelled: { label: "Cancelled", color: "bg-red-500 text-white" },
  Pending: { label: "Awaiting Payment", color: "bg-yellow-500 text-white" },
};
// ------------------------------

const OrderHistoryListCard = ({ order }) => {
  const navigate = useNavigate();
  // Use "Processing" as the final fallback if status is missing
  const orderStatus = STATUS_MAP[order.status] || STATUS_MAP.Processing;

  const totalItems = order.items?.length || 0;
  const totalAmount =
    order.totalAmount || (order.subtotal || 0) + (order.shipping || 0);
  const firstItem = order.items[0];
  const firstItemThumbnail = firstItem.images?.[0] || firstItem?.thumbnail;
  const firstItemName = order.items?.[0]?.name;

  const handleCardClick = () => {
    navigate(`/ordertrackingdetails/${order.id}`);
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

export default OrderHistoryListCard;