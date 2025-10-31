import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/useCartStore";
import { useNavigate } from "react-router-dom";

const ProductInfo = ({ product, selectedVariant }) => {
  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const navigate = useNavigate()

  if (!product || !selectedVariant) {
    return null;
  }

  const createItemToAdd = (isBuyNow = false) => {
    return {
      ...product,
      ...selectedVariant,
      id: selectedVariant.id || product.id,
      // Add a flag to indicate if this is a "Buy Now" item for special handling if needed
      isBuyNow: isBuyNow,
      quantity: 1, // Always add 1 item
    };
  };
  const handleAddToCart = () => {
    const itemToAdd = createItemToAdd(false);
    addItem(itemToAdd, false);
    toggleCart(true);
    console.log(
      `Added 1 of ${selectedVariant.name} (ID: ${itemToAdd.id}) to cart.`
    );
  };
  const handleBuyNow = () => {
    const itemToAdd = createItemToAdd(true);

    // 1. Add item to cart store
    addItem(itemToAdd, true);

    // 2. DO NOT open cart sidebar (toggleCart(false))

    // 3. Redirect user directly to the checkout page
    navigate("/checkout");

    console.log(
      `Buy Now activated for ${selectedVariant.name}. Redirecting to checkout.`
    );
  };
  const currentPrice = selectedVariant.price;
  const originalprice = product.originalprice;
  // --- 🛠️ NEW: Stock Check ---
  const isOutOfStock = product.stockQuantity <= 0;
  // Safely calculate the discount percentage
  const discountPercentage =
    originalprice && currentPrice
      ? Math.round(-((originalprice - currentPrice) / originalprice) * 100)
      : null;

  return (
    <div className="flex-1 flex flex-col justify-between mt-7">
      <div className="space-y-2">
        <h1 className="text-xl md:text-4xl font-semibold text-gray-900 text-left">
          {product.name}
        </h1>

        {/* Price Section */}
        <div className="mt-3 flex items-baseline gap-2">
          {product.originalprice && (
            <div className="flex-col flex items-baseline gap-2">
              <span className="text-4xl font-semibold text-red-600">
                {discountPercentage}%
              </span>
              <span className="text-m text-gray-500 line-through">
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
          disabled={isOutOfStock}
          className="flex-1 p-2 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white"
          size="lg"
        >
          Add to Cart
        </Button>
        <Button
          variant="outline"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className="flex-1 p-2 rounded-2xl border-orange-600 text-orange-600 hover:bg-orange-100"
          size="lg"
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
};

export default ProductInfo;
