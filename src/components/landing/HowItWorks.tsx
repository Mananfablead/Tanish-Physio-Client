import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

interface HowItWorksProps {
  cmsSteps: any[];
  stagger?: any;
  fadeInUp?: any;
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export const HowItWorks = ({ cmsSteps, stagger, fadeInUp }: HowItWorksProps) => {
  // Use passed props or fallback to local definitions
  const staggerAnimation = stagger || {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fadeInUpAnimation = fadeInUp || {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };
  return (
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
          variants={staggerAnimation}
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
              <motion.div key={item._id || index} variants={fadeInUpAnimation} className="relative z-10">
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
                      <div
                        className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-6
               shadow-lg shadow-primary/20
               group-hover:scale-110 transition-transform
               flex items-center justify-center"
                      >
                        <img
                          src={item.image}
                          alt={item.title || "image"}
                          className="w-10 h-10 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/64x64/png";
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        className="h-16 w-16 rounded-2xl gradient-primary
             flex items-center justify-center
             mx-auto mb-6 shadow-lg shadow-primary/20
             group-hover:scale-110 transition-transform"
                      >
                        <User className="w-8 h-8 text-white" />
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
  );
};