// src/store/useCartStore.js
import { create } from "zustand";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";

export const useCartStore = create((set, get) => ({
  isCartOpen: false,
  cartItems: [],

  // --- NEW ACTIONS FOR FIRESTORE SYNC ---

  // 1. Action to reset the cart (used on logout)
  resetCart: () => {
    set({ cartItems: [], isCartOpen: false });
  },

  // 2. Action to set the cart state from Firestore (used by the listener)
  setCart: (newCartItems) => {
    // Ensure newCartItems is an array (Firestore may return undefined/null if doc is empty)
    set({ cartItems: Array.isArray(newCartItems) ? newCartItems : [] });
  },

  // 3. Async Action to sync the current cart to Firestore (called after any local modification)
  syncCartToFirestore: async (itemsToSync) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.warn("User not logged in. Cart not saved to Firestore.");
      return;
    }

    try {
      const cartRef = doc(db, "carts", userId);

      // Write the cartItems array to the Firestore document
      await setDoc(cartRef, { items: itemsToSync }, { merge: true });
      console.log("Cart synced to Firestore successfully.");
    } catch (error) {
      console.error("Error syncing cart to Firestore:", error);
    }
  },

  // --- EXISTING ACTIONS (MODIFIED TO CALL SYNC) ---

  toggleCart: (open) => {
    set((state) => ({
      isCartOpen: typeof open === "boolean" ? open : !state.isCartOpen,
    }));
  },

  addItem: (product) => {
    const { cartItems, syncCartToFirestore } = get();
    let updatedCartItems;

    const existingItem = cartItems.find((item) => item.id === product.id);

    if (existingItem) {
      updatedCartItems = cartItems.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCartItems = [...cartItems, { ...product, quantity: 1 }];
    }

    set({ cartItems: updatedCartItems });
    syncCartToFirestore(updatedCartItems); // 🔥 Call sync after state update
  },

  removeItem: (productId) => {
    const { cartItems, syncCartToFirestore } = get();
    let updatedCartItems;

    const existingItem = cartItems.find((item) => item.id === productId);

    if (existingItem.quantity > 1) {
      updatedCartItems = cartItems.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
    } else {
      updatedCartItems = cartItems.filter((item) => item.id !== productId);
    }

    set({ cartItems: updatedCartItems });
    syncCartToFirestore(updatedCartItems); // 🔥 Call sync after state update
  },

  deleteItem: (productId) => {
    const { cartItems, syncCartToFirestore } = get();

    const updatedCartItems = cartItems.filter((item) => item.id !== productId);

    set({ cartItems: updatedCartItems });
    syncCartToFirestore(updatedCartItems); // 🔥 Call sync after state update
  },

  clearCart: () => {
    // This is typically called only on successful checkout
    const { syncCartToFirestore } = get();
    set({ cartItems: [] });
    syncCartToFirestore([]); // 🔥 Call sync after state update
  },
}));
