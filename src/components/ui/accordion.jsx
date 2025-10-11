import React, { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

const CustomAccordion = ({ items }) => {
  // Start with an empty array. No items are closed by default.
  const [closedIndices, setClosedIndices] = useState([]);

  const handleToggle = (index) => {
    // Check if the item is already in the closedIndices array
    if (closedIndices.includes(index)) {
      // If it's there, remove it to open the accordion
      setClosedIndices(closedIndices.filter((i) => i !== index));
    } else {
      // If it's not there, add it to close the accordion
      setClosedIndices([...closedIndices, index]);
    }
  };

  return (
    <div className="w-full">
      {items.map((item, index) => {
        // Check if the current item is closed
        const isClosed = closedIndices.includes(index);

        return (
          <div key={index} className="border-b">
            {/* Accordion Trigger */}
            <div
              className="flex justify-between items-center cursor-pointer py-4 text-left"
              // Correct onClick syntax using an arrow function
              onClick={() => handleToggle(index)}
            >
              <span className="text-md font-semibold">{item.title}</span>
              <ChevronDownIcon
                className={`size-5 transition-transform duration-200 ${
                  isClosed ? "" : "rotate-180" // Rotate the icon when it's open
                }`}
              />
            </div>

            {/* Accordion Content */}
            {!isClosed && ( // Render if the item is NOT closed
              <div className="overflow-hidden">
                <div className="py-0 text-gray-700">{item.content}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CustomAccordion;
