import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Star, Zap, ArrowRight, Tag, ShieldCheck, Video, Award, Clock } from "lucide-react";
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
    services: [
      "Orthopedic Physiotherapy",
      "Basic exercise plan",
      "Therapist consultation",
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
    services: [
      "Orthopedic Physiotherapy",
      "Neuro Physiotherapy",
      "Sports Physiotherapy",
      "Customized exercise plans",
      "Weekly progress reports",
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
    services: [
      "All physiotherapy services",
      "Personalized treatment plans",
      "Unlimited exercise plans",
      "Regular progress assessments",
      "Home visit services",
      "Nutrition consultation",
      "Injury prevention programs",
    ],
    popular: true,
  },
];

export default function SubscriptionPlansPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>("monthly");
  const [expandedPlan, setExpandedPlan] = useState<{ [key: string]: { features: boolean, services: boolean } }>({
    daily: { features: false, services: false },
    weekly: { features: false, services: false },
    monthly: { features: false, services: false },
  });
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
    try { sessionStorage.setItem("qw_pending_plan", JSON.stringify(plan)); } catch (e) { }
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
      <div className="bg-muted/30 py-14">
        <div className="container text-center  space-y-5">

          {/* BADGE */}
          <Badge
            variant="secondary"
            className="mx-auto inline-flex items-center gap-2 px-4 py-1"
          >
            <Star className="h-4 w-4 fill-primary text-primary" />
            Flexible Therapy Plans
          </Badge>

          {/* OPTIONAL INFO / RESERVED SESSION */}
          {/* {scheduled && (
      <div className="mx-auto max-w-2xl p-4 rounded-lg bg-blue-50 border border-blue-100 text-blue-800 text-sm">
        Your session is reserved for{" "}
        <span className="font-medium">
          {new Date(scheduled.reservedAt).toLocaleDateString()}
        </span>
        . Select a plan to unlock it.
      </div>
    )} */}

          {/* HEADLINE */}
          <h1 className="text-3xl lg:text-5xl font-bold leading-tight">
            Start Your Recovery,
            <span className="text-primary"> Guided by Experts</span>
          </h1>

          {/* SUBTEXT */}
          <p className="text-muted-foreground text-base lg:text-lg max-w-3xl mx-auto">
            Choose a therapy plan that matches your recovery goals. Every plan includes
            one-on-one guidance from certified physiotherapists, personalized programs,
            and continuous progress tracking.
          </p>



        </div>
      </div>


      <div className="container pb-12">
        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
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

                  <div className="space-y-4 text-left">
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <span className="bg-primary/10 p-1 rounded">
                          <CheckCircle className="h-3 w-3 text-primary" />
                        </span>
                        Included Features
                      </h4>
                      <ul className="space-y-2">
                        {plan.features.slice(0, 2).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {(plan.features.length > 2 && expandedPlan[plan.id]?.features) ? (
                          plan.features.slice(2).map((feature, idx) => (
                            <li key={idx + 2} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))
                        ) : null}
                        {plan.features.length > 2 && (
                          <li className="flex items-start gap-2 text-sm text-primary font-medium cursor-pointer" onClick={(e) => {
                            e.stopPropagation();
                            setExpandedPlan(prev => ({
                              ...prev,
                              [plan.id]: {
                                ...prev[plan.id],
                                features: !prev[plan.id].features
                              }
                            }));
                          }}>
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>
                              {expandedPlan[plan.id]?.features ? 'Show less' : `+${plan.features.length - 2} more features`}
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <span className="bg-primary/10 p-1 rounded">
                          <Star className="h-3 w-3 text-primary" />
                        </span>
                        Services Provided
                      </h4>
                      <ul className="space-y-2">
                        {plan.services.slice(0, 2).map((service, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>{service}</span>
                          </li>
                        ))}
                        {(plan.services.length > 2 && expandedPlan[plan.id]?.services) ? (
                          plan.services.slice(2).map((service, idx) => (
                            <li key={idx + 2} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              <span>{service}</span>
                            </li>
                          ))
                        ) : null}
                        {plan.services.length > 2 && (
                          <li className="flex items-start gap-2 text-sm text-primary font-medium cursor-pointer" onClick={(e) => {
                            e.stopPropagation();
                            setExpandedPlan(prev => ({
                              ...prev,
                              [plan.id]: {
                                ...prev[plan.id],
                                services: !prev[plan.id].services
                              }
                            }));
                          }}>
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>
                              {expandedPlan[plan.id]?.services ? 'Show less' : `+${plan.services.length - 2} more services`}
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

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
        <div className="max-w-6xl mx-auto">
          <Card className="bg-slate-90 shadow-xl">
            <CardContent className="p-6 space-y-6">
              {/* PLAN SUMMARY */}
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
                      : plans.find(p => p.id === selectedPlan)?.price}
                  </p>
                  {promoApplied && (
                    <p className="text-sm text-success">20% off applied</p>
                  )}
                </div>
              </div>

              {/* DIVIDER */}
              <div className="border-t" />

              {/* WHAT YOU GET */}
              <div>
                <h4 className="font-medium mb-3">What you get with this plan</h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="flex gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                    1-on-1 live video sessions
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                    Personal recovery roadmap
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                    Exercise videos & guidance
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                    Progress tracking & follow-ups
                  </div>
                </div>
              </div>

              {/* TRUST / SAFETY */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  Secure & private
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-blue-500" />
                  HD video calls
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-yellow-500" />
                  Certified experts
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  Flexible scheduling
                </div>
              </div>

              {/* CTA */}
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleContinue}
              >
                Continue to Booking
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>


            </CardContent>

          </Card>
        </div>
      </div>
    </Layout>
  );
}
