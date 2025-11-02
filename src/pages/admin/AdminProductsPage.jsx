// src/pages/AdminProductsPage.jsx

import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, app } from "@/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Package, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const functions = getFunctions(app, "us-central1");
const updateProductStock = httpsCallable(functions, "updateProductStock");

// --- Product Card ---
const ProductStockCard = ({ product }) => {
  const [stock, setStock] = useState(product.stockQuantity);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  let imageUrl = "https://via.placeholder.com/80";
  if (product.images?.[0]) imageUrl = product.images[0];
  else if (product.variants?.[0]?.images?.[0]) imageUrl = product.variants[0].images[0];

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      await updateProductStock({ productId: product.id, newStock: Number(stock) });
      setMessage({ type: "success", text: "Saved!" });
    } catch (error) {
      console.error("Stock update error:", error);
      setMessage({ type: "error", text: "Error!" });
    }
    setIsLoading(false);
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <Card className="bg-white hover:shadow-lg transition-shadow border border-gray-200 rounded-xl">
      <CardContent className="flex justify-between items-center p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
          />
          <div>
            <p className="font-semibold text-gray-800">{product.name}</p>
            <p className="text-sm text-gray-500">
              {product.description ? product.description.slice(0, 40) + "..." : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-20 text-center border-gray-300"
          />
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4"
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Save"}
          </Button>
          {message && (
            message.type === "success" ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// --- Main Page ---
const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const productsRef = collection(db, "Products");
    const q = query(productsRef, orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(fetched);
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Package className="h-7 w-7 text-orange-600" />
        Product Stock Management
      </h1>

      <div className="space-y-4 max-w-3xl mx-auto">
        {products.map((product) => (
          <ProductStockCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default AdminProductsPage;
