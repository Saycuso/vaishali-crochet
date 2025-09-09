import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import mockData from "@/data/MockData";
import { Button } from "@/components/ui/button";
import { CardContent, Card } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-separator";

const MockReviews = [
  {
    id: 1,
    author: "Sonia D.",
    rating: 5,
    comment:
      "This is beautiful! So happy with the craftsmanship. Looks exactly like the picture.",
  },
  {
    id: 2,
    author: "Ankit P.",
    rating: 5,
    comment:
      "Nice product, great quality than what I expected.",
  },
];
const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const foundProduct = mockData.find((p) => p.id === parseInt(productId, 10));
    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      navigate("/shop");
    }
  }, [productId, navigate]);
  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Image */}
        <div className="flex-1">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-auto rounded-lg shadow-md"
          />
        </div>
        {/* Product Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">{product.name}</h1>
            <p className="text-gray-600 text-lg">{product.description}</p>
            <p className="text-2xl font-semibold">₹{product.price}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
              <Button className="flex-1 bg-orange-600 hover:bg-orange-700 text-white" size="lg">
              Add to Cart
            </Button>
            <Button variant="outline" className="flex-1 border-orange-600 text-orange-600 hover:bg-orange-100" size="lg">
              Buy Now
            </Button>
          </div>
        </div>
      </div>
      <Separator className="my-12" />

      {/* Review Section */}
      <div className="space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold">Customer Reviews</h2>
        {MockReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{review.author}</span>
                <span className="text-yellow-500">
                  {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
                </span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductDetails;
