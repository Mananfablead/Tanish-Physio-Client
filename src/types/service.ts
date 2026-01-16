export interface Service {
  id: string | number;
  icon: string; // Using string for icon name instead of JSX.Element
  title: string;
  description: string;
  category?: string;
  benefits: string[];
  details: {
    title: string;
    description: string;
    benefits: string[];
    detailedDescription: string;
    conditionsTreated: string[];
    features: string[];
    sessionDuration: string;
    price: string;
    priceRange: string; // Added for compatibility with component
    prerequisites: string;
    whatToExpect: string[];
    resultsTimeline: string;
  };
  media?: {
    heroImage?: string;
    aboutImage?: string;
    videoUrl?: string;
  };
}