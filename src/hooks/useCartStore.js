// src/store/useCartStore.js
import { create } from "zustand";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";

// --- 🛠️ NEW HELPER FUNCTION ---
// Creates a unique ID for a cart item.
// e.g., "product_abc" for a simple product
// e.g., "product_abc_1" for variant index 1
const getCartId = (productId, variantIndex) => {
  if (variantIndex !== null && variantIndex !== undefined) {
    return `${productId}_${variantIndex}`;
  }
  return productId;
};

export const useCartStore = create((set, get) => ({
  isCartOpen: false,
  cartItems: [],
  buyNowItem: null,

  setBuyNowItem: (item) => set({ buyNowItem: item }),

  resetCart: () => {
    set({ cartItems: [], isCartOpen: false, buyNowItem: null });
  },

  setCart: (newCartItems) => {
    set({ cartItems: Array.isArray(newCartItems) ? newCartItems : [] });
  },

  syncCartToFirestore: async (itemsToSync) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.warn("User not logged in. Cart not saved to Firestore.");
      return;
    }
    try {
      const cartRef = doc(db, "carts", userId);
      await setDoc(cartRef, { items: itemsToSync }, { merge: true });
      console.log("Cart synced to Firestore successfully.");
    } catch (error) {
      console.error("Error syncing cart to Firestore:", error);
    }
  },

  toggleCart: (open) => {
    set((state) => ({
      isCartOpen: typeof open === "boolean" ? open : !state.isCartOpen,
    }));
  },

  // --- 🛠️ UPDATED addItem FUNCTION ---
  addItem: (itemData, isBuyNow = false) => {
    // 'itemData' MUST be an object built by your component
    // It MUST contain:
    // - productId (string, the main product ID)
    // - variantIndex (number or null)
    // - name (string, the product or variant name)
    // - price (number)
    // - images (array)
    // - stockQuantity (number)

    if (!itemData.productId || !itemData.name || itemData.price === undefined) {
      console.error("addItem received incomplete item data", itemData);
      return; // Don't add a broken item
    }

    const { cartItems, syncCartToFirestore, setBuyNowItem } = get();

    // 2. Create a unique ID for this cart item
    const cartId = getCartId(itemData.productId, itemData.variantIndex);

    // 3. Handle Buy Now
    if (isBuyNow) {
      const buyNowItem = {
        ...itemData,
        cartId: cartId,
        quantity: 1,
      };
      setBuyNowItem(buyNowItem);
      return;
    }

    // 4. Standard Add to Cart Logic
    let updatedCartItems;
    const existingItem = cartItems.find((item) => item.cartId === cartId);

    if (existingItem) {
      // Found it, just increase quantity
      updatedCartItems = cartItems.map((item) =>
        item.cartId === cartId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      // Not found, add it as a new item
      updatedCartItems = [
        ...cartItems,
        { ...itemData, cartId: cartId, quantity: 1 },
      ];
    }

    set({ cartItems: updatedCartItems });
    syncCartToFirestore(updatedCartItems);
  },

  // --- 🛠️ UPDATED removeItem FUNCTION ---
  removeItem: (cartId) => {
    const { cartItems, syncCartToFirestore } = get();
    let updatedCartItems;

    const existingItem = cartItems.find((item) => item.cartId === cartId);

    if (existingItem && existingItem.quantity > 1) {
      updatedCartItems = cartItems.map((item) =>
        item.cartId === cartId ? { ...item, quantity: item.quantity - 1 } : item
      );
    } else {
      updatedCartItems = cartItems.filter((item) => item.cartId !== cartId);
    }

    set({ cartItems: updatedCartItems });
    syncCartToFirestore(updatedCartItems);
  },

  // --- 🛠️ UPDATED deleteItem FUNCTION ---
  deleteItem: (cartId) => {
    const { cartItems, syncCartToFirestore } = get();
    const updatedCartItems = cartItems.filter((item) => item.cartId !== cartId);
    set({ cartItems: updatedCartItems });
    syncCartToFirestore(updatedCartItems);
  },

  clearCart: () => {
    const { syncCartToFirestore } = get();
    set({ cartItems: [], buyNowItem: null });
    syncCartToFirestore([]);
  },
}));