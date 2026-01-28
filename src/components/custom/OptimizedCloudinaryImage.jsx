import React from "react";
import { getOptimizedImage } from "@/lib/utils";

const OptimizedCloudinaryImage = ({
  src,
  alt,
  className,
  width = "300",
  height = "300",
}) => {
  // 1. Generate the 3 sizes using your existing helper
  const src360 = getOptimizedImage(src, 360);
  const src720 = getOptimizedImage(src, 720);
  const src1080 = getOptimizedImage(src, 1080); // For Retina screens

  return (
    <img
      // 2. The "Default" image (fallback)
      src={src720}
      
      // 3. The Responsive Magic (Browser picks the best one)
      srcSet={`
        ${src360} 360w,
        ${src720} 720w,
        ${src1080} 1080w
      `}
      
      // 4. Tell browser: "On mobile, I'm full width. On desktop, I'm 300px."
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
      
      alt={alt}
      
      // 5. Explicit dimensions to prevent Layout Shift (CLS)
      width={width}
      height={height}
      
      // 6. Performance tags
      loading="lazy"
      decoding="async"
      
      className={className}
    />
  );
};

export default OptimizedCloudinaryImage;