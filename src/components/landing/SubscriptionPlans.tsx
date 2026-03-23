import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ArrowRight,
  Users,
  IndianRupee,
  DollarSign,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getPriceByLocationSync } from "@/utils/priceUtils";

interface SubscriptionPlansProps {
  subscriptionPlans: any[];
  subscriptionLoading: boolean;
  subscriptionError: string | null;
  onTabChange?: (tab: "individual" | "group") => void;
}

export const SubscriptionPlans = ({
  subscriptionPlans,
  subscriptionLoading,
  subscriptionError,
  onTabChange,
}: SubscriptionPlansProps) => {
  const [activeTab, setActiveTab] = useState<"individual" | "group">(
    "individual",
  );

  // Currency state
  const [currencySymbol, setCurrencySymbol] = useState<"₹" | "$">("₹");
  const [currencyCode, setCurrencyCode] = useState<"INR" | "USD">("INR");

  // Detect currency on mount using your backend API
  useEffect(() => {
    const checkCurrency = async () => {
      try {
        const { getCountryFromIP } =
          await import("@/services/ipLocationService");
        const countryCode = await getCountryFromIP();

        console.log("💳 Subscription Currency Detection:", {
          countryCode: countryCode || "Not detected",
        });

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

  // Debug: Log plan prices
  useEffect(() => {
    console.log(
      "💳 Subscription Plans - Dual Currency Display:",
      subscriptionPlans.map((plan) => ({
        name: plan.name,
        price_inr: plan.price_inr,
        price_usd: plan.price_usd,
        priceINR: plan.priceINR,
        priceUSD: plan.priceUSD,
        oldPrice: plan.price,
      })),
    );
  }, [subscriptionPlans]);

  // Handle tab change
  const handleTabChange = (tab: "individual" | "group") => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab); // Parent ko notify karega
    }
  };

  return (
    <section className="py-12 bg-muted/30">
      <div className="container">
        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="secondary" className="mb-4">
            Consultation Options
          </Badge>

          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Choose Your Recovery Plan
          </h2>

          <p className="text-muted-foreground">
            Flexible and transparent options designed to support your
            personalized recovery journey.
          </p>
        </div>

        {/* TABS */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-lg border bg-muted p-1">
            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "individual"
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => handleTabChange("individual")}
            >
              Individual
            </button>

            <button
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "group"
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => handleTabChange("group")}
            >
              Group
            </button>
          </div>
        </div>

        {/* PLANS GRID */}
        <div
          className={`${
            subscriptionPlans.length === 1
              ? "flex justify-center"
              : subscriptionPlans.length === 2
                ? "flex flex-col md:flex-row justify-center gap-8"
                : "grid md:grid-cols-3 gap-8"
          } max-w-6xl mx-auto`}
        >
          {subscriptionLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">
                Loading subscription plans...
              </p>
            </div>
          ) : subscriptionError ? (
            <div className="col-span-full text-center text-destructive py-10">
              {subscriptionError}
            </div>
          ) : subscriptionPlans.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                No {activeTab} Plans Available
              </h3>
              <p className="text-muted-foreground">
                We don't have any {activeTab} subscription plans available at
                the moment.
              </p>
            </div>
          ) : (
            subscriptionPlans.slice(0, 3).map((plan: any) => {
              const planId = plan.planId || plan.id;
              const highlight = plan.popular;

              return (
                <motion.div
                  key={planId}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <Card
                    className={`relative h-full p-8 flex flex-col ${
                      highlight
                        ? "border-primary shadow-xl scale-105 z-10"
                        : "border-border shadow-md"
                    }`}
                  >
                    {/* {highlight && (
                      <Badge className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground">
                        Best Value
                      </Badge>
                    )} */}

                    {/* PLAN TITLE */}
                    <div className="mb-6 text-center">
                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>

                      {/* Dynamic Price Display - Country Based */}
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {/* Currency Icon */}
                        {currencySymbol === "₹" ? (
                          <IndianRupee className="h-8 w-8 text-emerald-600" />
                        ) : (
                          <DollarSign className="h-8 w-8 text-emerald-600" />
                        )}

                        {/* Price */}
                        <span
                          className={`text-4xl font-bold ${
                            currencySymbol === "₹"
                              ? "text-emerald-700"
                              : "text-emerald-700"
                          }`}
                        >
                          {(() => {
                            if (currencyCode === "INR") {
                              // Try both field names (underscore and camelCase)
                              const priceINR = plan.price_inr ?? plan.priceINR;
                              if (priceINR !== undefined && priceINR > 0) {
                                return priceINR.toLocaleString();
                              }
                              return (plan.price || 0).toLocaleString();
                            } else {
                              // Try both field names (underscore and camelCase)
                              const priceUSD = plan.price_usd ?? plan.priceUSD;
                              if (priceUSD !== undefined && priceUSD > 0) {
                                return priceUSD.toLocaleString();
                              }
                              return "0";
                            }
                          })()}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          /{plan.duration}
                        </span>
                      </div>

                      {/* Currency Code Badge */}
                      {/* <Badge variant={currencyCode === "INR" ? "secondary" : "outline"} className="mt-2">
                        {currencyCode === "INR" ? `INR: ₹` : `USD: $`}{(() => {
                          if (currencyCode === "INR") {
                            // Try both field names (underscore and camelCase)
                            const priceINR = plan.price_inr ?? plan.priceINR;
                            if (priceINR !== undefined && priceINR > 0) {
                              return priceINR.toLocaleString();
                            }
                            return (plan.price || 0).toLocaleString();
                          } else {
                            // Try both field names (underscore and camelCase)
                            const priceUSD = plan.price_usd ?? plan.priceUSD;
                            if (priceUSD !== undefined && priceUSD > 0) {
                              return priceUSD.toLocaleString();
                            }
                            return '0';
                          }
                        })()}
                      </Badge> */}
                    </div>

                    {/* FEATURES */}
                    <ul className="space-y-3 mb-8 flex-grow">
                      {plan.features
                        ?.slice(0, 4)
                        .map((feature: string, i: number) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <span>{feature}</span>
                          </li>
                        ))}
                    </ul>

                    {/* CTA */}
                    <Link to={`/plans?tab=${activeTab}`} className="w-full">
                      <button
                        className={`w-full rounded-md px-4 py-3 text-sm font-medium transition ${
                          highlight
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border border-input bg-background hover:bg-accent"
                        }`}
                      >
                        {highlight
                          ? "Choose Plan"
                          : `Select ${plan.name.split(" ")[0]}`}
                      </button>
                    </Link>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        {/* VIEW ALL */}
        <div className="mt-16 text-center">
          <Link
            to={`/plans?tab=${activeTab}`}
            className="inline-flex items-center justify-center text-sm font-medium text-primary hover:underline px-3 py-2 min-h-[44px] min-w-[44px] rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            View All Detailed Plans & Benefits
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};
