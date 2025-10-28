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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  ShoppingBag,
  Info,
  Briefcase,
  Mail,
  Package,
  LogOut,
  LogIn,
  Heart,
} from "lucide-react";

const auth = getAuth(app);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [wishlistCount] = useState(0); // ✅ start with 0, no random “3”
  const location = useLocation();
  const { toggleCart, cartItems, clearCart } = useCartStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      console.log(`Auth state changed. Logged in: ${!!user}`);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearCart();
      console.log("User logged out successfully.");
      setIsOpen(false);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const baseNavItems = [
    { name: "Shop", path: "/shop", icon: ShoppingBag },
    { name: "About", path: "/about", icon: Info },
    { name: "Careers", path: "/careers", icon: Briefcase },
    { name: "Contact", path: "/contact", icon: Mail },
    { name: "Orders And Tracking", path: "/orderstrackingpage", icon: Package },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="mx-auto p-1 flex justify-between items-center">
        {/* ================= Mobile Menu ================= */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="compact" className="ml-1">
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

            <SheetContent side="left" className="w-65 flex flex-col p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="text-left">
                  <Link
                    to="/"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2"
                  >
                    <img src={LOGO} className="h-10 w-auto" alt="Logo" />
                  </Link>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Main navigation menu.
                </SheetDescription>
              </SheetHeader>

              {/* Navigation links */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {baseNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 shadow-sm border border-orange-200"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <item.icon
                        className={`h-5 w-5 ${
                          isActive ? "text-orange-600" : "text-gray-600"
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Auth Section */}
              <div className="mt-auto border-t p-4">
                {isLoggedIn ? (
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-red-50 hover:text-red-600 text-base font-medium"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </Button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-100 hover:text-gray-900 text-base font-medium"
                  >
                    <LogIn className="h-5 w-5 text-gray-600" />
                    Login
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* ================= Logo ================= */}
        <Link to="/" className="text-2xl font-bold text-gray-800">
          <img src={LOGO} className="h-10 w-auto" alt="Logo" />
        </Link>

        {/* ================= Desktop Navigation ================= */}
        <div className="max-md:hidden">
          <div className="flex gap-10 lg:gap-20">
            {baseNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-gray-600 hover:text-gray-800 transition-colors duration-200 ${
                  location.pathname === item.path
                    ? "font-semibold text-gray-900"
                    : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* ================= Right Side: Wishlist + Cart ================= */}
        <div className="flex gap-2 items-center mr-2">
          {isLoggedIn ? (
            <Link to="/wishlist">
              <Button
                variant="outline"
                size="compact"
                title="Wishlist"
                className="relative"
              >
                <Heart className="h-5 w-5 text-red-500" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Button>
            </Link>
          ) : (
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

          {/* Cart Button */}
          <Button
            variant="outline"
            size="compact"
            onClick={() => toggleCart(true)}
            className="relative"
            title="View Shopping Cart"
          >
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
            {cartItems.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
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
