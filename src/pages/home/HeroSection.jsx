import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { useState, useEffect, useRef } from "react";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";

const HERO_COLLECTION = "hero-section-images";
const DECORATIVE_HERO_DOC_ID = "FsjPBGYTg2W4phsydIgT"; // change this to your doc ID
const DEFAULT_IMAGE_URL =
  "https://via.placeholder.com/1200x600?text=Handmade+Crochet+by+Vaishali";

const HeroSection = () => {
  const navigate = useNavigate();
  const [showHero, setShowHero] = useState(false);
  const [heroImage, setHeroImage] = useState(DEFAULT_IMAGE_URL);
  const nodeRef = useRef(null);

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const docRef = doc(db, HERO_COLLECTION, DECORATIVE_HERO_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          if (
            data.ocassions?.Decorative &&
            Array.isArray(data.ocassions.Decorative)
          ) {
            setHeroImage(data.ocassions.Decorative[0]);
          } else {
            console.log("Decorative array is empty, using default.");
          }
        } else {
          console.log("No such document found, using default image.");
        }
      } catch (error) {
        console.error("Error fetching hero content:", error);
      }
      setShowHero(true);
    };

    fetchHeroImage();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 md:py-12">
      <CSSTransition
        in={showHero}
        timeout={500}
        classNames="component-fade"
        unmountOnExit
        nodeRef={nodeRef}
      >
        <section
          ref={nodeRef}
          className="relative text-center w-full py-16 md:py-24 rounded-lg shadow-md mb-8 overflow-hidden"
        >
          {/* Background image fetched from DB */}
          <img
            src={heroImage}
            alt="Hero background"
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />

          {/* Overlay content */}
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-800">
              Handmade Crochet by Vaishali 🧶
            </h1>
            <p className="mt-4 text-base md:text-lg text-gray-700 max-w-xl mx-auto leading-relaxed">
              From our hands to your heart — explore our cozy, unique handmade
              creations.
            </p>
            <Button
              className="mt-6 px-6 py-2 text-white bg-pink-600 hover:bg-pink-700 transition-all duration-300"
              onClick={() => navigate("/shop")}
            >
              Shop Now
            </Button>
          </div>
        </section>
      </CSSTransition>
    </div>
  );
};

export default HeroSection;
