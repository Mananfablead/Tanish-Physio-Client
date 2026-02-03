import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, useInView, animate } from "framer-motion";
import heroImage from "@/assets/hero-physio.jpg";

import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

// Import Redux hooks and subscription actions
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/store';
import { fetchSubscriptionPlans } from '@/store/slices/subscriptionSlice';
import { fetchFeaturedTestimonials } from '@/store/slices/testimonialSlice';
import { selectFeaturedTestimonials, selectTestimonialsLoading, selectTestimonialsError } from '@/store/slices/testimonialSlice';
import { fetchHeroPublic, fetchStepsPublic, fetchWhyUsPublic, fetchFaqsPublic, fetchConditionsPublic } from '@/store/slices/cmsSlice';
import { fetchPublicAdmins } from '@/store/slices/adminSlice';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const CountUp = ({ value, duration = 2 }: { value: string; duration?: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (inView) {
      const match = value.match(/(\d+\.?\d*)(.*)/);
      if (match) {
        const target = parseFloat(match[1]);
        const suffix = match[2];
        const controls = animate(0, target, {
          duration,
          onUpdate: (latest) => {
            setDisplayValue(
              (target % 1 === 0 ? Math.floor(latest) : latest.toFixed(1)) + suffix
            );
          },
        });
        return () => controls.stop();
      }
    }
  }, [inView, value, duration]);

  return <span ref={ref}>{displayValue}</span>;
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

// Component to handle image with fallback
const ConditionDisplay = ({ image, label }: { image: string; label: string }) => {
  const [imgSrc, setImgSrc] = useState(image);
  const [useFallback, setUseFallback] = useState(!image);

  useEffect(() => {
    setImgSrc(image);
    setUseFallback(!image);
  }, [image]);

  if (useFallback) {
    const FallbackIcon = getIconComponent("Activity");
    return <FallbackIcon className="h-8 w-8" />;
  }

  return (
    <img 
      src={imgSrc} 
      alt={label}
      className="h-8 w-8 object-contain"
      onError={() => setUseFallback(true)}
    />
  );
};

export default function LandingPage() {
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  
  // Fetch subscription plans from Redux store
  const dispatch = useAppDispatch();
  const { plans: subscriptionPlans, loading: subscriptionLoading, error: subscriptionError } = useSelector((state: RootState) => state.subscriptions);
  
  // Fetch testimonials from Redux store
  const featuredTestimonials = useSelector(selectFeaturedTestimonials);
  const testimonialsLoading = useSelector(selectTestimonialsLoading);
  const testimonialsError = useSelector(selectTestimonialsError);
  
  // Fetch CMS hero and steps data from Redux store
  const { hero: cmsHero, steps: cmsSteps, whyUs: cmsWhyUs, faqs: cmsFaqs, conditions: cmsConditions, loading: cmsHeroLoading, error: cmsHeroError } = useSelector((state: RootState) => state.cms);
  
  // Fetch public admins from Redux store
  const { admins: publicAdmins, loading: adminsLoading, error: adminsError } = useSelector((state: RootState) => state.admins);
  
  // Fetch subscription plans when component mounts
  useEffect(() => {
    dispatch(fetchSubscriptionPlans());
  }, [dispatch]);
  
  // Fetch featured testimonials when component mounts
  useEffect(() => {
    dispatch(fetchFeaturedTestimonials());
  }, [dispatch]);
  
  // Fetch CMS hero and steps data when component mounts
  useEffect(() => {
    dispatch(fetchHeroPublic());
    dispatch(fetchStepsPublic());
    dispatch(fetchWhyUsPublic());
    dispatch(fetchFaqsPublic());
    dispatch(fetchConditionsPublic());
    dispatch(fetchPublicAdmins());
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
      {/* Sticky Floating CTA */}
      <motion.div 
        className="fixed bottom-6 right-6 z-50 pointer-events-none"
        initial={{ opacity: 0, y: 100 }}
        animate={{ 
          opacity: showStickyCTA ? 1 : 0, 
          y: showStickyCTA ? 0 : 100 
        }}
        transition={{ duration: 0.3 }}
      >
        <Link to="/questionnaire" className="pointer-events-auto">
          <Button size="lg" className="rounded-full shadow-2xl h-14 px-8 text-lg group">
            Start Assessment
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </motion.div>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero border-b border-primary/5">
        <div className="absolute inset-0 bg-gradient-to-br fr
        
        om-primary/10 via-background to-accent/10" />
        <div className="container relative py-16 lg:py-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="space-y-6">
                <Badge variant="secondary" className="w-fit px-4 py-1.5 flex items-center gap-2 border border-primary/10">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                    </span>
                    <span className="text-xs font-medium text-success">
                      {cmsHero?.isTherapistAvailable ? 'Therapists available now' : 'Book your appointment'}
                    </span>
                  </div>
                  <span className="text-muted-foreground mx-1">|</span>
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  {cmsHero?.trustedBy || 'Trusted by 10,000+ patients'}
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-balance">
                  {cmsHero?.heading || 'Start Your Recovery Journey Today'}
                </h1>
                <h3 className="text-xl font-semibold tracking-tight text-balance tracking-wide">{cmsHero?.subHeading || 'Recovery'}</h3>
                <p className="text-lg text-muted-foreground max-w-lg">
                  {cmsHero?.description || 'Connect with certified physiotherapists from home. Get personalized treatment plans and video consultations tailored to your needs.'}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/questionnaire">
                      <Button variant="hero" size="xl">
                        {cmsHero?.ctaText || 'Start Your Recovery'}
                        <ArrowRight className="h-5 w-5 ml-1" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Begin your personalized clinical assessment</p>
                  </TooltipContent>
                </Tooltip>
                
                {/* <Link to="/therapists">
                  <Button variant="heroOutline" size="xl">
                    {cmsHero?.secondaryCtaText || 'Continue as Guest'}
                  </Button>
                </Link> */}
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 ">
                {/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>HIPAA Compliant</span>
                </div> */}
                {cmsHero?.certifiedTherapists && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Award className="h-5 w-5 text-primary" />
                    <span>Certified Therapists</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                    ))}
                  </div>
                  <span>{cmsHero?.rating || '4.9/5 Rating'}</span>
                </div>
                <div className="space-y-2">
                  {cmsHero?.features && Array.isArray(cmsHero.features) && cmsHero.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-large border-8 border-white dark:border-white/5">
                <img 
                  src={cmsHero?.image || heroImage} 
                  alt="Physiotherapist helping patient with recovery exercises"
                  className="w-full h-[25rem] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
              </div>
              
              {/* Floating Stats Card */}
              {/* <Card variant="glass" className="absolute -bottom-6 -left-6 p-4 border border-primary/20 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">500+</p>
                    <p className="text-sm text-muted-foreground">Active Therapists</p>
                  </div>
                </div>
              </Card> */}

              <Card variant="glass" className="absolute -top-4 -right-4 p-4 border border-primary/20 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">24/7</p>
                    <p className="text-sm text-muted-foreground">Available</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 relative overflow-hidden bg-primary/[0.02] border-y border-primary/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />
        </div>
        
        <div className="container relative z-10">
          <motion.div 
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-4 border border-primary/20">How It Works</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              {(cmsSteps && cmsSteps.length > 0) ? (cmsSteps[0].heading || "Three Simple Steps to Recovery") : "Three Simple Steps to Recovery"}
            </h2>
            <p className="text-muted-foreground">
              {(cmsSteps && cmsSteps.length > 0) ? (cmsSteps[0].subHeading || "Our streamlined process ensures you get the right care from the right therapist.") : "Our streamlined process ensures you get the right care from the right therapist."}
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8 relative"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Connection Lines (Desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-y-1/2 z-0" />
            
            {(cmsSteps && cmsSteps.length > 0 ? cmsSteps : [
              {
                title: "Answer Health Questions",
                description: "Complete a quick assessment about your condition, pain areas, and recovery goals.",
                image: ""
              },
              {
                title: "Choose a Physiotherapist",
                description: "Browse certified therapists matched to your needs. Review profiles, ratings, and specializations.",
                image: ""
              },
              {
                title: "Start Video Sessions",
                description: "Connect via secure video calls. Get personalized exercises and track your progress.",
                image: ""
              }
            ]).map((item, index) => {
              const stepNumber = (index + 1).toString().padStart(2, '0');
              const colors = ['primary', 'accent', 'success'];
              const color = colors[index % colors.length];
              
              return (
                <motion.div key={item._id || index} variants={fadeInUp} className="relative z-10">
                  <Card 
                    variant="gradient" 
                    className="h-full p-8 text-center relative overflow-hidden group border-t-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    style={{ borderTopColor: `hsl(var(--${color}))` }}
                  >
                    <div className={`absolute top-4 right-4 text-6xl font-bold opacity-5 group-hover:opacity-10 transition-opacity text-${color}`}>
                      {stepNumber}
                    </div>
                    <div className="relative z-10">
                      {item.image ? (
                        <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                          <span className="h-8 w-8 text-white flex items-center justify-center">?</span>
                        </div>
                      )}
                      <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                    <div className={`absolute bottom-0 left-0 h-1 w-0 bg-${color} group-hover:w-full transition-all duration-500`} />
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Patient Testimonials */}
      <section className="py-16 relative overflow-hidden border-y border-primary/10" style={{ backgroundColor: '#2d8e8d' }}>
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 left-0 w-72 h-72 bg-white/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-black/5 rounded-full blur-[100px]" />
        </div>

        <div className="container relative z-10">
          <motion.div 
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4 border-white/30 text-white bg-white/10">Success Stories</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">What Our Patients Say</h2>
            <p className="text-white/80">
              Real recovery stories from people who regained their mobility and strength with our help.
            </p>
          </motion.div>

          <div className="px-4 md:px-12">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 5000,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {testimonialsLoading ? (
                  <CarouselItem className="pl-4 md:basis-1/3">
                    <div className="h-full p-8 flex items-center justify-center">
                      <p className="text-white">Loading testimonials...</p>
                    </div>
                  </CarouselItem>
                ) : testimonialsError ? (
                  <CarouselItem className="pl-4 md:basis-1/3">
                    <div className="h-full p-8 flex items-center justify-center">
                      <p className="text-destructive text-white">Error loading testimonials: {testimonialsError}</p>
                    </div>
                  </CarouselItem>
                ) : featuredTestimonials.length > 0 ? (
                  featuredTestimonials?.map((testimonial, index) => (
                    <CarouselItem key={testimonial?._id || index} className="pl-4 md:basis-1/3">
                      <motion.div variants={fadeInUp}>
                        <Card className={`h-full p-8 hover:shadow-xl transition-all duration-500 border-l-4 bg-gradient-to-br from-white to-muted/20 dark:from-background dark:to-muted/5 relative group overflow-hidden`}>
                          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                          
                          <div className="flex items-center gap-4 mb-6 relative z-10">
                            <Avatar className="h-14 w-14 border-2 shadow-md transition-transform duration-500 group-hover:scale-110"
                              style={{ borderColor: 'hsl(var(--primary/30))' }}>
                              <AvatarImage src={testimonial?.userId?.profilePicture || `https://i.pravatar.cc/150?u=${testimonial?.userId?._id}`} alt={testimonial?.userId?.name} />
                              <AvatarFallback>{testimonial?.userId?.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-bold text-lg">{testimonial.userId?.name}</h4>
                              <p className="text-xs font-bold uppercase tracking-widest text-primary">{testimonial?.problem}</p>
                            </div>
                          </div>
                          
                          <div className="flex mb-6 relative z-10">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < testimonial?.rating ? "fill-warning text-warning" : "text-muted"}`} 
                              />
                            ))}
                          </div>
                          
                          <div className="relative z-10">
                            <Quote className="h-10 w-10 text-primary/10 absolute -top-4 -left-2 transition-colors duration-500 group-hover:text-primary/20" />
                            <p className="text-muted-foreground italic relative z-10 pl-6 leading-relaxed line-clamp-4">
                              "{testimonial.content}"
                            </p>
                          </div>

                          <div className="absolute bottom-0 right-0 w-1 h-0 bg-primary group-hover:h-full transition-all duration-700" />
                        </Card>
                      </motion.div>
                    </CarouselItem>
                  ))
                ) : (
                  <CarouselItem className="pl-4 md:basis-1/3">
                    <div className="h-full p-8 flex items-center justify-center">
                      <p className="text-white">No featured testimonials available.</p>
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              <CarouselPrevious className="-left-4 md:-left-12 border-white/30 text-white hover:bg-white/20" />
              <CarouselNext className="-right-4 md:-right-12 border-white/30 text-white hover:bg-white/20" />
            </Carousel>
          </div>
        </div>
      </section>

      {/* Conditions We Treat */}
      <section className="py-16 relative overflow-hidden border-y border-primary/10" >
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" />
        </div>
        <div className="container relative z-10">
          <motion.div 
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-4 border border-primary/20">{cmsConditions?.title || 'Specialties'}</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">{cmsConditions?.title || 'Conditions We Treat'}</h2>
            <p className="text-muted-foreground">
              {cmsConditions?.description || 'Our experts specialize in a wide range of physical conditions to help you get back to your best self.'}
            </p>
          </motion.div>

          <div className="px-12">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 3000,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {(cmsConditions?.conditions && cmsConditions.conditions.length > 0 ? cmsConditions.conditions : [
                  { name: "Neck Pain", image: "", icon: "Activity" },
                  { name: "Back Pain", image: "", icon: "Bone" },
                  { name: "Knee Pain", image: "", icon: "HeartPulse" },
                  { name: "Shoulder Pain", image: "", icon: "Zap" },
                  { name: "Sports Injury", image: "", icon: "Dumbbell" },
                  { name: "Post-Surgery", image: "", icon: "Stethoscope" },
                  { name: "Sciatica", image: "", icon: "Activity" },
                  { name: "Arthritis", image: "", icon: "Bone" },
                  { name: "Spinal Cord", image: "", icon: "Activity" },
                  { name: "Hip Pain", image: "", icon: "Zap" },
                  { name: "Muscle Strain", image: "", icon: "Activity" },
                  { name: "Ligament Tear", image: "", icon: "HeartPulse" }
                ]).map((condition, index) => {
                  const item = {
                    label: condition.name,
                    image: condition.image,
                    color: ["primary", "accent", "success", "warning"][index % 4],
                    borderColor: "hover:border-primary",
                    bgColor: "bg-primary/10",
                    hoverBg: "group-hover:bg-primary",
                    activeLine: "bg-primary"
                  };
                  
                  return (
                    <CarouselItem key={condition._id || index} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/6">
                      <motion.div 
                        variants={fadeInUp}
                        whileHover={{ y: -8 }}
                        className="group cursor-pointer py-2"
                      >
                        <div className={`bg-background rounded-2xl p-8 text-center shadow-soft border-2 border-transparent transition-all duration-500 group-hover:shadow-xl ${item.borderColor}`}>
                          <div className={`h-16 w-16 rounded-2xl ${item.bgColor} flex items-center justify-center mx-auto mb-6 ${item.hoverBg} group-hover:text-white transition-all duration-500 shadow-sm`}>
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.label}
                                className="h-8 w-8 object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  // Hide the broken image and let the fallback render
                                  target.style.display = "none";
                                  // Show the parent container again to reveal the fallback
                                  if (target.parentElement) {
                                    target.parentElement.innerHTML = '';
                                    const fallbackIcon = getIconComponent("Activity");
                                    if (fallbackIcon) {
                                      const iconElement = document.createElement('div');
                                      iconElement.innerHTML = `<svg class=\"h-8 w-8\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"12\"></line><line x1=\"12\" y1=\"16\" x2=\"12.01\" y2=\"16\"></line></svg>`;
                                      target.parentElement.appendChild(iconElement);
                                    }
                                  }
                                }}
                              />
                            ) : (
                              <></>
                              // getIconComponent("Activity")({ className: "h-8 w-8" })
                            )}
                          </div>
                          <span className="font-bold text-sm tracking-wide">{item.label}</span>
                          <div className={`mt-4 h-1 w-0 ${item.activeLine} mx-auto rounded-full group-hover:w-12 transition-all duration-500`} />
                        </div>
                      </motion.div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="-left-12 border-primary/20 text-primary hover:bg-primary hover:text-white" />
              <CarouselNext className="-right-12 border-primary/20 text-primary hover:bg-primary hover:text-white" />
            </Carousel>
          </div>

          {/* <div className="mt-16 text-center">
            <Link to="/questionnaire">
              <Button variant="outline" size="lg" className="rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary shadow-lg shadow-black/10">
                Find the right therapist for your condition
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div> */}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 relative overflow-hidden border-y border-white/10" style={{ backgroundColor: '#2d8e8d' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-white/5 rounded-full blur-[120px] -translate-y-1/2" />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-black/5 rounded-full blur-[120px] -translate-y-1/2" />
        </div>
        
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="space-y-4">
                <Badge variant="outline" className="border-white/30 text-white bg-white/10">Why Choose Us</Badge>
                <h2 className="text-3xl lg:text-4xl font-bold text-white">
                  {cmsWhyUs?.title || 'Professional Care, Personalized'} 
                </h2>
                <p className="text-white/80 text-lg leading-relaxed">
                  {cmsWhyUs?.description || 'Experience the convenience of virtual physiotherapy without compromising on quality. Our platform connects you with the best care, anytime, anywhere.'}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {(cmsWhyUs?.features && cmsWhyUs.features.length > 0 ? cmsWhyUs.features : [
                  "Certified and experienced physiotherapists",
                  "Personalized treatment plans",
                  "Flexible scheduling - 24/7 availability",
                  "Progress tracking and exercise videos",
                  "Affordable subscription plans",
                  "Secure video consultations"
                ]).map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/10 shadow-sm backdrop-blur-sm hover:bg-white/20 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <Link to="/questionnaire">
                <Button variant="hero" size="xl" className="shadow-lg shadow-black/10 mt-4">
                  Start Your Assessment
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </motion.div>

            <motion.div 
              className="grid grid-cols-2 gap-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {(cmsWhyUs?.stats && cmsWhyUs.stats.length > 0 ? cmsWhyUs.stats : [
                { label: "Happy Patients", value: "10K+", description: "Successfully treated worldwide", _id: "1" },
                { label: "Therapists", value: "500+", description: "Certified medical experts", _id: "2", offset: "mt-12" },
                { label: "Sessions", value: "50K+", description: "Virtual consultations completed", _id: "3" },
                { label: "Avg Rating", value: "4.9", description: "Based on patient reviews", _id: "4", offset: "mt-12" }
              ]).map((stat, i) => (
                <Card 
                  key={stat._id || i} 
                  className={`p-8 mt-2 text-center border-2 border-primary/10 hover:border-primary/30 transition-all duration-500 hover:scale-105 shadow-xl bg-white/90 group relative overflow-hidden ${stat.offset || ""}`}
                  onMouseEnter={() => setHoveredStat(i)}
                  onMouseLeave={() => setHoveredStat(null)}
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                  <p className="text-4xl lg:text-5xl font-bold text-primary mb-2 tracking-tight relative z-10">
                    <CountUp key={`${i}-${hoveredStat === i}`} value={stat.value} />
                  </p>
                  <p className="text-lg font-semibold text-slate-900 uppercase tracking-wider relative z-10">{stat.label}</p>
                  <p className="text-md text-muted-foreground mt-2 relative z-10">{stat.description}</p>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Subscription Plans Preview */}
      <section className="py-8 bg-muted/30">
        <div className="container">
          <motion.div 
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="mb-4">Pricing Plans</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Choose Your Path to Recovery</h2>
            <p className="text-muted-foreground">
              Simple, transparent pricing to help you commit to your health goals.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {subscriptionLoading ? (
              <div className="col-span-full text-center py-8">
                <p>Loading subscription plans...</p>
              </div>
            ) : subscriptionError ? (
              <div className="col-span-full text-center py-8">
                <p className="text-destructive">Error loading subscription plans: {subscriptionError}</p>
              </div>
            ) : (
              subscriptionPlans.slice(0, 3).map((plan, index) => {
                const planId = plan.planId || plan.id;
                const highlight = plan.popular || planId === 'weekly';
                return (
              <motion.div key={planId} variants={fadeInUp}>
                <Card className={`relative h-full p-8 flex flex-col ${highlight ? "border-primary shadow-lg scale-105 z-10" : "border-border shadow-sm"}`}>
                  {highlight && (
                    <Badge className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground">
                      Best Value
                    </Badge>
                  )}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">₹{plan.price}</span>
                      <span className="text-muted-foreground text-sm">/{plan.duration}</span>
                    </div>
                  </div>
                  <ul className="space-y-4 mb-8 flex-grow">
                    {plan.features.slice(0, 3).map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground mb-6 text-center italic">Cancel anytime</p>
                  <Link to="/plans" className="w-full">
                    <Button 
                      className="w-full" 
                      variant={highlight ? "default" : "outline"}
                    >
                      {highlight ? "Choose Plan" : `Select ${plan.name.split(' ')[0]}`}
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            );})
            )}
          </motion.div>

          <div className="mt-16 text-center">
            <Link to="/plans">
              <Button variant="link" size="lg" className="text-primary font-semibold">
                View All Detailed Plans & Benefits
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

  {/* Featured Therapist – Single */}
<section
  className="py-20 relative overflow-hidden border-y border-primary/10"
  style={{ backgroundColor: "#f1fafa" }}
>
  {/* Background glow */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
  </div>

  <div className="container relative z-10">
    {adminsLoading ? (
      <div className="text-center py-12">
        <p>Loading featured therapist...</p>
      </div>
    ) : adminsError ? (
      <div className="text-center py-12">
        <p className="text-destructive">Error loading featured therapist: {adminsError}</p>
      </div>
    ) : publicAdmins && publicAdmins.length > 0 ? (
      <motion.div
        className="grid lg:grid-cols-2 gap-16 items-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {/* Therapist Image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            <img
              src={publicAdmins[0].profilePicture || "https://images.unsplash.com/photo-1622253692010-333f2da6031d"}
              alt={publicAdmins[0].name}
              className="w-full h-[420px] object-cover rounded-3xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <Badge className="absolute top-6 right-6 bg-success text-success-foreground shadow-lg">
              Available Today
            </Badge>
          </div>
        </motion.div>

        {/* Therapist Details */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <Badge variant="secondary" className="border border-primary/20 w-fit">
            Featured Therapist
          </Badge>

          <h2 className="text-3xl lg:text-4xl font-bold">
            {publicAdmins[0].name}
          </h2>

          <p className="text-primary font-semibold text-lg">
            {publicAdmins[0].doctorProfile?.specialization ? publicAdmins[0].doctorProfile.specialization.substring(0, publicAdmins[0].doctorProfile.specialization.indexOf(',') !== -1 ? publicAdmins[0].doctorProfile.specialization.indexOf(',') : publicAdmins[0].doctorProfile.specialization.length) : "Certified Physiotherapist"}
          </p>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{publicAdmins[0].doctorProfile?.experience || 'Experienced Professional'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="font-semibold">4.9 Rating</span>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed max-w-xl">
            {publicAdmins[0].doctorProfile?.bio || "Specialized in sports injuries, post-surgery rehabilitation, and chronic pain management. Known for personalized recovery plans and fast results through virtual physiotherapy."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/questionnaire">
              <Button size="lg" className="rounded-full">
                Start Assessment
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>

            <Link to={`/therapist/${publicAdmins[0].id}`}>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-primary/30"
              >
                View Full Profile
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    ) : (
      <div className="text-center py-12">
        <p>No featured therapist available.</p>
      </div>
    )}
  </div>
</section>


      {/* FAQ Section */}
      <section className="py-10 bg-muted/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="secondary" className="mb-4">Support</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Frequently Asked Questions</h2>
              <p className="text-muted-foreground mb-8">
                Find answers to common questions about our platform and services. Still have questions? Contact our support team.
              </p>
              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <HelpCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-bold">Need more help?</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Our team is available 24/7 to answer your questions and help you with any issues.
                </p>
                <Button variant="outline" className="w-full sm:w-auto">Contact Support</Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Accordion type="single" collapsible className="w-full space-y-4">
                {(cmsFaqs && cmsFaqs.length > 0 ? cmsFaqs : [
                  {
                    question: "Is online physiotherapy effective?",
                    answer: "Yes, research shows that virtual physiotherapy is highly effective for many conditions. It combines professional guidance with home-based exercises that are easy to follow and track."
                  },
                  {
                    question: "Do I need any special equipment?",
                    answer: "Most sessions can be done with minimal equipment found at home (like towels or chairs). If specific equipment is needed, your therapist will guide you on alternatives or what to purchase."
                  },
                  {
                    question: "Can I cancel my subscription anytime?",
                    answer: "Absolutely! We offer flexible plans with no long-term contracts. You can cancel or pause your subscription at any time through your dashboard."
                  },
                  {
                    question: "Is my personal and medical data secure?",
                    answer: "We take your privacy seriously. Our platform is fully secure, and all your sessions and medical data are encrypted and stored securely."
                  },
                  {
                    question: "Are the video sessions recorded?",
                    answer: "No, sessions are not recorded without your explicit consent. Your privacy is our priority, and all consultations are private between you and your therapist."
                  }
                ]).map((faq, i) => (
                  <AccordionItem key={faq._id || i} value={`item-${i}`} className="gradient-primary dark:bg-gray-900 rounded-xl px-6 border-none shadow-sm">
                    <AccordionTrigger className="text-left font-semibold py-5 hover:no-underline text-white">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-white pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust & Disclaimer */}
      <section className="py-12 border-t border-border">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="h-5 w-5 text-success" />
              </div>
              <div>
                <h5 className="font-bold text-sm mb-1">Data Privacy</h5>
                <p className="text-xs text-muted-foreground">We follow industry-standard healthcare data security and privacy practices.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h5 className="font-bold text-sm mb-1">Secure Encryption</h5>
                <p className="text-xs text-muted-foreground">End-to-end encryption for all video calls and messaging.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h5 className="font-bold text-sm mb-1">Medical Disclaimer</h5>
                <p className="text-xs text-muted-foreground">Not a replacement for emergency care. If in crisis, call local emergency services.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary">
        <div className="container">
          <motion.div 
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Start Your Recovery?
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              Take the first step towards a pain-free life. Our certified physiotherapists are ready to help you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/questionnaire">
                <Button 
                  size="xl" 
                  className="bg-background text-primary hover:bg-background/90"
                >
                  Get Started Today
                  <ArrowRight className="h-5 w-5 ml-1" />
                </Button>
              </Link>
              <Link to="/plans">
                <Button 
                  variant="outline" 
                  size="xl"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  View Plans
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
