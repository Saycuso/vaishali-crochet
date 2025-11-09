import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";
// --- CHANGED: Import our new card ---
import { FeaturedProductCard } from "./FeaturedProductCard";
// --- REMOVED: useNavigate and useCartStore ---

// A skeleton component to match the new card
const ProductCardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden shadow-md bg-white flex flex-col animate-pulse">
    <div className="w-full h-64 bg-gray-200" />
    <div className="p-4 flex-1">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-6 bg-gray-200 rounded w-1/2" />
    </div>
    <div className="p-4 pt-0">
      <div className="h-5 bg-gray-200 rounded w-1/3" />
    </div>
  </div>
);

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- REMOVED: cart and navigate logic ---

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const productsRef = collection(db, "Products");
        const q = query(productsRef, limit(3));

        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(productsData);
      } catch (err) {
        console.error("Error fetching featured products:", err);
        setError("Could not load products. Please try again later.");
      }
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  // --- REMOVED: handleProductClick and handleAddToCart handlers ---

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="grid  sm:grid-cols-2 md:grid-cols-3 gap-8">
      {isLoading
        ? [1, 2, 3].map((i) => <ProductCardSkeleton key={i} />)
        : // --- CHANGED: Simplified render logic ---
          products.map((product) => (
            <FeaturedProductCard key={product.id} product={product} />
          ))}
    </div>
  );
};

export default FeaturedProducts;