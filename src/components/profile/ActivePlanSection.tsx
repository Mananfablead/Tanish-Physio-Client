import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Calendar, Activity, BarChart3, RefreshCw, CreditCard, FileText } from "lucide-react";
import { Link } from "react-router-dom";

interface ActivePlanSectionProps {
  activePlan: any;
}

export function ActivePlanSection({ activePlan }: ActivePlanSectionProps) {
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

  return (
    <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[260px] flex flex-col justify-between overflow-hidden">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
            Active Plan
          </h3>
          {activePlan && (
            <Badge className="bg-success/10 text-success border-none font-bold">
              ACTIVE
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
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {activePlan?.status?.charAt(0).toUpperCase() + activePlan?.status?.slice(1) || "Inactive"}
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
                    ₹{activePlan?.amount?.toLocaleString() ?? 0}
                  </div>
                  <div className="text-slate-500 font-semibold uppercase tracking-wider text-xs">
                    {activePlan?.currency || "INR"}
                  </div>
                  <div className="text-slate-400 text-xs mt-1">
                    {activePlan?.planId || "Plan ID"}
                  </div>
                </div>
              </div>
            </div>

            {/* Session Usage Progress */}
            {activePlan?.availableSessions && (
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
                        Sessions Used: {activePlan.availableSessions.used}/{activePlan.availableSessions.total}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {activePlan.availableSessions.percentageUsed}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          activePlan.availableSessions.percentageUsed >= 90 
                            ? "bg-destructive" 
                            : activePlan.availableSessions.percentageUsed >= 70 
                            ? "bg-warning" 
                            : "bg-primary"
                        }`}
                        style={{ width: `${activePlan.availableSessions.percentageUsed}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                      {activePlan.availableSessions.remaining > 0 ? (
                        <span>{activePlan.availableSessions.remaining} sessions remaining</span>
                      ) : (
                        <span className="text-destructive font-medium">All sessions used</span>
                      )}
                    </div>
                  </div>

                  {/* Detailed session info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                    <div className="text-center p-3 bg-primary/5 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{activePlan.availableSessions.total}</div>
                      <div className="text-xs text-slate-500">Total Sessions</div>
                    </div>
                    <div className="text-center p-3 bg-success/5 rounded-lg">
                      <div className="text-2xl font-bold text-success">{activePlan.availableSessions.used}</div>
                      <div className="text-xs text-slate-500">Used</div>
                    </div>
                    <div className="text-center p-3 bg-warning/5 rounded-lg">
                      <div className="text-2xl font-bold text-warning">{activePlan.availableSessions.remaining}</div>
                      <div className="text-xs text-slate-500">Remaining</div>
                    </div>
                    <div className="text-center p-3 bg-info/5 rounded-lg">
                      <div className="text-2xl font-bold text-info">{activePlan.availableSessions.percentageUsed}%</div>
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
                    ? new Date(activePlan.startDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : "-"
                }
                icon={Clock}
                iconColor="text-warning"
              />

              <InfoBlock
                label="Valid Till"
                value={
                  activePlan?.endDate
                    ? new Date(activePlan.endDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
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
                    ? activePlan.autoRenew
                      ? "Enabled"
                      : "Disabled"
                    : "Enabled"
                }
                icon={Activity}
                iconColor="text-success"
              />

              <InfoBlock
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
              />
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
                Get started with a wellness plan tailored to your
                recovery goals.
              </p>
            </div>
            <button
              className="h-11 rounded-xl bg-primary hover:bg-primary/90 px-8 font-black text-white"
            >
              <Link to="/plans">Explore Our Plans</Link>
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}