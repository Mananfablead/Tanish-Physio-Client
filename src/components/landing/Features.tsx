import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

interface FeaturesProps {
  cmsWhyUs: any;
  setHoveredStat?: any;
  hoveredStat?: any;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const CountUpValue = ({ value, duration = 2500 }: { value: string; duration?: number }) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || !value) return;

    const match = value.match(/(\d+\.?\d*)(.*)/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const target = parseFloat(match[1]);
    const suffix = match[2] || "";
    if (Number.isNaN(target)) {
      setDisplayValue(value);
      return;
    }

    let raf = 0;
    let startedAt = 0;
    const start = 0;

    const step = (ts: number) => {
      if (!startedAt) startedAt = ts;
      const progress = Math.min(1, (ts - startedAt) / duration);
      const current = start + (target - start) * progress;
      setDisplayValue(
        `${target % 1 === 0 ? Math.floor(current) : current.toFixed(1)}${suffix}`,
      );
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          raf = requestAnimationFrame(step);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return <span ref={ref}>{displayValue}</span>;
};      

export const Features = ({ cmsWhyUs }: FeaturesProps) => {
  return (
    <section className="py-16 relative overflow-hidden border-y border-white/10" style={{ backgroundColor: '#2d8e8d' }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-white/5 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-black/5 rounded-full blur-[120px] -translate-y-1/2" />
      </div>
      
      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="space-y-4">
              <Badge variant="outline" className="border-white/30 text-white bg-white/10">Why Choose Us</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-white">
                {cmsWhyUs?.title || 'Professional Care, Personalized'} 
              </h2>
              <p className="text-white/80 text-lg leading-relaxed">
                {cmsWhyUs?.description || 'Experience the convenience of virtual physiotherapy without compromising on quality. Our platform connects you with the best care, anytime, anywhere.'}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {(cmsWhyUs?.features && cmsWhyUs.features.length > 0 ? cmsWhyUs.features : [
                "Certified and experienced physiotherapists",
                "Personalized treatment plans",
                "Flexible scheduling - 24/7 availability",
                "Progress tracking and exercise videos",
                "Affordable subscription plans",
                "Secure video consultations"
              ]).map((feature: string, index: number) => (
                <motion.div 
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/10 shadow-sm backdrop-blur-sm hover:bg-white/20 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-white">{feature}</span>
                </motion.div>
              ))}
            </div>

            <Link to="/questionnaire">
              <button className="mt-4 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 py-3 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 flex items-center gap-2">
                Start Your Assessment
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {(cmsWhyUs?.stats && cmsWhyUs.stats.length > 0 ? cmsWhyUs.stats : [
              { label: "Happy Patients", value: "10K+", description: "Successfully treated worldwide", _id: "1" },
              { label: "Therapists", value: "500+", description: "Certified medical experts", _id: "2", offset: "mt-12" },
              { label: "Sessions", value: "50K+", description: "Virtual consultations completed", _id: "3" },
              { label: "Avg Rating", value: "4.9", description: "Based on patient reviews", _id: "4", offset: "mt-12" }
            ]).map((stat: any, i: number) => (
              <motion.div
                key={stat._id || i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`h-full ${stat.offset || ""}`}
              >
                <Card 
                  className="p-8 text-center border-2 border-primary/10 hover:border-primary/30 transition-all duration-500 hover:scale-105 shadow-xl bg-white/90 group relative overflow-hidden h-full"
                >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                <p className="text-4xl lg:text-5xl font-bold text-primary mb-2 tracking-tight relative z-10">
                  {stat.value ? <CountUpValue value={stat.value} /> : "0"}
                </p>
                <p className="text-lg font-semibold text-slate-900 uppercase tracking-wider relative z-10">{stat.label}</p>
                <p className="text-md text-muted-foreground mt-2 relative z-10">{stat.description}</p>
              </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};