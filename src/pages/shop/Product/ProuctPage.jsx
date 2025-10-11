import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Separator } from "@radix-ui/react-separator";
import VariantSelector from "./VariantSelector";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductReviews from "./ProductReviewes";
import ProductInfo from "./ProductInfo";
import ProductDetails from "./ProductDetails.";

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
        const docRef = doc(db, "Products", productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() };
          setProduct(productData);

          if (productData.variants && productData.variants.length > 0) {
            setSelectedVariant(productData.variants[0]);
          } else {
            setSelectedVariant({
              name: productData.name,
              images: productData.images,
              price: productData.price,
            });
          }
        } else {
          console.log("this is the productId", docSnap.id);
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

  return (
    <div className="mx-auto p-4 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Product Image */}
        <div className="flex-1">
          <ProductImageGallery
            images={selectedVariant.images}
            productName={selectedVariant.name}
          />
        </div>

        {/* Variant Selector */}
        {product.variants && (
          <div className="mt-4">
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
        />
      </div>

      <Separator className="my-12" />
      <ProductDetails product={product} />
      <Separator className="m-12" />
      <ProductReviews 
      productId={productId}/>
    </div>
  );
};

export default ProductPage;
