import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle, ChevronRight, Star, Play, X, IndianRupee } from "lucide-react";
import { Service } from "@/types/service";
import { fetchServiceById } from "@/store/slices/serviceSlice";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "@/store";
import type { AppDispatch } from "@/store";
import { useAuth } from "@/context/AuthContext";

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
  };
  media?: {
    heroImage?: string;
    aboutImage?: string;
    videoUrl?: string;
  };
}

// ServiceHero component
const ServiceHero = ({ service }: { service: ExtendedService }) => (
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
                const priceRange = service.details.priceRange || service.details.price;
                const cleanedPriceRange = priceRange.replace("₹", "");
                // Extract first price from range (e.g., "4000-7500" -> "4000")
                const fixedPrice = cleanedPriceRange.split("-")[0];
                return fixedPrice;
              })()}
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
      {/* Hero Image */}
      {service.media?.heroImage && (
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <img
            src={service.media.heroImage}
            alt={`${service.title} hero`}
            className="w-full h-64 md:h-80 object-cover"
            loading="lazy"
          />
        </div>
      )}
    </div>
  </div>
);

// ServiceMedia component
const ServiceMedia = ({ service }: { service: ExtendedService }) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">
        About This Service
      </h2>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2">
          {/* Video Preview */}
          {service.media?.videoUrl && (
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-video flex items-center justify-center mb-6">
              <img
                src="https://placehold.co/600x400/e2e8f0/64748b?text=Video+Preview"
                alt="Video preview"
                className="w-full h-full object-cover"
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

        <div className="lg:w-1/2">
          {/* About Image */}
          {service.media?.aboutImage && (
            <div className="rounded-2xl overflow-hidden shadow-lg mb-6">
              <img
                src={service.media.aboutImage}
                alt={`${service.title} about`}
                className="w-full h-64 object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>

      {/* Video Modal */}
      {isVideoOpen && service.media?.videoUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl p-4">
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center">
              <p className="text-slate-500">
                Video Player: {service.media.videoUrl}
              </p>
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
}: {
  service: ExtendedService;
  navigate: any;
}) => {
  const { isAuthenticated } = useAuth();

  const handleBooking = () => {
    if (isAuthenticated) {
      navigate("/booking");
    } else {
      // For guest users, pass service data to booking page
      const bookingData = {
        service: {
          id: service.id,
          name: service.details.title,
          price: (service.details.priceRange || service.details.price).replace("₹", "").split("-")[0],
          duration: service.details.sessionDuration,
        },
        fromService: true,
      };
      navigate("/booking", { state: bookingData });
    }
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
              <IndianRupee className="h-4 w-4" />
              {(() => {
                const priceRange = service.details.priceRange || service.details.price;
                const cleanedPriceRange = priceRange.replace("₹", "");
                // Extract first price from range (e.g., "4000-7500" -> "4000")
                const fixedPrice = cleanedPriceRange.split("-")[0];
                return fixedPrice;
              })()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Results Timeline:</span>
            <span className="font-medium text-slate-900">
              {service.details.resultsTimeline}
            </span>
          </div>
          {/* {service.details.prerequisites && (
            <div className="flex justify-between">
              <span className="text-slate-600">Prerequisites:</span>
              <span className="font-medium text-slate-900">
                {service.details.prerequisites}
              </span>
            </div>
          )} */}
        </div>

        <Button
          className="w-full rounded-xl bg-primary hover:bg-primary/90 font-bold h-12 text-base"
          onClick={handleBooking}
        >
          Book Session Now
        </Button>

        {/* Trust Indicators */}
        <div className="mt-4 space-y-3 pt-4 border-t border-slate-200">
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
        </div>
      </div>

      {/* Testimonial */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
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
      </div>
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
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  
  // Get service from Redux store
  const { selectedService, loading, error } = useSelector((state: RootState) => state.services);
  
  useEffect(() => {
    if (serviceId) {
      dispatch(fetchServiceById(serviceId));
    }
  }, [dispatch, serviceId]);
  
  // Use the service from Redux store
  const service = selectedService;
  
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
            <span className="text-slate-900">{service?.details.title || 'Loading...'}</span>
          </div>

          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            {service && (
              <>
                <ServiceHero service={service as ExtendedService} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <ServiceMedia service={service as ExtendedService} />

                    <div className="border-t border-slate-200 pt-8">
                      <CollapsibleList
                        title="Conditions We Treat"
                        items={service.details.features}
                        icon={
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        }
                      />
                    </div>

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
                    <ServiceSidebar service={service as ExtendedService} navigate={navigate} />
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Floating Bottom CTA for Mobile */}
          {service && (
          <div className="fixed bottom-6 left-6 right-6 lg:hidden">
            <div className="flex items-center justify-between bg-white rounded-xl p-3 mb-2 shadow-lg border">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {(() => {
                    const priceRange = service.details.priceRange || service.details.price;
                    const cleanedPriceRange = priceRange.replace("₹", "");
                    // Extract first price from range (e.g., "4000-7500" -> "4000")
                    const fixedPrice = cleanedPriceRange.split("-")[0];
                    return fixedPrice;
                  })()}
                </p>
                <p className="text-xs text-slate-500">
                  {service.details.sessionDuration}
                </p>
              </div>
              <div className="flex items-center gap-1 text-slate-500 text-xs">
                <IndianRupee className="h-3 w-3" />
                <span>INR</span>
              </div>
            </div>
            <Button
              className="w-full rounded-xl bg-primary hover:bg-primary/90 font-bold h-14 text-base"
              onClick={() => {
                if (isAuthenticated) {
                  navigate("/booking");
                } else {
                  // For guest users, pass service data to booking page
                  const bookingData = {
                    service: {
                      id: service.id,
                      name: service.details.title,
                      price: (service.details.priceRange || service.details.price)
                        .replace("₹", "")
                        .split("-")[0],
                      duration: service.details.sessionDuration,
                    },
                    fromService: true,
                  };
                  navigate("/booking", { state: bookingData });
                }
              }}
            >
              Book Session
            </Button>
          </div>
          )}
        </div>
      </div>
    </Layout>
  );
}