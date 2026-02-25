import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, ChevronRight, Star, Play, X, IndianRupee, ChevronLeft, CircleAlert } from "lucide-react";
import { Service } from "@/types/service";
import {
  fetchServiceById,
  fetchServiceBySlug,
} from "@/store/slices/serviceSlice";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import type { AppDispatch } from "@/store";
import { useAuth } from "@/context/AuthContext";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { checkSubscriptionEligibility } from "@/lib/api";

// Use the Service type from the shared types
// Define extended service data structure
interface ExtendedService {
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
    features: string[];
    sessionDuration: string;
    price: string;
    priceRange: string;
    prerequisites: string;
    whatToExpect: string[];
    resultsTimeline: string;
    sessions: number;
  };
  media?: {
    heroImage?: string;
    aboutImage?: string;
    videoUrl?: string;
  };
}

// ServiceHero component
const ServiceHero = ({ service }: { service: ExtendedService }) => {
  console.log("service", service);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true); // Auto slide state
  const autoSlideInterval = useRef<NodeJS.Timeout | null>(null);

  // Combine all images (hero, about, and additional images from backend)
  const allImages = [
    service.media?.heroImage,
    service.media?.aboutImage,
    ...(service.details.features || []), // Assuming features might contain additional images
  ].filter((img) => img); // Remove any undefined/null values

  // If no images from features, just use hero and about images
  const validImages =
    allImages.length > 0
      ? allImages
      : [service.media?.heroImage, service.media?.aboutImage].filter(
          (img) => img
        );

  const hasNextImage = currentImageIndex < validImages.length - 1;
  const hasPrevImage = currentImageIndex > 0;

  // Auto slide effect
  useEffect(() => {
    if (validImages.length > 1 && isAutoSliding) {
      autoSlideInterval.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
      }, 3000); // 3 seconds interval
    }

    return () => {
      if (autoSlideInterval.current) {
        clearInterval(autoSlideInterval.current);
      }
    };
  }, [validImages.length, isAutoSliding]);

  const nextImage = () => {
    setIsAutoSliding(false); // Pause auto slide on manual navigation
    setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    setIsAutoSliding(false); // Pause auto slide on manual navigation
    setCurrentImageIndex(
      (prev) => (prev - 1 + validImages.length) % validImages.length
    );
  };

  const goToImage = (index: number) => {
    setIsAutoSliding(false); // Pause auto slide on manual navigation
    setCurrentImageIndex(index);
  };

  // Resume auto slide after 5 seconds of inactivity
  useEffect(() => {
    if (!isAutoSliding && validImages.length > 1) {
      const resumeTimer = setTimeout(() => {
        setIsAutoSliding(true);
      }, 5000);
      return () => clearTimeout(resumeTimer);
    }
  }, [currentImageIndex, validImages.length]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 mb-8">
      <div className="lg:w-1/2">
        <div className="flex items-start gap-4 mb-4">
          {/* <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            {service.icon}
          </div> */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {service.details.title}
            </h1>
            <div className="flex flex-wrap gap-3 mb-3">
              <Badge
                variant="secondary"
                className="px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border-primary/20"
              >
                {service.details.sessionDuration}
              </Badge>

              <Badge
                variant="secondary"
                className="px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border-primary/20 flex items-center gap-1"
              >
                <IndianRupee className="h-4 w-4" />
                {(() => {
                  const priceRange =
                    service.details.priceRange || service.details.price;
                  const cleanedPriceRange = priceRange.replace("₹", "");
                  // Extract first price from range (e.g., "4000-7500" -> "4000")
                  const fixedPrice = cleanedPriceRange.split("-")[0];
                  return fixedPrice;
                })()}
              </Badge>
              <Badge
                variant="secondary"
                className="px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border-primary/20"
              >
                Sessions: {service.details.sessions}
              </Badge>
            </div>
          </div>
        </div>
        <p className="text-lg text-slate-600 mb-6">
          {service.details.description}
        </p>
        <p className="text-slate-600 mb-6">
          {service.details.detailedDescription}
        </p>
      </div>

      <div className="lg:w-1/2">
        {/* Hero Image Gallery */}
        <div className="rounded-2xl overflow-hidden shadow-lg relative">
          <img
            src={validImages[currentImageIndex]}
            alt={`${service.title} image ${currentImageIndex + 1}`}
            className="w-full h-64 md:h-80 object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://placehold.co/600x400/e2e8f0/64748b?text=${encodeURIComponent(
                service.title
              )}`;
            }}
          />

          {validImages.length > 1 && (
            <>
              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                disabled={!hasPrevImage}
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200 ${
                  !hasPrevImage ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <ChevronLeft className="w-5 h-5 text-slate-800" />
              </button>

              <button
                onClick={nextImage}
                disabled={!hasNextImage}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200 ${
                  !hasNextImage ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <ChevronRight className="w-5 h-5 text-slate-800" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ServiceMedia component
const ServiceMedia = ({ service }: { service: ExtendedService }) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">
        About This Service
      </h2>

      <div className="flex flex-col lg:flex-row gap-8">
        {service.media?.videoUrl && (
          <div className="lg:w-1/2">
            {/* Video Preview */}
            {service.media?.videoUrl && (
              <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-video flex items-center justify-center mb-6">
                <img
                  src={
                    service.media.heroImage ||
                    "https://placehold.co/600x400/e2e8f0/64748b?text=Video+Preview"
                  }
                  alt="Video preview"
                  className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
                />
                <button
                  onClick={() => setIsVideoOpen(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors duration-200"
                >
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/90 hover:bg-primary transition-colors duration-200">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
        <div className="lg:w-1/2">
          {/* About Info */}
          <div className="mb-6">
            {/* <h3 className="text-xl font-bold text-slate-900 mb-3">About This Service</h3> */}
            <p className="text-slate-600">
              {service.details.detailedDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoOpen && service.media?.videoUrl && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setIsVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors duration-200 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden">
              <video
                src={service.media.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-cover"
                poster={service.media.heroImage}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ServiceSidebar component
const ServiceSidebar = ({
  service,
  navigate,
  hasActivePlan = false,
  activePlan = null,
  subscriptionInfo = null,
  subscriptionInfoProp = null,
  isSessionLimitExceededModalOpen = false,
  setIsSessionLimitExceededModalOpen,
  sessionLimitExceededInfo = null,
  setSessionLimitExceededInfo,
}: {
  service: ExtendedService;
  navigate: any;
  hasActivePlan?: boolean;
  activePlan?: any;
  subscriptionInfo?: any;
  // Modal state passed from parent
  isSessionLimitExceededModalOpen?: boolean;
  setIsSessionLimitExceededModalOpen?: (open: boolean) => void;
  sessionLimitExceededInfo?: any;
  setSessionLimitExceededInfo?: (info: any) => void;
  subscriptionInfoProp?: any;
}) => {
  const { isAuthenticated } = useAuth();

  const handleBooking = () => {
    // Check if user has an active plan but no remaining sessions or invalid plan
    if (hasActivePlan && subscriptionInfo && (
      subscriptionInfo?.remainingSessions <= 0 || 
      subscriptionInfo?.reason === 'NO_VALID_SESSIONS' || 
      subscriptionInfo?.reason === 'INVALID_PLAN' || 
      subscriptionInfo?.reason === 'PLAN_CONFIG_ERROR' || 
      subscriptionInfo?.reason === 'SESSIONS_EXHAUSTED' ||
      subscriptionInfo?.reason === 'NO_SESSIONS_IN_PLAN'
    )) {
      const totalSessions = subscriptionInfo?.totalSessions ?? activePlan?.sessions ?? 'unknown';
      const planName = subscriptionInfo?.planName ?? activePlan?.planName ?? 'your';
      const usedSessions = subscriptionInfo?.usedSessions ?? 0;
      const message = subscriptionInfo?.message ?? 
        (subscriptionInfo?.reason === 'NO_SESSIONS_IN_PLAN' 
          ? `Your ${planName} plan does not include any sessions. Please upgrade your plan.`
          : `You have reached your session limit. Your ${planName} plan includes ${totalSessions} sessions and you have used ${usedSessions} of them.`);
      
      // Call the parent's function to handle session limit exceeded
      if (setSessionLimitExceededInfo && setIsSessionLimitExceededModalOpen) {
        setSessionLimitExceededInfo({
          message,
          planName,
          totalSessions,
          usedSessions,
          remainingSessions: subscriptionInfo?.remainingSessions,
          reason: subscriptionInfo?.reason
        });
        setIsSessionLimitExceededModalOpen(true);
      }
      return;
    }
    const bookingData = {
      service: {
        id: service.id,
        name: service.details.title,
        price: (service.details.priceRange || service.details.price)
          .replace("₹", "")
          .split("-")[0],
        duration: service.details.sessionDuration,
      },
      fromServices: true,
      therapist: {
        id: `th-${Math.floor(Math.random() * 10000)}`,
        name: "Assigned Clinician",
        title: "Matched Specialist",
      },
      session: {
        type: "1-on-1",
        duration: service.details.sessionDuration,
        price: parseInt(
          (service.details.priceRange || service.details.price)
            .replace("₹", "")
            .split("-")[0]
        ),
      },
      plan: {
        name: `${service.details.title} Plan`,
        price: parseInt(
          (service.details.priceRange || service.details.price)
            .replace("₹", "")
            .split("-")[0]
        ),
        duration: service.details.sessionDuration,
      },
    };
    console.log("Booking Data:", bookingData);
    navigate("/questionnaire", { state: bookingData });
  };

  return (
    <div className="space-y-6 sticky top-24">
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4">
          Service Details
        </h3>

        <div className="space-y-4 mb-4">
          <div className="flex justify-between">
            <span className="text-slate-600">Session Duration:</span>
            <span className="font-medium text-slate-900">
              {service.details.sessionDuration}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Price:</span>
            <span className="font-medium text-slate-900 flex items-center gap-1">
              {hasActivePlan && ((subscriptionInfoProp && subscriptionInfoProp.remainingSessions > 0) || (activePlan?.availableSessions?.remaining > 0)) ? (
                <>
                  <span className="text-green-600 font-bold">FREE</span>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full ml-2">
                    with {activePlan?.planName || "your plan"}
                  </span>
                </>
              ) : (
                <>
                  <IndianRupee className="h-4 w-4" />
                  {(() => {
                    const priceRange =
                      service.details.priceRange || service.details.price;
                    const cleanedPriceRange = priceRange.replace("₹", "");
                    // Extract first price from range (e.g., "4000-7500" -> "4000")
                    const fixedPrice = cleanedPriceRange.split("-")[0];
                    return fixedPrice;
                  })()}
                </>
              )}
            </span>
          </div>
          
          {/* Show subscription session information if user has active plan */}
          {hasActivePlan && activePlan?.availableSessions && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <div className="text-sm">
                <p className="text-green-700 font-medium">
                  {activePlan.availableSessions.remaining} of {activePlan.availableSessions.total} sessions left
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${100 - activePlan.availableSessions.percentageUsed}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-600">Results Timeline:</span>
            <span className="font-medium text-slate-900">
              {service.details.resultsTimeline}
            </span>
          </div>

          {/* <div className="flex justify-between">
              <span className="text-slate-600">Prerequisites:</span>
              <span className="font-medium text-slate-900">
                {service.details.prerequisites}
              </span>
            </div>
         */}
        </div>

        <Button
          className="w-full rounded-xl bg-primary hover:bg-primary/90 font-bold h-12 text-base"
          onClick={handleBooking}
        >
          Book Session Now
        </Button>

        {/* Trust Indicators */}
        {/* <div className="mt-4 space-y-3 pt-4 border-t border-slate-200">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-sm text-slate-600">Certified therapists</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-sm text-slate-600">
              Evidence-based treatment
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-sm text-slate-600">Home visit available</span>
          </div>
        </div> */}
      </div>

      {/* Testimonial */}
      {/* <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
          ))}
        </div>
        <p className="text-slate-600 italic mb-3">
          "The therapy sessions helped me recover faster than I expected. The
          therapist was very professional and caring."
        </p>
        <p className="text-sm text-slate-500">
          - Sarah J., Orthopedic Physiotherapy
        </p>
      </div> */}
    </div>
  );
};

// Collapsible List Component
const CollapsibleList = ({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (items.length <= 4) {
    console.log(items);
    return (
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">{title}</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-3">
              {icon}
              <span className="text-slate-600">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-primary font-medium"
        >
          {isOpen ? "Show Less" : "Show All"}
          <ChevronRight
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        </button>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.slice(0, isOpen ? items.length : 4).map((item, index) => (
          <li key={index} className="flex items-center gap-3">
            {icon}
            <span className="text-slate-600">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function ServiceDetailPage() {
  const { serviceId, slug } = useParams<{ serviceId: string; slug: string }>();
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const user = useSelector(selectCurrentUser);
  
  // Check if user has active subscription
  const hasActivePlan = user?.subscriptionData && 
                       user.subscriptionData.status === 'active' && 
                       !user.subscriptionData.isExpired;
  const activePlan = user?.subscriptionData || null;

  // Subscription state
  const [subscriptionEligible, setSubscriptionEligible] = useState<boolean>(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [checkingSubscription, setCheckingSubscription] = useState<boolean>(false);
  
  // Session limit exceeded modal state
  const [isSessionLimitExceededModalOpen, setIsSessionLimitExceededModalOpen] = useState(false);
  const [sessionLimitExceededInfo, setSessionLimitExceededInfo] = useState<any>(null);

  // Get service from Redux store
  const { selectedService, loading, error } = useSelector(
    (state: RootState) => state.services
  );

  // Use slug if available, otherwise fall back to serviceId
  const identifier = slug || serviceId;

  // Check subscription eligibility when user changes
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (user) {
        try {
          setCheckingSubscription(true);
          const response = await checkSubscriptionEligibility();
          const { eligible, message, remainingSessions, planName, totalSessions, usedSessions } = response.data.data;
          
          setSubscriptionEligible(eligible);
          setSubscriptionInfo({
            eligible,
            message,
            remainingSessions,
            planName,
            totalSessions,
            usedSessions
          });
        } catch (error) {
          console.error('Error checking subscription status:', error);
          setSubscriptionEligible(false);
          setSubscriptionInfo(null);
        } finally {
          setCheckingSubscription(false);
        }
      } else {
        setSubscriptionEligible(false);
        setSubscriptionInfo(null);
      }
    };
    
    checkSubscriptionStatus();
  }, [user]);

  useEffect(() => {
    if (identifier) {
      // If we have a slug parameter, use it directly
      if (slug) {
        dispatch(fetchServiceBySlug(slug));
      }
      // Otherwise, check if serviceId looks like a slug or ID
      else if (serviceId) {
        // Check if the serviceId looks like a slug (contains hyphens and is not a typical MongoDB ID)
        // MongoDB IDs are typically 24 hex characters, while slugs contain hyphens
        const isLikelyASlug =
          serviceId.includes("-") || !/^[0-9a-fA-F]{24}$/.test(serviceId);

        if (isLikelyASlug) {
          dispatch(fetchServiceBySlug(serviceId));
        } else {
          dispatch(fetchServiceById(serviceId));
        }
      }
    }
  }, [dispatch, identifier, slug, serviceId]);

  // Use the service from Redux store
  const service = selectedService;
  console.log(service);
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg text-slate-600">Loading service...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !service) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Service Not Found
            </h1>
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={() => navigate("/services")}>
              Back to Services
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-8 bg-gradient-to-b from-primary/5 to-secondary/5">
        <div className="container">
          {/* Breadcrumb */}
          <div className="mb-6 text-sm text-slate-500">
            <Link
              to="/"
              className="hover:text-primary transition-colors duration-200"
            >
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link
              to="/services"
              className="hover:text-primary transition-colors duration-200"
            >
              Services
            </Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900">
              {service?.details.title || "Loading..."}
            </span>
          </div>

          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            {service && (
              <>
                <ServiceHero service={service as ExtendedService} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <ServiceMedia service={service as ExtendedService} />
                    {service.details.conditionsTreated.length > 0 && (
                      <div className="border-t border-slate-200 pt-8">
                        <CollapsibleList
                          title="Conditions We Treat"
                          items={service.details.conditionsTreated}
                          icon={
                            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                          }
                        />
                      </div>
                    )}

                    <div className="border-t border-slate-200 pt-8">
                      <CollapsibleList
                        title="What to Expect"
                        items={service.details.whatToExpect}
                        icon={
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                        }
                      />
                    </div>

                    <div className="border-t border-slate-200 pt-8">
                      <CollapsibleList
                        title="Service Benefits"
                        items={service.details.benefits}
                        icon={
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        }
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <ServiceSidebar
                      service={service as ExtendedService}
                      navigate={navigate}
                      hasActivePlan={hasActivePlan}
                      activePlan={activePlan}
                      subscriptionInfoProp={subscriptionInfo}
                      isSessionLimitExceededModalOpen={isSessionLimitExceededModalOpen}
                      setIsSessionLimitExceededModalOpen={setIsSessionLimitExceededModalOpen}
                      sessionLimitExceededInfo={sessionLimitExceededInfo}
                      setSessionLimitExceededInfo={setSessionLimitExceededInfo}
                    />
                    
                    {/* Session Limit Exceeded Modal */}
                    <Dialog open={isSessionLimitExceededModalOpen} onOpenChange={setIsSessionLimitExceededModalOpen}>
                      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
                            <CircleAlert className="h-6 w-6" />
                            Session Limit Reached
                          </DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800 mb-2">
                              {sessionLimitExceededInfo?.message || 'Your subscription session limit has been reached.'}
                            </p>
                            <p className="text-red-700 text-sm">
                              You have used all {sessionLimitExceededInfo?.usedSessions} sessions from your {sessionLimitExceededInfo?.planName} plan.
                            </p>
                          </div>
                          
                          <div className="space-y-3">
                            <h3 className="font-semibold text-gray-800">Next Steps:</h3>
                            <ul className="list-disc pl-5 space-y-2 text-gray-700">
                              <li>You can now book services by paying the regular price</li>
                              <li>Your subscription benefits are no longer available for additional sessions</li>
                              <li>Consider upgrading your subscription for more sessions</li>
                            </ul>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button 
                              onClick={() => {
                                setIsSessionLimitExceededModalOpen(false);
                                navigate('/services');
                              }}
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                              Browse Services
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setIsSessionLimitExceededModalOpen(false)}
                              className="flex-1"
                            >
                              Close
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}