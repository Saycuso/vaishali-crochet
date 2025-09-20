import { CardContent, Card } from "@/components/ui/card";

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
    comment: "Nice product, great quality than what I expected.",
  },
];

const ProductReviews = () => {
  return (
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
  );
};

export default ProductReviews;