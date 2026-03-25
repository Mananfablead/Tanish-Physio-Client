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
  addHreflang?: boolean;
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
  addHreflang = true,
}: SEOHeadProps) => {
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
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#0ea5e9" />

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
          telephone: "+91-9427555696",
          image: `${siteUrl}/favicon.png`,
          logo: `${siteUrl}/favicon.png`,
          description: description,
          address: {
            "@type": "PostalAddress",
            streetAddress:
              "5, Dhaval Appts, Besides Telephone Exchange, Choksiwadi Road, Ajaramar Chowk, Adajan",
            postalCode: "395009",
            addressLocality: "Surat",
            addressRegion: "Gujarat",
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
          priceRange: "₹",
          acceptsReservations: "true",
          sameAs: [
            "https://www.facebook.com/TanishPhysioFitnessandLaserClinic",
            "https://www.instagram.com/tanish_physio_fitness_clinic",
            "https://www.linkedin.com/company/tanishphysio",
            "https://www.youtube.com/@tanishphysio",
          ],
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Physiotherapy Services",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                item: {
                  "@type": "Service",
                  name: "Online Physiotherapy Consultation",
                },
              },
              {
                "@type": "ListItem",
                position: 2,
                item: {
                  "@type": "Service",
                  name: "Rehabilitation Therapy",
                },
              },
              {
                "@type": "ListItem",
                position: 3,
                item: {
                  "@type": "Service",
                  name: "Sports Injury Treatment",
                },
              },
              {
                "@type": "ListItem",
                position: 4,
                item: {
                  "@type": "Service",
                  name: "Pain Management",
                },
              },
              {
                "@type": "ListItem",
                position: 5,
                item: {
                  "@type": "Service",
                  name: "Posture Correction Therapy",
                },
              },
              {
                "@type": "ListItem",
                position: 6,
                item: {
                  "@type": "Service",
                  name: "Fitness Training",
                },
              },
            ],
          },
        })}
      </script>

      {/* Google Analytics Script - Loaded Asynchronously */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${
          import.meta.env.VITE_GA_ID || "GA_MEASUREMENT_ID"
        }`}
      ></script>
      <script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${
            import.meta.env.VITE_GA_ID || "GA_MEASUREMENT_ID"
          }');
        `}
      </script>
    </Helmet>
  );
};
