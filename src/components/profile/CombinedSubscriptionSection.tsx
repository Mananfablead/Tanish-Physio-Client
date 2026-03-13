import { useState } from "react";
import { ActivePlanSection } from "./ActivePlanSection";
import { SubscriptionHistorySection } from "./SubscriptionHistorySection";
import { BadgeCheck, ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils";

interface CombinedSubscriptionSectionProps {
  activePlan: any;
  userSubscriptions: any[];
  loading?: boolean;
  error?: string | null;
  onPlanSelect?: (plan: any) => void;
  user?: any;
}

type TabType = "active" | "history";

export function CombinedSubscriptionSection({
  activePlan,
  userSubscriptions,
  loading = false,
  error = null,
  onPlanSelect,
  user,
}: CombinedSubscriptionSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>("active");

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("active")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all",
              activeTab === "active"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <BadgeCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Active Plan</span>
            <span className="sm:hidden">Active</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all",
              activeTab === "history"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <ReceiptText className="h-4 w-4" />
            <span className="hidden sm:inline">Subscription History</span>
            <span className="sm:hidden">History</span>
          </button>
        </div>

        {/* Count Badges */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "px-4 py-1.5 rounded-full border font-bold text-xs transition-all",
              activeTab === "active"
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-white text-slate-600 border-slate-200"
            )}
          >
            {activePlan ? "1 Active" : "No Active"}
          </div>
          <div
            className={cn(
              "px-4 py-1.5 rounded-full border font-bold text-xs transition-all",
              activeTab === "history"
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-white text-slate-600 border-slate-200"
            )}
          >
            {userSubscriptions?.length || 0} Total
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-300">
        {activeTab === "active" ? (
          <ActivePlanSection 
            activePlan={activePlan} 
            onPlanSelect={onPlanSelect}
          />
        ) : (
          <SubscriptionHistorySection 
            userSubscriptions={userSubscriptions}
            loading={loading}
            error={error}
            user={user}
          />
        )}
      </div>
    </div>
  );
}
