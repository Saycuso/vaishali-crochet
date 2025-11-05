import React, { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

const CustomAccordion = ({ items }) => {
  // Start with all indices closed by default
  const [closedIndices, setClosedIndices] = useState(items.map((_, i) => i));

  const handleToggle = (index) => {
    if (closedIndices.includes(index)) {
      // open it
      setClosedIndices(closedIndices.filter((i) => i !== index));
    } else {
      // close it
      setClosedIndices([...closedIndices, index]);
    }
  };

  return (
    <div className="w-full">
      {items.map((item, index) => {
        const isClosed = closedIndices.includes(index);
        return (
          <div key={index} className="border-b border-gray-200">
            {/* Header */}
            <div
              className="flex justify-between items-center cursor-pointer py-4 text-left select-none"
              onClick={() => handleToggle(index)}
            >
              <span className="text-md font-semibold text-gray-800">
                {item.title}
              </span>
              <ChevronDownIcon
                className={`size-5 text-gray-600 transition-transform duration-200 ${
                  isClosed ? "" : "rotate-180 text-orange-500"
                }`}
              />
            </div>

            {/* Content */}
            {!isClosed && (
              <div className="overflow-hidden pb-4 text-gray-700 leading-relaxed text-sm">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CustomAccordion;
