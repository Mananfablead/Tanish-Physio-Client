import { Layout } from "@/components/layout/Layout";
import { useState, useEffect } from "react";
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

export default function SchedulePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  useEffect(() => {
    if (bookingData?.bookingCompleted) {
      // Show a message to the user that booking is complete
      toast.success("Payment successful! Your booking is confirmed.");
    }
  }, [bookingData]);

  // Check if there's booking data from services page
  const hasBookingSummary =
    bookingData?.fromServices || bookingData?.bookingSummary;

  // Extract booking summary data if available
  const bookingSummary = hasBookingSummary
    ? {
        therapist: bookingData.therapist || {
          name: bookingData?.therapistName || "Dr. Sarah Johnson",
          title: bookingData?.therapistTitle || "Sports Injury Specialist",
          avatar:
            bookingData?.therapistAvatar ||
            "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
        },
        session: bookingData.session || {
          type: bookingData?.sessionType || "1-on-1",
          duration: bookingData?.sessionDuration || "45 min",
          price: bookingData?.sessionPrice || 80,
        },
        date: bookingData.date || new Date(),
        time: bookingData.time || "10:00",
        plan: bookingData.plan || {
          name: bookingData?.planName || "Monthly Plan",
          price: bookingData?.planPrice || 199,
        },
      }
    : null;
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isPastSessionsOpen, setIsPastSessionsOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<string>("10:00");
  const [customTime, setCustomTime] = useState<string>("");
  
  // Mock available times for selected date
  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
    "14:00", "14:30", "15:00", "15:30", "16:00"
  ];

  // State for sessions
  const [sessions, setSessions] = useState([
    {
      id: "1",
      therapist: {
        name: "Dr. Sarah Johnson",
        avatar:
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
      },
      date: new Date(new Date().setDate(new Date().getDate() + 1)),
      startTime: "10:00",
      endTime: "10:45",
      type: "Video",
      status: "Confirmed",
      location: "Secure Video Call",
      relatedTo: "Lower back pain recovery",
      notes: "Initial assessment — please have any previous imaging ready.",
    },
    {
      id: "2",
      therapist: {
        name: "Dr. A. Lee",
        avatar:
          "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=80&h=80&fit=crop&crop=face",
      },
      date: new Date(new Date().setDate(new Date().getDate() + 3)),
      startTime: "14:00",
      endTime: "14:45",
      type: "Video",
      status: "Confirmed",
      location: "Secure Video Call",
      relatedTo: "Gait analysis",
      notes: "Reviewing progress on mobility exercises.",
    },
    {
      id: "3",
      therapist: {
        name: "Dr. Michael Chen",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
      },
      date: new Date(new Date().setDate(new Date().getDate() + 7)),
      startTime: "09:30",
      endTime: "10:15",
      type: "In-person",
      status: "Confirmed",
      location: "123 Wellness Center, Suite 201",
      relatedTo: "Knee rehabilitation",
      notes: "Post-surgical recovery session.",
    },
  ]);

  const mockPastSessions = [
    {
      id: "4",
      therapist: {
        name: "Dr. Emily Rodriguez",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
      },
      date: new Date(new Date().setDate(new Date().getDate() - 5)),
      startTime: "11:00",
      endTime: "11:45",
      type: "Video",
      status: "Completed",
      location: "Secure Video Call",
      relatedTo: "Shoulder mobility",
      notes: "Follow-up on exercises for rotator cuff strengthening.",
    },
    {
      id: "5",
      therapist: {
        name: "Dr. Michael Chen",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
      },
      date: new Date(new Date().setDate(new Date().getDate() - 12)),
      startTime: "09:30",
      endTime: "10:15",
      type: "In-person",
      status: "Completed",
      location: "123 Wellness Center, Suite 201",
      relatedTo: "Knee rehabilitation",
      notes: "Post-surgical recovery session.",
    },
  ];

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) =>
      direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const getSessionsForDate = (date: Date) => {
    return sessions.filter((session) =>
      isSameDay(new Date(session.date), date)
    );
  };

  const today = new Date();
  const upcomingSessions = sessions;
  const pastSessions = mockPastSessions;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-primary/5 pt-16 pb-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* {hasBookingSummary && (
            <div className="mb-8 bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      Booking Summary
                    </h2>
                    <p className="text-slate-600 text-sm">
                      Your session has been successfully booked
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-primary">
                    ₹{bookingSummary?.plan.price}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {bookingSummary?.plan.name}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-primary/10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-12 w-12 rounded-lg border border-slate-200">
                      <AvatarImage
                        src={bookingSummary?.therapist.avatar}
                        alt={bookingSummary?.therapist.name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-primary rounded-lg">
                        {bookingSummary?.therapist.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-black text-slate-900">
                        {bookingSummary?.therapist.name}
                      </h3>
                      <p className="text-slate-600 text-sm">
                        {bookingSummary?.therapist.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-600 text-sm">
                        {bookingSummary?.session.type} Session (
                        {bookingSummary?.session.duration})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-600 text-sm">
                        {format(bookingSummary?.date, "EEE, MMM d")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-600 text-sm">
                        {bookingSummary?.time}
                      </span>
                    </div>
                  </div>
                </div> */}

                {/* Guest User Information */}
                {/* {bookingData?.guestUser && (
                  <div className="mt-6 pt-6 border-t border-primary/10">
                    <h3 className="font-black text-slate-900 mb-3">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-slate-500">Name</p>
                        <p className="font-medium">
                          {bookingData.guestUser.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Email</p>
                        <p className="font-medium">
                          {bookingData.guestUser.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Phone</p>
                        <p className="font-medium">
                          {bookingData.guestUser.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )} */}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {hasBookingSummary ? "Your Sessions" : "Schedule"}
              </h1>
              <p className="text-slate-600 font-medium">
                Manage your upcoming and past appointments
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* {bookingData?.fromServices && (
                <Button
                  className="h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black px-6 shadow-md shadow-emerald-200"
                  onClick={() => navigate("/booking-confirmation")}
                >
                  View Confirmation
                </Button>
              )} */}
              <Button className="h-12 rounded-xl bg-primary hover:from-primary/90 hover:to-accent/90 text-white font-black px-6 shadow-md shadow-primary/20" 
                onClick={() => setIsBookingModalOpen(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Book New Session
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Calendar */}
            <div className="lg:col-span-1">
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

                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth().map((day, index) => {
                      const isToday = isSameDay(day, today);
                      const isSelected = isSameDay(day, selectedDate);
                      const hasSession = getSessionsForDate(day).length > 0;
                      const isPast = day < today && !isToday;

                      return isPast ? (
                        <div
                          key={index}
                          className="h-10 rounded-xl text-sm font-medium text-slate-300"
                        >
                          {format(day, "d")}
                        </div>
                      ) : (
                        <button
                          key={index}
                          onClick={() => setSelectedDate(day)}
                          className={`h-10 rounded-xl text-sm font-medium transition-all ${
                            isToday
                              ? "bg-primary/10 border border-primary/20 text-primary font-black"
                              : isSelected
                              ? "bg-primary text-white font-black shadow-md"
                              : "text-slate-700 hover:bg-slate-100"
                          } ${hasSession ? "relative" : ""}`}
                        >
                          {format(day, "d")}
                          {hasSession && (
                            <div
                              className={`absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                                isSelected ? "bg-white" : "bg-primary"
                              }`}
                            ></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sessions List */}
            <div className="lg:col-span-2">
              <Card className="bg-white/80 backdrop-blur rounded-2xl border border-primary/20 shadow-sm overflow-hidden">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg font-black text-slate-900">
                        {format(selectedDate, "MMMM d, yyyy")}
                      </CardTitle>
                      <p className="text-slate-500 text-sm font-medium mt-1">
                        {getSessionsForDate(selectedDate).length} session
                        {getSessionsForDate(selectedDate).length !== 1
                          ? "s"
                          : ""}{" "}
                        scheduled
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {getSessionsForDate(selectedDate).length > 0 ? (
                    <div className="space-y-4">
                      {getSessionsForDate(selectedDate).map(
                        (session, index) => (
                          <motion.div
                            key={session.id}
                            className="border rounded-xl p-5 bg-white hover:shadow-md transition-all"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <div className="flex items-start gap-4">
                              <Avatar className="h-14 w-14 rounded-xl border border-slate-200">
                                <AvatarImage
                                  src={session.therapist.avatar}
                                  alt={session.therapist.name}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-primary rounded-xl">
                                  {session.therapist.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-black text-slate-900 text-lg">
                                      {session.therapist.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                      <span className="text-sm text-slate-600 flex items-center gap-1">
                                        <Clock className="h-4 w-4" />{" "}
                                        {session.startTime} - {session.endTime}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-xs rounded-full px-3 py-1 border-slate-300 text-slate-600 font-bold"
                                      >
                                        {session.type}
                                      </Badge>
                                      {/* <Badge
                                        className={`text-xs rounded-full px-3 py-1 ${
                                          session.status === "Completed"
                                            ? "bg-gradient-to-r from-success to-emerald-500 text-white border-success/30"
                                            : session.status === "Confirmed"
                                            ? "bg-gradient-to-r from-primary to-accent text-white border-primary/30"
                                            : "bg-gradient-to-r from-warning to-amber-500 text-white border-warning/30"
                                        }`}
                                      >
                                        {session.status}
                                      </Badge> */}
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </div>

                                <p className="text-sm text-slate-500 mt-3 flex items-start gap-1">
                                  <User className="h-4 w-4 mt-0.5 text-slate-400" />{" "}
                                  <span className="font-bold">Focus:</span>{" "}
                                  {session.relatedTo}
                                </p>

                                {session.location && (
                                  <p className="text-sm text-slate-500 mt-1 flex items-start gap-1">
                                    <MapPin className="h-4 w-4 mt-0.5 text-slate-400" />{" "}
                                    {session.location}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-3 mt-5 justify-end">
                              {session.status === "Completed" ? (
                                <Button
                                  variant="outline"
                                  className="h-10 rounded-xl text-sm font-bold border-slate-300 text-slate-600 hover:bg-primary/5 hover:text-primary"
                                >
                                  <FileText className="h-4 w-4 mr-2" /> Session
                                  Summary
                                </Button>
                              ) : isSameDay(session.date, today) ? (
                                <></>
                              ) : null}
                            
                              {session.status !== "Completed" && (
                                <Button
                                  variant="outline"
                                  className="h-10 rounded-xl text-sm font-bold border-slate-300 text-slate-600 hover:bg-primary/5 hover:text-primary"
                                  onClick={() => {
                                    // Redirect to booking confirmation page
                                    navigate("/booking-confirmation");
                                  }}
                                >
                                  Confirm
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="py-16 text-center space-y-4">
                      <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        <Calendar className="h-10 w-10 text-primary/60" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black text-slate-900">
                          No sessions scheduled
                        </h3>
                        <p className="text-slate-500 font-medium max-w-xs mx-auto">
                          You don't have any sessions scheduled for{" "}
                          {format(selectedDate, "MMMM d, yyyy")}.
                        </p>
                      </div>
                      <Button 
                        className="h-11 rounded-xl bg-primary hover:from-primary/90 hover:to-accent/90 text-white font-bold px-6 mt-4"
                        onClick={() => {
                          setIsBookingModalOpen(true);
                          setCustomTime(""); // Reset custom time when opening
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Book Session
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900">Book Session</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsBookingModalOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mb-6">
              <h4 className="font-bold text-slate-800 mb-2">
                {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h4>
              <p className="text-slate-600 text-sm">Select a time for your session</p>
            </div>
            
            <div className="mb-6">
              <h4 className="font-bold text-slate-800 mb-3">Available Times</h4>
              <div className="grid grid-cols-3 gap-2">
                {availableTimes.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    className="py-2"
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-bold text-slate-800 mb-3">Or Enter Custom Time</h4>
              <Input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="w-full"
                placeholder="HH:MM"
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsBookingModalOpen(false)}
              >
                Reschedule
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                onClick={() => {
                  // Add the new session to the sessions array
                  const newSession = {
                    id: `session_${Date.now()}`,
                    therapist: {
                      name: "Dr. Sarah Johnson", // Using a default therapist
                      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
                    },
                    date: new Date(selectedDate),
                    startTime: customTime || selectedTime,
                    endTime: customTime ? 
                      // Calculate end time based on 45 min duration
                      new Date(new Date(`1970-01-01T${customTime}`).getTime() + 45 * 60000).toTimeString().substring(0, 5) : 
                      new Date(new Date(`1970-01-01T${selectedTime}`).getTime() + 45 * 60000).toTimeString().substring(0, 5),
                    type: "Video",
                    status: "Confirmed",
                    location: "Secure Video Call",
                    relatedTo: "General consultation",
                    notes: "Newly booked session",
                  };
                  
                  setSessions([...sessions, newSession]);
                  setIsBookingModalOpen(false);
                  toast.success(`Session booked for ${format(selectedDate, "MMM d, yyyy")} at ${customTime || selectedTime}`);
                  
                  // Optionally navigate to booking confirmation
                  // navigate("/booking-confirmation");
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