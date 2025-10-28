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
   if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        <p className="ml-3 text-gray-600">Loading your wishlist...</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="text-center min-h-[60vh] flex flex-col justify-center items-center">
        <p className="text-red-600">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Try Again</Button>
      </div>
     );
  }

  if (!userId) {
     return (
      <div className="text-center min-h-[60vh] flex flex-col justify-center items-center px-4">
        <HeartCrack className="h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Please Log In</h2>
        <p className="text-gray-500 mb-6">Log in to view your wishlist items.</p>
        <Button onClick={() => navigate('/login', { state: { from: '/wishlist' } })}>
          Log In
        </Button>
      </div>
     );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center min-h-[60vh] flex flex-col justify-center items-center px-4">
        <HeartCrack className="h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your Wishlist is Empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added any favorites yet!</p>
        <Button onClick={() => navigate('/shop')}>
          Start Shopping
        </Button>
      </div>
    );
  }


  // --- Display Wishlist Items ---
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 border-b pb-4">
        My Wishlist ({wishlistItems.length})
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistItems.map((product) => (
          // Make the whole div clickable
          <div key={product.id} onClick={() => handleProductClick(product.id)} className="cursor-pointer">
              <ProductCard
                product={product}
                // Pass false to hide the heart button on this page
                showWishlistButton={false}
              />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;