import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeroSectionProps {
  cmsHero: any;
}

export const HeroSection = ({ cmsHero }: HeroSectionProps) => {
  const cmsImageUrl: string | undefined =
    typeof cmsHero?.image === "string" && cmsHero.image.length > 0
      ? cmsHero.image
      : undefined;

  // Use CMS image only if it's already optimized (or same-origin). Otherwise use local optimized LCP asset.
  const shouldUseCmsForLcp =
    !!cmsImageUrl &&
    (cmsImageUrl.startsWith("/") ||
      cmsImageUrl.includes("tanishphysiofitness.in")) &&
    (cmsImageUrl.endsWith(".avif") ||
      cmsImageUrl.endsWith(".webp") ||
      cmsImageUrl.includes(".avif?") ||
      cmsImageUrl.includes(".webp?"));

  // Public, stable URLs so `index.html` can preload correctly in production.
  const localHero = {
    avifSrcSet:
      "/images/hero-physio-480.avif 480w, /images/hero-physio-768.avif 768w, /images/hero-physio-960.avif 960w, /images/hero-physio-1200.avif 1200w",
    webpSrcSet:
      "/images/hero-physio-480.webp 480w, /images/hero-physio-768.webp 768w, /images/hero-physio-960.webp 960w, /images/hero-physio-1200.webp 1200w",
    fallbackSrc: "/images/hero-physio-960.webp",
    lqip: "/images/hero-physio-lqip.webp",
    sizes: "(max-width: 1024px) 100vw, 50vw",
  };

  return (
    <section className="relative  overflow-hidden gradient-hero border-b border-primary/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="container relative py-5 lg:py-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div
            className="space-y-8"
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
                      ? "Therapist available now"
                      : "Book your appointment"}
                  </span>
                </div>
                <span className="text-muted-foreground mx-1">|</span>
                <Star className="h-3 w-3 fill-primary text-primary" />
                {cmsHero?.trustedBy || "Trusted by 10,000+ patients"}
              </Badge>
              <h2 className="text-4xl lg:text-6xl font-bold tracking-tight text-balance">
                {cmsHero?.heading || "Start Your Recovery Journey Today"}
              </h2>
              <p className="text-xl font-semibold tracking-wide text-balance text-muted-foreground">
                {cmsHero?.subHeading ||
                  "Online physiotherapy, rehab, and pain relief"}
              </p>
              <p className="text-lg text-muted-foreground max-w-lg">
                {cmsHero?.description ||
                  "Connect with certified physiotherapist from home. Get personalized treatment plans and video consultations tailored to your needs."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-start">
              {/* Primary CTA */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/questionnaire" state={{ goToSchedule: true }}>
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      {cmsHero?.ctaText || "Start Your Recovery"}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Begin your personalized recovery assessment</p>
                </TooltipContent>
              </Tooltip>

              {/* Secondary CTA */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/free-consultation">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      Free Consultation
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Book a free 15-minute consultation session</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6">
              {cmsHero?.certifiedTherapists && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-5 w-5 text-primary" />
                  <span>Expert Therapist</span>
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
                      className="flex items-center gap-4 text-sm text-muted-foreground"
                    >
                      <Star className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-large border-8 border-white dark:border-white/5">
              {shouldUseCmsForLcp ? (
                <img
                  src={cmsImageUrl}
                  alt="Physiotherapist helping patient with recovery exercises"
                  className="w-full h-[25rem] object-cover"
                  loading="eager"
                  decoding="async"
                  width={1200}
                  height={800}
                  fetchPriority="high"
                />
              ) : (
                <picture>
                  <source
                    type="image/avif"
                    srcSet={localHero.avifSrcSet}
                    sizes={localHero.sizes}
                  />
                  <source
                    type="image/webp"
                    srcSet={localHero.webpSrcSet}
                    sizes={localHero.sizes}
                  />
                  <img
                    src={localHero.fallbackSrc}
                    srcSet={localHero.webpSrcSet}
                    sizes={localHero.sizes}
                    alt="Physiotherapist helping patient with recovery exercises"
                    className="w-full h-[25rem] object-cover"
                    loading="eager"
                    decoding="async"
                    width={1200}
                    height={800}
                    fetchPriority="high"
                    style={{
                      backgroundImage: `url(${localHero.lqip})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                </picture>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
