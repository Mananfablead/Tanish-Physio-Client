import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface TestimonialsProps {
  featuredTestimonials: any[];
  testimonialsLoading: boolean;
  testimonialsError: string | null;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export const Testimonials = ({ featuredTestimonials, testimonialsLoading, testimonialsError }: TestimonialsProps) => {
  return (
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
              ) : featuredTestimonials.length > 0 ? (
                featuredTestimonials?.map((testimonial: any, index: number) => (
                  <CarouselItem key={testimonial?._id || index} className="pl-4 md:basis-1/3">
                    <motion.div variants={fadeInUp}>
                      <Card className={`h-full p-8 hover:shadow-xl transition-all duration-500 border-l-4 bg-gradient-to-br from-white to-muted/20 dark:from-background dark:to-muted/5 relative group overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />

                        <div className="flex items-center gap-4 mb-6 relative z-10">
                          <Avatar className="h-14 w-14 border-2 shadow-md transition-transform duration-500 group-hover:scale-110"
                            style={{ borderColor: 'hsl(var(--primary/30))' }}>
                            <AvatarImage src={testimonial?.userId?.profilePicture} />
                            <AvatarFallback className="capitalize">{testimonial?.userId?.name[0]}</AvatarFallback>
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
                <CarouselItem className="pl-4">
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
  );
};