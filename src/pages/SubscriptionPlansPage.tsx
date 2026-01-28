import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Star,
  Zap,
  ArrowRight,
  ShieldCheck,
  Video,
  Award,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { fetchSubscriptionPlans } from "@/store/slices/subscriptionSlice";
import { RootState, useAppDispatch } from "@/store";
import { fetchProfile, selectCurrentUser } from "@/store/slices/authSlice";
import { toast } from "sonner";

export default function SubscriptionPlansPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { plans: subscriptionPlans, loading, error } = useSelector(
    (state: RootState) => state.subscriptions
  );

  const user = useSelector(selectCurrentUser);
  const activePlan = user?.subscriptionData || null;
  const activePlanId = activePlan?.planId ?? null;

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [promoApplied] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [expandedFeatures, setExpandedFeatures] = useState<Record<string, boolean>>({});

  useEffect(() => {
    dispatch(fetchSubscriptionPlans());
    if (localStorage.getItem("token")) dispatch(fetchProfile());
  }, [dispatch]);

  return (
    <Layout>
      {/* HERO */}
      <div className="bg-muted/30 py-14">
        <div className="container text-center space-y-5">
          <Badge className="mx-auto inline-flex items-center gap-2 px-4 py-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            Flexible Therapy Plans
          </Badge>

          <h1 className="text-3xl lg:text-5xl font-bold">
            Start Your Recovery,
            <span className="text-primary"> Guided by Experts</span>
          </h1>

          <p className="text-muted-foreground max-w-3xl mx-auto">
            Choose a therapy plan that matches your recovery goals. Every plan
            includes one-on-one guidance from certified physiotherapists.
          </p>
        </div>
      </div>

      {/* PLANS */}
      <div className="container pb-12">
        {subscriptionPlans.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="mx-auto h-10 w-10 text-primary mb-4" />
            <h2 className="text-xl font-semibold">No Plans Found</h2>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
            {loading ? (
              <p className="col-span-full text-center">Loading plans...</p>
            ) : error ? (
              <p className="col-span-full text-center text-destructive">
                {error}
              </p>
            ) : (
              subscriptionPlans.map((plan, index) => {
                const planId = plan.planId || plan.id;
                const isSelected = selectedPlan === planId;
                const isActive = activePlanId === planId;

                return (
                  <motion.div
                    key={planId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      onClick={() => setSelectedPlan(planId)}
                      className={`relative h-full flex flex-col rounded-2xl cursor-pointer border
                        ${isSelected ? "ring-2 ring-primary" : ""}
                        ${plan.popular ? "shadow-lg" : "shadow-sm"}
                      `}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-orange-500 text-white px-3 py-1">
                            <Zap className="h-3 w-3 mr-1" />
                            Best Value
                          </Badge>
                        </div>
                      )}

                      {isActive && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="success">Active</Badge>
                        </div>
                      )}

                      <CardHeader className="text-center flex-shrink-0">
                        <CardTitle className="text-xl">
                          {plan.name}
                        </CardTitle>
                        <CardDescription>{plan.duration}</CardDescription>
                      </CardHeader>

                      <CardContent className="text-center space-y-6 flex-grow flex flex-col">
                        {/* PRICE */}
                        <div>
                          {plan.originalPrice && (
                            <span className="line-through text-muted-foreground mr-2">
                              ₹{plan.originalPrice}
                            </span>
                          )}
                          <span className="text-4xl font-bold">
                            ₹{plan.price}
                          </span>
                          <span className="text-muted-foreground">
                            /{plan.duration}
                          </span>
                        </div>

                        {/* SESSIONS */}
                        <p className="text-sm text-muted-foreground">
                          {typeof plan.sessions === "number"
                            ? `Up to ${plan.sessions} sessions`
                            : "Unlimited sessions"}
                        </p>

                        {/* DESCRIPTION */}
                        {plan.description && (
                          <div className="text-left">
                            <h4 className="text-sm font-medium mb-2">What's Included</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              {plan.description
                                .split("\n")
                                .slice(0, expandedDescriptions[planId] ? undefined : 2)
                                .map((line, idx) => (
                                  <li key={idx} className="flex gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{line}</span>
                                  </li>
                                ))}
                            </ul>
                            {plan.description.split("\n").length > 2 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 p-0 h-auto text-primary hover:text-primary/80"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedDescriptions(prev => ({
                                    ...prev,
                                    [planId]: !prev[planId]
                                  }));
                                }}
                              >
                                {expandedDescriptions[planId] ? (
                                  <>
                                    Show Less <ChevronUp className="h-4 w-4 ml-1" />
                                  </>
                                ) : (
                                  <>
                                    Show More <ChevronDown className="h-4 w-4 ml-1" />
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        )}

                        {/* FEATURES */}
                        <div className="text-left">
                          <h4 className="text-sm font-medium mb-2">
                            Included Features
                          </h4>
                          <div className="space-y-2">
                            {plan.features
                              .slice(0, expandedFeatures[planId] ? undefined : 2)
                              .map((f, i) => (
                                <div key={i} className="flex gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                                  <span>{f}</span>
                                </div>
                              ))}
                          </div>
                          {plan.features.length > 2 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 p-0 h-auto text-primary hover:text-primary/80"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedFeatures(prev => ({
                                  ...prev,
                                  [planId]: !prev[planId]
                                }));
                              }}
                            >
                              {expandedFeatures[planId] ? (
                                <>
                                  Show Less <ChevronUp className="h-4 w-4 ml-1" />
                                </>
                              ) : (
                                <>
                                  Show More <ChevronDown className="h-4 w-4 ml-1" />
                                </>
                              )}
                            </Button>
                          )}
                        </div>

                        {/* BUTTON */}
                        <Button
                          className="w-full"
                          variant={
                            isActive
                              ? "secondary"
                              : isSelected
                                ? "hero"
                                : "outline"
                          }
                          // disabled={!!activePlanId && !isActive}
                          onClick={(e) => {
                            e.stopPropagation();
                            // if (activePlanId) {
                            //   toast.info(
                            //     "You already have an active subscription"
                            //   );
                            //   return;
                            // }
                            setSelectedPlan(planId);
                          }}
                        >
                          {isActive
                            ? "Active Plan"
                            : isSelected
                              ? "Selected"
                              : "Select Plan"}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* SUMMARY */}
        {/* {selectedPlan && !activePlanId && ( */}
          <div className="max-w-6xl mx-auto">
            <Card className="shadow-xl rounded-2xl">
              <CardContent className="p-6 space-y-6">

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

                <div className="flex justify-between">
                  <h3 className="font-semibold">
                    {subscriptionPlans.find(
                      (p) => (p.planId || p.id) === selectedPlan
                    )?.name}
                  </h3>

                  <p className="text-muted-foreground text-sm">
                    Auto-renews after{" "}
                    {subscriptionPlans.find(
                      (p) => (p.planId || p.id) === selectedPlan
                    )?.duration}. Cancel anytime.
                  </p>
                </div>
                {/* TRUST & SAFETY */}
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

                <Button
                  size="lg"
                  variant="hero"
                  className="w-full"
                  onClick={() => {
                    const plan = subscriptionPlans.find(
                      (p) => (p.planId || p.id) === selectedPlan
                    );
                    if (!plan) return;

                    navigate("/booking", {
                      state: {
                        service: {
                          id: plan.planId || plan.id,
                          name: plan.name,
                          price: String(plan.price),
                          duration: plan.duration,
                        },
                        fromSubscription: true,
                      },
                    });
                  }}
                >
                  Book Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        {/* )} */}
      </div>
    </Layout>
  );
}
