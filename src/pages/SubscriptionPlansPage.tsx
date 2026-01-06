import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Star, Zap, ArrowRight, Tag } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    id: "daily",
    name: "Daily Pass",
    price: 29,
    duration: "24 hours",
    sessions: 1,
    features: [
      "1 video session",
      "Exercise plan access",
      "Chat support",
      "Session recording",
    ],
    popular: false,
  },
  {
    id: "weekly",
    name: "Weekly Plan",
    price: 79,
    duration: "7 days",
    sessions: 3,
    features: [
      "Up to 3 sessions",
      "Full exercise library",
      "Priority chat support",
      "Session recordings",
      "Progress tracking",
    ],
    popular: false,
  },
  {
    id: "monthly",
    name: "Monthly Plan",
    price: 199,
    originalPrice: 249,
    duration: "30 days",
    sessions: "Unlimited",
    features: [
      "Unlimited sessions",
      "Full exercise library",
      "24/7 priority support",
      "All session recordings",
      "Advanced progress tracking",
      "Personalized exercise plans",
      "Group session access",
    ],
    popular: true,
  },
];

export default function SubscriptionPlansPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>("monthly");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const bookingData = location.state;

  const handleContinue = () => {
    const plan = plans.find(p => p.id === selectedPlan);

    // Check for stored intake and recency
    let stored = null;
    try {
      const raw = sessionStorage.getItem("qw_questionnaire");
      if (raw) stored = JSON.parse(raw);
    } catch (e) { stored = null; }

    const RECENT_DAYS = 90;
    const now = Date.now();
    const isRecent = (ts: number | undefined | null) => ts && (now - ts) < RECENT_DAYS * 24 * 60 * 60 * 1000;

    if (stored && isRecent(stored.updatedAt)) {
      // Proceed to booking with prefilled intake
      navigate("/booking", {
        state: {
          ...bookingData,
          plan,
          promoApplied,
          questionnaireData: stored.data,
        },
      });
      return;
    }

    // No recent intake: save pending plan and redirect user to intake before activation
    try { sessionStorage.setItem("qw_pending_plan", JSON.stringify(plan)); } catch (e) {}
    navigate("/questionnaire", { state: { planToActivate: plan } });
  };

  const applyPromo = () => {
    if (promoCode.toLowerCase() === "recover20") {
      setPromoApplied(true);
    }
  };

  const scheduled = (() => { try { const raw = sessionStorage.getItem('qw_scheduled_session'); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } })();

  return (
    <Layout>
      <div className="bg-muted/30 py-12">
        <div className="container text-center max-w-3xl">
          <Badge variant="secondary" className="mb-4">
            <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
            Choose Your Plan
          </Badge>
          {/* {scheduled && (
            <div className="mb-4 p-3 rounded-md bg-blue-50 border border-blue-100 text-blue-800 text-sm">
              You have a reserved session on {new Date(scheduled.reservedAt).toLocaleDateString()}. Pick a plan to unlock it.
            </div>
          )} */}
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            Start Your Recovery Journey
          </h1>
          <p className="text-muted-foreground">
            Choose a plan that fits your needs. All plans include access to certified physiotherapists and personalized care.
          </p>
        </div>
      </div>

      <div className="container py-12">
        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                variant={plan.popular ? "featured" : "interactive"}
                className={`relative h-full cursor-pointer ₹{
                  selectedPlan === plan.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gradient-accent">
                      <Zap className="h-3 w-3 mr-1" />
                      Best Value
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.duration}</CardDescription>
                </CardHeader>

                <CardContent className="text-center">
                  <div className="mb-6">
                    {plan.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through mr-2">
                        ₹{plan.originalPrice}
                      </span>
                    )}
                    <span className="text-4xl font-bold">₹{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.duration}</span>
                  </div>

                  <div className="text-sm text-muted-foreground mb-6">
                    {typeof plan.sessions === "number" 
                      ? `Up to ${plan.sessions} session${plan.sessions > 1 ? "s" : ""}`
                      : "Unlimited sessions"
                    }
                  </div>

                  <ul className="space-y-3 text-left">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={selectedPlan === plan.id ? "hero" : "outline"}
                    className="w-full mt-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(plan.id);
                    }}
                  >
                    {selectedPlan === plan.id ? "Selected" : "Select Plan"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Promo Code */}
        {/* <Card variant="outline" className="max-w-md mx-auto mb-8">
          <CardContent className="p-4">
            <Label className="text-sm font-medium">Have a promo code?</Label>
            <div className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="pl-10"
                  disabled={promoApplied}
                />
              </div>
              <Button
                variant="outline"
                onClick={applyPromo}
                disabled={!promoCode || promoApplied}
              >
                {promoApplied ? "Applied!" : "Apply"}
              </Button>
            </div>
            {promoApplied && (
              <p className="text-sm text-success mt-2 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                20% discount applied!
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Try "RECOVER20" for 20% off
            </p>
          </CardContent>
        </Card> */}

        {/* Plan Details */}
        <div className="max-w-2xl mx-auto">
          <Card variant="gradient">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    {plans.find(p => p.id === selectedPlan)?.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Auto-renews after {plans.find(p => p.id === selectedPlan)?.duration}. Cancel anytime.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    ₹{promoApplied 
                      ? Math.round((plans.find(p => p.id === selectedPlan)?.price || 0) * 0.8)
                      : plans.find(p => p.id === selectedPlan)?.price
                    }
                  </p>
                  {promoApplied && (
                    <p className="text-sm text-success">20% off applied</p>
                  )}
                </div>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full mt-6"
                onClick={handleContinue}
              >
                Continue to Booking
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                By continuing, you agree to our Terms of Service and Privacy Policy.
                You can cancel your subscription at any time.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
