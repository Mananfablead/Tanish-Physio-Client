import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface SubscriptionPlansProps {
  subscriptionPlans: any[];
  subscriptionLoading: boolean;
  subscriptionError: string | null;
  onTabChange?: (tab: 'individual' | 'group') => void;
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

export const SubscriptionPlans = ({ subscriptionPlans, subscriptionLoading, subscriptionError, onTabChange, stagger, fadeInUp }: SubscriptionPlansProps) => {
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

  // Add state for tabs
  const [activeTab, setActiveTab] = useState<'individual' | 'group'>('individual');
  
  // Handle tab change by calling the parent callback
  const handleTabChange = (tab: 'individual' | 'group') => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };
  
  // Filter plans based on active tab
  const filteredPlans = subscriptionPlans.filter(plan => 
    (plan as any).session_type === activeTab
  );
  return (
    <section className="py-8 bg-muted/30">
      <div className="container">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Badge variant="secondary" className="mb-4">
            Consultation Options
          </Badge>

          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Choose Your Recovery Plan
          </h2>

          <p className="text-muted-foreground">
            Flexible and transparent options designed to support your personalized recovery journey.
          </p>
        </motion.div>

        {/* TABS */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border bg-muted p-1">
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'individual'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleTabChange('individual')}
            >
              Individual
            </button>
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'group'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleTabChange('group')}
            >
              Group
            </button>
          </div>
        </div>

        <motion.div
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          variants={staggerAnimation}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {subscriptionLoading ? (
            <div className="col-span-full text-center py-8">
              <p>Loading subscription plans...</p>
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No {activeTab} Plans Available</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We don't have any {activeTab} subscription plans available at the moment.
              </p>
            </div>
          ) : (
            filteredPlans.slice(0, 3).map((plan, index) => {
              const planId = plan.planId || plan.id;
              const highlight = plan.popular || planId === 'weekly';
              return (
                <motion.div key={planId} variants={fadeInUpAnimation}>
                  <Card className={`relative h-full p-8 flex flex-col ${highlight ? "border-primary shadow-lg scale-105 z-10" : "border-border shadow-sm"}`}>
                    {highlight && (
                      <Badge className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground">
                        Best Value
                      </Badge>
                    )}
                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">₹{plan.price}</span>
                        <span className="text-muted-foreground text-sm">/{plan.duration}</span>
                      </div>
                    </div>
                    <ul className="space-y-4 mb-8 flex-grow">
                      {plan.features.slice(0, 3).map((feature: string, i: number) => (
                        <li key={i} className="flex items-center gap-3 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {/* <p className="text-xs text-muted-foreground mb-6 text-center italic">Cancel anytime</p> */}
                    <Link to="/plans" className="w-full">
                      <button
                        className={`w-full rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${highlight ? "bg-primary text-primary-foreground shadow hover:bg-primary/90" : "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"}`}
                      >
                        {highlight ? "Choose Plan" : `Select ${plan.name.split(' ')[0]}`}
                      </button>
                    </Link>
                  </Card>
                </motion.div>
              );
            })
          )}
        </motion.div>

        <div className="mt-16 text-center">
          <Link to={`/plans?tab=${activeTab}`}>
            <button className="inline-flex items-center justify-center text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 underline-offset-4 hover:underline text-primary">
              View All Detailed Plans & Benefits
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};