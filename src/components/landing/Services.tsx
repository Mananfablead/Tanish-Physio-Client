import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Service } from "@/types/service";
import { ArrowRight, Clock, IndianRupee, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

interface ServicesProps {
  services: Service[];
  servicesLoading: boolean;
  servicesError: string | null;
  fadeInUp: any;
}

export function Services({
  services,
  servicesLoading,
  servicesError,
  fadeInUp,
}: ServicesProps) {
  if (servicesLoading) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading services...</p>
          </div>
        </div>
      </section>
    );
  }

  if (servicesError) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load services.</p>
          </div>
        </div>
      </section>
    );
  }

  const displayedServices = services.slice(0, 5);

  return (
    <section className="py-12 bg-muted/30">
      <div className="container">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="secondary" className="mb-3">
            Our Services
          </Badge>
          <h2 className="text-2xl lg:text-3xl font-bold mb-3">
            Specialized Physiotherapy Services
          </h2>
          <p className="text-muted-foreground text-sm">
            Discover our range of professional physiotherapy services.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedServices.map((service, index) => (
            <motion.div
              key={service.id}
              variants={fadeInUp}
              whileHover={{ y: -4 }}
              className="group cursor-pointer"
            >
              <Card className="overflow-hidden border-border hover:border-primary transition-all duration-300 hover:shadow-lg">
                {/* Service Image */}
                {service.media?.heroImage && (
                  <div className="relative h-40 overflow-hidden">
                    <Link to={`/service/${service.slug || service.id}`}>
                      <img
                        src={service.media.heroImage}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    </Link>
                  </div>
                )}

                {/* Service Info */}
                <div className="p-4">
                  <Link to={`/service/${service.slug || service.id}`}>
                    <h3 className="font-bold mb-1 group-hover:text-primary transition-colors truncate">
                      {service.title}
                    </h3>

                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {service.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <IndianRupee className="h-4 w-4" />
                        <span className="font-semibold text-primary">
                          {service.details.price.replace("₹", "")}
                        </span>
                      </div>
                    </div>
                  </Link>
                  {/* CTA Buttons */}
                  <div className="flex gap-2">
                    <Link
                      to={`/service/${service.slug || service.id}`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        View Details
                        <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      onClick={() => {
                        // Add booking logic here
                        console.log(
                          "Book session clicked for service:",
                          service.slug || service.id
                        );
                      }}
                    >
                      {/* <ShoppingCart className="h-3 w-3 mr-1" /> */}
                      Book session
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* View All Services Button */}
        <div className="mt-8 text-center">
          <Link to="/services">
            <Button variant="outline">
              View All Services
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
