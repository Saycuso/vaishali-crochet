import React from "react";
import CustomAccordion from "@/components/ui/accordion";

const ProductDetails = ({ product }) => {
  const accordionItems = [];

  if (product?.description) {
    accordionItems.push({
      title: "Product Description",               
      content: <p className="text-gray-700 text-left">{product.description}</p>,
    });
  }
  if (product?.specification) {
    // This is the updated code block to handle a map
    const specificationList = Object.entries(product?.specification)?.map(
      ([Key, value]) => {
        if (typeof value === "object" && value !== null) {
          return (
            <li key={Key}>
              <strong>{Key}:</strong> _
              {Object.entries(value)
                .map(([subKey, subValue]) => `${subKey} ${subValue}`)
                .join(",")}{" "}
            </li>
          );
        }
        return <li key = {Key}><strong>{Key}:</strong> {value}</li>
      }
    );

    accordionItems.push({
      title: "Product Specifications",
      content: 
        <ul className="list-disc list-inside space-y-2 text-gray-700">{specificationList}</ul>
    });
  }
  if (product?.videoLink) {
    accordionItems.push({
      title: "Videos",
      content: (
        <div className="aspect-w-16 aspect-h-9 ">
          <iframe
            width="100%"
            height="auto"
            src={product.videoLink}
            title="Product Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      ),
    });
  }
  if (accordionItems.length === 0) {
    return null;
  }
  return (
    <div className="mt-8">
      <CustomAccordion items={accordionItems} />
    </div>
  );
};

export default ProductDetails;
