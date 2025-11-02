// src/pages/AdminProductsPage.jsx

import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, app } from "@/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// --- 1. Initialize the new Cloud Function ---
const functions = getFunctions(app, "us-central1");
const updateProductStock = httpsCallable(functions, "updateProductStock");

// --- 2. Create a reusable Product Card component ---
const ProductStockCard = ({ product }) => {
  const [stock, setStock] = useState(product.stockQuantity);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null); // To show "Saved!" or "Error!"

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      await updateProductStock({ productId: product.id, newStock: Number(stock) });
      setMessage({ type: "success", text: "Saved!" });
    } catch (error) {
      console.error("Stock update error:", error);
      setMessage({ type: "error", text: error.message });
    }
    setIsLoading(false);
    // Hide message after 2 seconds
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <Card className="flex flex-col sm:flex-row justify-between items-center p-4 gap-4">
      <div className="flex items-center gap-4">
        <img 
          src={product.images[0]?.url || "https://via.placeholder.com/64"} 
          alt={product.name}
          className="w-16 h-16 object-cover rounded-md border"
        />
        <div>
          <p className="font-semibold">{product.name}</p>
          <p className="text-sm text-gray-500">ID: {product.id}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-24 text-center"
        />
        <Button onClick={handleSave} disabled={isLoading} className="w-24">
          {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Save"}
        </Button>
        {message && (
          message.type === 'success' ? 
          <CheckCircle className="h-5 w-5 text-green-500" /> :
          <AlertCircle className="h-5 w-5 text-red-500" />
        )}
      </div>
    </Card>
  );
};

// --- 3. The Main Page Component ---
const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for real-time product updates
    const productsRef = collection(db, "Products");
    const q = query(productsRef, orderBy("name", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProducts = [];
      snapshot.forEach((doc) => {
        fetchedProducts.push({ id: doc.id, ...doc.data() });
      });
      setProducts(fetchedProducts);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin h-8 w-8 text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <h1 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
        <Package className="h-8 w-8" />
        Admin: Product Stock
      </h1>
      
      <div className="space-y-4 max-w-4xl mx-auto">
        {products.map((product) => (
          <ProductStockCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default AdminProductsPage;