import { useState, useMemo } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Play, CheckCircle, ChevronLeft, ChevronRight, Clock, Video, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface SessionHistorySectionProps {
  sessions: any[];
  onReschedule: (session: any) => void;
}

const ITEMS_PER_PAGE = 5; // Adjust this number as needed

export function SessionHistorySection({ sessions, onReschedule }: SessionHistorySectionProps) {
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            Session
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Your past consultations and recorded sessions
          </p>
        </div>
        <Badge
          variant="outline"
          className="px-4 py-1.5 rounded-full border-slate-200 text-slate-600 font-bold bg-white"
        >
          {sessions?.length || 0} Sessions
        </Badge>
      </div>

      {sessions && sessions.length > 0 ? (
        <div className="space-y-4">
          {paginatedSessions.map((s) => {
            const isCompleted = s.status === "completed";
            
            return (
              <Card key={s._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-bold text-slate-900">
                      {s.bookingId?.serviceName || "Therapy Session"}
                    </div>
                    <div className="flex items-center gap-2">
                      {s.status === "live" ? (
                        <Link
                          to={`/video-call?sessionId=${s._id}`}
                          className="inline-flex items-center justify-center
               bg-green-600 hover:bg-green-700
               text-white font-bold text-sm
               px-4 py-1.5 rounded-full"
                        >
                          Join Call
                        </Link>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black uppercase
        ${s.status === "scheduled"
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
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-slate-600 font-medium">
                      <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                      {s.date
                        ? new Date(s.date).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "N/A"}
                    </div>
                    
                    <div className="flex items-center text-sm text-slate-600 font-medium">
                      <Clock className="h-4 w-4 mr-2 text-slate-400" />
                      {s.time || "—"}
                    </div>
                    
                    <div className="flex items-center text-sm text-slate-600 font-medium">
                      <Video className="h-4 w-4 mr-2 text-slate-400" />
                      {s.type || "1-on-1"}
                    </div>
                    
                    <div className="flex items-center text-sm text-slate-600 font-medium">
                      <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                      {s.duration ? `${s.duration} min` : "—"}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    {(s.status === "scheduled" || s.status === "pending" || s.status === "missed") && (
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
                  </div>
                </div>
              </Card>
            );
          })}
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4">
              <div className="text-sm text-slate-500">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sessions.length)} of {sessions.length} sessions
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10 h-10"
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[260px] flex flex-col justify-between overflow-hidden">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
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
                <p className="text-slate-500 font-medium">
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