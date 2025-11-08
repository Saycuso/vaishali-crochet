import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
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

const HERO_COLLECTION = "hero-section-images";
const DECORATIVE_HERO_DOC_ID = "FsjPBGYTg2W4phsydIgT";
const DEFAULT_IMAGE_URL =
  "https://via.placeholder.com/1200x600?text=Handmade+Crochet+by+Vaishali";

const HeroSection = () => {
  const navigate = useNavigate();
  const [heroImages, setHeroImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [api, setApi] = useState(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const autoplayPlugin = useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const docRef = doc(db, HERO_COLLECTION, DECORATIVE_HERO_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (
            data.ocassions?.Decorative &&
            Array.isArray(data.ocassions.Decorative) &&
            data.ocassions.Decorative.length > 0
          ) {
            setHeroImages(data.ocassions.Decorative);
          } else {
            setHeroImages([DEFAULT_IMAGE_URL]);
          }
        } else {
          setHeroImages([DEFAULT_IMAGE_URL]);
        }
      } catch (error) {
        console.error("Error fetching hero content:", error);
        setHeroImages([DEFAULT_IMAGE_URL]);
      }
      setIsLoading(false);
    };

    fetchHeroImages();
  }, []);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    const onSelect = () => setCurrent(api.selectedScrollSnap());
    const onAutoplayPlay = () => setIsPaused(false);
    const onAutoplayStop = () => setIsPaused(true);

    api.on("select", onSelect);
    api.on("autoplay:play", onAutoplayPlay);
    api.on("autoplay:stop", onAutoplayStop);

    return () => {
      api.off("select", onSelect);
      api.off("autoplay:play", onAutoplayPlay);
      api.off("autoplay:stop", onAutoplayStop);
    };
  }, [api]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-4 md:py-12">
        <div className="w-full h-80 rounded-lg shadow-lg mb-8 bg-gray-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full p-4 md:py-12">
      <Carousel
        setApi={setApi}
        plugins={[autoplayPlugin.current]}
        className="w-full relative"
        opts={{ loop: true }}
      >
        <CarouselContent>
          {heroImages.map((imageSrc, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <section className="relative text-center w-full py-20 md:py-28 rounded-lg shadow-lg overflow-hidden">
                  <img
                    src={imageSrc}
                    alt={`Hero background ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-black/30"
                    aria-hidden="true"
                  />
                  <div className="relative z-10 px-6">
                    <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-md">
                      Handmade Crochet by Vaishali
                    </h1>
                    <p className="mt-4 text-base md:text-lg text-gray-100 max-w-xl mx-auto leading-relaxed drop-shadow-md">
                      From our hands to your heart — explore our cozy, unique
                      handmade creations.
                    </p>
                    <Button
                      className="mt-8 px-8 py-3 text-base font-medium text-white bg-orange-600 hover:bg-orange-700 transition-all duration-300 rounded-full shadow-md"
                      onClick={() => navigate("/shop")}
                    >
                      Shop Now
                    </Button>
                  </div>
                </section>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation buttons */}
        <CarouselPrevious className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50 border-none" />
        <CarouselNext className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50 border-none" />

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => {
                api?.scrollTo(index);
                autoplayPlugin.current.reset();
              }}
              className={`h-3 w-3 rounded-full transition-colors ${
                current === index ? "bg-orange-600" : "bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* ✅ Progress bar (INSIDE carousel, under dots) */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[80%] h-[3px] bg-white/30 rounded-full overflow-hidden z-10">
          <div
            key={current}
            className={`h-[3px] bg-orange-600 progress-bar-fill ${
              isPaused ? "paused" : ""
            }`}
          />
        </div>
      </Carousel>
    </div>
  );
};

export default HeroSection;
