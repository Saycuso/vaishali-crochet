import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase"; // Import your Firebase auth instance

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // 1. Call the Firebase sign-out method
      await signOut(auth);

      // 2. Clear any local state/storage if necessary (like temporary profiles)
      // Note: useCartStore context may need a 'reset' action if it holds user-specific data.
      localStorage.removeItem("userProfile");

      // 3. Navigate the user to the home page or login page
      console.log("User logged out successfully.");
      navigate("/", { replace: true }); // Redirect to home page
    } catch (error) {
      console.error("Error signing out:", error);
      // Optional: Show an error message to the user
    }
  };

  return (
    <div onClick={handleLogout} style={{ cursor: "pointer" }}>
      Logout
    </div>
  );
};

export default Logout;
