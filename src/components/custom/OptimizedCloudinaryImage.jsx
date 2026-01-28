import React from "react";
import { getOptimizedImage } from "@/lib/utils";

const OptimizedCloudinaryImage = ({
  src,
  alt,
  className,
  width = "400",
  height = "300",
  // 👇 1. Default sizes (Full width on mobile, 300px on desktop)
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px" 
}) => {
  const src360 = getOptimizedImage(src, 360);
  const src720 = getOptimizedImage(src, 720);
  const src1080 = getOptimizedImage(src, 1080);

  return (
    <img
      src={src720}
      srcSet={`
        ${src360} 360w,
        ${src720} 720w,
        ${src1080} 1080w
      `}
      // 👇 2. Pass the prop to the img tag
      sizes={sizes} 
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
};

export default OptimizedCloudinaryImage;