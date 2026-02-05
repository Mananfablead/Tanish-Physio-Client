import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import heroImage from "@/assets/hero-physio.jpg";

interface HeroSectionProps {
  cmsHero: any;
  heroImage?: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export const HeroSection = ({ cmsHero, heroImage }: HeroSectionProps) => {
  return (
    <section className="relative overflow-hidden gradient-hero border-b border-primary/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="container relative py-16 lg:py-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-6">
              <Badge
                variant="secondary"
                className="w-fit px-4 py-1.5 flex items-center gap-2 border border-primary/10"
              >
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                  </span>
                  <span className="text-xs font-medium text-success">
                    {cmsHero?.isTherapistAvailable
                      ? "Therapists available now"
                      : "Book your appointment"}
                  </span>
                </div>
                <span className="text-muted-foreground mx-1">|</span>
                <Star className="h-3 w-3 fill-primary text-primary" />
                {cmsHero?.trustedBy || "Trusted by 10,000+ patients"}
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-balance">
                {cmsHero?.heading || "Start Your Recovery Journey Today"}
              </h1>
              <h3 className="text-xl font-semibold tracking-tight text-balance tracking-wide">
                {cmsHero?.subHeading || "Recovery"}
              </h3>
              <p className="text-lg text-muted-foreground max-w-lg">
                {cmsHero?.description ||
                  "Connect with certified physiotherapists from home. Get personalized treatment plans and video consultations tailored to your needs."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/questionnaire">
                    <Button variant="hero" size="xl">
                      {cmsHero?.ctaText || "Start Your Recovery"}
                      <ArrowRight className="h-5 w-5 ml-1" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Begin your personalized clinical assessment</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6">
              {cmsHero?.certifiedTherapists && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-5 w-5 text-primary" />
                  <span>Certified Therapists</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-warning text-warning"
                    />
                  ))}
                </div>
                <span>{cmsHero?.rating || "4.9/5 Rating"}</span>
              </div>
              <div className="space-y-2">
                {cmsHero?.features &&
                  Array.isArray(cmsHero.features) &&
                  cmsHero.features.map((feature: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Star className="h-5 w-5 text-primary flex-shrink-0" />
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

            {/* <div className="absolute -top-4 -right-4 p-4 border border-primary/20 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                  <Star className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
              </div>
            </div> */}
          </motion.div>
        </div>
      </div>
    </section>
  );
};