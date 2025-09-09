// src/pages/home/HeroSection.jsx
import { Button } from "@/components/ui/button"; // Import a Shadcn component
import { useNavigate } from "react-router-dom";
const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center p-4 md:pd-8">
      {/* Hero Section */}
      <section className="text-center w-full py-16 md:py-24 bg-gray-50 rounded-lg shadow-md mb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800">
          Handmade Crochet by Vaishali
        </h1>
        <p className="mt-4 text-base md:text-lg text-gray-600 max-w-xl mx-auto">
          From our hands to your heart. Explore our unique and cozy creations.
        </p>
        <Button className="mt-6" onClick={()=>{navigate('/shop')}}>Shop Now</Button>
      </section>
    </div>
  );
};

export default HeroSection
