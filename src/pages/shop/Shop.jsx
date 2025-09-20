// src\pages\shop\Shop.jsx
import { Link } from "react-router-dom";
import { ProductCard } from "@/pages/shop/ProductCard";
import { useEffect, useState } from "react";

import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Get a reference to the 'products' collection
        const productsCollection = collection(db, "Products");
        // Fetch all the documents from that collection
        const productSnapshot = await getDocs(productsCollection);

        // Map the documents to an array of product objects
        const productslist = productSnapshot.docs.map((doc) => ({
          id: doc?.id,
           ...doc?.data(),
        }));
        setProducts(productslist);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl">
        Loading products...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-5xl font-bold text-center mb-8">
        Shop Our Creations
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((item) => (
          <Link to={`/shop/${item.id}`} key={item.id}>
            <ProductCard product={item} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Shop;
