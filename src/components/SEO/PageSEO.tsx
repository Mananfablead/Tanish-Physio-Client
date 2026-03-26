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
  noindex = false,
  nofollow = false,
}: PageSEOProps) => {
  return (
    <Helmet>
      <title>{title}</title>

      {/* Robots Meta */}
      {noindex || nofollow ? (
        <meta
          name="robots"
          content={`${noindex ? "noindex" : ""} ${nofollow ? "nofollow" : ""}`.trim()}
        />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Structured Data - Enhanced LocalBusiness Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "PhysiotherapyBusiness",
          name: "Tanish Physio & Fitness",
          url: "https://tanishphysiofitness.in",
          logo: "https://tanishphysiofitness.in/favicon.png",
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
