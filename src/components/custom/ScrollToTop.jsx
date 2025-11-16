// src/components/custom/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  // Get the current page's path (e.g., "/shop", "/checkout")
  const { pathname } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []); // Empty array means it only runs on mount

  // This effect runs every single time the 'pathname' changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]); // The effect's dependency is the pathname

  return null; // This component renders no UI
};

export default ScrollToTop;