// src/store/useCartStore.js

import { create } from "zustand";

export const useCartStore = create((set, get) => ({
  isCartOpen: false,

  cartItems: [],

  toggleCart: (open) => {
    set((state) => ({
      isCartOpen: typeof open === "boolean" ? open : !state.isCartOpen,
    }));
  },

  addItem: (product) => {
    const existingItem = get().cartItems.find((item) => item.id === product.id);

    if (existingItem) {
      set((state) => ({
        cartItems: state.cartItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      }));
    } else {
      set((state) => ({
        cartItems: [...state.cartItems, { ...product, quantity: 1 }],
      }));
    }
  }, // <-- Comma added here

  removeItem: (productId) => {
    const existingItem = get().cartItems.find((item) => item.id === productId);
    if (existingItem.quantity > 1) {
      set((state) => ({
        cartItems: state.cartItems.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ),
      }));
    } else {
      set((state) => ({
        cartItems: state.cartItems.filter((item) => item.id !== productId),
      }));
    }
  },

  deleteItem: (productId) => {
    set((state)=>({
      cartItems: state.cartItems.filter((item)=> item.id !== productId)
    }))
  },

  clearCart: () => {
    set({ cartItems: [] });
  }, // <-- Removed extra comma here
}));
