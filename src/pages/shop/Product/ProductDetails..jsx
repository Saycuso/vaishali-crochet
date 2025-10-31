import React from "react";
import CustomAccordion from "@/components/ui/accordion";

const ProductDetails = ({ product }) => {
  const accordionItems = [];

  // --- 1. Product Description ---
  if (product?.description) {
    accordionItems.push({
      title: "Product Description",
      content: (
        <p className="text-gray-700 text-left text-sm leading-relaxed">
          {product.description}
        </p>
      ),
    });
  }

  // --- 2. Product Specifications ---
  if (product?.specification) {
    const specificationList = Object.entries(product?.specification)?.map(
      ([Key, value]) => {
        let content;
        if (typeof value === "object" && value !== null) {
          // Handle nested objects (like Dimensions)
          content = (
            <div
              className="flex justify-start text-left w-full text-sm leading-snug"
              key={Key}
            >
              <strong className="min-w-[110px] mr-2 opacity-90">{Key}:</strong>
              <span className="flex-1 text-gray-700">
                {Object.entries(value)
                  .map(([subKey, subValue]) => `${subKey}: ${subValue}`)
                  .join(" / ")}
              </span>
            </div>
          );
        } else {
          // Handle simple key:value pairs (like Material, Handling)
          content = (
            <div
              className="flex justify-start text-left w-full text-sm leading-snug"
              key={Key}
            >
              <strong className="min-w-[110px] mr-2 opacity-90">{Key}:</strong>
              <span className="flex-1 text-gray-700">{value}</span>
            </div>
          );
        }
        return content;
      }
    );

    accordionItems.push({
      title: "Product Specifications",
      content: (
        <div className="space-y-1.5 text-gray-700 mt-3 mb-3">
          {specificationList}
        </div>
      ),
    });
  }

  // --- 3. Videos ---
  if (product?.videoLink) {
    accordionItems.push({
      title: "Videos",
      content: (
        <div className="aspect-w-16 aspect-h-9 mt-4 mb-4">
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

  // --- 4. CANCELLATION & RETURNS ---
  if (product?.["Cancellation & Returns"]) {
    const policyData = product["Cancellation & Returns"];

    const policyContent = (
      <div className="text-gray-700 space-y-2 text-left mb-2 text-sm leading-relaxed">
        {/* CANCELLATIONS */}
        {policyData.CANCELLATIONS && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-0.5 opacity-90 mt-1">
              Cancellations
            </h4>
            <p>{policyData.CANCELLATIONS}</p>
          </div>
        )}
        {/* DAMAGES AND ISSUES */}
        {policyData["DAMAGES AND ISSUES"] && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-0.5 opacity-90 mt-3">
              Damages and Issues
            </h4>
            <p>{policyData["DAMAGES AND ISSUES"]}</p>
          </div>
        )}
        {/* REFUNDS */}
        {policyData.REFUNDS && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-0.5 opacity-90 mt-3">
              Refunds
            </h4>
            <p>{policyData.REFUNDS}</p>
          </div>
        )}
        {/* RETURNS + EXCHANGES */}
        {policyData["RETURNS + EXCHANGES"] && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-0.5 opacity-90 mt-3">
              Returns + Exchanges
            </h4>
            <p>{policyData["RETURNS + EXCHANGES"]}</p>
          </div>
        )}
      </div>
    );

    accordionItems.push({
      title: "Cancellation & Returns Policy",
      content: policyContent,
    });
  }

  // --- 5. Kindly Note ---
  if (product?.["Kindly Note"]) {
    accordionItems.push({
      title: "Kindly Note",
      content: (
        <p className="text-gray-700 text-left text-sm leading-relaxed">
          {product["Kindly Note"]}
        </p>
      ),
    });
  }

  // --- Final Render ---
  if (accordionItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <CustomAccordion items={accordionItems} />
    </div>
  );
};

export default ProductDetails;
