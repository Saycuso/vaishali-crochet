import React, { useState, useEffect } from 'react';
import { db, auth } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore'; // Keep arrayRemove for future use if needed
import { onAuthStateChanged } from 'firebase/auth';
import { ProductCard } from '@/pages/shop/ProductCard'; // Ensure correct path
import { Button } from '@/components/ui/button';
import { Loader2, HeartCrack } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// REMOVED: useCartStore import

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  // REMOVED: cart actions state

  // 1. Fetch Wishlist Product IDs and then Product Details (No changes needed here)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        setIsLoading(true);
        setError(null);
        try {
          const wishlistRef = doc(db, 'wishlist', user.uid);
          const wishlistSnap = await getDoc(wishlistRef);

          if (wishlistSnap.exists() && wishlistSnap.data().items?.length > 0) {
            const productIds = wishlistSnap.data().items;
            const productPromises = productIds.map(async (id) => {
              const productRef = doc(db, 'Products', id);
              const productSnap = await getDoc(productRef);
              return productSnap.exists() ? { id: productSnap.id, ...productSnap.data() } : null;
            });
            const productsData = (await Promise.all(productPromises)).filter(Boolean);
            setWishlistItems(productsData);
          } else {
            setWishlistItems([]);
          }
        } catch (err) {
          console.error("Error fetching wishlist items:", err);
          setError("Could not load your wishlist. Please try again later.");
          setWishlistItems([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setUserId(null);
        setWishlistItems([]);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // 2. REMOVED handleRemoveFromWishlist (Trigger is gone from card)
  //    (You might add a separate remove button outside the card later)

  // 3. REMOVED handleAddToCart

  // 4. Handle Card Click (Navigate to product page) - Stays the same
   const handleProductClick = (productId) => {
    navigate(`/shop/${productId}`);
  };


  // --- Render Logic --- (Loading, Error, Not Logged In, Empty states remain the same) ---
   // --- LOADING STATE ---
if (isLoading) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gradient-to-b from-amber-50 to-orange-100">
      <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-3" />
      <p className="text-gray-700 font-medium">Loading your wishlist...</p>
    </div>
  );
}

// --- ERROR STATE ---
if (error) {
  return (
    <div className="text-center min-h-[70vh] flex flex-col justify-center items-center bg-gradient-to-b from-amber-50 to-orange-100 px-4">
      <p className="text-red-600 font-medium mb-4">{error}</p>
      <Button onClick={() => window.location.reload()} className="bg-orange-500 hover:bg-orange-600">
        Try Again
      </Button>
    </div>
  );
}

// --- NOT LOGGED IN STATE ---
if (!userId) {
  return (
    <div className="text-center min-h-[70vh] flex flex-col justify-center items-center bg-gradient-to-b from-amber-50 to-orange-100 px-4">
      <HeartCrack className="h-14 w-14 text-gray-400 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Please Log In</h2>
      <p className="text-gray-600 mb-6 max-w-sm">
        Log in to view your wishlist and keep track of your favorite creations.
      </p>
      <Button
        onClick={() => navigate('/login', { state: { from: '/wishlist' } })}
        className="bg-orange-500 hover:bg-orange-600 text-white"
      >
        Log In
      </Button>
    </div>
  );
}

// --- EMPTY STATE ---
if (wishlistItems.length === 0) {
  return (
    <div className="text-center min-h-[70vh] flex flex-col justify-center items-center bg-gradient-to-b from-amber-50 to-orange-100 px-4">
      <HeartCrack className="h-14 w-14 text-gray-400 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your Wishlist is Empty</h2>
      <p className="text-gray-600 mb-6 max-w-sm">
        Looks like you haven’t added any favorites yet. Browse our creations and save the ones you love!
      </p>
      <Button onClick={() => navigate('/shop')} className="bg-orange-500 hover:bg-orange-600 text-white">
        Start Shopping
      </Button>
    </div>
  );
}

// --- MAIN WISHLIST GRID ---
return (
  <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 py-10 px-4 md:px-10">
    <div className="max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
          My <span className="text-orange-600">Wishlist</span>
        </h1>
        <div className="mt-3 w-24 mx-auto h-1 bg-orange-400 rounded-full"></div>
        <p className="text-gray-600 mt-3 max-w-2xl mx-auto text-base">
          A curated list of your favorite crochet pieces made with love and creativity.
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {wishlistItems.map((product) => (
          <div
            key={product.id}
            onClick={() => handleProductClick(product.id)}
            className="cursor-pointer hover:scale-[1.02] transition-transform duration-300"
          >
            <ProductCard product={product} showWishlistButton={false} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

};

export default Wishlist;