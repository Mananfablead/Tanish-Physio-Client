import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const CTA = () => {
  return (
    <section className="py-12 gradient-primary">
      <div className="container">
        <motion.div 
          className="text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Start Your Recovery?
          </h2>
          <p className="text-primary-foreground/80 mb-8">
            Take the first step towards a pain-free life. Our certified physiotherapists are ready to help you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/questionnaire">
              <button 
                className="rounded-full bg-background text-primary hover:bg-background/90 h-12 px-6 py-3 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 flex items-center gap-2"
              >
                Get Started Today
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
            <Link to="/plans">
              <button 
                className="rounded-full bg-background/20 text-primary-foreground hover:bg-background/30 h-12 px-6 py-3 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 flex items-center gap-2"
              >
                View Plans
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};