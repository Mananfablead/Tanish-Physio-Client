import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Lock, 
  Shield, 
  CheckCircle,
  Calendar,
  Clock,
  User,
  Wallet
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const therapist = bookingData?.therapist || {
    name: "Dr. Sarah Johnson",
    title: "Sports Injury Specialist",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
  };

  const session = bookingData?.session || {
    type: "1-on-1",
    duration: "45 min",
    price: 80,
  };

  const plan = bookingData?.plan || {
    name: "Monthly Plan",
    price: 199,
    duration: "30 days",
  };
  const planProvided = !!bookingData?.plan;

  const date = bookingData?.date || "Mon, Dec 30";
  const time = bookingData?.time || "10:00";
  const promoApplied = bookingData?.promoApplied || false;

  const finalPrice = promoApplied ? Math.round(plan.price * 0.8) : plan.price;

  // Check stored intake
  let storedIntake = null;
  try {
    const raw = sessionStorage.getItem("qw_questionnaire");
    if (raw) storedIntake = JSON.parse(raw);
  } catch (e) { storedIntake = null; }

  const RECENT_DAYS = 90;
  const now = Date.now();
  const intakeIsRecent = storedIntake && storedIntake.updatedAt && (now - storedIntake.updatedAt) < RECENT_DAYS * 24 * 60 * 60 * 1000;

  const handlePayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      // Persist plan as active subscription
      try {
        sessionStorage.setItem("qw_plan", JSON.stringify({ plan, purchasedAt: Date.now(), active: true }));
      } catch (e) {}

      // Check for existing intake
      let stored = null;
      try { const raw = sessionStorage.getItem("qw_questionnaire"); if (raw) stored = JSON.parse(raw); } catch (e) { stored = null; }
      const RECENT_DAYS = 90;
      const now = Date.now();
      const isRecent = (ts: number | undefined | null) => ts && (now - ts) < RECENT_DAYS * 24 * 60 * 60 * 1000;

      // Check for any previously reserved session (from intake-first scheduling)
      let scheduled = null;
      try { const raw = sessionStorage.getItem('qw_scheduled_session'); if (raw) scheduled = JSON.parse(raw); } catch (e) { scheduled = null; }

      if (!stored || !isRecent(stored?.updatedAt)) {
        // Plan purchased, but intake missing or outdated: require intake to unlock sessions
        toast.success("Payment successful! Please complete a short intake to unlock sessions.");
        // Save a pending marker to ensure plan activation after intake
        try { sessionStorage.setItem("qw_pending_plan", JSON.stringify(plan)); } catch (e) {}
        navigate("/questionnaire", { state: { planToActivate: plan } });
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
          sessionStorage.setItem('qw_scheduled_session', JSON.stringify(scheduled));
        }
      } catch (e) {}

      toast.success("Payment successful! Redirecting to your dashboard...");
      navigate("/booking-confirmation", { state: { ...bookingData, finalPrice } });
    }, 2000);
  };

  return (
    <Layout>
      <div className="bg-muted/30 py-8">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
              <p className="text-muted-foreground">
                Review your session details and complete payment
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1 rounded-lg text-sm font-black ${
                  intakeIsRecent
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-yellow-50 text-yellow-800"
                }`}
              >
                {intakeIsRecent ? "Intake: Complete" : "Intake: Required"}
              </div>
              <div
                className={`px-3 py-1 rounded-lg text-sm font-black ${
                  sessionStorage.getItem("qw_plan")
                    ? "bg-primary/10 text-primary"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {sessionStorage.getItem("qw_plan")
                  ? "Plan: Active"
                  : "Plan: Not Purchased"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  {[
                    {
                      value: "card",
                      label: "Credit / Debit Card",
                      icon: CreditCard,
                    },
                    { value: "paypal", label: "PayPal", icon: Wallet },
                    { value: "apple", label: "Apple Pay", icon: Wallet },
                  ].map((method) => (
                    <div key={method.value}>
                      <RadioGroupItem
                        value={method.value}
                        id={method.value}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={method.value}
                        className="flex items-center gap-3 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                      >
                        <method.icon className="h-5 w-5 text-primary" />
                        {method.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {paymentMethod === "card" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-6 space-y-4"
                  >
                    <div>
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input
                        id="cardName"
                        placeholder="John Doe"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <div className="relative mt-2">
                        <Input
                          id="cardNumber"
                          placeholder="4242 4242 4242 4242"
                        />
                        <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvc">CVC</Label>
                        <Input id="cvc" placeholder="123" className="mt-2" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card variant="outline">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Secure Payment</p>
                    <p className="text-xs text-muted-foreground">
                      Your payment is encrypted and secure. We never store your
                      card details.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Therapist */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <img
                    src={therapist.avatar}
                    alt={therapist.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium">{therapist.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {therapist.title}
                    </p>
                  </div>
                </div>

                {/* Session Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {session.type} Session ({session.duration})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{time}</span>
                  </div>
                </div>

                <Separator />

                {/* Plan */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{plan.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {plan.duration}
                    </p>
                  </div>
                  <p className="font-semibold">₹{plan.price}</p>
                </div>

                {promoApplied && (
                  <div className="flex justify-between items-center text-success">
                    <span className="text-sm">Promo Discount (20%)</span>
                    <span>-₹{Math.round(plan.price * 0.2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-bold text-2xl text-primary">
                    ₹{finalPrice}
                  </span>
                </div>

                {!planProvided ? (
                  <>
                    <div className="p-3 rounded-md bg-blue-50 border border-blue-100 text-blue-800 text-sm mb-4">
                      You can reserve this session now, then select a plan to
                      unlock it.
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full mb-3"
                      onClick={() => {
                        // reserve session and redirect to plans
                        const reserved = {
                          therapist,
                          session,
                          date,
                          time,
                          reservedAt: Date.now(),
                          locked: true,
                        };
                        try {
                          sessionStorage.setItem(
                            "qw_scheduled_session",
                            JSON.stringify(reserved)
                          );
                        } catch (e) {}
                        navigate("/plans", {
                          state: { fromReservation: true },
                        });
                      }}
                    >
                      Reserve Session
                    </Button>
                  </>
                ) : (
                  <>
                    {!intakeIsRecent && (
                      <div className="p-3 rounded-md bg-yellow-50 border border-yellow-100 text-yellow-800 text-sm mb-4">
                        We noticed you don't have a recent intake on file. After
                        payment you'll be prompted to complete the intake to
                        unlock sessions.
                      </div>
                    )}

                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full"
                      onClick={handlePayment}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Pay ₹{finalPrice}
                        </>
                      )}
                    </Button>
                  </>
                )}
                <p className="text-xs text-center text-muted-foreground">
                  By completing this purchase, you agree to our Terms of
                  Service.
                </p>
              </CardContent>
            </Card>

            {/* Cancellation Policy */}
            <Card variant="outline">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Cancellation Policy</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                    Free cancellation up to 24 hours before session
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                    Cancel subscription anytime, no hidden fees
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
