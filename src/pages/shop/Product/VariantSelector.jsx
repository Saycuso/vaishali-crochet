// src/components/VariantSelector.jsx

import React from "react";
import { Button } from "@/components/ui/button";

const VariantSelector = ({ variants, activeVariant, onSelect }) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {variants.map((variant) => (
        <Button
          key={variant.id}
          variant="outline"
          size="sm" // Changed size to "sm"
          onClick={() => onSelect(variant)}
          className={`
            rounded-full
            font-semibold
            ${activeVariant.id === variant.id 
              ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500" 
              : "border-gray-300 text-gray-700 hover:bg-gray-100"}
          `}
        >
          {variant.name}
        </Button>
      ))}
    </div>
  );
};

export default VariantSelector;