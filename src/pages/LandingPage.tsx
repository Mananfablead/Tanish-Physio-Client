import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEO/SEOHead";
import { PAGE_SEO } from "@/components/SEO/seoConfig";
import { SocialShareButtons } from "@/components/social/SocialShareButtons";
import { SocialFollowButtons } from "@/components/social/SocialFollowButtons";
import {
  ClipboardList,
  UserCheck,
  Video,
  Star,
  Shield,
  Award,
  ArrowRight,
  CheckCircle,
  Users,
  Clock,
  Activity,
  HeartPulse,
  Stethoscope,
  Bone,
  Dumbbell,
  Zap,
  Quote,
  HelpCircle,
  Lock,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Calendar,
  Check,
  FileText,
  User,
  Phone,
  Mail,
  Home,
  Briefcase,
  GraduationCap,
  Heart,
  Eye,
  Settings,
  Search,
  Filter,
  Grid,
  List,
  Map,
  Navigation,
  Package,
  ShoppingCart,
  Tag,
  Truck,
  Wrench,
  X,
  Plus,
  Minus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { motion, useInView, animate } from "framer-motion";

// Import components
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { ConditionsWeTreat } from "@/components/landing/ConditionsWeTreat";
import { Features } from "@/components/landing/Features";
import { SubscriptionPlans } from "@/components/landing/SubscriptionPlans";
import { FeaturedTherapist } from "@/components/landing/FeaturedTherapist";
import { FAQ } from "@/components/landing/FAQ";
import { TrustDisclaimer } from "@/components/landing/TrustDisclaimer";
import { CTA } from "@/components/landing/CTA";
import { Services } from "@/components/landing/Services";

// Import UI components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

// Import images
import heroImage from "@/assets/hero-physio.jpg";

import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/store";
import { fetchSubscriptionPlans } from "@/store/slices/subscriptionSlice";
import { fetchFeaturedTestimonials } from "@/store/slices/testimonialSlice";
import {
  selectFeaturedTestimonials,
  selectTestimonialsLoading,
  selectTestimonialsError,
} from "@/store/slices/testimonialSlice";
import {
  fetchHeroPublic,
  fetchStepsPublic,
  fetchWhyUsPublic,
  fetchFaqsPublic,
  fetchConditionsPublic,
} from "@/store/slices/cmsSlice";
import { fetchPublicAdmins } from "@/store/slices/adminSlice";
import { fetchFeaturedServices } from "@/store/slices/serviceSlice";
import {
  selectFeaturedServices,
  selectServicesLoading,
  selectServicesError,
} from "@/store/slices/serviceSlice";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const CountUp = ({
  value,
  duration = 2,
}: {
  value: string;
  duration?: number;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (inView && value && typeof value === "string") {
      const match = value.match(/(\d+\.?\d*)(.*)/);
      if (match) {
        const target = parseFloat(match[1]);
        const suffix = match[2];
        const controls = animate(0, target, {
          duration,
          onUpdate: (latest) => {
            setDisplayValue(
              (target % 1 === 0 ? Math.floor(latest) : latest.toFixed(1)) +
                suffix
            );
          },
        });
        return () => controls.stop();
      }
    }
  }, [inView, value, duration]);

  return <span ref={ref}>{value ? displayValue : "0"}</span>;
};

// Helper function to map icon names to components
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, any> = {
    ClipboardList: ClipboardList,
    UserCheck: UserCheck,
    Video: Video,
    Star: Star,
    Shield: Shield,
    Award: Award,
    CheckCircle: CheckCircle,
    Users: Users,
    Clock: Clock,
    Activity: Activity,
    HeartPulse: HeartPulse,
    Stethoscope: Stethoscope,
    Bone: Bone,
    Dumbbell: Dumbbell,
    Zap: Zap,
    Quote: Quote,
    HelpCircle: HelpCircle,
    Lock: Lock,
    ShieldCheck: ShieldCheck,
    AlertCircle: AlertCircle,
    MapPin: MapPin,
    Calendar: Calendar,
    Check: Check,
    FileText: FileText,
    User: User,
    Phone: Phone,
    Mail: Mail,
    Home: Home,
    Briefcase: Briefcase,
    GraduationCap: GraduationCap,
    Heart: Heart,
    Eye: Eye,
    Settings: Settings,
    Search: Search,
    Filter: Filter,
    Grid: Grid,
    List: List,
    Map: Map,
    Navigation: Navigation,
    Package: Package,
    ShoppingCart: ShoppingCart,
    Tag: Tag,
    Truck: Truck,
    Wrench: Wrench,
    Plus: Plus,
    Minus: Minus,
  };

  return iconMap[iconName] || ClipboardList;
};

export default function LandingPage() {
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);

  // Fetch subscription plans from Redux store
  const dispatch = useAppDispatch();
  const {
    plans: subscriptionPlans,
    loading: subscriptionLoading,
    error: subscriptionError,
  } = useSelector((state: RootState) => state.subscriptions);
  console.log("object", subscriptionPlans);
  // Fetch testimonials from Redux store
  const featuredTestimonials = useSelector(selectFeaturedTestimonials);
  const testimonialsLoading = useSelector(selectTestimonialsLoading);
  const testimonialsError = useSelector(selectTestimonialsError);

  // Fetch CMS hero and steps data from Redux store
  const {
    hero: cmsHero,
    steps: cmsSteps,
    whyUs: cmsWhyUs,
    faqs: cmsFaqs,
    conditions: cmsConditions,
    loading: cmsHeroLoading,
    error: cmsHeroError,
  } = useSelector((state: RootState) => state.cms);

  // Fetch public admins from Redux store
  const {
    admins: publicAdmins,
    loading: adminsLoading,
    error: adminsError,
  } = useSelector((state: RootState) => state.admins);

  // Fetch services from Redux store
  const featuredServices = useSelector(selectFeaturedServices);
  const servicesLoading = useSelector(selectServicesLoading);
  const servicesError = useSelector(selectServicesError);

  // State to track which session type to fetch
  const [sessionTypeFilter, setSessionTypeFilter] = useState<
    "individual" | "group"
  >("individual");
  // Fetch subscription plans when component mounts or session type changes
  useEffect(() => {
    dispatch(fetchSubscriptionPlans({ sessionType: sessionTypeFilter }));
  }, [dispatch, sessionTypeFilter]);
  // Fetch featured testimonials when component mounts
  useEffect(() => {
    dispatch(fetchSubscriptionPlans({ sessionType: sessionTypeFilter }));
  }, [dispatch, sessionTypeFilter]);

  // Fetch CMS hero and steps data when component mounts
  useEffect(() => {
    dispatch(fetchHeroPublic());
    dispatch(fetchStepsPublic());
    dispatch(fetchWhyUsPublic());
    dispatch(fetchFaqsPublic());
    dispatch(fetchConditionsPublic());
    dispatch(fetchPublicAdmins());
    dispatch(fetchFeaturedServices());
    dispatch(fetchFeaturedTestimonials());
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setShowStickyCTA(true);
      } else {
        setShowStickyCTA(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Layout>
      <SEOHead {...PAGE_SEO["/"]} />

      {/* Sticky Floating CTA */}
      {/* <motion.div
        className="fixed bottom-6 right-6 z-50 pointer-events-none"
        initial={{ opacity: 0, y: 100 }}
        animate={{
          opacity: showStickyCTA ? 1 : 0,
          y: showStickyCTA ? 0 : 100,
        }}
        transition={{ duration: 0.3 }}
      >
        <Link to="/questionnaire" className="pointer-events-auto">
          <Button
            size="lg"
            className="rounded-full shadow-2xl h-14 px-8 text-lg group"
          >
            Start Assessment
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </motion.div> */}
      {/* Hero Section */}
      <HeroSection cmsHero={cmsHero} heroImage={heroImage} />

      {/* Services Section - Only show if we have featured services */}
      {featuredServices && featuredServices.length > 0 && (
        <Services
          services={featuredServices}
          servicesLoading={servicesLoading}
          servicesError={servicesError}
          fadeInUp={fadeInUp}
        />
      )}

      {/* How It Works */}
      <HowItWorks cmsSteps={cmsSteps} stagger={stagger} fadeInUp={fadeInUp} />

      {/* Patient Testimonials */}
      <Testimonials
        featuredTestimonials={featuredTestimonials}
        testimonialsLoading={testimonialsLoading}
        testimonialsError={testimonialsError}
        fadeInUp={fadeInUp}
      />

      {/* Conditions We Treat */}
      <ConditionsWeTreat
        cmsConditions={cmsConditions}
        fadeInUp={fadeInUp}
        getIconComponent={getIconComponent}
      />

      {/* Features */}
      <Features
        cmsWhyUs={cmsWhyUs}
        fadeInUp={fadeInUp}
        CountUp={CountUp}
        setHoveredStat={setHoveredStat}
        hoveredStat={hoveredStat}
      />

      {/* Subscription Plans Preview */}
      <SubscriptionPlans
        subscriptionPlans={subscriptionPlans}
        subscriptionLoading={subscriptionLoading}
        subscriptionError={subscriptionError}
        onTabChange={setSessionTypeFilter}
        stagger={stagger}
        fadeInUp={fadeInUp}
      />

      {/* Featured Therapist – Single */}
      <FeaturedTherapist
        publicAdmins={publicAdmins}
        adminsLoading={adminsLoading}
        adminsError={adminsError}
      />

      {/* FAQ Section */}
      <FAQ cmsFaqs={cmsFaqs} />

      {/* Trust & Disclaimer */}
      <TrustDisclaimer />

      {/* CTA Section */}
      <CTA />

      {/* Social Follow Section - Bottom of Page */}
      <div className="bg-muted py-12">
        <div className="container text-center">
          <h3 className="text-2xl font-bold mb-6">Follow Us on Social Media</h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Stay updated with our latest health tips, success stories, and
            physiotherapy insights
          </p>
          <SocialFollowButtons variant="card" className="max-w-2xl mx-auto" />
        </div>
      </div>
    </Layout>
  );
}
