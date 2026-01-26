import React, { Suspense } from "react"; // 👈 Import React & Suspense
import HeroSection from "@/components/custom/HeroSection";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// 1. 👇 LAZY LOAD HEAVY COMPONENTS (The Secret Sauce)
// This tells React: "Don't download this code until the user actually needs it."
const FeaturedProducts = React.lazy(() => import("./FeaturedProducts"));
const YouTubeMilestone = React.lazy(() => import("@/components/custom/YouTubeMilestone"));

// Simple loading spinner for the sections
const SectionLoader = () => (
  <div className="w-full py-12 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center w-full overflow-x-hidden">
      {/* 1️⃣ Hero Section (EAGER LOAD) */}
      {/* We keep this normal because it's the first thing the user sees */}
      <HeroSection />

      {/* 2️⃣ Featured Creations (LAZY LOAD) */}
      <section className="w-full max-w-6xl text-center py-8 md:py-12 px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">
          Featured Creations
        </h2>
        <p className="text-gray-500 mb-6 max-w-xl mx-auto">
          Discover our handpicked collection — each piece crafted with care and passion.
        </p>
        
        {/* 👇 WRAP IN SUSPENSE */}
        <Suspense fallback={<SectionLoader />}>
          <FeaturedProducts />
        </Suspense>
      </section>

      {/* Divider */}
      <div className="w-full h-[1px] bg-gradient-to-r from-orange-200 via-pink-200 to-orange-200" />

      {/* 3️⃣ YouTube Milestone (LAZY LOAD) */}
      <section className="w-full bg-pink-50 py-8 md:py-12 px-6 md:hidden">
        {/* 👇 WRAP IN SUSPENSE */}
        <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse" />}>
          <YouTubeMilestone />
        </Suspense>
      </section>

      {/* Divider */}
      <div className="w-full h-[1px] bg-gradient-to-r from-orange-200 via-pink-200 to-orange-200" />

      {/* 4️⃣ About Section (Hardcoded Text is fine, it's fast) */}
      <section className="w-full bg-pink-50 py-8 md:py-12 px-6 md:hidden">
        <div className="text-center md:text-left max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            About Vaishali’s Crochet
          </h2>
          <p className="text-gray-600 mb-5 leading-relaxed">
            Every thread tells a story — we blend creativity and care to make handmade
            pieces that bring warmth to your life. From elegant home decor to cozy gifts,
            each crochet creation is designed with love and attention to detail.
          </p>
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 py-2"
            onClick={() => navigate("/about")}
          >
            Learn More
          </Button>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-[1px] bg-gradient-to-r from-pink-200 via-orange-200 to-pink-200" />

      {/* 5️⃣ Contact Us Section */}
      <section className="w-full bg-white py-8 md:py-12 px-6 text-center border-t border-gray-100 md:hidden">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Contact Us</h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">
          Have a custom order or just want to say hello? We’d love to hear from you!
        </p>
        <Button
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8 py-3 "
          onClick={() => navigate("/contact")}
        >
          Get in Touch
        </Button>
      </section>

      {/* 6️⃣ Careers Section */}
      <section className="w-full bg-pink-100 py-8 md:py-12 px-6 text-center md:hidden">
        <h2 className="text-3xl font-bold mb-3 text-gray-800">Join Our Team</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Are you passionate about handmade art, creativity, and craftsmanship?
          We’re always looking for crochet artists and digital creators to grow with us.
        </p>
        <Button
          className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-8 py-3"
          onClick={() => navigate("/careers")}
        >
          View Open Roles
        </Button>
      </section>
    </div>
  );
};

export default HomePage;