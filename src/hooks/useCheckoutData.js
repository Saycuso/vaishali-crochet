import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "./useCartStore";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, app } from "@/firebase";
import { calculateSubTotal } from "@/lib/cartUtils";

const SHIPPING_COST = 50.0;
const appId = app.options.appId;

/**
 * Fetches the user's profile document from Firestore.
 */
const fetchProfileFromFirestore = async (db, userId) => {
  if (!db || !userId) return null;
  const profileDocPath = `artifacts/${appId}/users/${userId}/profile/details`;
  const profileDocRef = doc(db, profileDocPath);

  try {
    const docSnap = await getDoc(profileDocRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (e) {
    console.error("Error fetching profile document: ", e);
    return null;
  }
};

export const useCheckoutLogic = ({ db }) => {
  const navigate = useNavigate();
  const { cartItems: mainCartItems, buyNowItem } = useCartStore();
  const clearCart = useCartStore((state) => state.clearCart);

  // 🔥 DETERMINE THE FINAL ITEMS FOR CHECKOUT
  // If buyNowItem exists, use an array containing only that item. Otherwise, use the main cart.
  const checkoutItems = buyNowItem ? [buyNowItem] : mainCartItems;

  // State Management
  const [customerInfo, setCustomerInfo] = useState(null);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState(null);

  const subtotal = calculateSubTotal(checkoutItems);
  const totalAmount = subtotal + SHIPPING_COST;

  // --- Core Logic: Check Profile Status ---
  const checkProfileStatus = useCallback(
    async (firebaseUser) => {
      if (!firebaseUser || !db) {
        setIsLoading(false);
        return;
      }

      const firestoreProfile = await fetchProfileFromFirestore(
        db,
        firebaseUser.uid
      );
      if (firestoreProfile) {
        setCustomerInfo(firestoreProfile);
        setIsLoading(false);
      } else {
        console.log(
          "Profile details missing. Redirecting to details setup/review."
        );
        setIsLoading(false);
        // Redirect to /detailspage, telling it to navigate to /checkout after completion
        navigate("/detailspage", { state: { from: "/checkout" } });
      }
    },
    [db, navigate]
  );

  // --- EFFECT: Auth Listener & Profile Load ---
  useEffect(() => {
    if (!db) {
      console.error("Firestore DB instance not passed.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.uid) {
        checkProfileStatus(currentUser);
        setUserId(currentUser.uid);
      } else {
        setUser(null);
        setUserId(null);
        // 🔥
        if (checkoutItems.length > 0) {
          console.log("User not authenticated. Redirecting to login.");
          setIsLoading(false);
          navigate("/signup", { state: { from: "/detailspage" } });
        } else {
          setIsLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [db, checkoutItems.length, navigate, checkProfileStatus]);

  // --- HANDLER: PLACE ORDER ---
  const handleSaveOrderToDb = async (currentCustomerInfo) => {
    if (!user || !db) {
      setOrderError(
        "Authentication error: User not logged in or database unavailable."
      );
      return null;
    }

    const orderData = {
      userId: userId,
      // 🔥
      items: checkoutItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        thumbnail: item.images[0] || item?.variants[0]?.images[0],
      })),
      customerInfo: currentCustomerInfo,
      subtotal: subtotal,
      shipping: SHIPPING_COST,
      totalAmount: totalAmount,
      status: "Pending Payment",
      createdAt: serverTimestamp(),
    };

    try {
      const ordersCollectionPath = `artifacts/${appId}/users/${user.uid}/orders`;
      const docRef = await addDoc(
        collection(db, ordersCollectionPath),
        orderData
      );
      return {
        orderId: docRef.id,
        orderData: orderData,
      };
    } catch (e) {
      console.error("Error adding document: ", e);
      setOrderError("Failed to place order in the database. Please try again.");
      return null;
    }
  };

  const handleOrderSuccess = (firebaseOrderId, paymentId) => {
    clearCart();
    navigate(
      `/order-success/${firebaseOrderId}?status=success&paymentId=${paymentId}`
    );
  };

  return {
    // State
    isLoading,
    userId,
    user,
    customerInfo,
    cartItems: checkoutItems,
    subtotal,
    totalAmount,
    isProcessing,
    orderError,
    appId,
    // Handlers
    navigate,
    setOrderError,
    setIsProcessing,
    handleSaveOrderToDb,
    handleOrderSuccess,
  };
};
