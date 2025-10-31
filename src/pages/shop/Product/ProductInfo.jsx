import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/useCartStore";
import { useNavigate } from "react-router-dom";

const ProductInfo = ({ product, selectedVariant }) => {
  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const navigate = useNavigate();

  // --- 🛠️ FIX: Get cartItems from the store ---
  const cartItems = useCartStore((state) => state.cartItems);
  // ------------------------------------------

  if (!product || !selectedVariant) {
    return null;
  }

  // --- 🛠️ FIX: Real-time stock checking logic ---
  // 1. Get the true stock quantity from the *selected variant*
  const stockQuantity = selectedVariant.stockQuantity || 0;

  // 2. Find this specific item in the cart
  const itemInCart = cartItems.find(item => item.id === selectedVariant.id);
  const quantityInCart = itemInCart ? itemInCart.quantity : 0;

  // 3. Determine button states
  const isOutOfStock = stockQuantity <= 0; // Product is sold out
  const isCartAtMax = quantityInCart >= stockQuantity; // User already has all available stock in their cart
  // ----------------------------------------------

  const createItemToAdd = (isBuyNow = false) => {
    return {
      ...product,
      ...selectedVariant,
      id: selectedVariant.id || product.id,
      isBuyNow: isBuyNow,
      quantity: 1, 
      // stockQuantity is already on selectedVariant
    };
  };

  const handleAddToCart = () => {
    const itemToAdd = createItemToAdd(false);
    addItem(itemToAdd, false); // addItem logic in your store handles incrementing
    toggleCart(true);
  };

  const handleBuyNow = () => {
    const itemToAdd = createItemToAdd(true);
    addItem(itemToAdd, true); // This will just set the buyNowItem
    navigate("/checkout");
  };
  
  const currentPrice = selectedVariant.price;
  const originalprice = product.originalprice;

  const discountPercentage =
    originalprice && currentPrice
      ? Math.round(-((originalprice - currentPrice) / originalprice) * 100)
      : null;
      
  // Determine button text based on stock
  let addButtonText = "Add to Cart";
  let buyButtonText = "Buy Now";
  if (isOutOfStock) {
    addButtonText = "Out of Stock";
    buyButtonText = "Out of Stock";
  } else if (isCartAtMax) {
    addButtonText = "All in Cart";
    buyButtonText = "All in Cart";
  }
  // ---------------------------------------

  return (
    <div className="flex-1 flex flex-col justify-between mt-2">
      <div className="space-y-2">
        <h1 className="text-xl md:text-4xl font-semibold text-gray-900 text-left">
          {product.name}
        </h1>

        {/* Price Section */}
        <div className="mt-3 flex items-baseline">
          {product.originalprice && (
            <div className="flex-col flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-red-600">
                {discountPercentage}%
              </span>
              <span className="text-xs text-gray-500 line-through">
                M.R.P.: ₹{originalprice}
              </span>
            </div>
          )}

          <div className="relative inline-block">
            <span className="absolute bottom-3 left-0 text-sm md:text-base font-bold text-green-600">
              ₹
            </span>
            <span className="text-4xl md:text-4xl font-semibold text-green-600 pl-3">
              {currentPrice}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex-col flex gap-4 mt-5">
        <Button
          onClick={handleAddToCart}
          // --- 🛠️ FIX: Update disabled logic ---
          disabled={isOutOfStock || isCartAtMax}
          // ------------------------------------
          className="flex-1 p-2 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white"
          size="lg"
        >
          {addButtonText}
        </Button>
        <Button
          variant="outline"
          onClick={handleBuyNow}
          // --- 🛠️ FIX: Update disabled logic ---
          disabled={isOutOfStock || isCartAtMax}
          // ------------------------------------
          className="flex-1 p-2 rounded-2xl border-orange-600 text-orange-600 hover:bg-orange-100"
          size="lg"
        >
          {buyButtonText}
        </Button>
      </div>
    </div>
  );
};

export default ProductInfo;