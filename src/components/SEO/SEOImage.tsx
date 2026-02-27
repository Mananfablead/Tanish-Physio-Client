import { ImgHTMLAttributes } from "react";

interface SEOImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  alt: string;
  seoTitle?: string;
  caption?: string;
  lazyLoad?: boolean;
}

export const SEOImage = ({
  alt,
  seoTitle,
  caption,
  lazyLoad = true,
  className = "",
  ...props
}: SEOImageProps) => {
  // Generate SEO-friendly alt text
  const generateAltText = () => {
    if (seoTitle) {
      return `${seoTitle} - ${alt}`;
    }
    return alt;
  };

  // Generate title for additional SEO
  const generateTitle = () => {
    if (seoTitle) return seoTitle;
    return alt;
  };

  return (
    <figure className="relative">
      <img
        alt={generateAltText()}
        title={generateTitle()}
        loading={lazyLoad ? "lazy" : "eager"}
        decoding="async"
        className={`w-full h-auto ${className}`}
        {...props}
      />
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
