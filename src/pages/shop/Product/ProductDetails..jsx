import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";

const ProductDetails = ({ product }) => {
  return (
    <div className="mt-8">
      <Accordion type="single" collapsible className="w-full">
        {/*Product Description*/}
        {product?.description && (
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg font-semibold text-left">
              Product Description
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-gray-700 text-left">{product.description}</p>
            </AccordionContent>
          </AccordionItem>
        )}
        {/* Product Specifications */}
        {product.specifications && (
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-lg font-semibold">
              Product Specifications
            </AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {product.specifications.map((spec, index) => (
                  <li key={index}>{spec}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}
        {/* Product Videos */}
        {product.videoLink && (
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-lg font-semibold">
              Videos
            </AccordionTrigger>
            <AccordionContent>
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  width="100%"
                  height="auto"
                  src={product.videoLink}
                  title="Product Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};

export default ProductDetails;
