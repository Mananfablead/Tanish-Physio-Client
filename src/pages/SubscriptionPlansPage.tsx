import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  TrendingUp,
  Target,
  Users,
  Heart,
  Brain,
  Dumbbell,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { fetchSubscriptionPlans } from "@/store/slices/subscriptionSlice";
import { RootState, useAppDispatch } from "@/store";
import { fetchProfile, selectCurrentUser } from "@/store/slices/authSlice";
import { toast } from "sonner";

export default function SubscriptionPlansPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  // Get tab from URL parameter or default to 'individual'
  const urlTab = searchParams.get('tab') as 'individual' | 'group' | null;
  const [activeTab, setActiveTab] = useState<'individual' | 'group'>(urlTab || 'individual');

  const { plans: subscriptionPlans, loading, error } = useSelector(
    (state: RootState) => state.subscriptions
  );
  const user = useSelector(selectCurrentUser);
  const activePlan = user?.subscriptionData || null;
  const activePlanId = activePlan?.planId ?? null;
  const isSubscriptionExpired = activePlan?.isExpired ?? false;
  const hasActiveSubscription = activePlanId && !isSubscriptionExpired;

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [promoApplied] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [expandedFeatures, setExpandedFeatures] = useState<Record<string, boolean>>({});
  // activeTab is now declared above with URL parameter support

  useEffect(() => {
    dispatch(fetchSubscriptionPlans({ sessionType: activeTab }));
    if (localStorage.getItem("token")) dispatch(fetchProfile());
  }, [dispatch, activeTab]);

  const [viewMode, setViewMode] = useState<'cards' | 'comparison'>('cards');

  // Function to get plan icon based on plan type
  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes('basic')) return <Heart className="h-6 w-6" />;
    if (planName.toLowerCase().includes('premium')) return <Dumbbell className="h-6 w-6" />;
    if (planName.toLowerCase().includes('pro') || planName.toLowerCase().includes('advanced')) return <Brain className="h-6 w-6" />;
    return <Target className="h-6 w-6" />;
  };

  return (
    <Layout>
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-6 pt-8 pb-10">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>

        <div className="container relative z-10 text-center space-y-4">
         
          {/* Heading */}
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-4 leading-snug">
            Start Your Recovery, Guided by
            <span className="block">an Expert</span>
          </h1>

          <p className="text-sm md:text-base text-slate-600 mb-8 max-w-2xl mx-auto">
            Choose a therapy plan tailored to your recovery goals with guidance from our experienced physiotherapist.
          </p>

        </div>
      </div>


      {/* PLANS SECTION */}
      <div className="container py-10">
        {/* TABS */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border bg-muted p-1">
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'individual'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('individual')}
            >
              Individual
            </button>
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'group'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('group')}
            >
              Group
            </button>
          </div>
        </div>

        {subscriptionPlans.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Plans Available</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Our subscription plans are currently being updated. Please check back later.
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className={`${
            subscriptionPlans.length === 2 
              ? 'flex flex-col md:flex-row justify-center gap-8 max-w-4xl mx-auto' 
              : 'grid md:grid-cols-3 gap-8 max-w-6xl mx-auto'
          } mb-0`}>
            {loading ? (
              <div className={`${subscriptionPlans.length === 2 ? 'w-full' : 'col-span-full'} flex justify-center py-12`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <p className={`${subscriptionPlans.length === 2 ? 'w-full' : 'col-span-full'} text-center text-destructive text-lg`}>
                {error}
              </p>
            ) : subscriptionPlans.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
                  <Zap className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No {activeTab} Plans Available</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We don't have any {activeTab} subscription plans available at the moment.
                </p>
              </div>
            ) : (
              subscriptionPlans.map((plan, index) => {
                const planId = plan.planId || plan.id;
                const isSelected = selectedPlan === planId;
                const isActive = activePlanId === planId && !isSubscriptionExpired;

                // Calculate discount percentage
                const discountPercentage = plan.originalPrice
                  ? Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100)
                  : 0;

                return (
                  <motion.div
                    key={planId}
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                    className="relative"
                  >
                    <Card
                      onClick={() => {
                        if ((!hasActiveSubscription || (isSubscriptionExpired && activePlanId === planId)) && !isActive) {
                          setSelectedPlan(planId);
                        }
                      }}
                      className={`relative h-full flex flex-col rounded-3xl cursor-pointer border-2 overflow-hidden group transition-all duration-300 hover:shadow-xl ${isSelected ? "ring-2 ring-primary scale-[1.02]" : "scale-100"} ${plan.popular ? "border-primary shadow-lg" : "border-border shadow-md"}`}
                    >
                      {/* Gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${plan.popular ? "from-primary/5 to-secondary/5" : "from-muted/20 to-background"} pointer-events-none`} />

                      {isSubscriptionExpired && activePlanId === planId && (
                        <div className="absolute top-4 right-4 z-10">
                          <Badge variant="destructive" className="bg-destructive/90 text-white border-destructive">
                            Expired
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="text-center flex-shrink-0 pt-4 pb-4 relative z-10">
                        <CardTitle className="text-2xl font-bold">
                          {plan.name}
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                          {plan.planId}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="text-center space-y-6 flex-grow flex flex-col px-8 pb-4 relative z-10">
                        {/* PRICE SECTION */}
                        <div className="space-y-2">
                          {plan.originalPrice && (
                            <div className="flex items-center justify-center gap-2">
                              <span className="line-through text-muted-foreground text-lg">
                                {plan.currency || '₹'}{plan.originalPrice}
                              </span>
                              {discountPercentage > 0 && (
                                <Badge variant="secondary" className="bg-destructive/20 text-destructive">
                                  {discountPercentage}% OFF
                                </Badge>
                              )}
                            </div>
                          )}
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-4xl font-bold">
                              {plan.currency || '₹'}{plan.price}
                            </span>
                            <span className="text-muted-foreground">
                              /{plan.duration}
                            </span>
                          </div>
                        </div>

                        {/* SESSIONS */}
                        <div className="py-0">
                          <p className="text-lg font-semibold text-primary">
                            {typeof plan.sessions === "number"
                              ? `Up to ${plan.sessions} sessions`
                              : plan.sessions} sessions
                          </p>
                        </div>

                        {/* DESCRIPTION */}
                        {plan.description && (
                          <div className="text-left">
                            <h4 className="text-xs font-medium mb-2 text-foreground">What's Included</h4>
                            <ul className="space-y-1 text-xs text-muted-foreground">
                              {plan.description
                                .split("\n")
                                .slice(0, expandedDescriptions[planId] ? undefined : 2)
                                .map((line, idx) => (
                                  <li key={idx} className="flex gap-1 items-start">
                                    <CheckCircle className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                    <span className="break-words">{line}</span>
                                  </li>
                                ))}
                            </ul>
                            {plan.description.split("\n").length > 2 && (
                              <Button
                                variant="link"
                                size="sm"
                                className="mt-1 p-0 h-auto text-primary hover:text-primary/80 text-xs"
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
                                    Show Less <ChevronUp className="h-3 w-3 ml-1" />
                                  </>
                                ) : (
                                  <>
                                    Show More <ChevronDown className="h-3 w-3 ml-1" />
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        )}

                        {/* FEATURES */}
                        <div className="text-left flex-grow">
                          <h4 className="text-xs font-medium mb-2 text-foreground">
                            Included Features
                          </h4>
                          <div className="space-y-1">
                            {plan.features
                              .slice(0, expandedFeatures[planId] ? undefined : 3)
                              .map((f, i) => (
                                <div key={i} className="flex gap-1 items-start text-xs">
                                  <CheckCircle className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                                  <span>{f}</span>
                                </div>
                              ))}
                          </div>
                          {plan.features.length > 3 && (
                            <Button
                              variant="link"
                              size="sm"
                              className="mt-1 p-0 h-auto text-primary hover:text-primary/80 text-xs"
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
                                  Show Less <ChevronUp className="h-3 w-3 ml-1" />
                                </>
                              ) : (
                                <>
                                  Show More <ChevronDown className="h-3 w-3 ml-1" />
                                </>
                              )}
                            </Button>
                          )}
                        </div>

                        {/* BUTTON */}
                        <Button
                          className="w-full h-12 text-base font-semibold py-6 rounded-xl"
                          variant={
                            isActive
                              ? "secondary"
                              : (hasActiveSubscription && activePlanId === planId)
                                ? "outline"
                                : "default"
                          }
                          disabled={isActive || (hasActiveSubscription && !isSubscriptionExpired && activePlanId !== planId)}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isActive && (!hasActiveSubscription || (isSubscriptionExpired && activePlanId === planId))) {
                              setSelectedPlan(planId);
                              setIsModalOpen(true);
                            }
                          }}
                        >
                          {isActive
                            ? "Active Plan"
                            : (hasActiveSubscription && activePlanId === planId)
                              ? "Plan Already Active"
                              : isSubscriptionExpired && activePlanId === planId
                                ? "Renew Plan"
                                : "Select Plan"}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        ) : subscriptionPlans.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No {activeTab} Plans Available</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              We don't have any {activeTab} subscription plans available at the moment.
            </p>
          </div>
        ) : (
          /* COMPARISON TABLE VIEW */
          <div className="overflow-x-auto rounded-xl border bg-card mb-12">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left font-semibold">Feature</th>
                  {subscriptionPlans.map((plan, index) => (
                    <th key={plan.planId || plan.id} className="p-4 text-center font-semibold">
                      <div className="flex flex-col items-center">
                        <span className="font-bold">{plan.name}</span>
                        <span className="text-sm text-muted-foreground">₹{plan.price}/{plan.duration}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/20">
                  <td className="p-4 font-medium">Sessions</td>
                  {subscriptionPlans.map((plan) => (
                    <td key={`sessions-${plan.planId || plan.id}`} className="p-4 text-center">
                      {typeof plan.sessions === "number"
                        ? `Up to ${plan.sessions}`
                        : plan.sessions}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-muted/20">
                  <td className="p-4 font-medium">Duration</td>
                  {subscriptionPlans.map((plan) => (
                    <td key={`duration-${plan.planId || plan.id}`} className="p-4 text-center">
                      {plan.planId}
                    </td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-muted/20">
                  <td className="p-4 font-medium">Price</td>
                  {subscriptionPlans.map((plan) => (
                    <td key={`price-${plan.planId || plan.id}`} className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        {plan.originalPrice && (
                          <span className="line-through text-muted-foreground text-sm">
                            ₹{plan.originalPrice}
                          </span>
                        )}
                        <span className="text-lg font-bold">₹{plan.price}</span>
                        <span className="text-sm text-muted-foreground">/{plan.duration}</span>
                      </div>
                    </td>
                  ))}
                </tr>
                {subscriptionPlans.some(plan => plan.features) && (
                  <tr className="border-b hover:bg-muted/20">
                    <td className="p-4 font-medium">Features</td>
                    {subscriptionPlans.map((plan) => (
                      <td key={`features-${plan.planId || plan.id}`} className="p-4">
                        <ul className="space-y-1">
                          {plan.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-1 text-xs">
                              <CheckCircle className="h-2 w-2 text-primary" />
                              <span>{feature}</span>
                            </li>
                          ))}
                          {plan.features.length > 3 && (
                            <li className="text-xs text-primary/70">+{plan.features.length - 3} more</li>
                          )}
                        </ul>
                      </td>
                    ))}
                  </tr>
                )}
                <tr>
                  <td className="p-4 font-medium">Action</td>
                  {subscriptionPlans.map((plan) => {
                    const planId = plan.planId || plan.id;
                    const isActive = activePlanId === planId && !isSubscriptionExpired;
                    const isSelected = selectedPlan === planId;
                    return (
                      <td key={`action-${planId}`} className="p-4 text-center">
                        <Button
                          variant={
                            isActive
                              ? "secondary"
                              : (hasActiveSubscription && activePlanId === planId)
                                ? "outline"
                                : "default"
                          }
                          size="sm"
                          disabled={isActive || (hasActiveSubscription && !isSubscriptionExpired && activePlanId !== planId)}
                          onClick={() => {
                            if (!isActive && (!hasActiveSubscription || (isSubscriptionExpired && activePlanId === planId))) {
                              setSelectedPlan(planId);
                              setIsModalOpen(true);
                            }
                          }}
                        >
                          {isActive
                            ? "Active"
                            : (hasActiveSubscription && activePlanId === planId)
                              ? "Active"
                              : isSubscriptionExpired && activePlanId === planId
                                ? "Renew"
                                : "Select"}
                        </Button>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* EXPIRED SUBSCRIPTION WARNING */}
        {isSubscriptionExpired && activePlan && (
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="border-destructive bg-destructive/10 rounded-2xl overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/20">
                      <ShieldCheck className="h-6 w-6 text-destructive" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-destructive mb-2">Subscription Expired</h3>
                    <p className="text-base text-muted-foreground mb-3">
                      Your {activePlan.planName} expired {Math.abs(activePlan.daysRemaining || 0)} day(s) ago.
                      Please select a new plan to continue your therapy sessions.
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Expired on: {new Date(activePlan.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        <span>Plan: {activePlan.planName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CONFIRMATION MODAL */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 border-b">
              <DialogHeader className="text-left">
                <DialogTitle className="text-2xl font-bold">Confirm Your Selection</DialogTitle>
                <DialogDescription>
                  Please review your selected plan before proceeding
                </DialogDescription>
              </DialogHeader>
            </div>

            {selectedPlan && (
              <div className="p-6 space-y-6">
                <div className="bg-gradient-to-br from-muted/50 to-background border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">
                      {subscriptionPlans.find(
                        (p) => (p.planId || p.id) === selectedPlan
                      )?.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-primary">
                      {(subscriptionPlans.find(
                        (p) => (p.planId || p.id) === selectedPlan
                      ) as any)?.currency || '₹'}{
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
                  <p className="text-base text-muted-foreground">
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        <Video className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <span>1-on-1 video sessions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        <Target className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <span>Personal recovery plan</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        <Dumbbell className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <span>Exercise guidance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <span>Progress tracking</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-4 border border-primary/10">
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Auto-renews every{" "}
                    {subscriptionPlans.find(
                      (p) => (p.planId || p.id) === selectedPlan
                    )?.duration}. Cancel anytime.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="p-6 pt-0">
              <Button
                variant="outline"
                className="h-12 px-6"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="h-12 px-6"
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
