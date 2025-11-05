// src/components/ProductInfo.jsx
// (Copy and replace your entire file)

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/useCartStore";
import { useNavigate } from "react-router-dom";

// --- 🛠️ 1. RECEIVE 'productId' PROP ---
const ProductInfo = ({ product, selectedVariant, productId }) => {
  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const navigate = useNavigate();
  const cartItems = useCartStore((state) => state.cartItems);

  if (!product || !selectedVariant) {
    return null;
  }

  // --- 🛠️ 2. RE-WRITTEN HANDLER FUNCTIONS ---
  const handleAction = (isBuyNow = false) => {
    // 1. Check if it's a simple or variant product
    const isVariant = product.variants && product.variants.length > 0;

    // 2. Get the correct data object (the simple product or the selected variant)
    const dataForCart = isVariant ? selectedVariant : product;

    // 3. Find the variant's index number (or null if it's a simple product)
    const variantIndex = isVariant
      ? product.variants.findIndex((v) => v.name === selectedVariant.name) // Finds the index (0, 1, 2...)
      : null;

    // 4. Build the NEW itemData object that the store expects
    const itemData = {
      productId: productId, // The PARENT ID (from props)
      variantIndex: variantIndex, // The index (or null)
      name: dataForCart.name,
      price: dataForCart.price,
      images: dataForCart.images,
      stockQuantity: dataForCart.stockQuantity,
      // We also add the product name for display in the cart
      productname: isVariant ? product.name : dataForCart.name,
    };

    // 5. Call addItem with the new, correct object
    addItem(itemData, isBuyNow);

    // 6. Redirect or open cart
    if (isBuyNow) {
      navigate("/checkout");
    } else {
      toggleCart(true);
    }
  };

  // --- 🛠️ 3. UPDATED STOCK CHECKING LOGIC ---
  const stockQuantity = selectedVariant.stockQuantity || 0;

  // Create the unique cartId to find this item
  const variantIndexForId = product.variants
    ? product.variants.findIndex((v) => v.name === selectedVariant.name)
    : null;
  const cartId =
    variantIndexForId !== null && variantIndexForId !== undefined
      ? `${productId}_${variantIndexForId}`
      : productId;

  const itemInCart = cartItems.find((item) => item.cartId === cartId);
  const quantityInCart = itemInCart ? itemInCart.quantity : 0;

  const isOutOfStock = stockQuantity <= 0;
  const isCartAtMax = quantityInCart >= stockQuantity;
  // --- END OF STOCK LOGIC ---

  const currentPrice = selectedVariant.price;
  const originalprice =
    selectedVariant.originalprice || product.originalprice; // Use variant original price if it exists

  const discountPercentage =
    originalprice && currentPrice
      ? Math.round(-((originalprice - currentPrice) / originalprice) * 100)
      : null;

  // Determine button text
  let addButtonText = "Add to Cart";
  let buyButtonText = "Buy Now";
  if (isOutOfStock) {
    addButtonText = "Out of Stock";
    buyButtonText = "Out of Stock";
  } else if (isCartAtMax) {
    addButtonText = "All in Cart";
    buyButtonText = "All in Cart";
  }

  return (
    <div className="flex-1 flex flex-col justify-between mt-2">
      <div className="space-y-2">
        <h1 className="text-xl md:text-4xl font-semibold text-gray-900 text-left">
          {product.name}
        </h1>

        {/* Price Section */}
        <div className="mt-3 flex items-baseline">
          {originalprice && (
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
          onClick={() => handleAction(false)} // 👈 Call the new handler
          disabled={isOutOfStock || isCartAtMax}
          className="flex-1 p-2 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white"
          size="lg"
        >
          {addButtonText}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleAction(true)} // 👈 Call the new handler
          disabled={isOutOfStock || isCartAtMax}
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