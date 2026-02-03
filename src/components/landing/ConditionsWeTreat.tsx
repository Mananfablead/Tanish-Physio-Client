import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import Autoplay from "embla-carousel-autoplay";
import { getIconComponent } from "./utils";

interface ConditionsWeTreatProps {
  cmsConditions: any;
}

export const ConditionsWeTreat = ({ cmsConditions }: ConditionsWeTreatProps) => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <section className="py-16 relative overflow-hidden border-y border-primary/10">
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
              ]).map((condition: any, index: number) => {
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
      </div>
    </section>
  );
};