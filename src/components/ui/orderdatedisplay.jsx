import React from 'react';
import { CalendarDays } from "lucide-react";

/**
 * Renders the order creation date in DD/MM/YYYY hh:mm format.
 * @param {object} props
 * @param {object | null} props.timestamp - Firestore Timestamp object.
 */
const OrderDateDisplay = ({ timestamp }) => {
    if (!timestamp) return <span className="text-gray-500">N/A</span>;

    // Convert Firestore Timestamp to Date object if needed
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    // Format the date as DD/MM/YYYY hh:mm using en-GB locale for the correct order
    const formattedDate = date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    return (
        <div className="flex items-center space-x-2 text-sm text-white pb-2 border-b border-gray-100">
            <CalendarDays className="h-4 w-4 text-white" />
            <span>{formattedDate}</span>
        </div>
    );
};

export default OrderDateDisplay;