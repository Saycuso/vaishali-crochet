import React, { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const VisuallyHidden = (props) => (
  <span
    style={{
      position: "absolute",
      width: "1px",
      height: "1px",
      margin: "-1px",
      border: "0",
      padding: "0",
      clip: "rect(0 0 0 0)",
      overflow: "hidden",
    }}
    {...props}
  />
);

const ProductImageGallery = ({ images, productName }) => {
  const [activeImage, setActiveImage] = useState(images[0]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (images && images.length > 0) {
      setActiveImage(images[0]);
    }
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <img
        src="https://via.placeholder.com/600"
        alt="Product Placeholder"
        className="w-full h-auto rounded-lg shadow-md"
      />
    );
  }

  return (
    <div>
      {/* Main Image and Dialog Trigger */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <img
            src={activeImage}
            alt={productName}
            className="w-full md:!h-[500px] h-[300px] sm:h-[350px] rounded-lg shadow-md mb-4 cursor-pointer object-cover"
          />
        </DialogTrigger>
        <DialogContent className="max-w-[90vw] md:max-w-2xl p-0 border-none">
          <VisuallyHidden>
            <DialogTitle>{productName}</DialogTitle>
            <DialogDescription>
              Full-size image of {productName}.
            </DialogDescription>
          </VisuallyHidden>
          <img src={activeImage} alt={productName} className="w-full h-auto" />
        </DialogContent>
      </Dialog>

      {/* Thumbnails */}
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full max-w-sm mx-auto"
      >
        <CarouselContent className="-ml-1">
          {images.map((image, index) => (
            <CarouselItem key={index} className="pl-1 basis-1/4">
              <div className="p-1">
                <Card
                  onClick={() => setActiveImage(image)}
                  className={`cursor-pointer rounded-md overflow-hidden ${
                    activeImage === image ? "border-2 border-orange-500" : ""
                  }`}
                >
                  <CardContent className="flex items-center justify-center p-0">
                    <div className=" flex items-center justify-center overflow-hidden rounded-md bg-white">
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                        className="object-cover aspect-square"
                    />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default ProductImageGallery;
