import { useState } from "react";
import { SessionHistorySection } from "./SessionHistorySection";
import { BookingsSection } from "./BookingsSection";
import { CalendarDays, NotebookTabs } from "lucide-react";
import { cn } from "@/lib/utils";
import { GoogleMeetDisplay } from "./GoogleMeetDisplay";

interface CombinedHistorySectionProps {
  sessions: any[];
  bookingList: any[];
  onReschedule: (session: any) => void;
}

type TabType = "sessions" | "bookings";

export function CombinedHistorySection({
  sessions,
  bookingList,
  onReschedule,
}: CombinedHistorySectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>("bookings");

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100/50 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("bookings")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all",
              activeTab === "bookings"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            <NotebookTabs className="h-4 w-4" />
            <span className="hidden sm:inline">Service Bookings</span>
            <span className="sm:hidden">Bookings</span>
          </button>

          <button
            onClick={() => setActiveTab("sessions")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all",
              activeTab === "sessions"
                ? "bg-white text-primary shadow-sm"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Session History</span>
            <span className="sm:hidden">Sessions</span>
          </button>
        </div>

        {/* Count Badges */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "px-4 py-1.5 rounded-full border font-bold text-xs transition-all",
              activeTab === "sessions"
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-white text-slate-600 border-slate-200",
            )}
          >
            {sessions?.length || 0} Sessions
          </div>
          <div
            className={cn(
              "px-4 py-1.5 rounded-full border font-bold text-xs transition-all",
              activeTab === "bookings"
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-white text-slate-600 border-slate-200",
            )}
          >
            {bookingList?.length || 0} Bookings
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-300">
        {activeTab === "sessions" ? (
          <div className="space-y-4">
            <SessionHistorySection
              sessions={sessions}
              onReschedule={onReschedule}
            />
            {/* Display Google Meet links for recent sessions */}
            {sessions &&
              sessions
                .slice(0, 3)
                .map((session) => (
                  <GoogleMeetDisplay
                    key={session._id}
                    sessionId={session._id}
                    className="mt-4"
                  />
                ))}
          </div>
        ) : (
          <BookingsSection bookingList={bookingList} />
        )}
      </div>
    </div>
  );
}
