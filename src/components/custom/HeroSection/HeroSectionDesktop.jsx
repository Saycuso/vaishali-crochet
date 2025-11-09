import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// 🔧 Constants
const HERO_COLLECTION = "hero-section-images";
const DECORATIVE_HERO_DOC_ID = "FsjPBGYTg2W4phsydIgT";
const DEFAULT_IMAGE_URL =
  "https://via.placeholder.com/1200x600?text=Handmade+Crochet+by+Vaishali";

const HeroSectionDesktop = () => {
  const navigate = useNavigate();

  // 🧩 State
  const [heroImages, setHeroImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [carouselApi, setCarouselApi] = useState(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // 🎬 Autoplay ref
  const autoplay = useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

  // 🪄 Fetch hero images from Firestore
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const docRef = doc(db, HERO_COLLECTION, DECORATIVE_HERO_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const images = data.ocassions?.Decorative;
          setHeroImages(
            Array.isArray(images) && images.length > 0
              ? images
              : [DEFAULT_IMAGE_URL]
          );
        } else {
          setHeroImages([DEFAULT_IMAGE_URL]);
        }
      } catch (error) {
        console.error("Error fetching hero content:", error);
        setHeroImages([DEFAULT_IMAGE_URL]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeroImages();
  }, []);

  // 🎡 Carousel logic
  useEffect(() => {
    if (!carouselApi) return;

    const updateCurrent = () => setCurrent(carouselApi.selectedScrollSnap());
    setCount(carouselApi.scrollSnapList().length);
    setCurrent(carouselApi.selectedScrollSnap());

    carouselApi.on("select", updateCurrent);
    return () => carouselApi.off("select", updateCurrent);
  }, [carouselApi]);

  // 🌀 Loading skeleton
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px] bg-gray-100 animate-pulse rounded-lg" />
    );
  }

  // 💫 Render
  return (
    <section className="relative flex flex-col items-center w-full max-w-7xl mx-auto py-8 px-8 lg:px-16 rounded-2xl overflow-hidden bg-gradient-to-r from-pink-50 via-white to-orange-50 shadow-lg">
      {/* 🌐 Local nav links above the hero */}
      <nav className="flex gap-10 mb-6 self-end pr-4">
        {[
          { label: "About Us", path: "/about" },
          { label: "Contact Us", path: "/contact" },
          { label: "Careers", path: "/careers" },
        ].map(({ label, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="text-gray-600 hover:text-orange-600 font-medium transition-colors text-lg"
          >
            {label}
          </button>
        ))}
      </nav>

      {/* 🧱 Main Hero Content */}
      <div className="flex items-center justify-between w-full">
        {/* 🖼 Left: Carousel */}
        <div className="w-1/2 rounded-xl overflow-hidden relative">
          <Carousel
            setApi={setCarouselApi}
            plugins={[autoplay.current]}
            className="w-full"
            opts={{ loop: true }}
          >
            <CarouselContent>
              {heroImages.map((src, index) => (
                <CarouselItem key={index}>
                  <img
                    src={src}
                    alt={`Hero ${index + 1}`}
                    className="w-full h-[500px] object-cover rounded-xl"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* 🧭 Controls */}
            <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 border-none text-white" />
            <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 border-none text-white" />

            {/* ⚪ Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => {
                    carouselApi?.scrollTo(index);
                    autoplay.current.reset();
                  }}
                  className={`h-3 w-3 rounded-full transition-colors ${
                    current === index ? "bg-orange-600" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </Carousel>
        </div>

        {/* ✨ Right: Text content */}
        <div className="w-1/2 pl-10 flex flex-col items-center justify-center">
          <h1 className="text-5xl font-extrabold text-gray-800 leading-tight mb-4">
            Handmade Crochet by{" "}
            <span className="text-orange-600">Vaishali</span>
          </h1>

          <p className="text-lg text-gray-600 mb-8 max-w-md leading-relaxed">
            From our hands to your heart — explore our cozy, unique handmade
            creations crafted with love and care.
          </p>

          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-12 py-5 text-lg font-medium shadow-lg transition-all duration-300 "
            onClick={() => navigate("/shop")}
          >
            Shop Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionDesktop;
