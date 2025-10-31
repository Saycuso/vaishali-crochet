import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "./useCartStore";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, app } from "@/firebase";
// 🛠️ No longer need calculateSubTotal
// import { calculateSubTotal } from "@/lib/cartUtils";

// 🛠️ REMOVED SHIPPING_COST
// const SHIPPING_COST = 50.0; 

const fetchProfileFromFirestore = async (db, userId) => {
  if (!db || !userId) return null;
  
  const profileDocPath = `users/${userId}`;
  const profileDocRef = doc(db, profileDocPath);

  try {
    const docSnap = await getDoc(profileDocRef);
    return docSnap.exists() && docSnap.data().name ? docSnap.data() : null;
  } catch (e) {
    console.error("Error fetching profile document: ", e);
    return null;
  }
};

export const useCheckoutLogic = ({ db }) => {
  const navigate = useNavigate();
  const { cartItems: mainCartItems, buyNowItem } = useCartStore();
  const clearCart = useCartStore((state) => state.clearCart);

  const checkoutItems = buyNowItem ? [buyNowItem] : mainCartItems;

  const [customerInfo, setCustomerInfo] = useState(null);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderError, setOrderError] = useState(null);

  // --- 🛠️ ALL PRICE LOGIC REMOVED ---
  // const subtotal = calculateSubTotal(checkoutItems);
  // const totalAmount = subtotal + SHIPPING_COST;
  // ----------------------------------

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
        navigate("/detailspage", { state: { from: "/checkout" } });
      }
    },
    [db, navigate]
  );

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

  const handleOrderSuccess = (firebaseOrderId, paymentId) => {
    clearCart();
    navigate(
      `/order-success/${firebaseOrderId}?status=success&paymentId=${paymentId}`
    );
  };

  return {
    isLoading,
    userId,
    user,
    customerInfo,
    cartItems: checkoutItems,
    // 🛠️ REMOVED subtotal,
    // 🛠️ REMOVED totalAmount,
    isProcessing,
    orderError,
    appId: app.options.appId,
    navigate,
    setOrderError,
    setIsProcessing,
    handleOrderSuccess,
  };
};