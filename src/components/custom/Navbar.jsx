// src/components/custom/Navbar.jsx

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/hooks/useCartStore";
import LOGO from "@/data/Logo/forcrochetwebsite.png";
import { app } from "@/firebase";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";

const auth = getAuth(app); // Initialize auth instance once

// Placeholder for the missing logo import
const LOGO_PLACEHOLDER = "Handmade With Love";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  // 2. State to track login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  // 3. Destructure cart actions and state
  const { toggleCart, cartItems, clearCart } = useCartStore();

  // --- Auth State Listener ---
  useEffect(() => {
    // This listener runs immediately, and then every time the user logs in or out
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // If user object exists, they are logged in (user will be null if logged out).
      setIsLoggedIn(!!user);
      console.log(`Auth state changed. Logged in: ${!!user}`);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // --- Logout Handler ---
  const handleLogout = async () => {
    try {
      // Using a try/catch to handle sign out gracefully
      await signOut(auth);
      clearCart();
      console.log("User logged out successfully.");
      // Close the mobile menu after logging out
      setIsOpen(false);
      // Firebase listener updates isLoggedIn automatically
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Base navigation items
  const baseNavItems = [
    { name: "Shop", path: "/shop" },
    { name: "About", path: "/about" },
    { name: "Careers", path: "/careers" },
    { name: "Contact", path: "/contact" },
    { name: "Orders And Tracking", path: "/orderstrackingpage" },
  ];

  // Dynamically add Login/Logout to mobile menu
  const mobileNavItems = [
    ...baseNavItems,
    // Conditionally add the Logout or Login item
    ...(isLoggedIn
      ? [{ name: "Logout", onClick: handleLogout }]
      : [{ name: "Login", path: "/login" }]),
  ];

  // Helper function to handle mobile link clicks
  const handleMobileLinkClick = (item) => {
    setIsOpen(false);
    if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="mx-auto p-1 flex justify-between items-center">
        {/* Mobile menu on the left */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="compact" className="ml-1">
                {/* Menu Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-menu"
                >
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetTitle className="sr-only">Main Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Navigate to different sections of the website.
              </SheetDescription>
              <nav className="flex flex-col gap-3 p-4">
                {/* Use dynamically filtered mobileNavItems */}
                {mobileNavItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path || "#"} // Use path if it exists, otherwise '#' for buttons
                    onClick={() => handleMobileLinkClick(item)}
                    className="w-full p-3 text-lg rounded-md text-gray-800 hover:bg-gray-100 transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo and Home link (centered) */}
        <Link to="/" className="text-2xl font-bold text-gray-800">
          {/* Using text placeholder since image path was missing */}
          <img src={LOGO} className="h-10 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="max-md:hidden">
          <div className="flex gap-10 lg:gap-20">
            {baseNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-gray-600 hover:text-gray-800 transition-colors duration-200
                ${
                  location.pathname === item.path
                    ? "font-semibold text-gray-900"
                    : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
            {/* Desktop Logout Button - Hidden in favor of using the primary User/Login button */}
            {/* Keeping it clean: Auth state is managed by the main right-side button */}
          </div>
        </div>

        {/* User Profile / Login and Cart on the right */}
        <div className="flex gap-1 items-center">
          {/* 4. Conditional User/Login Button */}
          {isLoggedIn ? (
            // Show Profile Icon if logged in
            <Link to="/detailspage">
              <Button variant="outline" size="compact" title="User Profile">
                {/* User Profile Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-user"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Button>
            </Link>
          ) : (
            // Show Login Button if logged out
            <Link to="/login">
              <Button
                variant="default"
                size="compact"
                className="bg-orange-600 hover:bg-orange-700"
              >
                Login
              </Button>
            </Link>
          )}

          {/* Cart Button with Count (Opens the CartSidebar via toggleCart) */}
          <Button
            variant="outline"
            size="compact"
            onClick={() => toggleCart(true)}
            className="mr-1 relative"
            title="View Shopping Cart"
          >
            {/* Shopping Cart Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-shopping-cart"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57L22 4H6" />
            </svg>
            {/* Cart Item Count Badge */}
            {cartItems.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {/* Display up to 9 items, then '9+' */}
                {cartItems.length > 9 ? "9+" : cartItems.length}
              </span>
            )}
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
