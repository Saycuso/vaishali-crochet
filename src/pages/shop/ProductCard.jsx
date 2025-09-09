import {
  Card,
  CardContent,
  CardFooter,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const ProductCard = ({ product }) => {
  return (
    <Card className="rounded-2xl shadow-md p-0 overflow-hidden hover:shadow-lg transition">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-45 object-cover rounded-t-2xl mb-4"
      />
      <CardContent  className="flex flex-col items-start p-4">
        <CardTitle className="text-md font-semibold">{product.name}</CardTitle>
        <CardDescription className=" mt-1">{product.description}</CardDescription>
      </CardContent>
      <CardFooter className="flex justify-between items-center px-4 pb-4 pt-0">
        <span className="text-xl font-bold">₹{product.price}</span>
        <Button>Add to Cart</Button>
      </CardFooter>
    </Card>
  );
};
