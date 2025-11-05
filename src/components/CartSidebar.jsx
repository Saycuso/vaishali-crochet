import React from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/hooks/useCartStore";
import { Button } from "@/components/ui/button";
import { calculateSubTotal } from "@/lib/cartUtils";

const CartSidebar = () => {
  const navigate = useNavigate();
  const { isCartOpen, cartItems, toggleCart, addItem, removeItem, deleteItem } =
    useCartStore();

  const total = calculateSubTotal(cartItems);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) toggleCart(false);
  };

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) return;
    toggleCart(false);
    navigate("/checkout");
  };

  return (
    <>
      {/* 🩶 Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
          isCartOpen
            ? "opacity-50 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={handleBackdropClick}
      />

      {/* 🧺 Cart Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm z-50 transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full bg-gradient-to-b from-orange-50 to-amber-100 shadow-2xl border-l border-orange-200 rounded-l-3xl overflow-hidden">
          {/* 🧵 Header */}
          <div className="p-5 flex justify-between items-center bg-white/70 backdrop-blur-sm border-b border-orange-100">
            <h2 className="text-2xl font-bold text-gray-800">
              Your <span className="text-orange-600">Cart</span>{" "}
              <span className="text-base font-medium text-gray-500">
                ({cartItems.length})
              </span>
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleCart(false)}
              className="text-gray-500 hover:text-orange-600"
            >
              ✕
            </Button>
          </div>

          {/* 🧶 Cart Items */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {cartItems.length === 0 ? (
              <div className="flex flex-col justify-center items-center text-center mt-16 text-gray-600">
                <img
                  src="/images/empty-cart.png"
                  alt="Empty Cart"
                  className="w-24 h-24 opacity-70 mb-4"
                />
                <p className="text-lg font-medium">Your cart is empty.</p>
                <p className="text-sm text-gray-500">
                  Add some handmade love to your basket ❤️
                </p>
              </div>
            ) : (
              cartItems.map((item) => {
                const isMaxStock = item.quantity >= item.stockQuantity;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 bg-white/80 p-3 rounded-2xl shadow-sm border border-orange-100 hover:shadow-md transition-all"
                  >
                    <img
                      src={
                        item.images?.[0] ||
                        "https://placehold.co/80x80/cccccc/333333?text=Product"
                      }
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">
                        {item?.productname
                          ? `${item.productname} — ${item.name}`
                          : item.name}
                      </p>
                      {item.size && (
                        <p className="text-sm text-gray-500">Size: {item.size}</p>
                      )}
                      <p className="font-bold text-green-600 mt-1">
                        ₹{item.price}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center mt-2">
                        <Button
                          variant="ghost"
                          className="w-6 h-6 p-0 text-gray-700 hover:bg-orange-100"
                          onClick={() => removeItem(item.id)}
                        >
                          −
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          className="w-6 h-6 p-0 text-gray-700 hover:bg-orange-100"
                          disabled={isMaxStock}
                          onClick={() => addItem(item)}
                        >
                          +
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 p-0 ml-2 text-red-500 hover:bg-red-50"
                          onClick={() => deleteItem(item.id)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 🧾 Footer */}
          <div className="p-5 bg-white/80 backdrop-blur-sm border-t border-orange-100">
            <div className="flex justify-between font-semibold text-lg mb-3">
              <span>Subtotal</span>
              <span className="text-green-600">₹{total.toFixed(2)}</span>
            </div>
            <Button
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-full shadow-md hover:shadow-lg transition-all"
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
