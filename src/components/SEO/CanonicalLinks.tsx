import { Helmet } from "react-helmet-async";

interface CanonicalLinksProps {
  currentUrl: string;
  alternateUrls?: Record<string, string>;
  hreflang?: boolean;
}

export const CanonicalLinks = ({
  currentUrl,
  alternateUrls = {},
  hreflang = true,
}: CanonicalLinksProps) => {
  const baseUrl =
    import.meta.env.VITE_APP_URL || "https://tanishphysiofitness.in";
  const fullUrl = currentUrl.startsWith("http")
    ? currentUrl
    : `${baseUrl}${currentUrl}`;

  const defaultAlternates = {
    en: fullUrl,
    "en-IN": fullUrl,
    "x-default": fullUrl,
  };

  const allAlternates = { ...defaultAlternates, ...alternateUrls };

  return (
    <Helmet>
      {/* Hreflang tags for multilingual support */}
      {hreflang &&
        Object.entries(allAlternates).map(([lang, url]) => (
          <link key={lang} rel="alternate" hrefLang={lang} href={url} />
        ))}
    </Helmet>
  );
};

// Predefined canonical components for common pages
export const HomePageCanonical = () => <CanonicalLinks currentUrl="/" />;

export const ServicesPageCanonical = () => (
  <CanonicalLinks currentUrl="/services" />
);

export const AboutPageCanonical = () => <CanonicalLinks currentUrl="/about" />;

export const ContactPageCanonical = () => (
  <CanonicalLinks currentUrl="/contact" />
);

export const BlogCanonical = ({ slug }: { slug: string }) => (
  <CanonicalLinks
    currentUrl={`/blog/${slug}`}
    alternateUrls={{
      en: `https://tanishphysio.com/blog/${slug}`,
      "en-IN": `https://tanishphysio.com/blog/${slug}`,
    }}
  />
);

export const ServiceDetailCanonical = ({ slug }: { slug: string }) => (
  <CanonicalLinks
    currentUrl={`/service/${slug}`}
    alternateUrls={{
      en: `https://tanishphysio.com/service/${slug}`,
      "en-IN": `https://tanishphysio.com/service/${slug}`,
    }}
  />
);
