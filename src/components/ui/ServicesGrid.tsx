import { ServiceCard } from "@/components/ui/ServiceCard";
import { 
  Activity, 
  Brain, 
  Users, 
  Baby, 
  HeartPulse, 
  Footprints, 
  Bone, 
  Scale, 
  Scissors, 
  Home
} from "lucide-react";

interface Service {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
  details: {
    title: string;
    description: string;
    benefits: string[];
    detailedDescription: string;
    conditionsTreated: string[];
    sessionDuration: string;
    priceRange: string;
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

export const services: Service[] = [
  {
    id: 1,
    icon: <Activity className="h-6 w-6" />,
    title: "Orthopedic Physiotherapy",
    description: "Specialized care for musculoskeletal conditions, injuries, and post-surgical rehabilitation to restore mobility and function.",
    benefits: [
      "Pain management techniques",
      "Injury prevention strategies",
      "Functional movement restoration"
    ],
    details: {
      title: "Orthopedic Physiotherapy",
      description: "Specialized care for musculoskeletal conditions, injuries, and post-surgical rehabilitation to restore mobility and function.",
      benefits: [
        "Pain management techniques",
        "Injury prevention strategies",
        "Functional movement restoration"
      ],
      detailedDescription: "Our orthopedic physiotherapy program focuses on treating injuries and conditions affecting bones, muscles, ligaments, and joints. Our specialists use evidence-based techniques to reduce pain, improve mobility, and restore function.",
      conditionsTreated: [
        "Back and neck pain",
        "Joint injuries",
        "Post-surgical rehabilitation",
        "Arthritis management",
        "Sports injuries",
        "Work-related injuries",
        "Fracture recovery",
        "Tendon injuries",
        "Muscle strains",
        "Postural dysfunction"
      ],
      sessionDuration: "45-60 min",
      priceRange: "₹4000-7500",
      prerequisites: "Medical referral recommended",
      whatToExpect: [
        "Initial assessment and evaluation",
        "Personalized treatment plan",
        "Hands-on manual therapy techniques",
        "Exercise prescription for home"
      ],
      resultsTimeline: "2-6 weeks"
    },
    media: {
      heroImage: "https://placehold.co/800x400/e2e8f0/64748b?text=Orthopedic+Therapy",
      aboutImage: "https://placehold.co/600x400/f1f5f9/64748b?text=Therapy+Session",
      videoUrl: "https://example.com/video"
    }
  },
  {
    id: 2,
    icon: <Brain className="h-6 w-6" />,
    title: "Neuro Physiotherapy",
    description: "Treatment for neurological conditions including stroke, Parkinson's disease, and spinal cord injuries.",
    benefits: [
      "Balance and coordination training",
      "Motor function improvement",
      "Daily living activities support"
    ],
    details: {
      title: "Neuro Physiotherapy",
      description: "Treatment for neurological conditions including stroke, Parkinson's disease, and spinal cord injuries.",
      benefits: [
        "Balance and coordination training",
        "Motor function improvement",
        "Daily living activities support"
      ],
      detailedDescription: "Neurological physiotherapy addresses movement and functional problems caused by disorders of the nervous system. Our specialists work to maximize independence and improve quality of life.",
      conditionsTreated: [
        "Stroke rehabilitation",
        "Parkinson's disease",
        "Multiple sclerosis",
        "Spinal cord injuries",
        "Traumatic brain injury",
        "Peripheral neuropathy",
        "Cerebral palsy",
        "Guillain-Barre syndrome",
        "Spina bifida",
        "Autism spectrum disorders"
      ],
      sessionDuration: "45-60 min",
      priceRange: "₹4500-8000",
      prerequisites: "Neurologist referral required",
      whatToExpect: [
        "Comprehensive neurological assessment",
        "Gait and balance training",
        "Strength and mobility exercises",
        "Adaptive equipment training"
      ],
      resultsTimeline: "4-12 weeks"
    },
    media: {
      heroImage: "https://placehold.co/800x400/dbeafe/3b82f6?text=Neuro+Therapy",
      aboutImage: "https://placehold.co/600x400/e0f2fe/0ea5e9?text=Neuro+Session",
      videoUrl: "https://example.com/video"
    }
  },
  {
    id: 3,
    icon: <Users className="h-6 w-6" />,
    title: "Sports Physiotherapy",
    description: "Targeted treatment for athletes and active individuals dealing with sports-related injuries and performance enhancement.",
    benefits: [
      "Injury prevention protocols",
      "Performance optimization",
      "Return to sport planning"
    ],
    details: {
      title: "Sports Physiotherapy",
      description: "Targeted treatment for athletes and active individuals dealing with sports-related injuries and performance enhancement.",
      benefits: [
        "Injury prevention protocols",
        "Performance optimization",
        "Return to sport planning"
      ],
      detailedDescription: "Our sports physiotherapy program is designed for athletes at all levels, focusing on injury prevention, treatment, and performance enhancement to get you back in the game safely.",
      conditionsTreated: [
        "ACL injuries",
        "Shoulder dislocations",
        "Concussions",
        "Overuse injuries",
        "Muscle strains",
        "Tennis/golfer's elbow",
        "Shin splints",
        "Plantar fasciitis",
        "Runner's knee",
        "Swimmer's shoulder"
      ],
      sessionDuration: "30-60 min",
      priceRange: "₹4250-7750",
      prerequisites: "Sports physical evaluation",
      whatToExpect: [
        "Sports-specific movement analysis",
        "Injury prevention screening",
        "Rehabilitation exercises",
        "Performance enhancement training"
      ],
      resultsTimeline: "1-8 weeks"
    },
    media: {
      heroImage: "https://placehold.co/800x400/dcfce7/22c55e?text=Sports+Therapy",
      aboutImage: "https://placehold.co/600x400/ecfdf5/16a34a?text=Sports+Session",
      videoUrl: "https://example.com/video"
    }
  },
  {
    id: 4,
    icon: <Baby className="h-6 w-6" />,
    title: "Pediatric Physiotherapy",
    description: "Gentle, child-friendly therapy for developmental delays, neurological conditions, and musculoskeletal issues.",
    benefits: [
      "Developmental milestone support",
      "Play-based therapy",
      "Family-centered care"
    ],
    details: {
      title: "Pediatric Physiotherapy",
      description: "Gentle, child-friendly therapy for developmental delays, neurological conditions, and musculoskeletal issues.",
      benefits: [
        "Developmental milestone support",
        "Play-based therapy",
        "Family-centered care"
      ],
      detailedDescription: "Pediatric physiotherapy helps children reach their physical potential through specialized, fun, and engaging treatments. Our therapists work closely with families to support the child's development.",
      conditionsTreated: [
        "Developmental delays",
        "Cerebral palsy",
        "Cystic fibrosis",
        "Torticollis",
        "Hip dysplasia",
        "Gross motor delays",
        "Autism spectrum disorders",
        "Down syndrome",
        "Muscular dystrophy",
        "Juvenile arthritis"
      ],
      sessionDuration: "30-45 min",
      priceRange: "₹3750-7000",
      prerequisites: "Parental consent required",
      whatToExpect: [
        "Play-based assessment",
        "Family education",
        "Home exercise programs",
        "Developmental milestone tracking"
      ],
      resultsTimeline: "3-12 weeks"
    },
    media: {
      heroImage: "https://placehold.co/800x400/fef3c7/f59e0b?text=Pediatric+Therapy",
      aboutImage: "https://placehold.co/600x400/fffbeb/f59e0b?text=Child+Therapy",
      videoUrl: "https://example.com/video"
    }
  },
  {
    id: 5,
    icon: <HeartPulse className="h-6 w-6" />,
    title: "Maternity Physiotherapy",
    description: "Specialized care for expectant and new mothers addressing pregnancy-related discomfort and postpartum recovery.",
    benefits: [
      "Prenatal and postnatal care",
      "Pelvic floor rehabilitation",
      "Posture correction support"
    ],
    details: {
      title: "Maternity Physiotherapy",
      description: "Specialized care for expectant and new mothers addressing pregnancy-related discomfort and postpartum recovery.",
      benefits: [
        "Prenatal and postnatal care",
        "Pelvic floor rehabilitation",
        "Posture correction support"
      ],
      detailedDescription: "Our maternity physiotherapy provides specialized care for women during pregnancy and postpartum, addressing common discomforts and promoting healthy recovery.",
      conditionsTreated: [
        "Lower back pain",
        "Pelvic girdle pain",
        "Diastasis recti",
        "Urinary incontinence",
        "Postural changes",
        "Postpartum recovery",
        "C-section recovery",
        "Carpal tunnel syndrome",
        "Round ligament pain",
        "Sciatic pain"
      ],
      sessionDuration: "45-60 min",
      priceRange: "₹4000-7250",
      prerequisites: "Pregnancy confirmation",
      whatToExpect: [
        "Pelvic floor assessment",
        "Prenatal/postnatal exercise guidance",
        "Posture correction techniques",
        "Breathing exercises"
      ],
      resultsTimeline: "4-10 weeks"
    },
    media: {
      heroImage: "https://placehold.co/800x400/fce7f3/ec4899?text=Maternity+Therapy",
      aboutImage: "https://placehold.co/600x400/fdf2f8/ec4899?text=Maternity+Session",
      videoUrl: "https://example.com/video"
    }
  },
  {
    id: 6,
    icon: <Footprints className="h-6 w-6" />,
    title: "Podiatry Physiotherapy",
    description: "Treatment for foot, ankle, and lower leg conditions with specialized biomechanical assessment.",
    benefits: [
      "Gait analysis and correction",
      "Orthotic recommendations",
      "Customized exercise programs"
    ],
    details: {
      title: "Podiatry Physiotherapy",
      description: "Treatment for foot, ankle, and lower leg conditions with specialized biomechanical assessment.",
      benefits: [
        "Gait analysis and correction",
        "Orthotic recommendations",
        "Customized exercise programs"
      ],
      detailedDescription: "Our podiatry physiotherapy addresses conditions affecting the feet, ankles, and lower legs, with specialized biomechanical assessments to identify root causes of pain and dysfunction.",
      conditionsTreated: [
        "Plantar fasciitis",
        "Achilles tendinopathy",
        "Ankle sprains",
        "Shin splints",
        "Metatarsalgia",
        "Flat feet/overpronation",
        "Heel spurs",
        "Bunions",
        "Morton's neuroma",
        "Tarsal tunnel syndrome"
      ],
      sessionDuration: "30-45 min",
      priceRange: "₹3750-6750",
      prerequisites: "Footwear assessment",
      whatToExpect: [
        "Gait and biomechanical analysis",
        "Footwear evaluation",
        "Custom exercise programs",
        "Orthotic recommendations"
      ],
      resultsTimeline: "2-8 weeks"
    },
    media: {
      heroImage: "https://placehold.co/800x400/ddd6fe/8b5cf6?text=Podiatry+Therapy",
      aboutImage: "https://placehold.co/600x400/ece9fe/8b5cf6?text=Foot+Session",
      videoUrl: "https://example.com/video"
    }
  },
  {
    id: 7,
    icon: <Bone className="h-6 w-6" />,
    title: "Chiropractic",
    description: "Manual therapy focusing on spine alignment and musculoskeletal health to reduce pain and improve function.",
    benefits: [
      "Spinal alignment correction",
      "Pain relief techniques",
      "Posture optimization"
    ],
    details: {
      title: "Chiropractic",
      description: "Manual therapy focusing on spine alignment and musculoskeletal health to reduce pain and improve function.",
      benefits: [
        "Spinal alignment correction",
        "Pain relief techniques",
        "Posture optimization"
      ],
      detailedDescription: "Chiropractic care focuses on the relationship between spine alignment and overall health, using manual adjustments to restore proper function and reduce pain.",
      conditionsTreated: [
        "Lower back pain",
        "Neck pain",
        "Headaches",
        "Sciatica",
        "Joint dysfunction",
        "Postural imbalances",
        "Herniated discs",
        "Scoliosis",
        "TMJ disorders",
        "Whiplash injuries"
      ],
      sessionDuration: "20-30 min",
      priceRange: "₹3000-6000",
      prerequisites: "No recent spine surgery",
      whatToExpect: [
        "Spinal assessment",
        "Manual adjustments",
        "Posture education",
        "Home care recommendations"
      ],
      resultsTimeline: "1-4 weeks"
    },
    media: {
      heroImage: "https://placehold.co/800x400/fef2f2/ef4444?text=Chiropractic",
      aboutImage: "https://placehold.co/600x400/ffebee/ef4444?text=Spine+Therapy",
      videoUrl: "https://example.com/video"
    }
  },
  {
    id: 8,
    icon: <Scale className="h-6 w-6" />,
    title: "Weight Management",
    description: "Comprehensive program combining physiotherapy with nutrition guidance for healthy weight management.",
    benefits: [
      "Personalized nutrition plans",
      "Exercise prescription",
      "Behavioral modification support"
    ],
    details: {
      title: "Weight Management",
      description: "Comprehensive program combining physiotherapy with nutrition guidance for healthy weight management.",
      benefits: [
        "Personalized nutrition plans",
        "Exercise prescription",
        "Behavioral modification support"
      ],
      detailedDescription: "Our weight management program combines physiotherapy with nutrition guidance to help you achieve sustainable, healthy weight loss through safe and effective methods.",
      conditionsTreated: [
        "Obesity",
        "Weight-related joint pain",
        "Metabolic syndrome",
        "Diabetes management",
        "Cardiovascular risk reduction",
        "Mobility limitations due to weight",
        "Pre-diabetes",
        "Hypertension",
        "Sleep apnea",
        "Fatty liver disease"
      ],
      sessionDuration: "45-60 min",
      priceRange: "₹4750-8500",
      prerequisites: "Medical clearance",
      whatToExpect: [
        "Body composition analysis",
        "Personalized exercise program",
        "Nutrition counseling",
        "Progress tracking"
      ],
      resultsTimeline: "8-16 weeks"
    },
    media: {
      heroImage: "https://placehold.co/800x400/f3e8ff/a855f7?text=Weight+Management",
      aboutImage: "https://placehold.co/600x400/faf5ff/a855f7?text=Wellness+Journey",
      videoUrl: "https://example.com/video"
    }
  },
  {
    id: 9,
    icon: <Scissors className="h-6 w-6" />,
    title: "Cosmetic & Hair Care",
    description: "Specialized treatments for aesthetic enhancement and hair care through advanced physiotherapy techniques.",
    benefits: [
      "Non-invasive procedures",
      "Advanced skin treatments",
      "Hair restoration therapy"
    ],
    details: {
      title: "Cosmetic & Hair Care",
      description: "Specialized treatments for aesthetic enhancement and hair care through advanced physiotherapy techniques.",
      benefits: [
        "Non-invasive procedures",
        "Advanced skin treatments",
        "Hair restoration therapy"
      ],
      detailedDescription: "Our cosmetic and hair care services use advanced physiotherapy techniques to enhance appearance and promote healthy skin and hair growth through non-invasive methods.",
      conditionsTreated: [
        "Hair loss",
        "Skin texture improvement",
        "Cellulite reduction",
        "Facial rejuvenation",
        "Scar tissue management",
        "Acne treatment",
        "Wrinkle reduction",
        "Pigmentation issues",
        "Stretch marks",
        "Hair thinning"
      ],
      sessionDuration: "30-45 min",
      priceRange: "₹5000-10000",
      prerequisites: "Skin assessment",
      whatToExpect: [
        "Skin/hair analysis",
        "Customized treatment plan",
        "Professional aesthetic treatments",
        "Home care routine"
      ],
      resultsTimeline: "4-12 weeks"
    },
    media: {
      heroImage: "https://placehold.co/800x400/ecfdf5/10b981?text=Cosmetic+Care",
      aboutImage: "https://placehold.co/600x400/f0fdf4/10b981?text=Aesthetic+Therapy",
      videoUrl: "https://example.com/video"
    }
  },
  {
    id: 10,
    icon: <Home className="h-6 w-6" />,
    title: "Home Service",
    description: "Convenient in-home physiotherapy services for patients who prefer treatment in their own environment.",
    benefits: [
      "Convenient home visits",
      "Personalized environment",
      "Flexible scheduling"
    ],
    details: {
      title: "Home Service",
      description: "Convenient in-home physiotherapy services for patients who prefer treatment in their own environment.",
      benefits: [
        "Convenient home visits",
        "Personalized environment",
        "Flexible scheduling"
      ],
      detailedDescription: "Our home service brings professional physiotherapy directly to you, allowing treatment in the comfort of your own environment with personalized attention and convenience.",
      conditionsTreated: [
        "Post-surgical recovery",
        "Mobility limitations",
        "Chronic pain management",
        "Elderly care",
        "Postpartum recovery",
        "General physiotherapy needs",
        "Post-hospitalization",
        "Chronic illness management",
        "Palliative care",
        "Rehabilitation after stroke"
      ],
      sessionDuration: "45-60 min",
      priceRange: "₹6000-10000",
      prerequisites: "Safe home environment",
      whatToExpect: [
        "In-home assessment",
        "Personalized treatment",
        "Home safety evaluation",
        "Family education"
      ],
      resultsTimeline: "2-12 weeks"
    },
    media: {
      heroImage: "https://placehold.co/800x400/f0f9ff/0ea5e9?text=Home+Service",
      aboutImage: "https://placehold.co/600x400/f0f9ff/0ea5e9?text=In-Home+Care",
      videoUrl: "https://example.com/video"
    }
  }
];

interface ServicesGridProps {
  services?: Service[];
}

export function ServicesGrid({ services: customServices }: ServicesGridProps = {}) {
  const servicesToDisplay = customServices || services;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {servicesToDisplay.map((service) => (
        <ServiceCard
          key={service.id}
          icon={service.icon}
          title={service.title}
          description={service.description}
          benefits={service.benefits}
          details={service.details}
          serviceId={service.id}
        />
      ))}
    </div>
  );
}