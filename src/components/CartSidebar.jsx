import React from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/hooks/useCartStore";
import { Button } from "@/components/ui/button";
import { calculateSubTotal } from "@/lib/cartUtils";
// Utility to calculate total price

const CartSidebar = () => {
  const navigate = useNavigate();
  const { isCartOpen, cartItems, toggleCart, addItem, removeItem, deleteItem } =
    useCartStore();

  const total = calculateSubTotal(cartItems);

  // Close the sidebar when the user clicks the backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      toggleCart(false);
    }
  };
  const handleCheckoutClick = () => {
    if (cartItems.length === 0) return;
    toggleCart(false);
    navigate("/checkout");
  };
  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
          isCartOpen
            ? "opacity-50 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={handleBackdropClick}
      />

      {/* Cart Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Cart ({cartItems.length})
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleCart(false)}
              className="text-gray-500 hover:text-gray-900"
            >
              {/* Close Icon (X) */}
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </Button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cartItems.length === 0 ? (
              <p className="text-center text-gray-500 mt-10">
                Your cart is empty.
              </p>
            ) : (
              cartItems.map((item) => {
                // --- 🛠️ STOCK CHECK LOGIC ---
                // Disable the Plus button if current quantity meets or exceeds stockQuantity
                const isMaxStock = item.quantity >= item.stockQuantity;
                // -----------------------------

                return (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 border-b pb-4"
                  >
                    <img
                      src={
                        item.images?.[0]?.url ||
                        "https://placehold.co/80x80/cccccc/333333?text=Product"
                      }
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {item.name}
                      </p>
                      {item.size && (
                        <p className="text-sm text-gray-500">Size: {item.size}</p>
                      )}
                      <p className="font-bold text-green-600">₹{item.price}</p>
                    </div>

                    {/* Quantity Controls and Delete */}
                    <div className="flex flex-col items-end space-y-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center border rounded-lg overflow-hidden">
                        <Button
                          variant="ghost"
                          className="w-6 h-6 p-0 text-gray-700 hover:bg-gray-100"
                          onClick={() => removeItem(item.id)} // Calls removeItem (decrements by 1)
                        >
                          {/* Minus Icon */}
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M20 12H4"
                            ></path>
                          </svg>
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          className="w-6 h-6 p-0 text-gray-700 hover:bg-gray-100"
                          // --- 🛠️ DISABLED IF MAX STOCK IS REACHED ---
                          disabled={isMaxStock}
                          // ------------------------------------------
                          onClick={() => addItem(item)} // Calls addItem (increments by 1)
                        >
                          {/* Plus Icon */}
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 4v16m8-8H4"
                            ></path>
                          </svg>
                        </Button>
                      </div>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-6 h-6 p-0 text-red-500 hover:bg-red-50"
                        onClick={() => deleteItem(item.id)} // Calls deleteItem (removes all)
                      >
                        {/* Trash Icon */}
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.993-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer (Subtotal and Checkout) */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-between font-bold text-lg mb-4">
              <span>Subtotal:</span>
              <span className="text-green-600">₹{total.toFixed(2)}</span>
            </div>
            <Button
              className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
              size="lg"
              disabled={cartItems.length === 0}
              onClick={handleCheckoutClick}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;