// src/components/custom/Navbar.jsx

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LOGO from "@/data/Logo/forcrochetwebsite.png"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Shop", path: "/shop" },
    { name: "About", path: "/about" },
    { name: "Careers", path: "/careers" },
    { name: "Contact", path: "/contact" },
    { name: "Orders And Tracking", path: "/ordersandtracking"},
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className=" mx-auto p-1 flex justify-between items-center">
        {/* Mobile menu on the left */}
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
            <SheetContent side="left" className="w-64">
              <SheetTitle className="sr-only">Main Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Navigate to different sections of the website.
              </SheetDescription>
              <nav className="flex flex-col gap-3 p-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="w-full p-3 text-lg rounded-md text-gray-800 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsOpen(false)}
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
          <img src={LOGO} className="h-10 w-auto"/>
        </Link>

        {/* Desktop Navigation */}

        <div className="max-md:hidden">
          <div className="flex gap-20">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-gray-600 hover:text-gray-800 transition-colors duration-200
                ${location.pathname === item.path ? "font-semibold" : ""}`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Login and Cart on the right */}
        <div className="flex gap-1 items-center">
          <Link to="/login">
            <Button variant="outline" size="compact">
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
          <Link to="/cart">
            <Button variant="outline" size="compact" className="mr-1">
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
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
