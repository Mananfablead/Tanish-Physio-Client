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
}: SEOHeadProps) => {
  return (
    <Helmet>
      <title>{title}</title>

      {/* Structured Data - Enhanced LocalBusiness Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "PhysiotherapyBusiness",
          name: "Tanish Physio & Fitness",
          url: "https://tanishphysiofitness.in",
          telephone: "+91-9427555696",
          image: "https://tanishphysiofitness.in/favicon.png",
          logo: "https://tanishphysiofitness.in/favicon.png",
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
    </Helmet>
  );
};
