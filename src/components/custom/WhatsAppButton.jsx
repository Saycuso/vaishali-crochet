import React from "react";
import { MessageCircle } from "lucide-react";

const WhatsAppButton = ({ productName }) => {
  // Replace with your Mom's real number (Country code + Number, no spaces)
  const phoneNumber = "7021645040"; 
  
  // Smart Message Logic
  const message = productName 
    ? `Hi! I'm interested in the "${productName}" and want to know more.`
    : "Hi! I was browsing your shop and have a question.";

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      title="Chat with us"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20b858] text-white p-4 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.25)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-110 flex items-center gap-2 group"
    >
      <MessageCircle size={28} className="animate-pulse" />
      {/* Text reveals on hover (Desktop) */}
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap font-semibold text-sm">
        Chat on WhatsApp
      </span>
    </button>
  );
};

export default WhatsAppButton;