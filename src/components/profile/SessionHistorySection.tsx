import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Play,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  Calendar,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

interface SessionHistorySectionProps {
  sessions: any[];
  onReschedule: (session: any) => void;
}

const ITEMS_PER_PAGE = 5; // Adjust this number as needed

export function SessionHistorySection({
  sessions,
  onReschedule,
}: SessionHistorySectionProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(sessions?.length / ITEMS_PER_PAGE || 0);

  const paginatedSessions = useMemo(() => {
    if (!sessions || sessions.length === 0) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sessions.slice(startIndex, endIndex);
  }, [sessions, currentPage]);

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-700";
      case "confirmed":
        return "bg-primary/10 text-primary";
      case "live":
        return "bg-green-600 text-white animate-pulse";
      case "completed":
        return "bg-success/10 text-success";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "rescheduled":
        return "bg-yellow-100 text-yellow-700";
      case "missed":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            Session
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Your past consultations and recorded sessions
          </p>
        </div>
        <div className="self-start sm:self-auto">
          <Badge
            variant="outline"
            className="px-4 py-1.5 rounded-full border-slate-200 text-slate-600 font-bold bg-white"
          >
            {sessions?.length || 0} Sessions
          </Badge>
        </div>
      </div>

      {sessions && sessions.length > 0 ? (
        <div>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Session
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Date & Time
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Duration
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {paginatedSessions.map((s) => (
                  <tr
                    key={s._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">
                        {s.bookingId?.serviceName || "Therapy Session"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">
                        {s.date
                          ? new Date(s.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </div>
                      <div className="text-sm text-slate-500">
                        {s.time || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {s.type || "1-on-1"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {s.duration ? `${s.duration} min` : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {s.status === "live" ? (
                        <div className="flex flex-col gap-2">
                          <Link
                            to={`/video-call?sessionId=${s._id}`}
                            className="inline-flex items-center justify-center
                  bg-green-600 hover:bg-green-700
                  text-white font-bold text-sm
                  px-4 py-1.5 rounded-full whitespace-nowrap flex-shrink-0"
                          >
                            Join Call
                          </Link>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase
          ${
            s.status === "scheduled"
              ? "bg-blue-100 text-blue-700"
              : s.status === "confirmed"
              ? "bg-primary/10 text-primary"
              : s.status === "completed"
              ? "bg-success/10 text-success"
              : s.status === "missed"
              ? "bg-destructive/10 text-destructive"
              : "bg-amber-100 text-amber-700"
          }`}
                          >
                            {s.status}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {(s.status === "scheduled" ||
                        s.status === "pending" ||
                        s.status === "missed") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-bold border-primary text-primary hover:bg-primary hover:text-white"
                          onClick={() => onReschedule(s)}
                        >
                          <CalendarDays className="h-4 w-4 mr-1" />
                          Reschedule
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {paginatedSessions.map((s) => (
              <Card
                key={s._id}
                className="p-4 border border-slate-200 rounded-lg"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {s.bookingId?.serviceName || "Therapy Session"}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {s.date
                          ? new Date(s.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </p>
                      <p className="text-xs text-slate-500">{s.time || "—"}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {s.status === "live" ? (
                        <Link
                          to={`/video-call?sessionId=${s._id}`}
                          className="inline-flex items-center justify-center
                bg-green-600 hover:bg-green-700
                text-white font-bold text-xs
                px-3 py-1 rounded-full whitespace-nowrap"
                        >
                          Join Call
                        </Link>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-black uppercase
        ${
          s.status === "scheduled"
            ? "bg-blue-100 text-blue-700"
            : s.status === "confirmed"
            ? "bg-primary/10 text-primary"
            : s.status === "completed"
            ? "bg-success/10 text-success"
            : s.status === "missed"
            ? "bg-destructive/10 text-destructive"
            : "bg-amber-100 text-amber-700"
        }`}
                        >
                          {s.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500">Type</p>
                      <p className="text-sm text-slate-900">
                        {s.type || "1-on-1"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Duration</p>
                      <p className="text-sm text-slate-900">
                        {s.duration ? `${s.duration} min` : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    {(s.status === "scheduled" ||
                      s.status === "pending" ||
                      s.status === "missed") && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-bold border-primary text-primary hover:bg-primary hover:text-white w-full"
                        onClick={() => onReschedule(s)}
                      >
                        <CalendarDays className="h-4 w-4 mr-1" />
                        Reschedule
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-4 gap-4">
              <div className="text-sm text-slate-500 text-center sm:text-left">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, sessions.length)} of{" "}
                {sessions.length} sessions
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="flex items-center"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum =
                      currentPage <= 3
                        ? i + 1
                        : currentPage >= totalPages - 2
                        ? totalPages - 4 + i
                        : currentPage - 2 + i;

                    if (pageNum < 1 || pageNum > totalPages) return null;

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10 h-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {totalPages > 5 &&
                    (currentPage > 4 || currentPage < totalPages - 3) && (
                      <span className="flex items-center h-10 px-2">...</span>
                    )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center"
                >
                  <span className="hidden sm:inline mr-1">Next</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[260px] flex flex-col justify-between overflow-hidden">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                Session History
              </h3>
            </div>
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <Play className="h-8 w-8 text-slate-300" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900">
                  No Session History
                </h3>
                <p className="text-slate-500 font-medium max-w-xs mx-auto">
                  You haven't completed any sessions yet.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
