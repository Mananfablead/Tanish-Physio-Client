import { useState, useEffect, useRef } from "react";

interface SEOImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  width?: string | number;
  height?: string | number;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  seoTitle?: string;
  caption?: string;
}

/**
 * Advanced SEO-optimized image component with lazy loading
 * Features:
 * - Intersection Observer for lazy loading
 * - Placeholder support
 * - Proper alt text for accessibility
 * - WebP format support via Vite plugin
 * - Structured data for images
 */
export const SEOImage = ({
  src,
  alt,
  className = "",
  placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+",
  width,
  height,
  loading = "lazy",
  fetchPriority = "auto",
  seoTitle,
  caption,
}: SEOImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(loading === "eager");
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate SEO-friendly alt text
  const generateAltText = () => {
    if (seoTitle) {
      return `${seoTitle} - ${alt}`;
    }
    return alt;
  };

  useEffect(() => {
    if (loading === "eager") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px",
        threshold: 0.01,
      },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  return (
    <figure className="relative">
      <div
        ref={imgRef}
        className={`relative overflow-hidden ${className}`}
        style={{
          width: width ? `${width}` : "100%",
          height: height ? `${height}` : "auto",
        }}
      >
        {/* Placeholder image */}
        {!isLoaded && (
          <img
            src={placeholder}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            aria-hidden="true"
          />
        )}

        {/* Actual image with lazy loading */}
        {isInView ? (
          <img
            src={src}
            alt={generateAltText()}
            title={seoTitle || alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            loading={loading}
            fetchPriority={fetchPriority}
            onLoad={() => setIsLoaded(true)}
            decoding="async"
          />
        ) : null}
      </div>
      {caption && (
        <figcaption className="text-sm text-muted-foreground mt-2 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

// Predefined image components for common use cases
export const HeroImage = (props: Omit<SEOImageProps, "seoTitle">) => (
  <SEOImage seoTitle="Professional Physiotherapy Services" {...props} />
);

export const ServiceImage = (props: Omit<SEOImageProps, "seoTitle">) => (
  <SEOImage seoTitle="Physiotherapy Treatment" {...props} />
);

export const TherapistImage = (props: Omit<SEOImageProps, "seoTitle">) => (
  <SEOImage seoTitle="Certified Physiotherapist" {...props} />
);

export const TestimonialImage = (props: Omit<SEOImageProps, "seoTitle">) => (
  <SEOImage seoTitle="Patient Success Story" {...props} />
);

export const LogoImage = (props: Omit<SEOImageProps, "seoTitle" | "alt">) => (
  <SEOImage
    alt="Tanish Physio & Fitness Logo"
    seoTitle="Tanish Physio & Fitness Brand Logo"
    {...props}
  />
);
