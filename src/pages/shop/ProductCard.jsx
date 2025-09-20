import {
  Card,
  CardContent,
  CardFooter,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const ProductCard = ({ product }) => {

  const imageUrl = 
  (product?.images && product.images.length > 0)
  ? product.images[0]
  : product?.variants[0]?.images[0]
  

  return (
    <Card className="rounded-2xl shadow-md p-0 overflow-hidden hover:shadow-lg transition">
      <img
        src={imageUrl}
        alt={product.name}
        className="w-full h-65 object-cover rounded-t-2xl block"
      />
      <CardContent  className="flex flex-col items-start px-5">
        <CardTitle className="text-md font-semibold">{product.name}</CardTitle>
      </CardContent>
      <CardFooter className="flex justify-between items-center px-4 pb-4 pt-0">
        <span className="text-xl font-bold">₹{product.price}</span>
        <Button className="hover:bg-orange-700">Add to Cart</Button>
      </CardFooter>
    </Card>
  );
};
 