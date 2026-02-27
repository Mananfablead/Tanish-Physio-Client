export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
}

export const DEFAULT_SEO: SEOConfig = {
  title: "Tanish Physio & Fitness - Online Physiotherapy & Video Consultation",
  description:
    "Connect with certified physiotherapists from home. Get personalized treatment plans and video consultations tailored to your needs. Professional physiotherapy services at your convenience.",
  keywords:
    "physiotherapy, online physiotherapy, video consultation, home physiotherapy, physical therapy, rehabilitation, fitness, health, wellness, exercise, therapy sessions, certified physiotherapists",
  image: "/favicon.png",
  type: "website",
  author: "Tanish Physio & Fitness",
};

export const PAGE_SEO: Record<string, SEOConfig> = {
  "/": {
    title: "Tanish Physio & Fitness | Online Physiotherapy Services",
    description:
      "Experience professional physiotherapy from the comfort of your home. Connect with certified physiotherapists for personalized video consultations and treatment plans.",
    keywords:
      "online physiotherapy, video consultation, home physiotherapy, certified physiotherapists, rehabilitation, physical therapy",
    type: "website",
  },
  "/services": {
    title: "Our Services - Tanish Physio & Fitness | Physiotherapy Treatments",
    description:
      "Explore our comprehensive range of physiotherapy services including orthopedic rehabilitation, sports injury treatment, post-surgical recovery, and wellness programs.",
    keywords:
      "physiotherapy services, orthopedic rehabilitation, sports injury treatment, post-surgical recovery, wellness programs",
    type: "website",
  },
  "/about": {
    title: "About Us - Tanish Physio & Fitness | Professional Physiotherapy",
    description:
      "Learn about Tanish Physio & Fitness - your trusted partner for professional physiotherapy services. Certified therapists, personalized care, and convenient online consultations.",
    keywords:
      "about physiotherapy, certified physiotherapists, professional therapy, online consultation, healthcare",
    type: "website",
  },
  "/contact": {
    title: "Contact Us - Tanish Physio & Fitness | Get in Touch",
    description:
      "Contact Tanish Physio & Fitness for appointments, inquiries, or support. Our team is ready to help you with your physiotherapy needs.",
    keywords:
      "contact physiotherapy, book appointment, physiotherapy inquiry, customer support",
    type: "website",
  },
  "/faq": {
    title: "FAQ - Frequently Asked Questions | Tanish Physio & Fitness",
    description:
      "Find answers to common questions about our online physiotherapy services, appointment booking, treatment plans, and what to expect from your consultation.",
    keywords:
      "physiotherapy FAQ, common questions, online consultation FAQ, treatment questions",
    type: "website",
  },
  "/therapists": {
    title: "Meet Our Therapists - Certified Physiotherapists | Tanish Physio",
    description:
      "Get to know our team of certified and experienced physiotherapists who are dedicated to providing you with the best care and personalized treatment plans.",
    keywords:
      "certified physiotherapists, experienced therapists, physiotherapy team, qualified professionals",
    type: "website",
  },
  "/plans": {
    title:
      "Subscription Plans - Affordable Physiotherapy Packages | Tanish Physio",
    description:
      "Choose from our flexible subscription plans for ongoing physiotherapy care. Individual and group sessions available at competitive prices.",
    keywords:
      "physiotherapy plans, subscription packages, affordable therapy, physiotherapy pricing",
    type: "website",
  },
  "/free-consultation": {
    title: "Free Consultation - Try Our Services | Tanish Physio & Fitness",
    description:
      "Book your free physiotherapy consultation today. Experience our professional services and personalized approach without any commitment.",
    keywords:
      "free physiotherapy consultation, try physiotherapy, free assessment, initial consultation",
    type: "website",
  },
  "/login": {
    title: "Login - Access Your Account | Tanish Physio & Fitness",
    description:
      "Sign in to your Tanish Physio & Fitness account to access your appointments, treatment plans, and consultation history.",
    keywords:
      "physiotherapy login, patient portal, account access, therapy dashboard",
    type: "website",
  },
  "/register": {
    title: "Register - Create Your Account | Tanish Physio & Fitness",
    description:
      "Sign up for Tanish Physio & Fitness to book appointments, access video consultations, and manage your physiotherapy journey.",
    keywords:
      "physiotherapy registration, create account, patient signup, therapy account",
    type: "website",
  },
};

export const SOCIAL_CONFIG = {
  facebook: "https://www.facebook.com/TanishPhysioFitnessandLaserClinic",
  instagram: "https://www.instagram.com/tanish_physio_fitness_clinic",
  youtube: "https://www.youtube.com/@tanishphysiofitnessclinic3230",
  twitter: "@tanishphysio",
  linkedin: "https://www.linkedin.com/company/tanishphysio",
};

export const seoConfig = {
  siteUrl: "https://tanishphysiofitness.in",
  siteName: "Tanish Physio & Fitness",
  twitterHandle: "@tanishphysio",
  defaultImage: "/favicon.png",
};

export const STRUCTURED_DATA = {
  business: {
    "@context": "https://schema.org",
    "@type": "PhysiotherapyBusiness",
    name: "Tanish Physio & Fitness",
    description:
      "Professional online physiotherapy services with certified therapists",
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
    openingHours: "Mo-Su 09:00-21:00",
    priceRange: "$$",
    serviceArea: {
      "@type": "Place",
      name: "India",
    },
  },
};
