import { useState, useEffect } from "react";
import HeroSectionMobile from "@/components/custom/HeroSection/HeroSectionMobile";
import HeroSectionDesktop from "@/components/custom/HeroSection/HeroSectionDesktop";
export default function HeroSection() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isDesktop ? <HeroSectionDesktop /> : <HeroSectionMobile />;
}
