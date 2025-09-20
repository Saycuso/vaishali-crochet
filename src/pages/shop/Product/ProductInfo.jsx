import { Button } from "@/components/ui/button";

import { useCartStore } from "@/hooks/useCartStore";

const ProductInfo = ({ product, selectedVariant }) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({ ...product, ...selectedVariant });
    console.log("Item added to cart: ", product.name);
  };

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
                {Math.round(
                  -(
                    (product.originalprice - selectedVariant.price) /
                    product.originalprice
                  ) * 100
                )}
                %
              </span>
              <span className="text-m text-gray-500 line-through">
                M.R.P.: ₹{product.originalprice}
              </span>
            </div>
          )}
          <div className="relative inline-block">
            {/* ₹ symbol positioned absolutely */}
            <span className="absolute bottom-3 left-0 text-sm md:text-base font-bold text-green-600">
              ₹
            </span>

            {/* Price with left padding so ₹ doesn’t overlap */}
            <span className="text-4xl md:text-4xl font-semibold text-green-600 pl-3">
              {selectedVariant?.price}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex-col flex gap-4 mt-8">
        <Button
          onClick={handleAddToCart}
          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
          size="lg"
        >
          Add to Cart
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-orange-600 text-orange-600 hover:bg-orange-100"
          size="lg"
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
};

export default ProductInfo;
