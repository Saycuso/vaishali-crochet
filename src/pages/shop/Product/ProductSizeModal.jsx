import React from "react";

const ProductSizeModal = ({ isOpen, onClose, sizes, onSelectSize }) => {
  if (!isOpen) {
    return null;
  }

  return (
    // Modal Overlay
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Modal Content */}
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm transform scale-100 transition-transform duration-300">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Choose Size</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* Size Buttons */}
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => onSelectSize(size)}
              className="px-4 py-2 border rounded-full font-medium text-sm text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductSizeModal;
