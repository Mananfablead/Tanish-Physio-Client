import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Star, Zap, ArrowRight, Tag, ShieldCheck, Video, Award, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubscriptionPlans } from '@/store/slices/subscriptionSlice';
import { RootState, useAppDispatch } from '@/store';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { createSubscriptionPaymentOrder, verifySubscriptionPayment, processPaymentWebhook } from '@/lib/api';
import { toast } from 'sonner';



export default function SubscriptionPlansPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Get subscription plans from Redux store
  const { plans: subscriptionPlans, loading, error } = useSelector((state: RootState) => state.subscriptions);
  
  // Get authentication status
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  // Initialize selectedPlan based on fetched plans or default to 'monthly'
  const [selectedPlan, setSelectedPlan] = useState<string>("monthly");
  
  // Fetch subscription plans when component mounts
  useEffect(() => {
    dispatch(fetchSubscriptionPlans());
  }, [dispatch]);
  
  // Update expandedPlan state when subscriptionPlans change
  useEffect(() => {
    if (subscriptionPlans && subscriptionPlans.length > 0) {
      const initialExpandedState: { [key: string]: { features: boolean, services: boolean } } = {};
      subscriptionPlans.forEach(plan => {
        const planId = plan.planId || plan.id;
        initialExpandedState[planId] = { features: false, services: false };
      });
      setExpandedPlan(initialExpandedState);
      
      // Set default selected plan if available
      if (subscriptionPlans.length > 0 && !subscriptionPlans.find(p => p.planId === selectedPlan)) {
        const defaultPlan = subscriptionPlans.find(p => p.popular) || subscriptionPlans[0];
        if (defaultPlan) {
          setSelectedPlan(defaultPlan.planId || defaultPlan.id || "monthly");
        }
      }
    }
  }, [subscriptionPlans]);
  
  const [expandedPlan, setExpandedPlan] = useState<{ [key: string]: { features: boolean, services: boolean } }>({
    daily: { features: false, services: false },
    weekly: { features: false, services: false },
    monthly: { features: false, services: false },
  });
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const bookingData = location.state;

  const handleContinue = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Store the current location so user can be redirected back after login
      sessionStorage.setItem('redirect_after_login', window.location.pathname);
      // Redirect to login page
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    
    const plan = subscriptionPlans.find(p => (p.planId || p.id) === selectedPlan);
    
    if (!plan) {
      toast.error("Please select a valid plan");
      return;
    }
    
    try {
      // Get the selected plan
      const selectedPlanData = subscriptionPlans.find(p => (p.planId || p.id) === selectedPlan);
      
      if (!selectedPlanData) {
        toast.error("Please select a valid plan");
        return;
      }
      
      // Calculate final price with promo if applied
      const finalPrice = promoApplied ? Math.round(selectedPlanData.price * 0.8) : selectedPlanData.price;
      
      // Create subscription payment order directly
      const paymentOrderData = {
        planId: selectedPlanData.planId || selectedPlanData.id,
        planName: selectedPlanData.name,
        amount: finalPrice,
        currency: "INR",
        subscription: true // Mark as subscription payment
      };
      
      const paymentOrderResponse: any = await createSubscriptionPaymentOrder(paymentOrderData);
      
      if (paymentOrderResponse.data && paymentOrderResponse.data.success) {
        const { orderId, key: razorpayKey, bookingId } = paymentOrderResponse.data.data;
        
        // Initialize Razorpay
        const options = {
          key: razorpayKey || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_S250uIjk1rVbsT",
          order_id: orderId,
          amount: finalPrice * 100, // Convert to paise
          currency: "INR",
          name: "Tanish Physio",
          description: `Subscription Plan Payment - Plan: ${selectedPlanData.name}, Booking ID: ${bookingId}`,
          image: "https://your-wellness-path.com/logo.png", // Replace with actual logo URL
          handler: function (response: any) {
            // Payment successful - verify subscription payment
            const paymentVerificationData = {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              bookingId: bookingId,
              subscription: true
            };
            
            verifySubscriptionPayment(paymentVerificationData)
              .then((verificationResponse: any) => {
                // Verification successful
                // Send webhook notification for successful payment
                const webhookData = {
                  paymentId: paymentVerificationData.paymentId,
                  orderId: paymentVerificationData.orderId,
                  status: 'success',
                  bookingId: bookingId,
                  timestamp: Date.now(),
                  signature: paymentVerificationData.signature
                };
                
                processPaymentWebhook(webhookData)
                  .catch(webhookError => {
                    console.error('Webhook call failed:', webhookError);
                  });
                
                // Persist plan as active subscription
                sessionStorage.setItem(
                  "qw_plan",
                  JSON.stringify({ plan: selectedPlanData, purchasedAt: Date.now(), active: true })
                );
                
                // Check for existing intake
                let stored = null;
                try {
                  const raw = sessionStorage.getItem("qw_questionnaire");
                  if (raw) stored = JSON.parse(raw);
                } catch (e) {
                  stored = null;
                }
                const RECENT_DAYS = 90;
                const now = Date.now();
                const isRecent = (ts: number | undefined | null) =>
                  ts && now - ts < RECENT_DAYS * 24 * 60 * 60 * 1000;

                // Check for any previously reserved session
                let scheduled = null;
                try {
                  const raw = sessionStorage.getItem("qw_scheduled_session");
                  if (raw) scheduled = JSON.parse(raw);
                } catch (e) {
                  scheduled = null;
                }

                if (!stored || !isRecent(stored?.updatedAt)) {
                  // Plan purchased, but intake missing or outdated: require intake to unlock sessions
                  toast.success(
                    "Payment successful! Please complete a short intake to unlock sessions."
                  );
                  // Save a pending marker to ensure plan activation after intake
                  try {
                    sessionStorage.setItem("qw_pending_plan", JSON.stringify(selectedPlanData));
                  } catch (e) {}
                  navigate("/questionnaire", { state: { planToActivate: selectedPlanData } });
                  return;
                }

                // Intake exists and is recent: assign therapist, unlock scheduled session if present & proceed
                try {
                  const therapist = {
                    id: `th-${Math.floor(Math.random() * 10000)}`,
                    name: "Assigned Clinician",
                    title: "Matched Specialist",
                    assignedAt: Date.now(),
                  };
                  sessionStorage.setItem("qw_assigned", JSON.stringify(therapist));

                  if (scheduled) {
                    scheduled.locked = false;
                    scheduled.therapist = therapist;
                    scheduled.confirmedAt = Date.now();
                    sessionStorage.setItem(
                      "qw_scheduled_session",
                      JSON.stringify(scheduled)
                    );
                  }
                } catch (e) {}

                toast.success("Payment successful! Your subscription is now active.");
                navigate("/schedule", {
                  state: {
                    ...bookingData,
                    bookingId: bookingId,
                    finalPrice,
                    fromServices: true,
                    plan: selectedPlanData
                  },
                });
              })
              .catch((error) => {
                console.error("Payment verification failed:", error);
                
                // Send webhook notification for failed verification
                const webhookData = {
                  paymentId: paymentVerificationData.paymentId,
                  orderId: paymentVerificationData.orderId,
                  status: 'failed',
                  bookingId: bookingId,
                  timestamp: Date.now(),
                  error: error.message || 'Verification failed'
                };
                
                processPaymentWebhook(webhookData)
                  .catch(webhookError => {
                    console.error('Webhook call failed:', webhookError);
                  });
                
                // Even if verification fails, proceed with the flow since payment was successful on Razorpay side
                try {
                  // Persist plan as active subscription
                  sessionStorage.setItem(
                    "qw_plan",
                    JSON.stringify({ plan: selectedPlanData, purchasedAt: Date.now(), active: true })
                  );
                  
                  // Check for existing intake
                  let stored = null;
                  try {
                    const raw = sessionStorage.getItem("qw_questionnaire");
                    if (raw) stored = JSON.parse(raw);
                  } catch (e) {
                    stored = null;
                  }
                  const RECENT_DAYS = 90;
                  const now = Date.now();
                  const isRecent = (ts: number | undefined | null) =>
                    ts && now - ts < RECENT_DAYS * 24 * 60 * 60 * 1000;

                  // Check for any previously reserved session
                  let scheduled = null;
                  try {
                    const raw = sessionStorage.getItem("qw_scheduled_session");
                    if (raw) scheduled = JSON.parse(raw);
                  } catch (e) {
                    scheduled = null;
                  }

                  if (!stored || !isRecent(stored?.updatedAt)) {
                    // Plan purchased, but intake missing or outdated: require intake to unlock sessions
                    toast.success(
                      "Payment successful! Please complete a short intake to unlock sessions."
                    );
                    // Save a pending marker to ensure plan activation after intake
                    try {
                      sessionStorage.setItem("qw_pending_plan", JSON.stringify(selectedPlanData));
                    } catch (e) {}
                    navigate("/questionnaire", { state: { planToActivate: selectedPlanData } });
                    return;
                  }

                  // Intake exists and is recent: assign therapist, unlock scheduled session if present & proceed
                  try {
                    const therapist = {
                      id: `th-${Math.floor(Math.random() * 10000)}`,
                      name: "Assigned Clinician",
                      title: "Matched Specialist",
                      assignedAt: Date.now(),
                    };
                    sessionStorage.setItem("qw_assigned", JSON.stringify(therapist));

                    if (scheduled) {
                      scheduled.locked = false;
                      scheduled.therapist = therapist;
                      scheduled.confirmedAt = Date.now();
                      sessionStorage.setItem(
                        "qw_scheduled_session",
                        JSON.stringify(scheduled)
                      );
                    }
                  } catch (e) {}

                  toast.success("Payment successful! Your subscription is now active.");
                  navigate("/schedule", {
                    state: {
                      ...bookingData,
                      bookingId: bookingId,
                      finalPrice,
                      fromServices: true,
                      plan: selectedPlanData
                    },
                  });
                } catch (innerError) {
                  console.error("Error in fallback flow:", innerError);
                  toast.error("Payment was successful but there was an issue processing your subscription. Please contact support.");
                }
              });
          },
          prefill: {
            name: "Customer",
            email: "customer@example.com",
            contact: "9999999999",
          },
          theme: {
            color: "#3b82f6",
          },
          modal: {
            ondismiss: function() {
              // Handle when user closes the payment modal without completing payment
              toast.info("Payment was cancelled. You can try again later.");
            }
          }
        };
        
        // Open Razorpay checkout
        if (typeof window !== 'undefined' && (window as any).Razorpay) {
          // Check if key exists before creating Razorpay instance
          if (!options.key || options.key === "rzp_test_1234567890") {
            toast.error("Razorpay key is not configured properly. Please contact support.");
            return;
          }
          
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } else {
          console.error("Razorpay SDK not loaded");
          toast.error("Payment gateway not loaded. Please try again.");
        }
      } else {
        toast.error("Failed to create payment order. Please try again.");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("An error occurred while processing your payment. Please try again.");
    }
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
          {loading ? (
            <div className="col-span-full text-center py-8">
              <p>Loading subscription plans...</p>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-8">
              <p className="text-destructive">Error loading subscription plans: {error}</p>
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
                className={`relative h-full cursor-pointer ₹{
                  selectedPlan === planId ? "ring-2 ring-primary" : ""
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
                        {(plan.features.length > 2 && expandedPlan[planId]?.features) ? (
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
                              [planId]: {
                                ...prev[planId],
                                features: !prev[planId].features
                              }
                            }));
                          }}>
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>
                              {expandedPlan[planId]?.features ? 'Show less' : `+${plan.features.length - 2} more features`}
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
                        {plan.services?.slice(0, 2).map((service, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>{service}</span>
                          </li>
                        ))}
                        {(plan.services && plan.services.length > 2 && expandedPlan[planId]?.services) ? (
                          plan.services.slice(2).map((service, idx) => (
                            <li key={idx + 2} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              <span>{service}</span>
                            </li>
                          ))
                        ) : null}
                        {plan.services && plan.services.length > 2 && (
                          <li className="flex items-start gap-2 text-sm text-primary font-medium cursor-pointer" onClick={(e) => {
                            e.stopPropagation();
                            setExpandedPlan(prev => ({
                              ...prev,
                              [planId]: {
                                ...prev[planId],
                                services: !prev[planId].services
                              }
                            }));
                          }}>
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>
                              {expandedPlan[planId]?.services ? 'Show less' : `+${plan.services.length - 2} more services`}
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <Button
                    variant={selectedPlan === planId ? "hero" : "outline"}
                    className="w-full mt-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(planId);
                    }}
                  >
                    {selectedPlan === planId ? "Selected" : "Select Plan"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );})
          )}
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
              
              {!isAuthenticated && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 text-center">
                  Please log in to continue with your booking
                </div>
              )}
              
              {/* CTA */}
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleContinue}
              >
                {isAuthenticated ? 'Pay Now' : 'Login to Continue'}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>


            </CardContent>

          </Card>
        </div>
      </div>
    </Layout>
  );
}
