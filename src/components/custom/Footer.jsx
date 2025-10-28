import React from 'react';
import { Link } from 'react-router-dom'; 

const Footer = () => {
  return (
    // Main Footer Container
    <footer className="w-full bg-gray-900 text-gray-300 py-8 px-4 text-center mt-auto">
      
      {/* Content Wrapper: Stacks on mobile, Row on PC */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center">
        
        {/* Left Section: Branding and Copyright */}
        <div className="mb-6 md:mb-0 text-left">
          <p className="text-xl font-semibold text-orange-400 mb-2">Vaishalis crochet</p>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Vaishalis crochet. All rights reserved.
            <br />
            Handmade with Love, Made in India.
          </p>
        </div>

        {/* Right Section: Navigation Columns */}
        {/* Added gap-12 for better PC spacing between the two columns */}
        <div className="flex flex-col md:flex-row md:gap-12 gap-6 text-left">
          
          {/* Column 1: Shop & Info */}
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-semibold mb-1 text-white">Shop & Info</p>
            {/* Links here should stack vertically for a clean look */}
            <Link to="/shop" className="text-sm hover:text-orange-400 transition">
              Shop All
            </Link>
            <Link to="/about" className="text-sm hover:text-orange-400 transition">
              About Us
            </Link>
            <Link to="/contact" className="text-sm hover:text-orange-400 transition">
              Contact Us
            </Link>
            <Link to="/careers" className="text-sm hover:text-orange-400 transition">
              Careers
            </Link>
          </div>

          {/* Column 2: Compliance Links (MANDATORY FOR RAZORPAY) */}
          <div className="flex flex-col space-y-2 mt-4 md:mt-0">
            <p className="text-sm font-semibold mb-1 text-white">Policies</p>
            {/* Links here should also stack vertically */}
            <Link to="/privacy-policy" className="text-sm hover:text-orange-400 transition">
              Privacy Policy
            </Link>
            <Link to="/terms-and-conditions" className="text-sm hover:text-orange-400 transition">
              Terms & Conditions
            </Link>
            <Link to="/refund-policy" className="text-sm hover:text-orange-400 transition">
              Refund & Return Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;