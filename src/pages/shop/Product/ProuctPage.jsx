import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Separator } from "@radix-ui/react-separator";
import VariantSelector from "./VariantSelector";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductReviewSection from "./ProductReviewes";
import ProductInfo from "./ProductInfo";
import ProductDetails from "./ProductDetails.";
import WhatsAppButton from "@/components/custom/WhatsAppButton";

const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // --- 🛠️ FIX: Collection name is case-sensitive ---
        const docRef = doc(db, "Products", productId);
        // ---------------------------------------------
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() };
          setProduct(productData);

          if (productData.variants && productData.variants.length > 0) {
            setSelectedVariant(productData.variants[0]);
          } else {
            // --- 🛠️ FIX: Non-variant products need this data ---
            setSelectedVariant({
              id: productData.id, // <-- Added ID
              name: productData.name,
              images: productData.images,
              price: productData.price,
              stockQuantity: productData.stockQuantity, // <-- Added stock
            });
            // ------------------------------------------------
          }
        } else {
          console.log("Product not found:", productId);
          navigate("/shop");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        navigate("/shop");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, navigate]);

  if (loading || !product || !selectedVariant) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl">
        Loading...
      </div>
    );
  }

 // ... (inside ProductPage.js)

  return (
    <div className="mx-auto p-4 max-w-8xl">
      <div className="grid grid-cols-1 md:!grid-cols-5 gap-2 md:gap-10">
        {/* Product Image */}
        <div className="flex-1 md:col-span-3">
          <ProductImageGallery
            images={selectedVariant.images}
            productName={selectedVariant.name}
          />
        </div>
 <div className="md:col-span-2">
        {/* Variant Selector */}
          {product.variants && (
            <div className="">
              <VariantSelector
                variants={product.variants}
                activeVariant={selectedVariant}
                onSelect={setSelectedVariant}
              />
            </div>
          )}

        {/* Product info, prices, and actions */}
        <ProductInfo
          product={product}
          selectedVariant={selectedVariant}
          setSelectedVariant={setSelectedVariant}
          productId={productId}
        />
        <Separator className="my-0" />
      <ProductDetails product={product} />

      </div>
      </div>
      <Separator className="m-12" />
    
      <ProductReviewSection
      productId={productId}/>
      <WhatsAppButton productName={selectedVariant.name || product.name} />
    </div>
  );
};

export default ProductPage;