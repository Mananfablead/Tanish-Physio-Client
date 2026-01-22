import { Layout } from "@/components/layout/Layout";
import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  User,
  VideoIcon,
  Play,
  Plus,
  ChevronLeft,
  ChevronRight,
  MapPin,
  FileText,
  Users,
  CheckCircle,
  X,
  MoreHorizontal,
  Package,
  RefreshCw,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { getAvailability, getAllSessions, getUpcomingSessions, getSessionById, createSession, updateSession, deleteSession, getSessionsByUserId, getSessionsByTherapistId, getCompletedSessions, getScheduledSessions, cancelSession, rescheduleSession, getSessionNotes, addSessionNotes, getPastSessions, getTodaySessions } from "@/lib/api";
import { fetchAllSessions, fetchUpcomingSessions, fetchPastSessions, fetchCompletedSessions, fetchScheduledSessions, fetchTodaySessions, fetchSessionById, fetchSessionsByUserId, createNewSession, updateExistingSession, deleteExistingSession, cancelSessionById, rescheduleSessionById, fetchSessionNotes, addSessionNote } from '@/store/slices/sessionSlice';
import { useAppDispatch, useAppSelector } from '@/store';
import { useDispatch, useSelector } from "react-redux";
import { fetchUserSubscriptions } from "@/store/slices/subscriptionSlice";

export default function SchedulePage() {
  const location = useLocation();
  const navigate = useNavigate()
  const bookingData = location.state;
  console.log("userSubscriptionsdadadadaddddad--------?", bookingData)
  useEffect(() => {
    if (bookingData?.fromSubscription) {
      toast.success("Subscription activated! You can now book your sessions.");
    } else if (bookingData?.fromServices) {
      toast.success("Service purchased! You can now book your session.");
    }
  }, [bookingData]);

  // Check if there's booking data from services page
  const hasBookingSummary =
    bookingData?.fromServices || bookingData?.fromSubscription || bookingData?.bookingSummary;

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<string>("");

  // UI Control States for Session Creation
  const [sessionTypeValue, setSessionTypeValue] = useState<string>("1-on-1");
  const [sessionStatusValue, setSessionStatusValue] = useState<string>("scheduled");
  const [sessionNotesValue, setSessionNotesValue] = useState<string>("");

  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get available times for selected date from availability API
  const getAvailableTimesForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dateAvailability = availability.find((avail) => {
      const availDate = new Date(avail.date);
      return isSameDay(availDate, date);
    });

    if (dateAvailability && dateAvailability.availableTimes) {
      return dateAvailability.availableTimes;
    }

    return [];
  };

  // Calculate available times based on selected date and availability data using useMemo
  const availableTimes = useMemo(() => {
    if (!availability || !Array.isArray(availability)) return [];
    return getAvailableTimesForDate(selectedDate);
  }, [selectedDate, availability]);




  // State for sessions
  const [sessions, setSessions] = useState<any[]>([]);
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchUserSubscriptions());


  }, [dispatch]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch both availability and sessions
        const [availabilityResponse, sessionsResponse] = await Promise.all([
          getAvailability(),
          getAllSessions()
        ]);

        const availabilityData: any = availabilityResponse;
        const sessionsData: any = sessionsResponse;
        console.log(sessionsData)
        setAvailability(availabilityData.data?.data?.availability || []);

        // Update sessions with actual data from API
        if (sessionsData.data?.success) {
          setSessions(sessionsData.data.data.sessions || []);
          // Also dispatch to store in Redux
          // dispatch(fetchAllSessions());
        } else {
          setSessions([]);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load schedule data');
        toast.error('Failed to load schedule data');
        // Fallback to empty arrays
        setAvailability([]);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) =>
      direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  const getCalendarDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start, end });
    const startWeekday = start.getDay(); // 0 = Sunday
    const emptyDays = Array(startWeekday).fill(null);
    return [...emptyDays, ...daysInMonth];
  };
  // Helper function to get availability for a specific date
  const getAvailabilityForDate = (date: Date) => {
    if (!availability || !Array.isArray(availability)) return null;

    const dateString = format(date, 'yyyy-MM-dd');
    return availability.find((avail) => {
      // Compare date strings directly
      return avail.date === dateString;
    });
  };

  const today = new Date();


  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-primary/5 pt-10 pb-20">
        <div className="container  mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {hasBookingSummary ? "Your Sessions" : "Schedule"}
              </h1>
              <p className="text-slate-600 font-medium">
                Manage your upcoming and past appointments
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Calendar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <Card className="bg-white/80 backdrop-blur rounded-2xl border border-primary/20 shadow-sm overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg font-black text-slate-900">
                      Calendar
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl"
                        onClick={() => navigateMonth("prev")}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-xl"
                        onClick={() => navigateMonth("next")}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Legend for calendar colors */}
                    <div className="flex flex-wrap gap-2 mb-4 justify-center">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300"></div>
                        <span className="text-xs text-slate-600">Booked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
                        <span className="text-xs text-slate-600">Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
                        <span className="text-xs text-slate-600">Unavailable</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
                        <span className="text-xs text-slate-600">Not Booked</span>
                      </div>
                    </div>
                    <div className="text-center mb-4">
                      <h3 className="font-black text-slate-900">
                        {format(currentMonth, "MMMM yyyy")}
                      </h3>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                        <div
                          key={day}
                          className="text-center text-xs font-black text-slate-500 py-1"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 max-h-[400px] overflow-y-auto">
                      {loading ? (
                        // Show loading placeholders while availability data is loading
                        Array.from({ length: 42 }).map((_, index) => (
                          <div
                            key={index}
                            className="h-10 rounded-xl text-sm font-medium flex items-center justify-center"
                          >
                            <div className="animate-pulse bg-gray-200 rounded w-6 h-6" />
                          </div>
                        ))
                      ) : (
                        getCalendarDays().map((day, index) => {
                          if (!day) {
                            return <div key={index} className="h-10" />;
                          }

                          const isToday = isSameDay(day, today);
                          const isSelected = isSameDay(day, selectedDate);

                          // Check if there's a session booked for this day
                          const hasSession = sessions.some(session => {
                            const sessionDate = parseISO(session.date);
                            return isSameDay(sessionDate, day);
                          });

                          const availabilityForDate = getAvailabilityForDate(day);
                          const hasAvailability = availabilityForDate && availabilityForDate.status === 'available' && (!availabilityForDate.availableTimes || availabilityForDate.availableTimes.length > 0);
                          const isPast = day < today && !isToday;

                          return isPast ? (
                            <div
                              key={index}
                              className="h-10 rounded-xl text-sm font-medium text-slate-300 flex items-center justify-center"
                            >
                              {format(day, "d")}
                            </div>
                          ) : availabilityForDate ? (
                            <button
                              key={index}
                              onClick={() => {
                                setSelectedDate(day);
                                // Only open booking modal if the date has availability and no session is booked
                                if (hasAvailability && !hasSession) {
                                  setIsBookingModalOpen(true);
                                }
                              }}
                              className={`h-10 rounded-xl text-sm font-medium flex flex-col items-center justify-center transition-all ${isToday
                                ? "bg-primary/10 border border-primary/20 text-primary font-black"
                                : isSelected
                                  ? "bg-primary text-white font-black shadow-md"
                                  : hasSession
                                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                                    : availabilityForDate
                                      ? (availabilityForDate.status === 'available' ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200")  // Green for available, Red for unavailable
                                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"  // Gray for dates with no availability data (Not Booked)
                                } ${hasSession || availabilityForDate ? "relative" : ""}`}
                            >
                              <span className="text-xs">{format(day, "d")}</span>

                              {(hasSession || availabilityForDate) && (
                                <>
                                  {hasSession && (
                                    <span
                                      className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-blue-500"  // Blue dot for booked
                                        }`}
                                    />
                                  )}
                                  {availabilityForDate?.status === 'available' && !hasSession && (
                                    <span
                                      className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-green-500"  // Green dot for available
                                        }`}
                                    />
                                  )}
                                </>
                              )}
                            </button>
                          ) : (
                            <div
                              key={index}
                              className="h-10 rounded-xl text-sm font-medium flex flex-col items-center justify-center bg-gray-100 text-gray-400 cursor-not-allowed"
                            >
                              <span className="text-xs">{format(day, "d")}</span>
                              {/* <span className="text-[0.6rem] font-bold mt-0.5">
            Not Booked
          </span> */}
                            </div>
                          );
                        })
                      )}
                    </div>

                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column - Sessions List */}
            <div className="lg:col-span-2">
              <Card className="bg-white/80 backdrop-blur rounded-2xl border border-primary/20 shadow-sm overflow-hidden">
                <CardHeader>
                  <h2 className="font-black text-slate-900 text-lg">
                    Your Therapy Sessions
                  </h2>
                  <p className="text-sm text-slate-500">
                    View and manage your scheduled therapy sessions
                  </p>
                </CardHeader>

                <CardContent>
                  {sessions.length > 0 ? (
                    <div className="space-y-4">
                      {sessions.map((session, index) => (
                        <motion.div
                          key={session.id}
                          className="border rounded-xl p-5 bg-white hover:shadow-md transition-all"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-1 min-w-0">
                              {/* HEADER */}
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-black text-slate-900 text-lg">
                                    {session?.therapist?.name || "Therapist"}
                                  </h3>

                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-sm text-slate-600 flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {session.startTime || session.time} –{" "}
                                      {session.endTime || "N/A"}
                                    </span>

                                    <Badge variant="outline" className="text-xs font-bold">
                                      {session.type || "Session"}
                                    </Badge>

                                    <Badge
                                      className={`text-xs font-bold ${session.status === "Completed"
                                        ? "bg-emerald-500 text-white"
                                        : session.status === "Confirmed" ||
                                          session.status === "confirmed"
                                          ? "bg-primary text-white"
                                          : session.status === "Scheduled" ||
                                            session.status === "scheduled"
                                            ? "bg-blue-500 text-white"
                                            : "bg-amber-500 text-white"
                                        }`}
                                    >
                                      {session.status}
                                    </Badge>
                                  </div>
                                </div>

                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* DETAILS */}
                              <p className="text-sm text-slate-500 mt-3 flex gap-1">
                                <User className="h-4 w-4 mt-0.5" />
                                <span className="font-bold">Focus:</span>{" "}
                                {session.relatedTo || "General Physiotherapy"}
                              </p>

                              {session.location && (
                                <p className="text-sm text-slate-500 mt-1 flex gap-1">
                                  <MapPin className="h-4 w-4 mt-0.5" />
                                  {session.location}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* ACTIONS */}
                          <div className="flex gap-3 mt-5 justify-end">
                            {session.status === "Completed" ? (
                              <Button variant="outline" className="font-bold">
                                <FileText className="h-4 w-4 mr-2" />
                                Session Summary
                              </Button>
                            ) : isSameDay(parseISO(session.date), today) ? (
                              <Button
                                className="bg-green-600 hover:bg-green-700 font-bold"
                                onClick={() =>
                                  navigate("/video-call", {
                                    state: {
                                      sessionId: session.id,
                                      therapist: session.therapist,
                                    },
                                  })
                                }
                              >
                                <VideoIcon className="h-4 w-4 mr-2" />
                                Join Call
                              </Button>
                            ) : null}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    /* EMPTY STATE */
                    <div className="py-16 text-center space-y-4">
                      <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-10 w-10 text-primary/60" />
                      </div>

                      <h3 className="text-xl font-black text-slate-900">
                        No sessions scheduled
                      </h3>

                      <p className="text-slate-500 font-medium max-w-xs mx-auto">
                        You don’t have any sessions scheduled for{" "}
                        {format(selectedDate, "MMMM d, yyyy")}.
                      </p>

                      <Button
                        className="h-11 rounded-xl bg-primary text-white font-bold px-6"
                        onClick={() => setIsBookingModalOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Book Session
                      </Button>
                    </div>
                  )}
                </CardContent>

              </Card>


            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">

            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-xl font-black text-slate-900">
                Book Session
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsBookingModalOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* BODY */}
            <div className="p-6 space-y-6">

              {/* DATE + SESSION TYPE */}
              <div className="flex flex-col md:flex-row justify-between gap-6 items-start">

                {/* DATE INFO */}
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </h4>
                  <p className="text-slate-500 text-sm">
                    Select a time for your session
                  </p>
                </div>

                {/* SESSION TYPE SELECT */}
                <div className="w-40">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Session Type
                  </label>
                  <select
                    value={sessionTypeValue}
                    onChange={(e) => setSessionTypeValue(e.target.value)}
                    className="w-full h-9 px-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="1-on-1">1-on-1</option>
                    <option value="group">Group</option>
                  </select>
                </div>
              </div>

              {/* AVAILABLE TIMES */}
              <div>
                <h4 className="font-bold text-slate-800 mb-3">
                  Available Times
                </h4>

                {availableTimes.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {availableTimes.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        className="py-2 text-sm"
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <Calendar className="h-7 w-7 text-primary/60" />
                    </div>
                    <h3 className="text-lg font-bold text-red-500">
                      Not Available
                    </h3>
                    <p className="text-slate-500 text-sm mt-1">
                      {loading
                        ? "Loading availability..."
                        : `No available times for ${format(selectedDate, "MMM d, yyyy")}`}
                    </p>
                  </div>
                )}
              </div>

              {/* SESSION NOTES */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  Session Notes
                </label>
                <textarea
                  value={sessionNotesValue}
                  onChange={(e) => setSessionNotesValue(e.target.value)}
                  placeholder="Add any special instructions or notes for this session..."
                  rows={3}
                  className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

            </div>

            {/* FOOTER */}
            <div className="flex gap-3 px-6 py-4 border-t bg-slate-50">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsBookingModalOpen(false)}
              >
                Cancel
              </Button>

              <Button
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                disabled={!selectedTime}
                onClick={async () => {
                  if (!selectedTime) {
                    toast.error("Please select a time for your session");
                    return;
                  }

                  try {

                    let subscriptionIdValue = null;
                    if (bookingData?.fromSubscription) {
                      console.log("1")
                      // Try to get from bookingData first (could come from Questionnaire page)
                      subscriptionIdValue = bookingData?.subscriptionId || getSubscriptionIdFromStorage();
                    } else if (bookingData?.subscriptionId) {
                      console.log("2")
                      subscriptionIdValue = bookingData?.subscriptionId;
                    } else if (bookingData?.fromSubscription && !subscriptionIdValue) {
                      // Double check from sessionStorage if subscription flow
                      console.log("3")
                      subscriptionIdValue = getSubscriptionIdFromStorage();
                    }
                    if (bookingData?.plan?.id) {
                      subscriptionIdValue = bookingData?.plan?.id;
                    }


                    const sessionData = {
                      bookingId: (bookingData?.fromServices || bookingData?.bookingId && !subscriptionIdValue) ? (bookingData?.bookingId || bookingData?.service?.bookingId) || null : null,
                      subscriptionId: subscriptionIdValue,
                      date: format(selectedDate, "yyyy-MM-dd"),
                      time: selectedTime,
                      type: sessionTypeValue,
                      status: sessionStatusValue,
                    };

                    // Helper function to get subscription ID from stored plan
                    function getSubscriptionIdFromStorage() {
                      try {
                        const storedPlan = sessionStorage.getItem("qw_plan");
                        console.log('Stored Plan Data:', storedPlan);
                        if (storedPlan) {
                          const planData = JSON.parse(storedPlan);
                          console.log('Parsed Plan Data:', planData);
                          return planData.subscriptionId || null;
                        }
                      } catch (e) {
                        console.error("Error getting subscription ID:", e);
                      }
                      return null;
                    }

                    const response: any = await createSession(sessionData);

                    if (response.data?.success) {
                      setSessions([...sessions, response.data.data.session]);
                      setIsBookingModalOpen(false);
                      toast.success(
                        `Session booked for ${format(selectedDate, "MMM d, yyyy")} at ${selectedTime}`
                      );
                    } else {
                      toast.error("Failed to book session");
                    }
                  } catch (err) {
                    toast.error("Failed to book session");
                  }
                }}
              >
                Confirm
              </Button>
            </div>

          </div>
        </div>
      )}

    </Layout>
  );
}