// src\pages\shop\Shop.jsx
import { Link } from "react-router-dom";
import { ProductCard } from "@/pages/shop/ProductCard";
import { useEffect, useState } from "react";
import mockData from "@/data/MockData";

const Shop = () => {
  const [products, setProducts] = useState([]);


  useEffect(() => {
    setProducts(mockData);
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl md:text-5xl font-bold text-center mb-8">Shop Our Creations</h1>
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
