import { Helmet } from "react-helmet-async";

interface PageSEOProps {
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
  addHreflang?: boolean;
  noindex?: boolean;
  nofollow?: boolean;
}

export const PageSEO = ({
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
  addHreflang = true,
  noindex = false,
  nofollow = false,
}: PageSEOProps) => {
  const siteUrl =
    import.meta.env.VITE_APP_URL || "https://tanishphysiofitness.in";
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const ogImage = image || `${siteUrl}/favicon.png`;

  const defaultKeywords =
    "physiotherapy, online physiotherapy, video consultation, home physiotherapy, physical therapy, rehabilitation, fitness training, pain relief, posture correction, sports injury, certified physiotherapists India";

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta name="author" content={author || "Tanish Physio & Fitness"} />

      {/* Robots Meta */}
      {noindex || nofollow ? (
        <meta
          name="robots"
          content={`${noindex ? "noindex" : ""} ${nofollow ? "nofollow" : ""}`.trim()}
        />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Canonical URL */}
      {canonicalUrl ? (
        <link rel="canonical" href={canonicalUrl} />
      ) : (
        <link rel="canonical" href={fullUrl} />
      )}

      {/* Hreflang Tags for India */}
      {addHreflang && (
        <>
          <link rel="alternate" hrefLang="en-in" href={fullUrl} />
          <link rel="alternate" hrefLang="x-default" href={fullUrl} />
        </>
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Tanish Physio & Fitness" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Tanish Physio & Fitness" />
      <meta property="og:locale" content="en_IN" />

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

      {/* Favicon */}
      <link rel="icon" type="image/png" href="/favicon.png" />
      <link rel="apple-touch-icon" href="/favicon.png" />

      {/* Structured Data - Enhanced LocalBusiness Schema */}
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
          geo: {
            "@type": "GeoCoordinates",
            latitude: "20.5937",
            longitude: "78.9629",
          },
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+91-9427555696",
            contactType: "customer service",
            availableLanguage: ["English", "Hindi"],
          },
          openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "09:00",
            closes: "21:00",
          },
          priceRange: "₹₹",
          acceptsReservations: "true",
          sameAs: [
            "https://www.facebook.com/TanishPhysioFitnessandLaserClinic",
            "https://www.instagram.com/tanish_physio_fitness_clinic",
            "https://www.linkedin.com/company/tanishphysio",
            "https://www.youtube.com/@tanishphysio",
          ],
        })}
      </script>
    </Helmet>
  );
};
