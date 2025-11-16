import {
  Card,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Heart, Star } from "lucide-react";
import React, { useState, useEffect } from "react";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export const ProductCard = ({ product, showWishlistButton = true }) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isProcessingWishlist, setIsProcessingWishlist] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const calculateTotalStock = (product) => {
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      // It's a VARIABLE product. Sum the stock of all variants.
      return product.variants.reduce((total, variant) => {
        return total + (variant.stockQuantity || 0); // Add each variant's stock
      }, 0);
    }
    // It's a SIMPLE product. Use the top-level stock.
    return product.stockQuantity || 0;
  };
  
  const totalStock = calculateTotalStock(product);

  const imageUrl =
    product?.images?.[0] ||
    product?.variants?.[0]?.images?.[0] ||
    "https://placehold.co/400x300?text=No+Image";

  const hasDiscount =
    product?.originalprice && product?.originalprice > product?.price;

  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalprice - product.price) / product.originalprice) * 100
      )
    : 0;

  // 🧠 FETCH REAL REVIEWS
  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?.id) return;
      try {
        const reviewsRef = collection(db, "reviews");
        const q = query(reviewsRef, where("productId", "==", product.id));
        const snapshot = await getDocs(q);

        const fetchedReviews = snapshot.docs.map((doc) => doc.data());
        if (fetchedReviews.length > 0) {
          const total = fetchedReviews.reduce(
            (sum, review) => sum + (review.rating || 0),
            0
          );
          setAvgRating((total / fetchedReviews.length).toFixed(1));
          setReviewCount(fetchedReviews.length);
        } else {
          setAvgRating(0);
          setReviewCount(0);
        }
      } catch (error) {
        console.error("Error fetching product reviews:", error);
      }
    };

    fetchReviews();
  }, [product.id]);

  // 🧠 WISHLIST LOGIC (same as before)
  useEffect(() => {
    if (!showWishlistButton) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setIsProcessingWishlist(true);
        const wishlistRef = doc(db, "wishlist", user.uid);

        try {
          const docSnap = await getDoc(wishlistRef);
          setIsWishlisted(
            docSnap.exists() && docSnap.data().items?.includes(product.id)
          );
        } catch (error) {
          console.error("Error checking wishlist:", error);
        } finally {
          setIsProcessingWishlist(false);
        }
      } else {
        setUserId(null);
        setIsWishlisted(false);
      }
    });

    return () => unsubscribe();
  }, [product.id, showWishlistButton]);

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!userId) {
      alert("Please log in to add items to your wishlist.");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    if (isProcessingWishlist) return;

    setIsProcessingWishlist(true);
    const wishlistRef = doc(db, "wishlist", userId);

    try {
      const docSnap = await getDoc(wishlistRef);
      if (docSnap.exists()) {
        if (docSnap.data().items?.includes(product.id)) {
          await updateDoc(wishlistRef, { items: arrayRemove(product.id) });
          setIsWishlisted(false);
        } else {
          await updateDoc(wishlistRef, { items: arrayUnion(product.id) });
          setIsWishlisted(true);
        }
      } else {
        await setDoc(wishlistRef, { items: [product.id] });
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      alert("Could not update wishlist. Please try again.");
    } finally {
      setIsProcessingWishlist(false);
    }
  };

  return (
    <Card
      className="rounded-2xl shadow-md bg-white overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group gap-2"
    >
      {/* Discount Badge */}
      {hasDiscount && totalStock > 0 && (
        <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          -{discountPercent}%
        </span>
      )}

      {/* Wishlist Button */}
      {showWishlistButton && (
        <button
          onClick={handleWishlistToggle}
          disabled={isProcessingWishlist}
          className={`absolute top-3 right-3 bg-white/80 hover:bg-white rounded-full p-2 shadow-sm z-10 ${
            isProcessingWishlist ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-colors duration-200 ${
              isWishlisted
                ? "text-red-500 fill-red-500"
                : "text-gray-500 hover:text-red-500"
            }`}
          />
        </button>
      )}

      {/* Product Image */}
      <div className="overflow-hidden relative rounded-t-2xl">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {totalStock  === 0 && (
          <CardTitle className="absolute inset-0 bg-black/50 text-white font-bold flex items-center justify-center text-base">
            Out of Stock
          </CardTitle>
        )}
      </div>

      <CardContent className="px-3 py-0">
        {/* Product Name */}
        <h3 className="text-md font-semibold text-gray-800 line-clamp-2 leading-tight text-left">
          {product.name}
        </h3>

        {/* Ratings from Firestore */}
        <div className="flex items-center gap-2 mt-1">
          <div className="flex text-yellow-400 text-xs">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                fill={i < Math.round(avgRating) ? "#facc15" : "none"}
                stroke="#facc15"
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-600">
            {avgRating} ({reviewCount})
          </span>
        </div>
      </CardContent>

      <CardFooter className="px-3 pb-4 flex flex-col items-start gap-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-gray-800">
            ₹{product.price}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-800 opacity-80 line-through">
              ₹{product.originalprice}
            </span>
          )}
        </div>

        {hasDiscount && (
          <span className="text-[11px] text-red-600 font-medium">
            Limited time deal
          </span>
        )}
      </CardFooter>
    </Card>
  );
};
