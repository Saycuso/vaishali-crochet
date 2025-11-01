import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom"; // 👈 Make sure this is imported

const CheckoutAddress = ({ customerInfo }) => {
  const navigate = useNavigate(); // 👈 Make sure this is present

  return (
    // 🛠️ Use consistent padding/shadow/border to match OrderSummary
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      
      {/* 🛠️ Make heading EXACTLY match OrderSummary */}
      <h2 className="text-lg font-semibold text-gray-800 mb-5 border-b pb-3">
        <span className="text-orange-600 font-extrabold mr-2">1.</span>
        Delivery Address
      </h2>

      {/* 🛠️ Add 'text-left' and fix data font sizes */}
     <div className="text-sm text-gray-700 space-y-2">
  <div className="grid grid-cols-[auto_1fr] gap-7">
    <span className="font-medium">Name:</span>
    <span className="text-start">{customerInfo?.name}</span>
  </div>
  <div className="grid grid-cols-[auto_1fr] gap-4">
    <span className="font-medium">Address:</span>
    <span className="text-start">{customerInfo?.address}</span>
  </div>
  <div className="grid grid-cols-[auto_1fr] gap-4">
    <span className="font-medium">Pincode:</span>
    <span className="text-start">{customerInfo?.pincode}</span>
  </div>
  <div className="grid grid-cols-[auto_1fr] gap-6">
    <span className="font-medium">Phone:</span>
    <span className="text-start">{customerInfo?.phone}</span>
  </div>

  <Button
    variant="link"
    onClick={() =>
      navigate("/detailspage", {
        state: { from: "/checkout", isManualEdit: true },
      })
    }
    className="p-0 text-orange-600 hover:text-orange-700 mt-3 font-semibold"
  >
    Change Details
  </Button>
</div>

    </div>
  );
};

export default CheckoutAddress;