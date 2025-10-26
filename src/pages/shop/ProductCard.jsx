import {
  Card,
  CardContent,
  CardFooter,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Star } from "lucide-react"; // icons for wishlist & rating

export const ProductCard = ({ product }) => {
  const imageUrl =
    product?.images && product.images.length > 0
      ? product.images[0]
      : product?.variants?.[0]?.images?.[0];

  // fake stock data fallback
  const stock = product?.stock || 3; // can make dynamic later

  return (
    <Card className="rounded-2xl shadow-md p-0 overflow-hidden bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative">
      {/* Wishlist heart */}
      <button className="absolute top-3 right-3 bg-white/80 hover:bg-white rounded-full p-2 shadow-sm">
        <Heart className="w-4 h-4 text-orange-500" />
      </button>

      {/* Product image */}
      <img
        src={imageUrl}
        alt={product.name}
        className="w-full h-64 object-cover rounded-t-2xl"
      />

      {/* Content */}
      <CardContent className="flex flex-col items-start px-5 py-3">
        {/* Product Name */}
        <CardTitle
          className="text-lg font-semibold text-gray-800 line-clamp-2"
          title={product.name}
        >
          {product.name}
        </CardTitle>

        {/* Badge + Ratings */}
        <div className="flex items-center gap-2 mt-1">
          
          <div className="flex items-center gap-0.5 text-yellow-400 text-xs">
            <Star size={12} fill="#facc15" stroke="none" />
            <Star size={12} fill="#facc15" stroke="none" />
            <Star size={12} fill="#facc15" stroke="none" />
            <Star size={12} fill="#facc15" stroke="none" />
            <Star size={12} fill="#facc15" stroke="none" />
            <span className="text-[11px] text-gray-500 ml-1">(0)</span>
          </div>
        </div>

        {/* Stock Info */}
        <CardDescription className="text-sm text-gray-600 mt-2">
          {stock > 0 ? (
            <span className="text-pink-600 font-medium">
              Only {stock} left in stock!
            </span>
          ) : (
            <span className="text-red-500 font-semibold">Out of stock</span>
          )}
        </CardDescription>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex justify-between items-center px-5 pb-5 pt-0">
        <span className="text-xl font-bold text-gray-800">₹{product.price}</span>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4"
          disabled={stock <= 0}
        >
          {stock <= 0 ? "Sold Out" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
};
