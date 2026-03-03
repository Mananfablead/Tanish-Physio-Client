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
  title:
    "Tanish Physio & Fitness - Professional Online Physiotherapy & Video Consultation Services",
  description:
    "Experience premium online physiotherapy with certified experts. Get personalized treatment plans, video consultations, and professional rehabilitation from the comfort of your home. Book your session today for expert care.",
  keywords:
    "physiotherapy, online physiotherapy, video consultation, home physiotherapy, physical therapy, rehabilitation, fitness, health, wellness, exercise, therapy sessions, certified physiotherapists",
  image: "/favicon.png",
  type: "website",
  author: "Tanish Physio & Fitness",
};

export const PAGE_SEO: Record<string, SEOConfig> = {
  "/": {
    title:
      "Tanish Physio & Fitness | Professional Online Physiotherapy Services India",
    description:
      "India's leading online physiotherapy platform. Connect with certified physiotherapists for personalized video consultations, treatment plans, and rehabilitation. Book your session today for expert care from home.",
    keywords:
      "online physiotherapy India, video consultation, home physiotherapy, certified physiotherapists, rehabilitation, physical therapy, telehealth physiotherapy",
    type: "website",
  },
  "/services": {
    title:
      "Physiotherapy Services - Orthopedic Rehab, Sports Injury & Wellness | Tanish Physio",
    description:
      "Comprehensive physiotherapy services including orthopedic rehabilitation, sports injury treatment, post-surgical recovery, and wellness programs. Expert care for all your physical therapy needs.",
    keywords:
      "physiotherapy services, orthopedic rehabilitation, sports injury treatment, post-surgical recovery, wellness programs, physical therapy services",
    type: "website",
  },
  "/about": {
    title:
      "About Tanish Physio & Fitness | Certified Physiotherapy Experts India",
    description:
      "Learn about Tanish Physio & Fitness - India's trusted physiotherapy platform. Discover our certified therapists, personalized care approach, and convenient online consultation services.",
    keywords:
      "about physiotherapy, certified physiotherapists India, professional therapy, online consultation, healthcare platform",
    type: "website",
  },
  "/contact": {
    title: "Contact Tanish Physio & Fitness | Book Appointment & Support",
    description:
      "Get in touch with Tanish Physio & Fitness for appointments, inquiries, or support. Contact our team for physiotherapy consultations, booking assistance, and customer support.",
    keywords:
      "contact physiotherapy, book appointment, physiotherapy inquiry, customer support, consultation booking",
    type: "website",
  },
  "/faq": {
    title:
      "Physiotherapy FAQ - Common Questions Answered | Tanish Physio & Fitness",
    description:
      "Find answers to frequently asked questions about online physiotherapy services, appointment booking, treatment plans, and what to expect from your consultation with Tanish Physio & Fitness.",
    keywords:
      "physiotherapy FAQ, common questions, online consultation FAQ, treatment questions, physiotherapy help",
    type: "website",
  },
  "/therapist": {
    title:
      "Find Certified Physiotherapists - Expert Therapists Directory | Tanish Physio",
    description:
      "Browse our directory of certified physiotherapists and find the perfect match for your recovery needs. Filter by specialization, experience, and availability to connect with expert care.",
    keywords:
      "find physiotherapist, certified therapists, physiotherapy experts, therapist directory, expert physiotherapists, qualified therapists",
    type: "website",
  },
  "/chat-history": {
    title: "Chat History - Tanish Physio & Fitness",
    description:
      "View your chat history with our support team. Access previous conversations and continue your physiotherapy journey.",
    keywords:
      "chat history, support chat, conversation history, customer support, physiotherapy chat",
    type: "website",
  },
  "/video-call": {
    title: "Video Call - Tanish Physio & Fitness",
    description:
      "Join your live physiotherapy video consultation session. Connect with your therapist for personalized treatment and guidance.",
    keywords:
      "video call, physiotherapy video session, online consultation, live therapy, video consultation",
    type: "website",
  },
  "/plans": {
    title:
      "Physiotherapy Subscription Plans - Affordable Packages | Tanish Physio",
    description:
      "Choose from our flexible subscription plans for ongoing physiotherapy care. Affordable individual and group sessions with expert therapists at competitive prices.",
    keywords:
      "physiotherapy plans, subscription packages, affordable therapy, physiotherapy pricing, therapy packages",
    type: "website",
  },
  "/free-consultation": {
    title:
      "Free Physiotherapy Consultation - Try Our Services | Tanish Physio & Fitness",
    description:
      "Book your free physiotherapy consultation today. Experience our professional services and personalized approach without any commitment. Get expert assessment and treatment recommendations.",
    keywords:
      "free physiotherapy consultation, try physiotherapy, free assessment, initial consultation, complimentary physiotherapy",
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
    title: "Register for Physiotherapy Account - Tanish Physio & Fitness",
    description:
      "Create your account with Tanish Physio & Fitness to access online physiotherapy services, video consultations, and personalized treatment plans from certified therapists.",
    keywords:
      "physiotherapy registration, create account, patient signup, therapy account, online physiotherapy registration",
    type: "website",
  },
  "/profile": {
    title:
      "Patient Profile Dashboard - Manage Your Physiotherapy Account | Tanish Physio",
    description:
      "Manage your Tanish Physio & Fitness profile. View appointments, treatment plans, subscription details, and personal information in your patient dashboard with certified therapists.",
    keywords:
      "physiotherapy profile, patient dashboard, account management, appointment history, treatment plans, subscription details",
    type: "website",
  },
  "/booking": {
    title:
      "Book Physiotherapy Appointment Online - Schedule Your Session | Tanish Physio",
    description:
      "Book your physiotherapy appointment with Tanish Physio & Fitness. Choose your preferred date and time, select services, and complete your online booking with certified experts.",
    keywords:
      "book physiotherapy appointment, schedule session, physiotherapy booking, appointment booking, online booking, session scheduling",
    type: "website",
  },
  "/booking-confirmation": {
    title:
      "Booking Confirmed - Your Physiotherapy Appointment is Set | Tanish Physio",
    description:
      "Your physiotherapy booking with Tanish Physio & Fitness has been confirmed. View your appointment details, session information, and next steps with your certified therapist.",
    keywords:
      "booking confirmed, appointment confirmation, physiotherapy booking, session details, appointment confirmation page, booking success",
    type: "website",
  },
  "/coming-soon": {
    title: "Coming Soon - Online Physiotherapy Platform Launch | Tanish Physio",
    description:
      "Tanish Physio & Fitness is coming soon with revolutionary video consultation technology for physiotherapy. Stay tuned for expert care and personalized treatment plans from certified therapists.",
    keywords:
      "physiotherapy coming soon, video consultation, online physiotherapy, coming soon page, physiotherapy technology, expert care",
    type: "website",
  },
  "/group-sessions": {
    title:
      "Group Therapy Sessions - Community Physiotherapy Classes | Tanish Physio",
    description:
      "Join our community-based group therapy sessions led by expert physiotherapists. Connect with others facing similar challenges and accelerate your recovery together with professional guidance.",
    keywords:
      "group therapy, physiotherapy groups, community sessions, group rehabilitation, online group sessions",
    type: "website",
  },
  "/group-sessions/register": {
    title:
      "Register for Group Therapy Session - Join Physiotherapy Classes | Tanish Physio",
    description:
      "Complete your registration for our group therapy sessions. Join expert-led physiotherapy groups and connect with others on similar recovery journeys with certified therapists.",
    keywords:
      "register group session, physiotherapy registration, group therapy signup, session booking, physiotherapy enrollment",
    type: "website",
  },
  "/group-video-call": {
    title:
      "Group Video Call Session - Online Physiotherapy Group Therapy | Tanish Physio",
    description:
      "Join your live group physiotherapy session. Connect with your therapist and fellow participants in real-time video consultation for collaborative recovery with certified experts.",
    keywords:
      "group video call, physiotherapy video session, live group therapy, online consultation, group call",
    type: "website",
  },
  "/invoice": {
    title:
      "Physiotherapy Session Invoice - Treatment Billing & Payment Details | Tanish Physio",
    description:
      "View and download your physiotherapy session invoice. Detailed billing information for your treatment services with certified therapists and professional care.",
    keywords:
      "physiotherapy invoice, treatment bill, session receipt, payment receipt, billing information",
    type: "website",
  },
  "/404": {
    title: "Page Not Found - 404 Error | Tanish Physio & Fitness",
    description:
      "The page you are looking for could not be found. Return to our homepage to continue exploring our professional physiotherapy services and certified therapist consultations.",
    keywords:
      "404 error, page not found, broken link, missing page, error page",
    type: "website",
  },
  "/recorded-sessions": {
    title: "Recorded Sessions - Tanish Physio & Fitness",
    description:
      "Access and manage your recorded physiotherapy sessions. View session recordings, download files, and track your therapy progress.",
    keywords:
      "recorded sessions, therapy recordings, session history, physiotherapy videos, recorded consultations",
    type: "website",
  },
  "/reset-password": {
    title: "Reset Password - Tanish Physio & Fitness",
    description:
      "Reset your password for your Tanish Physio & Fitness account. Securely update your login credentials to access your physiotherapy services.",
    keywords:
      "reset password, forgot password, password recovery, account security, login reset",
    type: "website",
  },
  "/schedule": {
    title: "Schedule Appointment - Tanish Physio & Fitness",
    description:
      "Schedule your physiotherapy appointment with certified experts. Choose your preferred date and time for personalized treatment sessions.",
    keywords:
      "schedule appointment, book physiotherapy, appointment booking, physiotherapy scheduling, session booking",
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

// Utility function to get SEO configuration with fallback to DEFAULT_SEO
export const getSEOConfig = (pathname: string): SEOConfig => {
  // Check if we have specific SEO config for this pathname
  if (PAGE_SEO[pathname]) {
    return PAGE_SEO[pathname];
  }

  // If not found, try with trailing slash removed or added
  const normalizedPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname + '/';
  if (PAGE_SEO[normalizedPath]) {
    return PAGE_SEO[normalizedPath];
  }

  // If still not found, return the default SEO config
  return DEFAULT_SEO;
};
