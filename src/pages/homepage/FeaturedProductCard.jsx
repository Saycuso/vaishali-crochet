import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export const FeaturedProductCard = ({ product }) => {
  // Check for variants to get the right image
  const displayVariant =
    product.variants && product.variants.length > 0
      ? product.variants[0]
      : null;

  // Image logic remains the same: use variant image if it exists
  const imageUrl = displayVariant
    ? displayVariant.images?.[0]
    : product.images?.[0];

  // --- CHANGED ---
  // Name logic now ALWAYS uses the main product.name
  const name = product.name;

  return (
    <Link to={`/shop/${product.id}`} className="group block">
      <Card className="rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition flex flex-col h-full">
        {/* Image */}
        <div className="overflow-hidden">
          <img
            src={imageUrl || "https://placehold.co/400x300?text=No+Image"}
            alt={name} // Alt tag will also use the main product name
            className="w-full h-64 object-cover block transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <CardContent className="p-2 flex-1">
          <CardTitle
            className="text-lg font-semibold text-gray-800 line-clamp-2"
            title={name} // Title attribute will use main product name
          >
            {name} {/* Display text will use main product name */}
          </CardTitle>
        </CardContent>

        {/* Footer Link */}
        <CardFooter className="p-4 pt-0">
          <span className="font-medium text-orange-600 flex items-center gap-1 transition-transform duration-300 group-hover:translate-x-1">
            View Details
            <ArrowRight className="h-4 w-4" />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
};