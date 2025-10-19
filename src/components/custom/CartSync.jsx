import React, { useEffect } from "react";
import { useCartStore } from "@/hooks/useCartStore"; // Your Zustand Store
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/firebase"; // Your Firebase App instance

const CartSync = () => {
  // Destructure the actions we need
  const { setCart, resetCart } = useCartStore();

  useEffect(() => {
    let unsubscribeFromFirestore = null;

    // 1. Listen for Authentication state changes
    const unsubscribeFromAuth = onAuthStateChanged(auth, (user) => {
      // Clear any previous Firestore listener
      if (unsubscribeFromFirestore) {
        unsubscribeFromFirestore();
        unsubscribeFromFirestore = null;
      }

      if (user) {
        // User is LOGGED IN: Start subscribing to their cart
        const userId = user.uid;
        const cartRef = doc(db, "carts", userId);

        console.log(`User logged in (${userId}). Setting up cart listener.`);

        // 2. Subscribe to the Firestore Cart document (Real-time listener)
        unsubscribeFromFirestore = onSnapshot(
          cartRef,
          (docSnap) => {
            if (docSnap.exists()) {
              // Document exists, retrieve the items array
              const cartData = docSnap.data().items || [];
              console.log("Cart data received from Firestore.");
              // 2. LOG: Let's see what cartData actually is
              console.log("Cart Data:", cartData); // <-- 🛠️ ADD THIS LINE
              setCart(cartData); // 🔥 Update Zustand with remote data
            } else {
              // Document doesn't exist (new user or first cart item hasn't been added yet)
              console.log(
                "No cart document found in Firestore. Resetting local cart."
              );
              setCart([]); // Reset local cart to empty
            }
          },
          (error) => {
            console.error("Error listening to cart changes:", error);
            // Handle error (e.g., reset cart to avoid showing stale data)
            setCart([]);
          }
        );
      } else {
        // User is LOGGED OUT: Clear the local cart
        console.log("User logged out. Resetting local cart.");
        resetCart(); // This handles the logout cleanup (already in Navbar but good for redundancy)
      }
    });

    // 3. Cleanup function: Unsubscribe all listeners when the component unmounts
    return () => {
      unsubscribeFromAuth();
      if (unsubscribeFromFirestore) {
        unsubscribeFromFirestore();
      }
    };
  }, [resetCart, setCart]);

  // This component doesn't render anything visually
  return null;
};

export default CartSync;
