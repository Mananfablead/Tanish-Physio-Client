import { Helmet } from "react-helmet-async";

export const OrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Tanish Physio & Fitness",
    url: "https://tanishphysiofitness.in",
    logo: "https://tanishphysiofitness.in/favicon.png",
    description:
      "Professional online physiotherapy services with certified therapists providing personalized treatment plans and video consultations",
    sameAs: [
      "https://www.facebook.com/tanishphysio",
      "https://www.instagram.com/tanishphysio",
      "https://www.linkedin.com/company/tanishphysio",
      "https://www.youtube.com/@tanishphysio",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-9427555696",
      contactType: "customer service",
      email: "drkhushboo26@gmail.com",
      availableLanguage: "en",
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export const PhysiotherapyBusinessSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "PhysiotherapyBusiness",
    name: "Tanish Physio & Fitness",
    image: "https://tanishphysiofitness.in/favicon.png",
    "@id": "https://tanishphysiofitness.in",
    url: "https://tanishphysiofitness.in",
    telephone: "+91-9427555696",
    email: "drkhushboo26@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "5, Dhaval Appts, Besides Telephone Exchange, Choksiwadi Road, Ajaramar Chowk, Adajan",
      addressLocality: "Surat",
      addressRegion: "Gujarat",
      postalCode: "395009",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 21.1702,
      longitude: 72.8311,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "10:00",
        closes: "16:00",
      },
    ],
    priceRange: "$$",
    description:
      "Professional online physiotherapy services with certified therapists providing personalized treatment plans and video consultations",
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export const ServiceSchema = ({
  serviceName,
  description,
}: {
  serviceName: string;
  description: string;
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Physiotherapy",
    provider: {
      "@type": "PhysiotherapyBusiness",
      name: "Tanish Physio & Fitness",
    },
    name: serviceName,
    description: description,
    offers: {
      "@type": "Offer",
      category: "Professional Service",
      priceCurrency: "INR",
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export const FAQSchema = ({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export const BreadcrumbSchema = ({
  breadcrumbs,
}: {
  breadcrumbs: Array<{ name: string; url: string }>;
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};

export const ArticleSchema = ({
  title,
  description,
  author,
  datePublished,
  dateModified,
  image,
}: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified: string;
  image?: string;
}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "Tanish Physio & Fitness",
      logo: {
        "@type": "ImageObject",
        url: "https://tanishphysiofitness.in/favicon.png",
      },
    },
    datePublished: datePublished,
    dateModified: dateModified,
    image: image || "https://tanishphysio.com/favicon.png",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://tanishphysio.com",
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
};
