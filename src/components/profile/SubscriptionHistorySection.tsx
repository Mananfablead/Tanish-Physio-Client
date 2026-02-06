import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

import { SubscriptionWithExpiration } from "@/types/user";

interface Subscription extends SubscriptionWithExpiration {
  endDate: string;
  nextBillingDate: string;
  autoRenew: boolean;
  status: string;
  paymentGateway: string;
  orderId: string;
  paymentId: string;
  createdAt: string;
}

interface SubscriptionHistorySectionProps {
  userSubscriptions: Subscription[];
  loading?: boolean;
  error?: string | null;
}

export function SubscriptionHistorySection({
  userSubscriptions = [],
  loading = false,
  error = null
}: SubscriptionHistorySectionProps) {
  // Handle loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase">
            Subscription History
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Complete history of your subscriptions
          </p>
        </div>
        <Card className="p-10 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
          </div>
        </Card>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase">
            Subscription History
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Complete history of your subscriptions
          </p>
        </div>
        <Card className="p-10 text-center">
          <div className="text-red-500">
            <FileText className="mx-auto h-10 w-10" />
            <h3 className="mt-4 text-lg font-bold">Error Loading Data</h3>
            <p className="text-slate-500">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

const isSubscriptionExpired = (endDate?: string) => {
  if (!endDate) return false;
  return new Date(endDate).getTime() < Date.now();
};

const getDaysUntilExpiry = (endDate?: string) => {
  if (!endDate) return null;
  return Math.ceil(
    (new Date(endDate).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  );
};


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 uppercase">
          Subscription History
        </h2>
        <p className="text-slate-500 font-medium text-sm">
          Complete history of your subscriptions
        </p>
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden md:block">
        {userSubscriptions?.length > 0 ? (
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Plan
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                      Sessions
                    </th>

                    {/* <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Payment
                    </th> */}
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {userSubscriptions.map((p: Subscription) => (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Plan */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">
                          {p.planName}
                        </div>
                        <div className="text-xs text-slate-400">
                          Plan ID: {p.planId}
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        <div>
                          Start: {" "}
                          {p.startDate
                            ? new Date(p.startDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                            : "N/A"}
                        </div>
                        <div>
                          End: {" "}
                          {p.endDate
                            ? new Date(p.endDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                            : "N/A"}
                        </div>
                        
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-right">
                        <span className="font-black text-slate-900">
                          ₹{p.amount?.toLocaleString() || 0}
                        </span>
                        {/* <div className="text-xs text-slate-500">
                          {p.currency || "INR"}
                        </div> */}
                      </td>

                      {/* Sessions */}
                      <td className="px-6 py-4 text-center">
                        {p.availableSessions ? (
                          <div className="text-sm font-bold space-y-1">
                            <div>
                              {p.availableSessions.used}/{p.availableSessions.total}
                            </div>

                            <div className="font-bold text-primary">
                              Left: {p.availableSessions.remaining}
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-400 text-xs">N/A</div>
                        )}
                      </td>


                      {/* Payment */}
                      {/* <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-slate-900">
                          {p.paymentGateway || "N/A"}
                        </div>
                        <div className="text-slate-400 text-xs">
                          Order: {p.orderId ? p.orderId.slice(-8) : "N/A"}
                        </div>
                        <div className="text-slate-400 text-xs">
                          Pay ID: {p.paymentId ? p.paymentId.slice(-8) : "N/A"}
                        </div>
                      </td> */}

                      {/* Status */}
                     <td className="px-6 py-4 text-center">
  {(() => {
    const expired = isSubscriptionExpired(p.endDate);
    const daysLeft = getDaysUntilExpiry(p.endDate);

    return (
      <div className="space-y-1 flex flex-col">
        {/* MAIN STATUS */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-black uppercase
            ${
              expired
                ? "bg-red-100 text-red-700"
                : p.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }
          `}
        >
          {expired ? "EXPIRED" : p.status || "UNKNOWN"}
        </span>

        {/* EXPIRY INFO */}
        {p.endDate && (
          expired ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
              Expired on {" "}
              {new Date(p.endDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          ) : daysLeft !== null && daysLeft <= 7 ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
              Expires in {daysLeft} day{daysLeft > 1 ? "s" : ""}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
              Valid till {" "}
              {new Date(p.endDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )
        )}
      </div>
    );
  })()}
</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-black text-slate-900">
              No Subscription History
            </h3>
            <p className="text-slate-500 font-medium mt-2">
              You haven't purchased any plans yet.
            </p>
          </Card>
        )}
      </div>
      
      {/* MOBILE CARD VIEW */}
      <div className="md:hidden">
        {userSubscriptions?.length > 0 ? (
          <div className="space-y-4">
            {userSubscriptions.map((p: Subscription) => (
              <Card key={p._id} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {p.planName}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Plan ID: {p.planId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">₹{p.amount?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500">Start Date</p>
                      <p className="text-sm text-slate-900">
                        {p.startDate
                          ? new Date(p.startDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">End Date</p>
                      <p className="text-sm text-slate-900">
                        {p.endDate
                          ? new Date(p.endDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-slate-100">
                    <div className="space-y-1 flex flex-col">
                      {(() => {
                        const expired = isSubscriptionExpired(p.endDate);
                        const daysLeft = getDaysUntilExpiry(p.endDate);

                        return (
                          <>
                            {/* MAIN STATUS */}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-black uppercase
                                ${
                                  expired
                                      ? "bg-red-100 text-red-700"
                                      : p.status === "active"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-yellow-100 text-yellow-700"
                                }
                              `}
                            >
                              {expired ? "EXPIRED" : p.status || "UNKNOWN"}
                            </span>

                            {/* EXPIRY INFO */}
                            {p.endDate && (
                              expired ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                                  Expired on {" "}
                                  {new Date(p.endDate).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              ) : daysLeft !== null && daysLeft <= 7 ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                  Expires in {daysLeft} day{daysLeft > 1 ? "s" : ""}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                                  Valid till {" "}
                                  {new Date(p.endDate).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              )
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  
                  {p.availableSessions && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-xs text-slate-500">Used</p>
                          <p className="text-sm font-bold text-slate-900">{p.availableSessions.used}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500">Total</p>
                          <p className="text-sm font-bold text-slate-900">{p.availableSessions.total}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500">Left</p>
                          <p className="text-sm font-bold text-primary">{p.availableSessions.remaining}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-black text-slate-900">
              No Subscription History
            </h3>
            <p className="text-slate-500 font-medium mt-2">
              You haven't purchased any plans yet.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}