import { Link } from "react-router-dom";
import { ProductCard } from "@/pages/shop/ProductCard";
import { useEffect, useState } from "react";

import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // State for sub-categories
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        // --- 1. FETCH PRODUCTS ---
        const productsCollection = collection(db, "Products");
        const productSnapshot = await getDocs(productsCollection);
        const productslist = productSnapshot.docs.map((doc) => ({
          id: doc?.id,
          ...doc?.data(),
        }));
        setProducts(productslist);

        // --- 2. FETCH SUB-CATEGORIES ---
        const categoriesCollection = collection(db, "sub-categories");
        const categorySnapshot = await getDocs(categoriesCollection);
        const categoryList = categorySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching shop data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShopData();
  }, []);

  // --- 🛠️ UPDATED FILTERING LOGIC (This is the fix!) ---
  const filteredProducts = products.filter((product) => {
    // 1. If 'all' is selected, show all products
     if (selectedCategory === "all") return true;

  const hasOldCategory = String(product["sub-categoryId"]) === String(selectedCategory);

  const hasNewCategory =
    Array.isArray(product.subcategory_ids) &&
    product.subcategory_ids.some(
      (id) => String(id) === String(selectedCategory)
    );

    // 4. If EITHER is true, show the product
    return hasOldCategory || hasNewCategory;
  });
  // --- 🛠️ END OF FIX ---

  // --- HANDLER ---
  const handleFilterChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

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

      {/* --- DROPDOWN SELECT --- */}
      <div className="flex justify-center mb-10">
        <select
          value={selectedCategory}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-full max-w-xs text-lg text-gray-700 
                     focus:ring-orange-600 focus:border-orange-600 appearance-none bg-white shadow-sm"
        >
          {/* Default Option: Show All */}
          <option value="all">All Creations</option>

          {/* Dynamic Category Options */}
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* --- PRODUCT GRID (Using filteredProducts) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.length === 0 && (
          <p className="col-span-full text-center text-lg text-gray-500">
            No products found in this category.
          </p>
        )}

        {filteredProducts.map((item) => (
          <Link to={`/shop/${item.id}`} key={item.id}>
            <ProductCard product={item} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Shop;