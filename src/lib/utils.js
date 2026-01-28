import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// 👇 ADD THIS FUNCTION TO HANDLE CLOUDINARY RESIZING
export const getOptimizedImage = (url, width = 500) => {
  if (!url) return "https://via.placeholder.com/400"; // Safety Fallback
  
  // Check if it's actually a Cloudinary URL
  if (url.includes("res.cloudinary.com")) {
    // Inject the resize parameters after the "/upload/" part
    // w_ = width, q_auto = auto quality, f_auto = auto format (webp/avif)
    return url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);
  }
  
  // If it's Firebase or something else, return the original URL
  return url;
};