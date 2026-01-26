import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { db, auth } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// 1. 👇 USE A REAL URL HERE (Replace this with one of your actual Cloudinary/Firebase images for best results)
const FALLBACK_IMAGE = "https://via.placeholder.com/1200x600?text=Handmade+Crochet+by+Vaishali"; 
const HERO_COLLECTION = "hero-section-images";
const DECORATIVE_HERO_DOC_ID = "FsjPBGYTg2W4phsydIgT";

const HeroSectionDesktop = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  
  // 2. 👇 INITIALIZE WITH IMAGE IMMEDIATELY (No empty array, no loading state)
  const [heroImages, setHeroImages] = useState([FALLBACK_IMAGE]); 
  
  const [carouselApi, setCarouselApi] = useState(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const autoplay = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user ? user : null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const docRef = doc(db, HERO_COLLECTION, DECORATIVE_HERO_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // 3. 👇 ONLY UPDATE IF WE HAVE DATA
          if (data.ocassions?.Decorative?.length > 0) {
            setHeroImages(data.ocassions.Decorative);
          }
        }
      } catch (error) {
        console.error("Error fetching hero content:", error);
      }
      // REMOVED setIsLoading(false) because we deleted the state
    };
    fetchHeroImages();
  }, []);

  useEffect(() => {
    if (!carouselApi) return;
    const updateCurrent = () => setCurrent(carouselApi.selectedScrollSnap());
    setCount(carouselApi.scrollSnapList().length);
    carouselApi.on("select", updateCurrent);
    return () => carouselApi.off("select", updateCurrent);
  }, [carouselApi]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // 4. 👇 REMOVED THE "if (isLoading)" BLOCK COMPLETELY.
  // The component will now render instantly.

  return (
    <section className="relative flex flex-col items-center w-full mx-auto py-16 px-10 lg:px-20 overflow-hidden bg-gradient-to-r from-orange-200 to-pink-200 animate-gradient-aurora">
       {/* 🌈 Background layer */}
       <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#fff7f2] via-[#ffe9e9] to-[#fff5ef]" />

       {/* ☁️ Soft glow background blobs */}
       <div className="absolute -top-20 -left-40 w-[500px] h-[500px] bg-orange-200/40 blur-[130px] rounded-full -z-10" />
       <div className="absolute bottom-0 -right-32 w-[600px] h-[600px] bg-pink-200/40 blur-[140px] rounded-full -z-10" />

       {/* 🌐 Local nav */}
       <nav className="flex gap-10 mb-10 self-end pr-4">
         {[
           { label: "About Us", path: "/about" },
           { label: "Contact Us", path: "/contact" },
           { label: "Careers", path: "/careers" },
         ].map(({ label, path }) => (
           <button
             key={path}
             onClick={() => navigate(path)}
             className="text-gray-700 hover:text-orange-600 font-medium transition-all duration-300 relative group"
           >
             {label}
             <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-orange-500 transition-all duration-300 group-hover:w-full" />
           </button>
         ))}

         {currentUser ? (
           <>
             <button
               onClick={() => navigate("/orders")}
               className="text-gray-700 hover:text-orange-600 font-medium transition-all duration-300 relative group"
             >
               My Orders
               <span className="absolute left-0 bottom-[-4px] w-0 h-[2px] bg-orange-500 transition-all duration-300 group-hover:w-full" />
             </button>
             <button
               onClick={handleLogout}
               className="px-5 py-2.5 rounded-full bg-gray-600 hover:bg-gray-700 text-white font-semibold shadow-md hover:shadow-lg active:scale-[0.97] transition-all duration-300"
             >
               Log Out
             </button>
           </>
         ) : (
           <button
             onClick={() => navigate("/signup")}
             className=" px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold shadow-md hover:shadow-[0_8px_25px_-5px_rgba(255,111,0,0.4)] hover:scale-[1.05] active:scale-[0.97] transition-all duration-300"
           >
             Sign Up
           </button>
         )}
       </nav>

       {/* 💎 Elevated Hero Card */}
       <div className="relative flex items-center justify-between w-full rounded-3xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.25)] bg-gradient-to-r from-[#fffdfc] via-[#fff8f3] to-[#fff4ef] border border-orange-100/40 backdrop-blur-sm px-10 py-12">
        {/* 🖼 Left: Carousel */}
        <div className="w-1/2 rounded-2xl overflow-hidden shadow-[0_8px_30px_-8px_rgba(0,0,0,0.3)] relative">
          <Carousel
            setApi={setCarouselApi}
            plugins={[autoplay.current]}
            opts={{ loop: true }}
            className="w-full"
          >
            <CarouselContent>
              {heroImages.map((src, index) => (
                <CarouselItem key={index}>
                  <img
                    src={src}
                    alt={`Hero ${index + 1}`}
                    // 5. 👇 PRIORITY TAGS (The most important part)
                    fetchpriority={index === 0 ? "high" : "auto"}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="w-full h-[500px] object-cover transition-transform duration-700 hover:scale-105"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 border-none text-white backdrop-blur-md" />
            <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 border-none text-white backdrop-blur-md" />

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => {
                    carouselApi?.scrollTo(index);
                    autoplay.current.reset();
                  }}
                  className={`h-3 w-3 rounded-full transition-all ${
                    current === index
                      ? "bg-orange-600 scale-110"
                      : "bg-white/60 hover:bg-orange-300"
                  }`}
                />
              ))}
            </div>
          </Carousel>
        </div>

        {/* ✨ Right: Text */}
        <div className="w-1/2 pl-12 flex flex-col items-center justify-center">
          <h1 className="text-6xl font-extrabold text-gray-900 leading-tight mb-5 drop-shadow-sm">
            Handmade Crochet by{" "}
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Vaishali
            </span>
          </h1>

          <p className="text-lg text-gray-600 mb-8 max-w-md leading-relaxed">
            From our hands to your heart — explore our cozy, unique handmade
            creations crafted with love and care.
          </p>

          <Button
            className="rounded-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-pink-500 hover:to-orange-500 text-white px-12 py-5 text-lg font-semibold shadow-lg hover:shadow-[0_8px_25px_-5px_rgba(255,111,0,0.4)] transition-all duration-300"
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