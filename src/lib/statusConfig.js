// src/lib/statusConfig.js

export const STATUS_MAP = {
  // Backend statuses
  created: { label: "Payment Pending", color: "bg-yellow-500 text-white", darkColor: "bg-yellow-100 text-yellow-700" },
  captured: { label: "Confirmed", color: "bg-green-500 text-white", darkColor: "bg-green-100 text-green-700" },
  failed_out_of_stock: { label: "Failed (OOS)", color: "bg-red-500 text-white", darkColor: "bg-red-100 text-red-700" },
  
  // Fallback/Manual statuses
  Processing: { label: "Processing", color: "bg-orange-500 text-white", darkColor: "bg-orange-100 text-orange-700" },
  Shipped: { label: "Shipped", color: "bg-blue-500 text-white", darkColor: "bg-blue-100 text-blue-700" },
  Delivered: { label: "Delivered", color: "bg-indigo-500 text-white", darkColor: "bg-indigo-100 text-indigo-700" },
  Cancelled: { label: "Cancelled", color: "bg-red-500 text-white", darkColor: "bg-red-100 text-red-700" },
  Pending: { label: "Awaiting Payment", color: "bg-yellow-500 text-white", darkColor: "bg-yellow-100 text-yellow-700" },
};

// We can also create a helper to get the right color
export const getStatusDetails = (status) => {
  return STATUS_MAP[status] || STATUS_MAP.Processing;
};