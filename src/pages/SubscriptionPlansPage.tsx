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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
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
                      onClick={() => {
                        if (!activePlanId && !isActive) {
                          setSelectedPlan(planId);
                        }
                      }}
                      className={`relative h-full flex flex-col rounded-2xl cursor-pointer border
                        ${isSelected ? "ring-2 ring-primary" : ""}
                        ${plan.popular ? "shadow-lg" : "shadow-sm"}
                      `}
                    >
                      {/* {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-orange-500 text-white px-3 py-1">
                            <Zap className="h-3 w-3 mr-1" />
                            Best Value
                          </Badge>
                        </div>
                      )} */}

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
                            : plan.sessions} sessions
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
                              : activePlanId
                                ? "outline"
                                : "default"
                          }
                          disabled={isActive || !!activePlanId}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isActive && !activePlanId) {
                              setSelectedPlan(planId);
                              setIsModalOpen(true);
                            }
                          }}
                        >
                          {isActive
                            ? "Active Plan"
                            : activePlanId
                              ? "Plan Already Active"
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

        {/* CONFIRMATION MODAL */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Your Selection</DialogTitle>
              <DialogDescription>
                Please review your selected plan before proceeding
              </DialogDescription>
            </DialogHeader>
            
            {selectedPlan && (
              <div className="space-y-4">
                <div className="bg-muted/20 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">
                    {subscriptionPlans.find(
                      (p) => (p.planId || p.id) === selectedPlan
                    )?.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold text-primary">
                      ₹{
                        subscriptionPlans.find(
                          (p) => (p.planId || p.id) === selectedPlan
                        )?.price
                      }
                    </span>
                    <span className="text-muted-foreground">
                      /
                      {subscriptionPlans.find(
                        (p) => (p.planId || p.id) === selectedPlan
                      )?.duration}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {typeof subscriptionPlans.find(
                      (p) => (p.planId || p.id) === selectedPlan
                    )?.sessions === "number"
                      ? `Up to ${subscriptionPlans.find(
                          (p) => (p.planId || p.id) === selectedPlan
                        )?.sessions} sessions`
                      : subscriptionPlans.find(
                          (p) => (p.planId || p.id) === selectedPlan
                        )?.sessions} sessions
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>1-on-1 video sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Personal recovery plan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Exercise guidance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Progress tracking</span>
                  </div>
                </div>

                <div className="bg-muted/10 rounded-lg p-3 text-sm">
                  <p className="text-muted-foreground">
                    Auto-renews every{" "}
                    {subscriptionPlans.find(
                      (p) => (p.planId || p.id) === selectedPlan
                    )?.duration}. Cancel anytime.
                  </p>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const plan = subscriptionPlans.find(
                    (p) => (p.planId || p.id) === selectedPlan
                  );
                  if (!plan) return;
                  
                  setIsModalOpen(false);
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
                Confirm & Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
