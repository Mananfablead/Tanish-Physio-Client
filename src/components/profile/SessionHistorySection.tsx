import { useState, useMemo, useEffect } from "react";
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
  MessageSquare,
  Copy,
  Check,
  Info,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star } from "lucide-react";
import {
  createTestimonial,
  createTestimonialWithVideo,
  getUserTestimonials,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface SessionHistorySectionProps {
  sessions: any[];
  onReschedule: (session: any) => void;
}

interface FeedbackForm {
  rating: number;
  content: string;
  problem: string;
  serviceUsed: string;
  video: File | null;
  videoPreview: string | null;
}

const ITEMS_PER_PAGE = 5; // Adjust this number as needed

export function SessionHistorySection({
  sessions,
  onReschedule,
}: SessionHistorySectionProps) {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for real-time button updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch testimonials on mount
  useEffect(() => {
    const fetchUserTestimonials = async () => {
      try {
        const response = await getUserTestimonials();
        if (response.data.success) {
          const testimonials = response.data.data;
          // Extract session IDs from testimonials and add to the set
          const sessionIds = testimonials
            .filter((testimonial: any) => testimonial.sessionId) // Only include testimonials with a sessionId
            .map((testimonial: any) => testimonial.sessionId);
          setSubmittedFeedbackSessions(new Set(sessionIds));
        }
      } catch (error) {
        console.error("Error fetching user testimonials:", error);
      }
    };

    fetchUserTestimonials();
  }, []);
  const [feedbackSession, setFeedbackSession] = useState<any>(null);
  const [feedbackForm, setFeedbackForm] = useState<FeedbackForm>({
    rating: 5,
    content: "",
    problem: "",
    serviceUsed: "",
    video: null,
    videoPreview: null,
  });
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [submittedFeedbackSessions, setSubmittedFeedbackSessions] = useState<
    Set<string>
  >(new Set());
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [detailSession, setDetailSession] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [requestingMeet, setRequestingMeet] = useState<string | null>(null);
  const [meetRequestSuccess, setMeetRequestSuccess] = useState<Set<string>>(new Set());

  const openSessionDetail = (session: any) => {
    setDetailSession(session);
    setIsDetailModalOpen(true);
  };

  const copyToClipboard = async (link: string, sessionId: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(sessionId);
      toast({
        title: "Copied!",
        description: "Google Meet link copied to clipboard",
      });
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleRequestGoogleMeet = async (sessionId: string) => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "Session ID is required",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue",
        variant: "destructive",
      });
      return;
    }

    setRequestingMeet(sessionId);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/video-call/generate-google-meet`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionId }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Request Sent!",
          description: "Your therapist has been notified to generate a Google Meet link for this session.",
          variant: "default",
        });
        
        // Mark this session as having a successful meet request
        setMeetRequestSuccess(prev => new Set(prev).add(sessionId));
        
        // Refresh sessions after a short delay to show the new link
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        throw new Error(data.message || "Failed to request Google Meet link");
      }
    } catch (error: any) {
      console.error("Error requesting Google Meet link:", error);
      toast({
        title: "Request Failed",
        description: error.message || "Could not send request. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setRequestingMeet(null);
    }
  };

  const isSessionTimeArrived = (session: any) => {
    if (!session?.startTime) return true; // If no startTime, assume it's available

    // Use currentTime state instead of new Date() for real-time updates
    const now = currentTime;

    // If we have both date and time fields, use them for more accurate local time comparison
    if (session.date && session.time) {
      // Parse the local date and time
      const [hours, minutes] = session.time.split(":").map(Number);
      const sessionLocalTime = new Date(session.date);
      sessionLocalTime.setHours(hours, minutes, 0, 0);

      return now >= sessionLocalTime;
    }

    // Fallback to startTime if date/time not available
    const sessionStartTime = new Date(session.startTime);
    return now >= sessionStartTime;
  };

  const isSessionInFuture = (session: any) => {
    if (!session?.startTime) return false; // If no startTime, can't determine

    const now = new Date();

    // If we have both date and time fields, use them for more accurate local time comparison
    if (session.date && session.time) {
      // Parse the local date and time
      const [hours, minutes] = session.time.split(":").map(Number);
      const sessionLocalTime = new Date(session.date);
      sessionLocalTime.setHours(hours, minutes, 0, 0);

      return now < sessionLocalTime;
    }

    // Fallback to startTime if date/time not available
    const sessionStartTime = new Date(session.startTime);
    return now < sessionStartTime;
  };

  const isWithinRescheduleWindow = (session: any) => {
    if (!session?.startTime) return false; // If no startTime, can't determine

    const now = new Date();

    // If we have both date and time fields, use them for more accurate local time comparison
    if (session.date && session.time) {
      // Parse the local date and time
      const [hours, minutes] = session.time.split(":").map(Number);
      const sessionLocalTime = new Date(session.date);
      sessionLocalTime.setHours(hours, minutes, 0, 0);

      // Calculate 12-hour window (43200000 milliseconds)
      const twelveHoursInMs = 12 * 60 * 60 * 1000;

      // Check if session is at least 12 hours away
      return sessionLocalTime.getTime() - now.getTime() >= twelveHoursInMs;
    }

    // Fallback to startTime if date/time not available
    const sessionStartTime = new Date(session.startTime);
    const twelveHoursInMs = 12 * 60 * 60 * 1000;

    // Check if session is at least 12 hours away
    return sessionStartTime.getTime() - now.getTime() >= twelveHoursInMs;
  };

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(sessions?.length / ITEMS_PER_PAGE || 0);

  const paginatedSessions = useMemo(() => {
    if (!sessions || sessions.length === 0) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sessions.slice(startIndex, endIndex);
  }, [sessions, currentPage]);
  console.log("paginatedSessions", paginatedSessions)
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

  const handleLeaveFeedback = (session: any) => {
    setFeedbackSession(session);
    setFeedbackForm({
      rating: 5,
      content: "",
      problem: "",
      serviceUsed: session.bookingId?.serviceName || "",
      video: null,
      videoPreview: null,
    });
    setIsFeedbackModalOpen(true);
  };

  const submitFeedback = async () => {
    if (
      !feedbackForm.content.trim() ||
      !feedbackForm.problem.trim() ||
      !feedbackForm.serviceUsed.trim()
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingFeedback(true);
    try {
      // Prepare testimonial data
      const { serviceUsed, rating, content, problem, video } = feedbackForm;
      let response;

      if (video) {
        // If there's a video, use the video upload function
        const testimonialData = {
          serviceUsed: feedbackSession.bookingId?.serviceName || serviceUsed,
          rating,
          content,
          problem,
          video: video,
          sessionId: feedbackSession._id, // Include session ID for tracking
        };

        response = await createTestimonialWithVideo(testimonialData);
      } else {
        // If no video, use regular function
        const testimonialData = {
          serviceUsed: feedbackSession.bookingId?.serviceName || serviceUsed,
          rating,
          content,
          problem,
          sessionId: feedbackSession._id, // Include session ID for tracking
        };

        response = await createTestimonial(testimonialData);
      }

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Your feedback has been submitted successfully!",
        });
        setIsFeedbackModalOpen(false);
        // Add the session ID to the set of submitted feedback sessions
        if (feedbackSession?._id) {
          setSubmittedFeedbackSessions(
            (prev) => new Set([...prev, feedbackSession._id])
          );
        }
        setFeedbackForm({
          rating: 5,
          content: "",
          problem: "",
          serviceUsed: "",
          video: null,
          videoPreview: null,
        });
      } else {
        throw new Error(response.data.message || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
            onClick={() => {
              if (interactive) {
                setFeedbackForm({ ...feedbackForm, rating: i + 1 });
              }
            }}
            style={{ cursor: interactive ? "pointer" : "default" }}
          />
        ))}
      </div>
    );
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
                  <>
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
                          {/* Show timeSlot if available, otherwise fallback to time or startTime */}
                          {s.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {s.type || "1-on-1"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {/* Show duration from session, or calculate from timeSlot */}
                        {(() => {
                          if (s.duration) {
                            return `${s.duration} min`;
                          } else if (s.timeSlot?.start && s.timeSlot?.end) {
                            // Calculate duration from timeSlot
                            const [startHours, startMinutes] = s.timeSlot.start.split(':').map(Number);
                            const [endHours, endMinutes] = s.timeSlot.end.split(':').map(Number);
                            const duration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
                            return `${duration} min`;
                          } else if (s.scheduledTime) {
                            // Default 45 minutes for subscription sessions
                            return '45 min';
                          }
                          return "—";
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {s.status === "live" ? (
                          isSessionTimeArrived(s) ? (
                            <Link
                              to={
                                (s.groupSessionId || (s.type === "group" || s.sessionType === "group"))
                                  ? `/group-video-call/${s.groupSessionId || s._id}`
                                  : `/video-call?sessionId=${s._id}`
                              }
                              className="inline-flex items-center justify-center
                  bg-green-600 hover:bg-green-700
                  text-white font-bold text-sm
                  px-4 py-1.5 rounded-full whitespace-nowrap flex-shrink-0"
                            >
                              Join Call
                            </Link>
                          ) : (
                            <button
                              className="inline-flex items-center justify-center
                  bg-gray-400 text-white font-bold text-sm
                  px-4 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 cursor-not-allowed"
                              disabled
                            >
                              Starts in{" "}
                              {s.date && s.time
                                ? (() => {
                                    const [hours, minutes] = s.time
                                      .split(":")
                                      .map(Number);
                                    const sessionLocalTime = new Date(s.date);
                                    sessionLocalTime.setHours(
                                      hours,
                                      minutes,
                                      0,
                                      0
                                    );
                                    return Math.ceil(
                                      (sessionLocalTime.getTime() -
                                        currentTime.getTime()) /
                                        (1000 * 60)
                                    );
                                  })()
                                : Math.ceil(
                                    (new Date(s.startTime).getTime() -
                                      currentTime.getTime()) /
                                      (1000 * 60)
                                  )}{" "}
                              min
                            </button>
                          )
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
                        <div className="flex flex-col items-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="font-bold text-slate-500 hover:text-primary hover:bg-primary/10 px-2"
                            onClick={() => openSessionDetail(s)}
                          >
                            <Info className="h-4 w-4 mr-1" />
                            Read More
                          </Button>
                          
                          {/* Request Google Meet Link - Show if no meet link exists and session is upcoming */}
                          {/* {!s.googleMeetLink && 
                           (s.status === "scheduled" || s.status === "confirmed" || s.status === "live") && (
                            <>
                              {meetRequestSuccess.has(s._id) ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="font-bold border-green-500 text-green-500 cursor-default"
                                  disabled
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Meet Link Requested
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="font-bold border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                                  onClick={() => handleRequestGoogleMeet(s._id)}
                                  disabled={requestingMeet === s._id}
                                >
                                  {requestingMeet === s._id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                      Sending...
                                    </>
                                  ) : (
                                    <>
                                      <Video className="h-4 w-4 mr-1" />
                                      Request Google Meet
                                    </>
                                  )}
                                </Button>
                              )}
                            </>
                          )} */}
                          
                          {(s.status === "scheduled" ||
                            s.status === "confirmed") &&
                            isSessionInFuture(s) &&
                            isWithinRescheduleWindow(s) && (
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
                          {s.status === "completed" &&
                            (submittedFeedbackSessions.has(s._id) ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="font-bold border-green-500 text-green-500 cursor-default"
                                disabled
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Feedback Submitted
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="font-bold border-primary text-primary hover:bg-primary hover:text-white"
                                onClick={() => handleLeaveFeedback(s)}
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Leave Feedback
                              </Button>
                            ))}
                        </div>
                      </td>
                    </tr>
                    {/* Expanded row for Google Meet link - Same design as GoogleMeetDisplay */}
                    {s.googleMeetLink && (
                      <tr className="bg-gray-50/50">
                        <td colSpan={6} className="px-6 py-3">
                          <Card className="p-4 w-full">
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Video className="h-5 w-5 text-blue-600" />
                                  <h3 className="font-bold text-lg">
                                    Google Meet/Zoom Alternative
                                  </h3>
                                </div>
                                <Badge variant="default">Available</Badge>
                              </div>

                              <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-sm text-blue-800 mb-2">
                                  Your therapist has arranged an alternative
                                  Google Meet/Zoom session.
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <a
                                    href={s.googleMeetLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2
                                      bg-blue-600 hover:bg-blue-700
                                      text-white font-medium text-sm
                                      px-3 py-2 rounded-lg
                                      transition-colors"
                                  >
                                    <Video className="h-4 w-4" />
                                    Join Google Meet/Zoom
                                  </a>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      copyToClipboard(s.googleMeetLink, s._id)
                                    }
                                    className="flex items-center gap-2"
                                  >
                                    {copiedLink === s._id ? (
                                      <>
                                        <Check className="h-4 w-4 text-green-600" />
                                        Copied!
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="h-4 w-4" />
                                        Copy Link
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {s.googleMeetCode && (
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">
                                    Meeting Code:
                                  </span>{" "}
                                  <span className="font-mono font-bold bg-blue-50 px-2 py-1 rounded">
                                    {s.googleMeetCode}
                                  </span>
                                </div>
                              )}
                            </div>
                          </Card>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {paginatedSessions.map((s) => (
              <div key={s._id} className="space-y-3">
                <Card className="p-4 border border-slate-200 rounded-lg">
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
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          {/* Show timeSlot if available, otherwise fallback to time or startTime */}
                          {s.timeSlot?.start && s.timeSlot?.end ? (
                            <>
                              <Clock className="h-3 w-3" />
                              {s.timeSlot.start} - {s.timeSlot.end}
                            </>
                          ) : (
                            s.time ||
                            (s.startTime
                              ? new Date(s.startTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—")
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {s.status === "live" ? (
                          isSessionTimeArrived(s) ? (
                            <Link
                              to={
                                (s.groupSessionId || (s.type === "group" || s.sessionType === "group"))
                                  ? `/group-video-call/${s.groupSessionId || s._id}`
                                  : `/video-call?sessionId=${s._id}`
                              }
                              className="inline-flex items-center justify-center
                  bg-green-600 hover:bg-green-700
                  text-white font-bold text-xs
                  px-3 py-1 rounded-full whitespace-nowrap"
                            >
                              Join Call
                            </Link>
                          ) : (
                            <button
                              className="inline-flex items-center justify-center
                  bg-gray-400 text-white font-bold text-xs
                  px-3 py-1 rounded-full whitespace-nowrap cursor-not-allowed"
                              disabled
                            >
                              Starts in{" "}
                              {s.date && s.time
                                ? (() => {
                                    const [hours, minutes] = s.time
                                      .split(":")
                                      .map(Number);
                                    const sessionLocalTime = new Date(s.date);
                                    sessionLocalTime.setHours(
                                      hours,
                                      minutes,
                                      0,
                                      0
                                    );
                                    return Math.ceil(
                                      (sessionLocalTime.getTime() -
                                        currentTime.getTime()) /
                                        (1000 * 60)
                                    );
                                  })()
                                : Math.ceil(
                                    (new Date(s.startTime).getTime() -
                                      currentTime.getTime()) /
                                      (1000 * 60)
                                  )}{" "}
                              min
                            </button>
                          )
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
                          {/* Show duration from session, or calculate from timeSlot */}
                          {(() => {
                            if (s.duration) {
                              return `${s.duration} min`;
                            } else if (s.timeSlot?.start && s.timeSlot?.end) {
                              // Calculate duration from timeSlot
                              const [startHours, startMinutes] = s.timeSlot.start.split(':').map(Number);
                              const [endHours, endMinutes] = s.timeSlot.end.split(':').map(Number);
                              const duration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
                              return `${duration} min`;
                            } else if (s.scheduledTime) {
                              // Default 45 minutes for subscription sessions
                              return '45 min';
                            }
                            return "—";
                          })()}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="font-bold text-slate-500 hover:text-primary hover:bg-primary/10 w-full"
                        onClick={() => openSessionDetail(s)}
                      >
                        <Info className="h-4 w-4 mr-1" />
                        Read More
                      </Button>
                      
                      {/* Request Google Meet Link - Mobile */}
                      {/* {!s.googleMeetLink && 
                       (s.status === "scheduled" || s.status === "confirmed" || s.status === "live") && (
                        <>
                          {meetRequestSuccess.has(s._id) ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="font-bold border-green-500 text-green-500 cursor-default w-full"
                              disabled
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Meet Link Requested
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="font-bold border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white w-full"
                              onClick={() => handleRequestGoogleMeet(s._id)}
                              disabled={requestingMeet === s._id}
                            >
                              {requestingMeet === s._id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Video className="h-4 w-4 mr-1" />
                                  Request Google Meet
                                </>
                              )}
                            </Button>
                          )}
                        </>
                      )} */}
                      
                      {(s.status === "scheduled" || s.status === "confirmed") &&
                        isSessionInFuture(s) &&
                        isWithinRescheduleWindow(s) && (
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
                      {s.status === "completed" &&
                        (submittedFeedbackSessions.has(s._id) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-bold border-green-500 text-green-500 cursor-default w-full"
                            disabled
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Feedback Submitted
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-bold border-primary text-primary hover:bg-primary hover:text-white w-full"
                            onClick={() => handleLeaveFeedback(s)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Leave Feedback
                          </Button>
                        ))}
                    </div>
                  </div>
                </Card>

                {/* Google Meet Link Card - Mobile (Same design as GoogleMeetDisplay) */}
                {s.googleMeetLink && (
                  <Card className="p-4 w-full">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Video className="h-5 w-5 text-blue-600" />
                          <h3 className="font-bold text-base">
                            Google Meet Alternative
                          </h3>
                        </div>
                        <Badge variant="default">Available</Badge>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-sm text-blue-800 mb-2">
                          Your therapist has arranged an alternative Google Meet
                          session.
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={s.googleMeetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2
                              bg-blue-600 hover:bg-blue-700
                              text-white font-medium text-sm
                              px-3 py-2 rounded-lg
                              transition-colors"
                          >
                            <Video className="h-4 w-4" />
                            Join Google Meet
                          </a>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(s.googleMeetLink, s._id)
                            }
                            className="flex items-center gap-2"
                          >
                            {copiedLink === s._id ? (
                              <>
                                <Check className="h-4 w-4 text-green-600" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                Copy Link
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {s.googleMeetCode && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Meeting Code:</span>{" "}
                          <span className="font-mono font-bold bg-blue-50 px-2 py-1 rounded">
                            {s.googleMeetCode}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
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

      {/* Session Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Session Details
            </DialogTitle>
          </DialogHeader>
          {detailSession && (
            <div className="space-y-4 py-2">
              {/* Service */}
              <div className="rounded-lg bg-slate-50 p-4 space-y-3">
                <h3 className="font-black text-slate-900 text-base">
                  {detailSession.bookingId?.serviceName || "Therapy Session"}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Status</p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-black uppercase ${
                        detailSession.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : detailSession.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : detailSession.status === "missed"
                          ? "bg-destructive/10 text-destructive"
                          : detailSession.status === "live"
                          ? "bg-green-600 text-white"
                          : detailSession.status === "confirmed"
                          ? "bg-primary/10 text-primary"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {detailSession.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Type</p>
                    <p className="mt-1 font-semibold text-slate-800">{detailSession.type || "1-on-1"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Date</p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {detailSession.date
                        ? new Date(detailSession.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Time</p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {/* Show timeSlot if available, otherwise fallback to time or startTime */}
                      {detailSession.timeSlot?.start && detailSession.timeSlot?.end ? (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {detailSession.timeSlot.start} - {detailSession.timeSlot.end}
                        </span>
                      ) : (
                        detailSession.time ||
                        (detailSession.startTime
                          ? new Date(detailSession.startTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—")
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Duration</p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {/* Show duration from session, or calculate from timeSlot */}
                      {(() => {
                        if (detailSession.duration) {
                          return `${detailSession.duration} min`;
                        } else if (detailSession.timeSlot?.start && detailSession.timeSlot?.end) {
                          // Calculate duration from timeSlot
                          const [startHours, startMinutes] = detailSession.timeSlot.start.split(':').map(Number);
                          const [endHours, endMinutes] = detailSession.timeSlot.end.split(':').map(Number);
                          const duration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
                          return `${duration} min`;
                        } else if (detailSession.scheduledTime) {
                          // Default 45 minutes for subscription sessions
                          return '45 min';
                        }
                        return "—";
                      })()}
                    </p>
                  </div>
                  {detailSession.endTime && (
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">End Time</p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {new Date(detailSession.endTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Info */}
              {detailSession.bookingId && (
                <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                  <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Booking Info</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {detailSession.bookingId.therapistName && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Therapist</p>
                        <p className="mt-1 font-semibold text-slate-800">{detailSession.bookingId.therapistName}</p>
                      </div>
                    )}
                    {detailSession.bookingId.amount != null && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Amount Paid</p>
                        <p className="mt-1 font-semibold text-slate-800">₹{detailSession.bookingId.finalAmount ?? detailSession.bookingId.amount}</p>
                      </div>
                    )}
                    {detailSession.bookingId.bookingType && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Booking Type</p>
                        <p className="mt-1 font-semibold text-slate-800 capitalize">{detailSession.bookingId.bookingType.replace(/-/g, " ")}</p>
                      </div>
                    )}
                    {detailSession.bookingId.paymentStatus && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Payment</p>
                        <p className="mt-1 font-semibold text-slate-800 capitalize">{detailSession.bookingId.paymentStatus}</p>
                      </div>
                    )}
                  </div>
                  {detailSession.bookingId.notes && (
                    <div className="mt-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Notes</p>
                      <p className="mt-1 text-sm text-slate-700 bg-slate-50 rounded p-2">{detailSession.bookingId.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Google Meet */}
              {detailSession.googleMeetLink && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 space-y-2">
                  <h4 className="font-bold text-blue-700 text-sm uppercase tracking-wide flex items-center gap-2">
                    <Video className="h-4 w-4" /> Google Meet
                  </h4>
                  <a
                    href={detailSession.googleMeetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-3 py-2 rounded-lg transition-colors"
                  >
                    <Video className="h-4 w-4" />
                    Join Google Meet
                  </a>
                  {detailSession.googleMeetCode && (
                    <p className="text-sm text-blue-800">
                      Meeting Code:{" "}
                      <span className="font-mono font-bold bg-white px-2 py-0.5 rounded">
                        {detailSession.googleMeetCode}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* Notes / Admin notes */}
              {detailSession.notes && (
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Session Notes</p>
                  <p className="text-sm text-slate-700">{detailSession.notes}</p>
                </div>
              )}

              {/* Session ID reference */}
              {/* <p className="text-xs text-slate-400 text-right">Session ID: {detailSession._id}</p> */}
            </div>
          )}
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Modal */}
      <Dialog open={isFeedbackModalOpen} onOpenChange={setIsFeedbackModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Share Your Feedback</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rating">Rating</Label>
              <div className="flex items-center gap-2 mt-1">
                {renderStars(feedbackForm.rating, true)}
                <span className="ml-2 font-medium">
                  {feedbackForm.rating}/5
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="problem">What problem did you have? *</Label>
              <Input
                id="problem"
                value={feedbackForm.problem}
                onChange={(e) =>
                  setFeedbackForm({ ...feedbackForm, problem: e.target.value })
                }
                placeholder="Describe the problem you had"
              />
            </div>

            <div>
              <Label htmlFor="serviceUsed">Service Used *</Label>
              <Input
                id="serviceUsed"
                value={feedbackForm.serviceUsed}
                onChange={(e) =>
                  setFeedbackForm({
                    ...feedbackForm,
                    serviceUsed: e.target.value,
                  })
                }
                placeholder="Enter the service you received"
              />
            </div>

            <div>
              <Label htmlFor="content">Your Feedback *</Label>
              <Textarea
                id="content"
                value={feedbackForm.content}
                onChange={(e) =>
                  setFeedbackForm({ ...feedbackForm, content: e.target.value })
                }
                placeholder="Share your experience and how we helped you..."
                rows={4}
              />
            </div>
          </div>

          {/* Video Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="video">Upload Video (optional)</Label>
            <Input
              id="video"
              type="file"
              accept="video/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setFeedbackForm({
                    ...feedbackForm,
                    video: file,
                    videoPreview: URL.createObjectURL(file),
                  });
                }
              }}
            />
            {feedbackForm.videoPreview && (
              <div className="mt-2">
                <video
                  src={feedbackForm.videoPreview}
                  controls
                  className="max-w-full h-32 rounded-lg"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setFeedbackForm({
                      ...feedbackForm,
                      video: null,
                      videoPreview: null,
                    });
                  }}
                >
                  Remove Video
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsFeedbackModalOpen(false)}
              disabled={submittingFeedback}
            >
              Cancel
            </Button>
            <Button onClick={submitFeedback} disabled={submittingFeedback}>
              {submittingFeedback ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}