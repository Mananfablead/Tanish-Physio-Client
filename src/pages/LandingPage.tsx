import { useState, useEffect, useRef, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEO/SEOHead";
import { getSEOConfig } from "@/components/SEO/seoConfig";
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
import { Services } from "@/components/landing/Services";
import { SectionLoader } from "@/components/landing/SectionLoader";

// Lazy load below-the-fold components for performance
const Testimonials = lazy(() =>
  import("@/components/landing/Testimonials").then((m) => ({
    default: m.Testimonials,
  })),
) as any;
const ConditionsWeTreat = lazy(() =>
  import("@/components/landing/ConditionsWeTreat").then((m) => ({
    default: m.ConditionsWeTreat,
  })),
) as any;
const Features = lazy(() =>
  import("@/components/landing/Features").then((m) => ({
    default: m.Features,
  })),
) as any;
const SubscriptionPlans = lazy(() =>
  import("@/components/landing/SubscriptionPlans").then((m) => ({
    default: m.SubscriptionPlans,
  })),
) as any;
const FeaturedTherapist = lazy(() =>
  import("@/components/landing/FeaturedTherapist").then((m) => ({
    default: m.FeaturedTherapist,
  })),
) as any;
const FAQ = lazy(() =>
  import("@/components/landing/FAQ").then((m) => ({ default: m.FAQ })),
) as any;
const TrustDisclaimer = lazy(() =>
  import("@/components/landing/TrustDisclaimer").then((m) => ({
    default: m.TrustDisclaimer,
  })),
) as any;
const CTA = lazy(() =>
  import("@/components/landing/CTA").then((m) => ({ default: m.CTA })),
) as any;

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
import heroImage from "@/assets/hero-physio.png";

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
                suffix,
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
      {/* Enhanced SEO Meta Tags */}
      <SEOHead
        title="Online Physiotherapy & Video Consultations in India | Tanish Physio & Fitness"
        description="Book online physiotherapy with certified therapists in India. Get video consultations, personalized rehab plans, and guided recovery from home. Expert physiotherapy, rehabilitation and fitness training services."
        keywords="physiotherapy, online physiotherapy, video consultation, home physiotherapy, physical therapy, rehabilitation, fitness training, pain relief, posture correction, sports injury, certified physiotherapists India"
        url="/"
        type="website"
      />

      {/* Main content with proper semantic structure */}
      <main>
        {/* Hidden H1 for SEO - Main page title */}
        <h1 className="sr-only">
          Expert Physiotherapy & Fitness Training in India | Online Video
          Consultations with Certified Therapists
        </h1>
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
        <Suspense fallback={<SectionLoader height="h-96" />}>
          <Testimonials
            featuredTestimonials={featuredTestimonials}
            testimonialsLoading={testimonialsLoading}
            testimonialsError={testimonialsError}
            fadeInUp={fadeInUp}
          />
        </Suspense>

        {/* Conditions We Treat */}
        <Suspense fallback={<SectionLoader height="h-80" />}>
          <ConditionsWeTreat
            cmsConditions={cmsConditions}
            fadeInUp={fadeInUp}
            getIconComponent={getIconComponent}
          />
        </Suspense>

        {/* Features */}
        <Suspense fallback={<SectionLoader height="h-96" />}>
          <Features
            cmsWhyUs={cmsWhyUs}
            fadeInUp={fadeInUp}
            CountUp={CountUp}
            setHoveredStat={setHoveredStat}
            hoveredStat={hoveredStat}
          />
        </Suspense>

        {/* Subscription Plans Preview */}
        <Suspense fallback={<SectionLoader height="h-96" />}>
          <SubscriptionPlans
            subscriptionPlans={subscriptionPlans}
            subscriptionLoading={subscriptionLoading}
            subscriptionError={subscriptionError}
            onTabChange={setSessionTypeFilter}
            stagger={stagger}
            fadeInUp={fadeInUp}
          />
        </Suspense>

        {/* Featured Therapist – Single */}
        <Suspense fallback={<SectionLoader height="h-80" />}>
          <FeaturedTherapist
            publicAdmins={publicAdmins}
            adminsLoading={adminsLoading}
            adminsError={adminsError}
          />
        </Suspense>

        {/* FAQ Section */}
        <Suspense fallback={<SectionLoader height="h-80" />}>
          <FAQ cmsFaqs={cmsFaqs} />
        </Suspense>

        {/* Trust & Disclaimer */}
        <Suspense fallback={<SectionLoader height="h-40" />}>
          <TrustDisclaimer />
        </Suspense>

        {/* CTA Section */}
        <Suspense fallback={<SectionLoader height="h-60" />}>
          <CTA />
        </Suspense>

        {/* Internal Navigation Links (Hidden but helps crawlers and accessibility) */}
        <nav className="sr-only" aria-label="Internal navigation links">
          <ul>
            <li>
              <Link to="/services">Explore all physiotherapy services</Link>
            </li>
            <li>
              <Link to="/therapists">Find our certified therapists</Link>
            </li>
            <li>
              <Link to="/plans">View subscription plans</Link>
            </li>
            <li>
              <Link to="/about">Learn about our mission</Link>
            </li>
            <li>
              <Link to="/faq">Read frequently asked questions</Link>
            </li>
            <li>
              <Link to="/contact">Contact us for support</Link>
            </li>
            <li>
              <Link to="/free-consultation">Book a free consultation</Link>
            </li>
            <li>
              <Link to="/questionnaire">Start your recovery assessment</Link>
            </li>
          </ul>
        </nav>

        {/* SEO Content Section - Comprehensive text content for search engines */}
        <section
          className="container mx-auto px-4 py-16 max-w-5xl"
          aria-label="SEO Content"
        >
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Leading Online Physiotherapy Services in India
            </h2>

            <p className="text-slate-700 mb-4">
              Welcome to Tanish Physio & Fitness, India's premier destination
              for professional <strong>online physiotherapy</strong> and
              rehabilitation services. Our team of certified physiotherapists
              provides expert care through convenient video consultations,
              bringing quality healthcare directly to your home. Whether you're
              dealing with chronic pain, recovering from an injury, or looking
              to improve your physical fitness, our comprehensive approach
              combines evidence-based treatment with personalized care plans
              tailored to your unique needs.
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">
              Comprehensive Physiotherapy Treatments
            </h3>

            <p className="text-slate-700 mb-4">
              Our physiotherapy clinic offers a wide range of specialized
              treatments designed to address various conditions and promote
              optimal recovery. From{" "}
              <strong>sports injury rehabilitation</strong> to chronic pain
              management, our therapists utilize cutting-edge techniques and
              therapeutic exercises to help you regain mobility and strength. We
              specialize in treating back pain, neck pain, joint disorders,
              post-surgical rehabilitation, neurological conditions, and
              workplace ergonomics through targeted interventions and{" "}
              <strong>posture correction therapy</strong>.
            </p>

            <p className="text-slate-700 mb-4">
              What sets our <strong>fitness training</strong> programs apart is
              the integration of physiotherapy expertise with exercise science.
              Each rehabilitation program is carefully designed to not only
              alleviate immediate symptoms but also prevent future injuries
              through strengthening exercises, flexibility training, and
              lifestyle modifications. Our therapists work closely with you to
              establish realistic goals and track progress throughout your
              recovery journey.
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">
              Why Choose Online Physiotherapy?
            </h3>

            <p className="text-slate-700 mb-4">
              Online physiotherapy has revolutionized access to quality
              healthcare across India. Our video consultation platform
              eliminates geographical barriers, reduces travel time, and
              provides flexible scheduling options that fit your busy lifestyle.
              Research shows that telehealth physiotherapy delivers outcomes
              comparable to in-person sessions while offering greater
              convenience and cost-effectiveness. Patients appreciate the
              comfort of receiving professional guidance from their own homes,
              leading to better adherence to treatment protocols and faster
              recovery times.
            </p>

            <p className="text-slate-700 mb-4">
              Through our secure digital platform, you'll receive comprehensive
              assessments, real-time exercise demonstrations, personalized home
              exercise programs, and ongoing monitoring of your progress. Our
              therapists provide detailed explanations of your condition,
              treatment rationale, and self-management strategies to empower you
              in taking control of your health and wellness journey.
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">
              Expert Care for Pain Relief and Rehabilitation
            </h3>

            <p className="text-slate-700 mb-4">
              <strong>Pain relief</strong> is at the core of our treatment
              philosophy. Our physiotherapists employ various evidence-based
              modalities including manual therapy, therapeutic exercises,
              electrotherapy, and functional training to effectively manage
              acute and chronic pain conditions. We understand that pain affects
              every aspect of life, which is why our holistic approach addresses
              not just physical symptoms but also the psychological and social
              factors that influence recovery.
            </p>

            <p className="text-slate-700 mb-4">
              For athletes and active individuals, our{" "}
              <strong>sports injury</strong> specialists provide sport-specific
              rehabilitation programs designed to safely return you to peak
              performance. We treat common sports injuries including ACL tears,
              rotator cuff injuries, tennis elbow, runner's knee, ankle sprains,
              and stress fractures. Our therapists analyze movement patterns,
              identify biomechanical imbalances, and develop targeted
              intervention strategies to optimize athletic performance while
              minimizing injury risk.
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">
              Posture Correction and Ergonomic Solutions
            </h3>

            <p className="text-slate-700 mb-4">
              In today's digital age, poor posture has become a widespread
              health concern leading to chronic pain and dysfunction. Our{" "}
              <strong>posture correction</strong> programs address forward head
              posture, rounded shoulders, and spinal misalignments caused by
              prolonged computer use, smartphone usage, and sedentary
              lifestyles. Through postural analysis, corrective exercises,
              ergonomic modifications, and awareness training, we help restore
              proper alignment and reduce strain on your musculoskeletal system.
            </p>

            <h3 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">
              Get Started with Your Recovery Today
            </h3>

            <p className="text-slate-700 mb-4">
              Beginning your physiotherapy journey with Tanish Physio & Fitness
              is simple and convenient. Schedule your initial video consultation
              at a time that works best for you. During this comprehensive
              session, your therapist will conduct a thorough assessment,
              discuss your medical history, identify contributing factors, and
              collaborate with you to establish meaningful treatment goals.
              You'll receive a customized treatment plan outlining recommended
              interventions, expected timeline, and home exercise prescriptions.
            </p>

            <p className="text-slate-700 mb-4">
              Don't let pain or limited mobility hold you back from living life
              to the fullest. Our dedicated team of physiotherapy professionals
              is here to support you every step of the way. Experience the
              difference of patient-centered care that prioritizes your unique
              needs, respects your time, and delivers measurable results. Join
              hundreds of satisfied patients across India who have successfully
              recovered and transformed their lives through our expert
              physiotherapy and fitness training services.
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
