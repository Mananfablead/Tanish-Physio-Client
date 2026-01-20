import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Zap, ArrowRight, Tag, ShieldCheck, Video, Award, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubscriptionPlans } from '@/store/slices/subscriptionSlice';
import { RootState, useAppDispatch } from '@/store';
import { fetchProfile, selectCurrentUser, selectIsAuthenticated } from '@/store/slices/authSlice';
import { toast } from 'sonner';



export default function SubscriptionPlansPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Get subscription plans from Redux store
  const { plans: subscriptionPlans, loading, error } = useSelector((state: RootState) => state.subscriptions);
  const user = useSelector(selectCurrentUser);
  // Get authentication status
  const activePlan = user?.subscriptionData || null;
  const activePlanId = activePlan?.planId ?? null;

  console.log("activePlaakjsjakjkdasjdksjdksdjsksjldslkdfjdfn", activePlan)
  // Initialize selectedPlan based on fetched plans or default to 'monthly'
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);


  // Fetch subscription plans when component mounts
useEffect(() => {
  dispatch(fetchSubscriptionPlans());
  if (localStorage.getItem('token'))
    dispatch(fetchProfile());
}, [dispatch]);




  const [expandedPlan, setExpandedPlan] = useState<{ [key: string]: { features: boolean, services: boolean } }>({
    daily: { features: false, services: false },
    weekly: { features: false, services: false },
    monthly: { features: false, services: false },
  });
  const [promoApplied, setPromoApplied] = useState(false);


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
        {subscriptionPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-10 w-10 text-primary" />
            </div>

            <h2 className="text-2xl font-semibold mb-2">
              No Subscription Plans Found
            </h2>

            <p className="text-muted-foreground max-w-md mb-6">
              We’re currently working on new plans for you.
              Please check back soon or contact support for more details.
            </p>

            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="px-6"
            >
              Refresh Page
            </Button>
          </div>

        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <p>Loading subscription plans...</p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-8">
                <p className="text-destructive">
                  Error loading subscription plans: {error}
                </p>
              </div>
            ) : (
              subscriptionPlans.map((plan, index) => {
                const planId = plan.planId || plan.id;

                return (
                  <motion.div
                    key={planId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >


                    <Card
                      variant={plan.popular ? "featured" : "interactive"}
                      className={`relative h-full cursor-pointer ${selectedPlan === planId ? "ring-2 ring-primary" : ""
                        }`}
                      onClick={() => setSelectedPlan(planId)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="gradient-accent">
                            <Zap className="h-3 w-3 mr-1" />
                            Best Value
                          </Badge>
                        </div>
                      )}
                      {activePlanId === planId && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        </div>
                      )}
                      <CardHeader className="text-center pb-2">
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <CardDescription>{plan.duration}</CardDescription>
                      </CardHeader>

                      <CardContent className="text-center">
                        {/* PRICE */}
                        <div className="mb-6">
                          {plan.originalPrice && (
                            <span className="text-lg text-muted-foreground line-through mr-2">
                              ₹{plan.originalPrice}
                            </span>
                          )}
                          <span className="text-4xl font-bold">₹{plan.price}</span>
                          <span className="text-muted-foreground">
                            /{plan.duration}
                          </span>
                        </div>

                        {/* SESSIONS */}
                        <div className="text-sm text-muted-foreground mb-6">
                          {typeof plan.sessions === "number"
                            ? `Up to ${plan.sessions} session${plan.sessions > 1 ? "s" : ""
                            }`
                            : "Unlimited sessions"}
                        </div>

                        {/* FEATURES */}
                        <div className="space-y-4 text-left">
                          <h4 className="font-medium text-sm mb-2">
                            Included Features
                          </h4>
                          <ul className="space-y-2">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-success" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* BUTTON */}
                        <Button
                          variant={
                            activePlanId === planId
                              ? "secondary"
                              : selectedPlan === planId
                                ? "hero"
                                : "outline"
                          }
                          className="w-full mt-6"
                          disabled={!!activePlanId && activePlanId !== planId}
                          onClick={(e) => {
                            e.stopPropagation();

                            if (activePlanId) {
                              toast.info("You already have an active subscription");
                              return;
                            }

                            setSelectedPlan(planId);
                          }}
                        >
                          {activePlanId === planId
                            ? "Active Plan"
                            : selectedPlan === planId
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


        {selectedPlan && !activePlanId && subscriptionPlans.length > 0 && (

          <div className="max-w-6xl mx-auto">
            <Card className="bg-slate-90 shadow-xl">
              <CardContent className="p-6 space-y-6">
                {/* PLAN SUMMARY */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {subscriptionPlans.find(p => (p.planId || p.id) === selectedPlan)?.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Auto-renews after {subscriptionPlans.find(p => (p.planId || p.id) === selectedPlan)?.duration}. Cancel anytime.
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      ₹{promoApplied
                        ? Math.round(((subscriptionPlans.find(p => (p.planId || p.id) === selectedPlan)?.price || 0) * 0.8))
                        : subscriptionPlans.find(p => (p.planId || p.id) === selectedPlan)?.price}
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
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    const selectedPlanData = subscriptionPlans.find(
                      p => (p.planId || p.id) === selectedPlan
                    );

                    console.log("selectedPlanData", selectedPlanData);

                    if (!selectedPlanData) {
                      toast.error("Please select a plan");
                      return;
                    }
                    if (!selectedPlan) {
                      toast.error("Please select a plan to continue");
                      return;
                    }

                    const bookingData = {
                      service: {
                        id: selectedPlanData.planId || selectedPlanData.id,
                        name: selectedPlanData.name,
                        price: String(selectedPlanData.price), // service flow jaisa string
                        duration: selectedPlanData.duration,
                      },
                      fromSubscription: true, // 🔥 SUBSCRIPTION FLOW
                    };

                    navigate("/booking", { state: bookingData });
                  }}

                >
                  Book Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>



              </CardContent>

            </Card>
          </div>
        )}

      </div>
    </Layout>
  );
}
