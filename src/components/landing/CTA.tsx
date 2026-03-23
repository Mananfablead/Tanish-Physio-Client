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
            Ready to Begin Your Recovery?
          </h2>

          <p className="text-primary-foreground/80 mb-8">
            Take the first step toward a pain-free and active life with expert
            physiotherapy guidance tailored to your needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/questionnaire">
              <button
                className="rounded-full bg-background text-primary hover:bg-background/90 h-12 px-6 py-3 text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
                title="Start your personalized recovery assessment"
              >
                Start Your Assessment
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>

            {/* <Link to="/free-consultation">
              <button
                className="rounded-full bg-background/20 text-primary-foreground hover:bg-background/30 h-12 px-6 py-3 text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
                title="Book a free 15-minute consultation"
              >
                Free Consultation
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link> */}

            <Link to="/plans">
              <button
                className="rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 h-12 px-6 py-3 text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
                title="View our subscription plans"
              >
                Explore Plans
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
