import { Link } from "react-router-dom";
import { ProductCard } from "@/pages/shop/ProductCard";
import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        const productsCollection = collection(db, "Products");
        const productSnapshot = await getDocs(productsCollection);
        const productsList = productSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsList);

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

  const filteredProducts = products.filter((product) => {
    if (selectedCategory === "all") return true;
    const hasOldCategory =
      String(product["sub-categoryId"]) === String(selectedCategory);
    const hasNewCategory =
      Array.isArray(product.subcategory_ids) &&
      product.subcategory_ids.some(
        (id) => String(id) === String(selectedCategory)
      );
    return hasOldCategory || hasNewCategory;
  });

  const handleFilterChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl text-orange-600">
        Loading products...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 to-pink-100 py-10 px-4 md:px-10">
      {/* 🧶 Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
          Shop Our <span className="text-orange-600">Creations</span>
        </h1>
        <div className="mt-3 w-24 mx-auto h-1 bg-orange-400 rounded-full"></div>
        <p className="text-gray-600 mt-3 max-w-2xl mx-auto text-base">
          Explore our collection of handcrafted crochet products made with love
          and care. Each piece tells a story of art and empowerment.
        </p>
      </div>

      {/* 🧵 Filter Dropdown */}
      <div className="flex justify-center mb-12">
        <select
          value={selectedCategory}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="border border-orange-300 rounded-full p-3 px-6 text-lg text-gray-800 
                     focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm transition-all"
        >
          <option value="all">All Creations</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* 🧺 Product Grid */}
      <div className="grid md:grid-cols-3 sm:grid-cols-2  lg:grid-cols-4 gap-8">
        {filteredProducts.length === 0 && (
          <p className="col-span-full text-center text-lg text-gray-600 italic">
            No products found in this category.
          </p>
        )}

        {filteredProducts.map((item) => (
          <Link to={`/shop/${item.id}`} key={item.id}>
            <div className="hover:scale-[1.02] transition-transform duration-300">
              <ProductCard product={item} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Shop;
