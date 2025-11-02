import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, app } from "@/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Package, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// --- 1. Initialize the new Cloud Function ---
const functions = getFunctions(app, "us-central1");
const updateProductStock = httpsCallable(functions, "updateProductStock");


// --- 2. NEW Sub-Component: VariantStockEditor ---
// This component handles the logic for a *single variant*
const VariantStockEditor = ({ productId, variant, variantIndex }) => {
  const [stock, setStock] = useState(variant.stockQuantity || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      // We now pass the variantIndex to the backend
      await updateProductStock({ 
        productId: productId, 
        newStock: Number(stock),
        variantIndex: variantIndex // 👈 Tell the backend WHICH variant to update
      });
      setMessage({ type: "success" });
    } catch (error) {
      console.error("Stock update error:", error);
      setMessage({ type: "error" });
    }
    setIsLoading(false);
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <div className="flex items-center justify-between pl-10 pr-4 py-3 bg-gray-50 rounded-lg">
      <p className="font-medium text-gray-700">{variant.name}</p>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-20 text-center border-gray-300"
        />
        <Button
          onClick={handleSave}
          disabled={isLoading}
          size="sm" // Smaller button for variants
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-3"
        >
          {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Save"}
        </Button>
        {message && (
          message.type === "success" ? 
          <CheckCircle className="h-5 w-5 text-green-500" /> :
          <AlertCircle className="h-5 w-5 text-red-500" />
        )}
      </div>
    </div>
  );
}


// --- 3. Main Product Card (Now handles BOTH simple and variable) ---
const ProductStockCard = ({ product }) => {
  const [stock, setStock] = useState(product.stockQuantity || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Check if this is a variable product
  const hasVariants = product.variants && Array.isArray(product.variants) && product.variants.length > 0;

  let imageUrl = "https://via.placeholder.com/80";
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    imageUrl = product.images[0];
  } else if (hasVariants) {
    const variantImages = product.variants[0].images;
    if (variantImages && Array.isArray(variantImages) && variantImages.length > 0) {
      imageUrl = variantImages[0];
    }
  }

  // This handleSave is only for SIMPLE (non-variant) products
  const handleSimpleSave = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      // We pass 'null' for variantIndex to update the top-level stock
      await updateProductStock({ 
        productId: product.id, 
        newStock: Number(stock), 
        variantIndex: null 
      });
      setMessage({ type: "success" });
    } catch (error) {
      console.error("Stock update error:", error);
      setMessage({ type: "error" });
    }
    setIsLoading(false);
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <Card className="bg-white hover:shadow-lg transition-shadow border border-gray-200 rounded-xl overflow-hidden">
      <CardContent className="flex items-center p-4 gap-4">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-20 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
        />
        <div className="flex flex-col justify-between flex-1 min-w-0 gap-3">
          <p className="font-semibold text-gray-800 truncate">
            {product.name}
          </p>

          {/* --- 🛠️ CONDITIONAL RENDER --- */}
          {/* If it's a SIMPLE product, show the main stock editor */}
          {!hasVariants && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-20 text-center border-gray-300"
              />
              <Button
                onClick={handleSimpleSave}
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Save"}
              </Button>
              {message && (
                message.type === "success" ? 
                <CheckCircle className="h-5 w-5 text-green-500" /> :
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* If it IS a variable product, show the list of variant editors */}
      {hasVariants && (
        <div className="flex flex-col gap-2 px-4 pb-4">
          {product.variants.map((variant, index) => (
            <VariantStockEditor
              key={variant.id || index}
              productId={product.id}
              variant={variant}
              variantIndex={index}
            />
          ))}
        </div>
      )}
    </Card>
  );
};


// --- 4. Main Page ---
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