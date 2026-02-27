import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  canonicalUrl?: string;
}

export const SEOHead = ({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  author,
  publishedTime,
  modifiedTime,
  canonicalUrl,
}: SEOHeadProps) => {
  const siteUrl =
    import.meta.env.VITE_APP_URL || "https://tanishphysiofitness.in";
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const ogImage = image || `${siteUrl}/favicon.png`;

  const defaultKeywords =
    "physiotherapy, online physiotherapy, video consultation, home physiotherapy, physical therapy, rehabilitation, fitness, health, wellness, exercise, therapy sessions, certified physiotherapists";

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta name="author" content={author || "Tanish Physio & Fitness"} />

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Tanish Physio & Fitness" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@tanishphysio" />
      <meta name="twitter:creator" content="@tanishphysio" />

      {/* Article specific meta tags */}
      {type === "article" && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
        </>
      )}

      {/* Viewport and Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#0ea5e9" />

      {/* Favicon */}
      <link rel="icon" type="image/png" href="/favicon.png" />
      <link rel="apple-touch-icon" href="/favicon.png" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "PhysiotherapyBusiness",
          name: "Tanish Physio & Fitness",
          url: siteUrl,
          logo: `${siteUrl}/favicon.png`,
          description: description,
          address: {
            "@type": "PostalAddress",
            addressLocality: "India",
            addressCountry: "IN",
          },
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            availableLanguage: "en",
          },
          sameAs: [
            "https://www.facebook.com/TanishPhysioFitnessandLaserClinic",
            "https://www.instagram.com/tanish_physio_fitness_clinic",
            "https://www.linkedin.com/company/tanishphysio",
            "https://www.youtube.com/@tanishphysiofitnessclinic3230",
          ],
        })}
      </script>
    </Helmet>
  );
};
