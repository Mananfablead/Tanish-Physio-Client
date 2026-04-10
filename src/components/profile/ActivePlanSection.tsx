import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, Calendar, Activity, BarChart3, RefreshCw, CreditCard, FileText, CheckCircle, ArrowRight, User, Users } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useAppDispatch } from "@/store";
import { fetchSubscriptionPlans } from "@/store/slices/subscriptionSlice";
import { useSelector } from "react-redux";
import { Check } from "lucide-react";
import { getCountryFromIP } from "@/services/ipLocationService";

interface ActivePlanSectionProps {
  activePlan: any;
  onPlanSelect?: (plan: any) => void;
}

export function ActivePlanSection({
  activePlan,
  onPlanSelect,
}: ActivePlanSectionProps) {
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"individual" | "group">(
    "individual",
  );
  // Default to INR - will be updated by useEffect if needed
  const [currencySymbol, setCurrencySymbol] = useState<"₹" | "$">("₹");
  const [currencyCode, setCurrencyCode] = useState<"INR" | "USD">("INR");

  // Detect currency on mount using your backend API
  useEffect(() => {
    const checkCurrency = async () => {
      try {
        const countryCode = await getCountryFromIP();

        if (countryCode === "IN") {
          setCurrencySymbol("₹");
          setCurrencyCode("INR");
        } else {
          setCurrencySymbol("$");
          setCurrencyCode("USD");
        }
      } catch (error) {
        console.warn("Currency detection failed, using INR");
        setCurrencySymbol("₹");
        setCurrencyCode("INR");
      }
    };

    checkCurrency();
  }, []);

  const { plans, loading, error } = useSelector(
    (state: any) => state.subscriptions,
  );

  useEffect(() => {
    dispatch(fetchSubscriptionPlans(undefined));
  }, [dispatch]);

  const InfoBlock = ({
    label,
    value,
    subValue,
    icon: Icon,
    iconColor = "text-primary",
  }: {
    label: string;
    value: React.ReactNode;
    subValue?: string;
    icon: any;
    iconColor?: string;
  }) => (
    <div className="rounded-xl border border-slate-100 bg-slate-100 p-2 flex gap-3 items-start transition-all hover:bg-slate-200">
      <div
        className={`h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0`}
      >
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">
          {label}
        </p>
        <div className="font-black text-slate-900 truncate">{value}</div>
        {subValue && (
          <p className="text-xs font-bold text-primary mt-0.5">{subValue}</p>
        )}
      </div>
    </div>
  );
  const isExpired =
    activePlan?.endDate && new Date(activePlan.endDate).getTime() < Date.now();

  // Calculate availableSessions if not provided
  const availableSessions =
    activePlan?.availableSessions ||
    (() => {
      if (activePlan?.totalService && typeof activePlan.sessions === "number") {
        const total = activePlan.totalService;
        const remaining = activePlan.sessions;
        const used = total - remaining;
        const percentageUsed = total > 0 ? Math.round((used / total) * 100) : 0;
        return {
          total,
          used,
          remaining,
          percentageUsed,
        };
      }
      return null;
    })();

  return (
    <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[260px] flex flex-col justify-between overflow-hidden">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
            Active Plan
          </h3>
          {activePlan && (
            <Badge
              className={`border-none font-bold ${
                isExpired
                  ? "bg-destructive/10 text-destructive"
                  : "bg-success/10 text-success"
              }`}
            >
              {isExpired ? "EXPIRED" : "ACTIVE"}
            </Badge>
          )}
        </div>

        {activePlan ? (
          <div className="space-y-6">
            {/* Header with enhanced design */}
            <div className="bg-gradient-to-r from-primary/5 to-blue-50 p-6 rounded-2xl border border-primary/10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Star className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900">
                      {activePlan?.planName || "Subscription Plan"}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <Badge
                      variant="secondary"
                      className={
                        isExpired
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }
                    >
                      {isExpired ? "Expired" : "Active"}
                    </Badge>

                    <span className="text-slate-500 font-medium">
                      Payment via {activePlan?.paymentGateway || "Razorpay"}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-500">
                      ID: {activePlan?._id?.slice(-6) || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl md:text-4xl font-black text-primary mb-1">
                    {currencySymbol}
                    {activePlan?.finalAmount?.toLocaleString() ??
                      activePlan?.amount?.toLocaleString() ??
                      0}
                  </div>
                  {/* {activePlan?.discountAmount > 0 && (
                    <div className="text-slate-500 text-sm line-through">
                      {currencySymbol}{activePlan?.amount?.toLocaleString()}
                    </div>
                  )} */}
                  <div className="text-slate-500 font-semibold uppercase tracking-wider text-xs">
                    {activePlan?.currency || currencyCode}
                  </div>
                  {activePlan?.couponCode && (
                    <div className="text-success text-xs font-medium mt-1">
                      Coupon: {activePlan.couponCode}
                    </div>
                  )}
                  <div className="text-slate-400 text-xs mt-1">
                    {activePlan?.planId || "Plan ID"}
                  </div>
                </div>
              </div>
            </div>

            {/* Session Usage Progress */}
            {availableSessions && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Session Usage
                </h3>

                <div className="space-y-4">
                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-slate-700">
                        Sessions Used: {availableSessions.used}/
                        {availableSessions.total}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {availableSessions.percentageUsed}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          availableSessions.percentageUsed >= 90
                            ? "bg-destructive"
                            : availableSessions.percentageUsed >= 70
                              ? "bg-warning"
                              : "bg-primary"
                        }`}
                        style={{
                          width: `${availableSessions.percentageUsed}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      {availableSessions.remaining > 0 ? (
                        <span>
                          {availableSessions.remaining} sessions remaining
                        </span>
                      ) : (
                        <span className="text-destructive font-medium">
                          All sessions used
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Detailed session info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                    <div className="text-center p-3 bg-primary/5 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {availableSessions.total}
                      </div>
                      <div className="text-xs text-slate-500">
                        Total Sessions
                      </div>
                    </div>
                    <div className="text-center p-3 bg-success/5 rounded-lg">
                      <div className="text-2xl font-bold text-success">
                        {availableSessions.used}
                      </div>
                      <div className="text-xs text-slate-500">Used</div>
                    </div>
                    <div className="text-center p-3 bg-warning/5 rounded-lg">
                      <div className="text-2xl font-bold text-warning">
                        {availableSessions.remaining}
                      </div>
                      <div className="text-xs text-slate-500">Remaining</div>
                    </div>
                    <div className="text-center p-3 bg-info/5 rounded-lg">
                      <div className="text-2xl font-bold text-info">
                        {availableSessions.percentageUsed}%
                      </div>
                      <div className="text-xs text-slate-500">Utilization</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoBlock
                label="Start Date"
                value={
                  activePlan?.startDate
                    ? new Date(activePlan.startDate).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )
                    : "-"
                }
                icon={Clock}
                iconColor="text-warning"
              />

              <InfoBlock
                label="Valid Till"
                value={
                  activePlan?.endDate
                    ? new Date(activePlan.endDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "-"
                }
                icon={Calendar}
                iconColor="text-destructive"
              />

              <InfoBlock
                label="Auto Renew"
                value={
                  activePlan?.autoRenew !== undefined
                    ? !activePlan.autoRenew
                      ? "Enabled"
                      : "Disabled"
                    : "Enabled"
                }
                icon={Activity}
                iconColor="text-success"
              />

              {/* <InfoBlock
                label="Next Billing"
                value={
                  activePlan?.nextBillingDate
                    ? new Date(activePlan.nextBillingDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })
                    : "-"
                }
                icon={RefreshCw}
                iconColor="text-info"
              />

              <InfoBlock
                label="Payment ID"
                value={
                  activePlan?.paymentId
                    ? activePlan.paymentId.slice(-8)
                    : "-"
                }
                icon={CreditCard}
                iconColor="text-primary"
              />

              <InfoBlock
                label="Order ID"
                value={
                  activePlan?.orderId
                    ? activePlan.orderId.slice(-8)
                    : "-"
                }
                icon={FileText}
                iconColor="text-slate-600"
              /> */}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <Star className="h-8 w-8 text-slate-300" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">
                No Active Plan
              </h3>
              <p className="text-slate-500 font-medium max-w-xs mx-auto">
                Get started with a wellness plan tailored to your recovery
                goals.
              </p>
            </div>
            <button
              className="h-11 rounded-xl bg-primary hover:bg-primary/90 px-8 font-black text-white"
              onClick={() => setIsModalOpen(true)}
            >
              Explore Our Plans
            </button>
          </div>
        )}
        {/* Subscription Plans Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="p-6 pb-4 border-b">
              <DialogTitle className="text-2xl font-bold text-center">
                Choose Your Wellness Plan
              </DialogTitle>
              <DialogDescription className="text-center text-slate-600">
                Select the perfect plan for your recovery journey
              </DialogDescription>
            </DialogHeader>

            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500 font-medium">
                    Failed to load plans: {error}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => dispatch(fetchSubscriptionPlans(undefined))}
                  >
                    Retry
                  </Button>
                </div>
              ) : plans && plans.length > 0 ? (
                <Tabs
                  value={activeTab}
                  onValueChange={(value) =>
                    setActiveTab(value as "individual" | "group")
                  }
                  className="w-full"
                >
                  <TabsList className="flex w-full bg-gray-100 p-1 rounded-full mb-8">
                    <TabsTrigger
                      value="individual"
                      className="flex-1 flex items-center justify-center gap-2
               py-2.5 rounded-full text-sm font-medium
               text-gray-600 transition-all duration-300
               data-[state=active]:bg-white
               data-[state=active]:text-gray-900
               data-[state=active]:shadow-sm"
                    >
                      <User className="w-5 h-5" />
                      Individual Sessions
                    </TabsTrigger>

                    <TabsTrigger
                      value="group"
                      className="flex-1 flex items-center justify-center gap-2
               py-2.5 rounded-full text-sm font-medium
               text-gray-600 transition-all duration-300
               data-[state=active]:bg-white
               data-[state=active]:text-gray-900
               data-[state=active]:shadow-sm"
                    >
                      <Users className="w-5 h-5" />
                      Group Sessions
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="individual" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {plans
                        .filter(
                          (plan: any) => plan.session_type === "individual",
                        )
                        .map((plan: any) => (
                          <Card
                            key={plan._id || plan.id}
                            className="flex flex-col h-full border-2 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="p-6 flex-1">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-slate-900">
                                  {plan.name}
                                </h3>
                                <Badge variant="secondary" className="text-xs">
                                  Individual
                                </Badge>
                              </div>

                              <div className="mb-6">
                                <div className="text-3xl font-black text-primary mb-1">
                                  {currencySymbol}
                                  {plan.price?.toLocaleString()}
                                </div>
                                <div className="text-slate-500 text-sm">
                                  {plan.duration}
                                </div>
                              </div>

                              <p className="text-slate-600 text-sm mb-6 line-clamp-2">
                                {plan.description}
                              </p>

                              <ul className="space-y-3 mb-6 flex-1">
                                {plan.features
                                  ?.slice(0, 5)
                                  .map((feature: string, index: number) => (
                                    <li
                                      key={index}
                                      className="flex items-start gap-3"
                                    >
                                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                      <span className="text-sm text-slate-700">
                                        {feature}
                                      </span>
                                    </li>
                                  ))}
                              </ul>
                            </div>

                            <div className="p-6 pt-0">
                              <Button
                                className="w-full h-12 text-base font-semibold rounded-xl"
                                onClick={() => {
                                  setIsModalOpen(false);
                                  // Call the provided callback or fallback to default navigation
                                  if (onPlanSelect) {
                                    onPlanSelect(plan);
                                  }
                                }}
                              >
                                Select Plan
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                    </div>
                    {plans.filter(
                      (plan: any) => plan.session_type === "individual",
                    ).length === 0 && (
                      <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                          <User className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                          No Individual Plans Available
                        </h3>
                        <p className="text-slate-500">
                          Please check back later or contact support.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="group" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {plans
                        .filter((plan: any) => plan.session_type === "group")
                        .map((plan: any) => (
                          <Card
                            key={plan._id || plan.id}
                            className="flex flex-col h-full border-2 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="p-6 flex-1">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-slate-900">
                                  {plan.name}
                                </h3>
                                <Badge variant="secondary" className="text-xs">
                                  Group
                                </Badge>
                              </div>

                              <div className="mb-6">
                                <div className="text-3xl font-black text-primary mb-1">
                                  {currencySymbol}
                                  {plan.price?.toLocaleString()}
                                </div>
                                <div className="text-slate-500 text-sm">
                                  {plan.duration}
                                </div>
                              </div>

                              <p className="text-slate-600 text-sm mb-6 line-clamp-2">
                                {plan.description}
                              </p>

                              <ul className="space-y-3 mb-6 flex-1">
                                {plan.features
                                  ?.slice(0, 5)
                                  .map((feature: string, index: number) => (
                                    <li
                                      key={index}
                                      className="flex items-start gap-3"
                                    >
                                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                      <span className="text-sm text-slate-700">
                                        {feature}
                                      </span>
                                    </li>
                                  ))}
                              </ul>
                            </div>

                            <div className="p-6 pt-0">
                              <Button
                                className="w-full h-12 text-base font-semibold rounded-xl"
                                onClick={() => {
                                  setIsModalOpen(false);
                                  // Call the provided callback or fallback to default navigation
                                  if (onPlanSelect) {
                                    onPlanSelect(plan);
                                  }
                                }}
                              >
                                Select Plan
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                    </div>
                    {plans.filter((plan: any) => plan.session_type === "group")
                      .length === 0 && (
                      <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                          <Users className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                          No Group Plans Available
                        </h3>
                        <p className="text-slate-500">
                          Please check back later or contact support.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Star className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    No Plans Available
                  </h3>
                  <p className="text-slate-500">
                    Please check back later or contact support.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}
