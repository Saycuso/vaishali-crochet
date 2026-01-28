import React from "react";
import { getOptimizedImage } from "@/lib/utils";

const OptimizedCloudinaryImage = ({
  src,
  alt,
  className,
  width = "368",
  height = "368",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 368px",
}) => {
  const src360 = getOptimizedImage(src, 360);
  const src400 = getOptimizedImage(src, 400);
  const src720 = getOptimizedImage(src, 720);

  return (
    <img
      src={src400}
      srcSet={`
        ${src360} 360w,
        ${src400} 400w,
        ${src720} 720w
      `}
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
