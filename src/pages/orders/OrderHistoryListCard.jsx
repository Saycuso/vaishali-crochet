// src/components/orders/OrderSummaryCard.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Package, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import OrderDateDisplay from "@/components/ui/orderdatedisplay";

// Status map with cleaner colors for the list view
const STATUS_MAP = {
  Paid: { label: "Confirmed", color: "bg-green-500 text-white" },
  Processing: { label: "Processing", color: "bg-orange-500 text-white" },
  Shipped: { label: "Shipped", color: "bg-blue-500 text-white" },
  Delivered: { label: "Delivered", color: "bg-indigo-500 text-white" },
  Cancelled: { label: "Cancelled", color: "bg-red-500 text-white" },
  Pending: { label: "Awaiting Payment", color: "bg-yellow-500 text-white" },
};

const OrderHistoryListCard = ({ order }) => {
  const navigate = useNavigate();
  const orderStatus = STATUS_MAP[order.status] || STATUS_MAP.Processing;

  const totalItems = order.items?.length || 0;
  const totalAmount =
    order.totalAmount || (order.subtotal || 0) + (order.shipping || 0);

  // Get the thumbnail of the first item for the visual preview
  const firstItemThumbnail = order.items?.[0]?.thumbnail;
  const firstItemName = order.items?.[0]?.name;

  const handleCardClick = () => {
    // Navigates to the detail page. Ensure your App.js uses this dynamic path: /orderstracking/:orderId
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
          {/* 1. PRODUCT IMAGE (THE NEW STACKED BLOCK) */}
          <div className="flex-shrink-0 relative h-16 w-16">
            {/* Base Image (First Item) - Always visible */}
            <img
              src={firstItemThumbnail || "https://via.placeholder.com/64"}
              alt={firstItemName || "Order Item"}
              className="h-14 w-14 object-cover rounded-md border-2 border-white shadow-md absolute top-0 left-0 z-10"
            />

            {/* Stacked Indicator (Shows there's more than one item) */}
            {totalItems > 1 && (
              <div className="h-14 w-14 bg-gray-200 rounded-md border border-gray-300 absolute bottom-0 right-0 transform translate-x-1 translate-y-1">
                {/* Optional: Add a simple '+' icon or count if desired, but this shape is enough */}
              </div>
            )}
          </div>

          {/* 2. ORDER DETAILS */}
          <div className="flex flex-col min-w-0">
            {/* Date & Item Count */}
            <div className="flex flex-col text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <OrderDateDisplay timestamp={order.createdAt} />
              </div>
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4 text-orange-500" />
                <span>
                  {totalItems} Item{totalItems !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Mobile Status Badge (for stacked layout) */}
          </div>
        </div>

        {/* RIGHT BLOCK: Total and Navigation */}
        <div className="flex items-center flex-shrink-0 ">
          {/* Total */}
          <div className="text-right">
            <p className="text-sm font-medium text-gray-500 mb-1">Total</p>
            <p className="text-xl font-extrabold text-orange-600">
              ₹{totalAmount.toFixed(2)}
            </p>
          </div>

          {/* Arrow/Indicator */}
          <ArrowRight className="h-6 w-6 text-orange-500 hidden sm:block" />
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderHistoryListCard;
