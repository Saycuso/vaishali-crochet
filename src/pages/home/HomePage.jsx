// src/pages/home/HomePage.jsx
import HeroSection from "./HeroSection";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8">
      {/* Now your homepage component is cleaner and just renders the sections */}
      <HeroSection />

      {/* Other Sections will follow here */}
      <section className="w-full">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-6">
          Featured Creations
        </h2>
        {/* Product Cards will go here */}
      </section>

      {/* And so on... */}
    </div>
  );
};

export default HomePage;