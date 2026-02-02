import { useState, useMemo } from "react";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Home,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Service {
  id: number | string;
  icon: React.ReactNode;
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
    sessionDuration: string;
    price: string;
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



interface EnhancedServicesGridProps {
  services?: Service[];
}

export function EnhancedServicesGrid({
  services: customServices,
}: EnhancedServicesGridProps) {
  const servicesToDisplay = customServices;
  console.log(servicesToDisplay)
  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 9; // Show 9 services per page

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        servicesToDisplay
          .map((service) => {
            // Use the category field from the service, fallback to first word of title
            return service?.category || service?.title?.split(' ')[0] || 'Other';
          })
          .map(cat => cat.trim())
          .filter(Boolean)
      )
    );

    return ["all", ...uniqueCategories];
  }, [servicesToDisplay]);


  // Filter services based on search term and category
  const filteredServices = useMemo(() => {
    return servicesToDisplay.filter((service) => {
      const matchesSearch =
        service.title?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm?.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" ||
        service.category?.toLowerCase().includes(categoryFilter.toLowerCase()) ||
        service.title.toLowerCase().includes(categoryFilter.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [servicesToDisplay, searchTerm, categoryFilter]);

  // Calculate pagination
  const totalServices = filteredServices.length;
  const totalPages = Math.ceil(totalServices / servicesPerPage);

  // Get services for current page
  const currentServices = useMemo(() => {
    const startIndex = (currentPage - 1) * servicesPerPage;
    return filteredServices.slice(startIndex, startIndex + servicesPerPage);
  }, [filteredServices, currentPage, servicesPerPage]);

  // Reset to first page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 py-6">
      {/* Filters Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <h2 className="text-2xl font-bold text-slate-900"> </h2>

          {/* Search Input */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleFilterChange();
              }}
              className="pl-10 w-full rounded-xl border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = categoryFilter === category;

            return (
              <Badge
                key={category}
                variant={isActive ? "default" : "outline"}
                className={`
          cursor-pointer px-4 py-2 transition-all duration-200
          ${isActive
                    ? "bg-primary text-white shadow-md"
                    : "hover:bg-secondary hover:shadow-sm"}
        `}
                onClick={() => setCategoryFilter(category)}
              >
                <span className="flex items-center gap-2">
                  {isActive && (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  )}
                  {category === "all"
                    ? "All"
                    : category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
              </Badge>
            );
          })}
        </div>

      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentServices.length > 0 ? (
          currentServices.map((service) => (
            <Link to={`/service/${service?.id}`} key={service.id}>
              <div
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
              >
                {/* Service Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.media?.heroImage || `https://placehold.co/400x300/e2e8f0/64748b?text=${encodeURIComponent(service.title)}`}
                    alt={service.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://placehold.co/400x300/e2e8f0/64748b?text=${encodeURIComponent(service.title)}`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
      
                {/* Service Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {service.title}
                  </h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-500">
                      Session Duration: {service?.details?.sessionDuration}
                    </span>
        <span className="text-sm text-slate-500">
                      Sessions: {service?.details?.sessions}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {service?.details?.price}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-4">{service.description}</p>
                  <div className="mb-4">
                    <h4 className="font-semibold text-slate-800 mb-2">
                      Benefits:
                    </h4>
                    <ul className="space-y-1">
                      {service.benefits.slice(0, 2).map((benefit, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-sm text-slate-600">
                            {benefit}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-auto w-full rounded-xl border-primary text-primary hover:bg-primary hover:text-white font-bold"
                  >
                    Read More
                  </Button>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Search className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No Services Found
            </h3>
            <p className="text-slate-600 max-w-md mx-auto">
              We couldn't find any services matching your search criteria. Try
              adjusting your filters or search term.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            {Math.min((currentPage - 1) * servicesPerPage + 1, totalServices)}-
            {Math.min(currentPage * servicesPerPage, totalServices)} of{" "}
            {totalServices} services
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground px-2">
              Page {currentPage} of {totalPages}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
