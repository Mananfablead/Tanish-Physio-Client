import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface Service {
  id: number | string;
  slug?: string;
  title: string;
  description: string;
  category?: string;
  benefits: string[];
  details: {
    sessionDuration: string;
    price: string;
  };
  media?: {
    heroImage?: string;
  };
}

interface EnhancedServicesGridProps {
  services?: Service[];
}

export function EnhancedServicesGrid({
  services = [],
}: EnhancedServicesGridProps) {
  const servicesToDisplay = services;
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const servicesPerPage = 9;

  /* -------------------- CATEGORIES -------------------- */
  const categories = useMemo(() => {
    if (servicesToDisplay.length === 0) return ["all"];

    const uniqueCategories = Array.from(
      new Set(
        servicesToDisplay
          .map((s) => s.category || s.title?.split(" ")[0] || "Other")
          .map((c) => c.trim())
          .filter(Boolean)
      )
    );

    return ["all", ...uniqueCategories];
  }, [servicesToDisplay]);

  /* -------------------- FILTER -------------------- */
  const filteredServices = useMemo(() => {
    return servicesToDisplay.filter((service) => {
      const matchesSearch =
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" ||
        service.category
          ?.toLowerCase()
          .includes(categoryFilter.toLowerCase()) ||
        service.title.toLowerCase().includes(categoryFilter.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [servicesToDisplay, searchTerm, categoryFilter]);

  /* -------------------- PAGINATION -------------------- */
  const totalServices = filteredServices.length;
  const totalPages = Math.ceil(totalServices / servicesPerPage);

  const currentServices = useMemo(() => {
    const start = (currentPage - 1) * servicesPerPage;
    return filteredServices.slice(start, start + servicesPerPage);
  }, [filteredServices, currentPage]);

  /* -------------------- UI -------------------- */
  return (
    <div className="space-y-8 py-6">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        {/* Categories */}
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => {
            const isActive = categoryFilter === category;

            return (
              <Badge
                key={category}
                variant={isActive ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 rounded-full transition-all duration-200
            ${
              isActive
                ? "bg-primary text-white shadow-md scale-105"
                : "hover:bg-secondary/60 hover:scale-105"
            }`}
                onClick={() => {
                  setCategoryFilter(category);
                  setCurrentPage(1);
                }}
              >
                <span className="flex items-center gap-2">
                  {isActive && (
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  )}
                  {category === "all"
                    ? "All"
                    : category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
              </Badge>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 rounded-full shadow-sm focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentServices.length > 0 ? (
          currentServices.map((service) => (
            <Link
              to={
                service.slug
                  ? `/service/${service.slug}`
                  : `/service/${service.id}`
              }
              key={service.id}
            >
              <div className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition">
                <div className="h-48 overflow-hidden">
                  <img
                    src={
                      service.media?.heroImage ||
                      `https://placehold.co/400x300?text=${encodeURIComponent(
                        service.title
                      )}`
                    }
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">

                  <h3 className="text-xl font-bold mb-2 line-clamp-1">
                    {service.title}
                  </h3>

                  <div className="flex justify-between text-sm text-slate-500 mb-3">
                    <span>
                      Duration: {service.details.sessionDuration}
                    </span>
                    <span className="font-bold text-primary">
                      {service.details.price}
                    </span>
                  </div>

                  {/* Description fixed height */}
                  <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                    {service.description}
                  </p>

                  {/* Push button to bottom */}
                  <div className="mt-auto flex flex-col sm:flex-row gap-3">
                    <Button
                      className="flex-1 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition-all duration-200"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const bookingData = {
                          service: {
                            id: service.id,
                            name: service.title,
                            price: service.details.price
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
                              service.details.price
                                .replace("₹", "")
                                .split("-")[0]
                            ),
                          },
                          plan: {
                            name: `${service.title} Plan`,
                            price: parseInt(
                              service.details.price
                                .replace("₹", "")
                                .split("-")[0]
                            ),
                            duration: service.details.sessionDuration,
                          },
                        };

                        console.log("Booking Data:", bookingData);
                        navigate("/booking", { state: bookingData });
                      }}
                    >
                      Book Session
                    </Button>

                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200"
                      asChild
                    >
                      <Link
                        to={
                          service.slug
                            ? `/service/${service.slug}`
                            : `service/${service.id}`
                        }
                      >
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Search className="mx-auto h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold">No Services Found</h3>
            <p className="text-slate-600">Try adjusting search or filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
