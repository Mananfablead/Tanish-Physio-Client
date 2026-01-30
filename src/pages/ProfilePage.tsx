import { Layout } from "@/components/layout/Layout";
import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  ShieldCheck,
  Clock,
  Camera,
  Save,
  FileText,
  Star,
  Users,
  Calendar,
  Play,
  Activity,
  VideoIcon,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  PlusCircle,
  CalendarDays,
  BarChart3
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/store";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { fetchUserSubscriptions } from "@/store/slices/subscriptionSlice";
import { fetchUserPayments } from "@/store/slices/paymentSlice";
import {
  fetchUpcomingSessions,
  fetchAllSessions,
} from "@/store/slices/sessionSlice";
import { getAllBookingsAsync } from "@/store/slices/bookingsSlice";
import {
  updateProfile,
  setCredentials,
  fetchProfile,
} from "@/store/slices/authSlice";

import api from "@/lib/api";
import { rescheduleSession, getAvailability } from "@/lib/api";

// Helper function to format session dates and times
const formatSessionDateTime = (startTime?: string, endTime?: string) => {
  if (!startTime) return "-";

  const startDate = new Date(startTime);
  const endDate = endTime ? new Date(endTime) : null;

  const dateStr = startDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const startTimeStr = startDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const endTimeStr = endDate
    ? endDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "-";

  return `${dateStr} - ${startTimeStr} to ${endTimeStr}`;
};

// Define types for API responses
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

// --- Sub-components for Right Panel consistency ---

const RightPanelCard = ({
  title,
  badge,
  children,
  footer,
}: {
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) => (
  <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[260px] flex flex-col justify-between overflow-hidden">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
          {title}
        </h3>
        {badge}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
    {footer && (
      <div className="flex justify-end items-center gap-3 pt-6 border-t border-slate-50 mt-auto">
        {footer}
      </div>
    )}
  </Card>
);

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

export default function ProfilePage() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<string>("personal");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Reschedule states
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState<boolean>(false);
  const [sessionToReschedule, setSessionToReschedule] = useState<any>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>("");
  const [rescheduleTime, setRescheduleTime] = useState<string>("");
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  
  // Calendar states
  const [availability, setAvailability] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  // Get data from Redux store
  const {
    userSubscriptions,
    loading: subsLoading,
    error: subsError,
  } = useSelector((state: any) => state.subscriptions);
  const {
    userPayments,
    loading: paymentsLoading,
    error: paymentsError,
  } = useSelector((state: any) => state.payment);

  const { toast } = useToast();

  const {
    upcomingSessions,
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
  } = useSelector((state: { sessions: any }) => state.sessions);
  const {
    bookings,
    loading: bookingsLoading,
    error: bookingsError,
  } = useSelector((state: any) => state.bookings);
  const bookingList = bookings || [];
  const activePlan = user?.subscriptionData;
  // Set state based on Redux data
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const nextSession =
    upcomingSessions?.find((session: any) => session.status === "live") || null;
  // Fetch user data when component mounts
  useEffect(() => {
    dispatch(fetchUserSubscriptions());
    dispatch(fetchUserPayments());
    dispatch(fetchUpcomingSessions());
    dispatch(fetchAllSessions());
    dispatch(getAllBookingsAsync());
    dispatch(fetchProfile());
  }, []);

  // Handle session rescheduling
  const handleReschedule = async () => {
    if (!sessionToReschedule || !rescheduleDate || !rescheduleTime) {
      setRescheduleError("Please select both date and time");
      return;
    }

    try {
      const rescheduleData = {
        date: rescheduleDate,
        time: rescheduleTime,
        startTime: `${rescheduleDate}T${rescheduleTime}:00`,
        status: "scheduled"
      };

      const response: any = await rescheduleSession(sessionToReschedule._id, rescheduleData);
      
      if (response.data?.success) {
        // Refresh sessions data
        dispatch(fetchAllSessions());
        dispatch(fetchUpcomingSessions());
        
        setIsRescheduleModalOpen(false);
        setSessionToReschedule(null);
        setRescheduleDate("");
        setRescheduleTime("");
        setRescheduleError(null);
        toast({ title: "Session rescheduled successfully", variant: "default" });
      } else {
        setRescheduleError(response.data?.message || "Failed to reschedule session");
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Failed to reschedule session";
      setRescheduleError(errorMessage);
      setTimeout(() => setRescheduleError(null), 5000);
    }
  };

  // Get status badge class
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
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  // Calendar utility functions
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const isToday = (dateStr: string) => dateStr === todayStr;
  const isSelected = (dateStr: string) => dateStr === selectedDate;

  const isPastDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":");
    const h = Number(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  const handleTimeSlotClick = (date: string, timeSlot: any) => {
    if (timeSlot.status === 'available') {
      setSelectedDate(date);
      setRescheduleDate(date);
      setRescheduleTime(timeSlot.start);
    }
  };

  // Get today's date for highlighting
  const todayDate = new Date();
  
  // Calendar weeks memoization
  const calendarWeeks = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const availabilityForDate = availability.find((item: any) => item.date === dateStr);

      let status = 0;
      if (availabilityForDate && availabilityForDate.timeSlots) {
        const slots = availabilityForDate.timeSlots;
        const bookedSlots = slots.filter((slot: any) => slot.status === 'booked');
        const unavailableSlots = slots.filter((slot: any) => slot.status === 'unavailable');
        const availableSlots = slots.filter((slot: any) => slot.status === 'available');

        if (bookedSlots.length > 0) {
          status = 1;
        } else if (unavailableSlots.length > 0 && availableSlots.length === 0) {
          status = 2;
        } else if (availableSlots.length > 0) {
          status = 0;
        }
      }

      return {
        date: dateStr,
        day,
        status,
        availability: availabilityForDate
      };
    });

    const weeks = [];
    const paddingStart = firstDayOfMonth;
    const paddingEnd = (7 - (paddingStart + daysInMonth) % 7) % 7;

    const paddedDays = [
      ...Array(paddingStart).fill(null),
      ...calendarDays,
      ...Array(paddingEnd).fill(null)
    ];

    for (let i = 0; i < paddedDays.length; i += 7) {
      weeks.push(paddedDays.slice(i, i + 7));
    }

    return weeks;
  }, [currentYear, currentMonth, availability]);

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return ''; 
      case 1: return 'bg-green-100 text-green-700 hover:bg-green-200';
      case 2: return 'bg-muted text-muted-foreground'; 
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getDateStatus = (date: string) => {
    const dayAvailability = availability.find((item: any) => item.date === date);

    if (!dayAvailability || !dayAvailability.timeSlots?.length) {
      return "unavailable";
    }

    const hasAvailable = dayAvailability.timeSlots.some(
      (slot: any) => slot.status === "available"
    );

    return hasAvailable ? "available" : "booked";
  };

  // Fetch availability when reschedule modal opens
  useEffect(() => {
    const fetchAvailability = async () => {
      if (isRescheduleModalOpen) {
        setAvailabilityLoading(true);
        try {
          const response: any = await getAvailability();
          setAvailability(response.data?.data?.availability || []);
        } catch (error) {
          console.error("Failed to fetch availability:", error);
        } finally {
          setAvailabilityLoading(false);
        }
      }
    };

    fetchAvailability();
  }, [isRescheduleModalOpen]);

  // Define sections for sidebar navigation
  const sections = [
    {
      id: "personal",
      label: "Personal Info",
      sub: "Manage your personal details",
      icon: User,
      color: "text-primary",
    },
    {
      id: "activePlan",
      label: "Active Plan",
      sub: "Your current subscription",
      icon: Award,
      color: "text-primary",
    },
    {
      id: "bookSession",
      label: "Book Session Now",
      sub: "Schedule a new session",
      color: "text-primary",
      icon: PlusCircle,
      isAction: true, // 👈 CTA flag
      
    },
    {
      id: "upcoming",
      label: "Upcoming Sessions",
      sub: "Your scheduled sessions",
      icon: Clock,
      color: "text-primary",
    },
    {
      id: "sessionHistory",
      label: "Session History",
      sub: "Your past sessions",
      icon: Play,
      color: "text-primary",
    },
    {
      id: "subscriptionHistory",
      label: "Subscription History",
      sub: "Your plan & payment history",
      icon: FileText,
      color: "text-primary",
    },
    {
      id: "bookings",
      label: "Service Bookings",
      sub: "All your booked services",
      icon: Calendar,
      color: "text-primary",
    },
  ];

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      console.error("Please select a valid image");
      return;
    }

    // ✅ INSTANT PREVIEW
    const localPreview = URL.createObjectURL(file);
    setPreviewImage(localPreview);

    const formData = new FormData();
    formData.append("profilePicture", file); // backend field name - matches your backend

    try {
      const response: any = await api.put("/auth/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl =
        response.data?.data?.profilePicture ||
        response.data?.data?.imageUrl ||
        response.data?.data?.image ||
        response.data?.profilePicture;

      const updatedUser = {
        ...user,
        image: imageUrl,
      };

      dispatch(setCredentials({ user: updatedUser, token: user?.id || "" }));

      // optional: preview ko real image se replace
      setPreviewImage(imageUrl);
    } catch (error) {
      console.error("Failed to update profile image", error);
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Get form data
      const nameInput = document.querySelector("#name") as HTMLInputElement;
      const phoneInput = document.querySelector("#phone") as HTMLInputElement;
      const locationInput = document.querySelector(
        "#location"
      ) as HTMLInputElement;

      const profileData = {
        name: nameInput?.value || user?.name,
        phone: phoneInput?.value || user?.phone,
        // Note: location field doesn't exist in User interface, so we'll skip it
        // If backend supports other fields, add them here
      };

      await dispatch(updateProfile(profileData));

      // Show success message
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <Layout>
      <div className="relative overflow-hidden bg-primary pt-16 pb-32">
        {/* Background Patterns */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2" />
          <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] translate-y-1/2" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
        </div>

        <div className="container relative z-10">
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-8">
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary via-accent to-primary rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500 animate-gradient-xy" />
              <div className="relative">
                <Avatar className="h-40 w-40 rounded-3xl border-4 border-slate-800 shadow-2xl relative overflow-hidden">
                  <AvatarImage
                    src={previewImage || user?.profilePicture}
                    alt={user?.name}
                    className="object-cover"
                  />

                  <AvatarFallback className="text-5xl font-black bg-slate-800 text-primary">
                    {user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute -bottom-2 -right-2 h-12 w-12 rounded-2xl shadow-2xl bg-primary hover:bg-primary/90 text-white border-4 border-slate-900"
                  onClick={() =>
                    document.getElementById("profile-image-upload")?.click()
                  }
                >
                  <Camera className="h-6 w-6" />
                </Button>
                <input
                  type="file"
                  id="profile-image-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div className="text-center lg:text-left space-y-4 flex-1">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <h1 className="text-5xl font-black text-white tracking-tight">
                    {user?.name}
                  </h1>
                  {/* <Badge className="bg-slate-800 text-primary hover:bg-primary/30 border-none px-4 py-1 text-xs font-black uppercase tracking-widest">
                    Pro Patient
                  </Badge> */}
                </div>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-white font-bold">
                  <p className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                    <Mail className="h-4 w-4 text-white" /> {user?.email}
                  </p>
                  <p className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                    <Phone className="h-4 w-4 text-white" /> {user?.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full lg:w-auto">
              {[
                {
                  label: "Active Plans",
                  value: activePlan ? "1" : "0",
                  icon: Activity,
                  color: "text-primary",
                  bg: "bg-primary/10",
                },
                {
                  label: "Completed",
                  value: sessionHistory.length,
                  icon: Calendar,
                  color: "text-accent",
                  bg: "bg-accent/10",
                },

                {
                  label: "Upcoming",
                  value: upcomingSessions.length,
                  icon: Clock,
                  color: "text-success",
                  bg: "bg-success/10",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 
             hover:shadow-md transition-all group shadow-sm
             flex flex-col items-center text-center"
                >
                  <div
                    className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3
               group-hover:scale-110 transition-transform`}
                  >
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>

                  <p className="text-2xl font-black text-primary leading-none">
                    {stat.value}
                  </p>

                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container -mt-16 pb-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Desktop Sidebar Nav */}
          <div className="hidden lg:block space-y-6">
            <Card className="p-4 rounded-2xl border-slate-200 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <div className="space-y-1">
                {sections.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "bookSession") {
                        navigate("/schedule");
                      } else {
                        setSelectedSection(item.id);
                      }
                    }}
                    className={`w-full text-left p-3.5 rounded-xl transition-all duration-300 group
    ${
      selectedSection === item.id
        ? "bg-primary/10 shadow-inner"
        : "hover:bg-primary/10"
    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg transition-colors
        ${
          selectedSection === item.id
            ? "bg-white shadow-sm"
            : "bg-primary/5 group-hover:bg-white"
        }`}
                      >
                        <item.icon className={`h-5 w-5  ${item.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-black text-sm transition-colors
          ${selectedSection === item.id ? "text-primary" : "text-slate-700"}`}
                        >
                          {item.label}
                        </div>

                        <div className="text-[11px] font-medium truncate text-slate-500">
                          {item.sub}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* <Card className="p-6 rounded-2xl bg-slate-900 text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-24 w-24" />
              </div>
              <div className="relative z-10 space-y-4">
                <h4 className="font-black text-lg leading-tight">Need Medical Assistance?</h4>
                <p className="text-slate-400 text-sm font-medium">Our support team and therapists are here for you 24/7.</p>
                <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-black rounded-xl h-11">
                  Contact Support
                </Button>
              </div>
            </Card> */}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Mobile Navigation Trigger */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-primary transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <Menu className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">
                      Current Section
                    </p>
                    <p className="text-lg font-black text-slate-900 leading-none">
                      {sections.find((s) => s.id === selectedSection)?.label ||
                        "Menu"}
                    </p>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </button>
            </div>

            <div className="bg-slate-200/40 backdrop-blur p-3 rounded-2xl space-y-4 border border-slate-200 shadow-sm">
              {/* Detail panel: shows the selected sidebar item */}
              <div className="space-y-6">
                {selectedSection === "activePlan" && (
                  <RightPanelCard
                    title="Active Plan"
                    badge={
                      activePlan && (
                        <Badge className="bg-success/10 text-success border-none font-bold">
                          ACTIVE
                        </Badge>
                      )
                    }
                    footer={
                      activePlan && (
                        <>
                          {/* <Button
                            variant="outline"
                            className="h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-primary font-bold"
                            onClick={handleCancelPlan}
                          >
                            Cancel Plan
                          </Button> */}
                          {/* <Button
                            className="h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-black"
                            onClick={() => {
                              // For active plan, navigate to schedule with subscription data
                              navigate("/schedule", {
                                state: {
                                  fromSubscription: true,
                                  plan: activePlan,
                                  subscriptionId: activePlan?._id
                                }
                              });
                            }}
                          >
                            Create Session
                          </Button> */}
                        </>
                      )
                    }
                  >
                    {activePlan ? (
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h2 className="text-3xl font-black text-slate-900">
                              {activePlan?.planName || "Subscription Plan"}
                            </h2>

                            <p className="text-slate-500 font-medium mt-1">
                              Payment via{" "}
                              {activePlan?.paymentGateway || "Razorpay"} •
                              Status: {activePlan?.status || "inactive"}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="text-3xl font-black text-primary">
                              ₹{activePlan?.amount ?? 0}
                            </div>
                            <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                              {activePlan?.currency || "INR"}
                            </div>
                          </div>
                        </div>

                        {/* Info blocks */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <InfoBlock
                            label="Start Date"
                            value={
                              activePlan?.startDate
                                ? new Date(
                                    activePlan.startDate
                                  ).toLocaleDateString()
                                : "-"
                            }
                            icon={Clock}
                            iconColor="text-warning"
                          />

                          <InfoBlock
                            label="Valid Till"
                            value={
                              activePlan?.endDate
                                ? new Date(
                                    activePlan.endDate
                                  ).toLocaleDateString()
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
                        <Button
                          asChild
                          className="h-11 rounded-xl bg-primary hover:bg-primary/90 px-8 font-black"
                        >
                          <Link to="/plans">Explore Our Plans</Link>
                        </Button>
                      </div>
                    )}
                  </RightPanelCard>
                )}

                {selectedSection === "upcoming" && (
                  <>
                    {upcomingSessions.length > 0 && (
                      <RightPanelCard title="Upcoming Sessions  ">
                        <div className="space-y-4">
                          {upcomingSessions.map((session) => (
                            <div
                              key={session.id}
                              className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-white hover:shadow-sm transition"
                            >
                              {/* Avatar */}
                              {/* <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                <User className="h-6 w-6 text-slate-400" />
                              </div> */}

                              {/* Therapist + Session Info */}
                              <div className="flex-1">
                                <h4 className="font-black text-slate-900">
                                  {session?.bookingId?.serviceName}
                                </h4>
                                <p className="text-sm text-slate-500 font-medium">
                                  {formatSessionDateTime(
                                    session?.startTime,
                                    session?.endTime
                                  )}
                                </p>
                              </div>

                              {/* Status */}
                              <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-primary/10 text-primary">
                                {session.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </RightPanelCard>
                    )}

                    {nextSession ? (
                      <RightPanelCard
                        title="Upcoming Session"
                        badge={
                          <Badge className="bg-primary/10 text-primary hover:text-white border-none font-bold">
                            {nextSession.status}
                          </Badge>
                        }
                        footer={
                          <div className="flex gap-3 w-full">
                            <Button
                              variant="outline"
                              className="flex-1 h-11 rounded-xl border-slate-200 font-bold hover:bg-primary"
                            >
                              <Users className="h-5 w-5 mr-2" /> Message
                            </Button>
                            <Link
                              to={`/video-call?sessionId=${nextSession._id}`}
                              className="flex-1"
                            >
                              <Button className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-black">
                                <Play className="h-5 w-5 mr-2 fill-white" />
                                Join Session
                              </Button>
                            </Link>
                          </div>
                        }
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InfoBlock
                            label="Date & Time"
                            value={new Date(
                              nextSession.startTime || nextSession.date
                            ).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                            subValue={`${new Date(
                              nextSession.startTime || nextSession.date
                            ).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })} — ${new Date(
                              nextSession.endTime || nextSession.date
                            ).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`}
                            icon={Calendar}
                            iconColor="text-primary"
                          />
                          <InfoBlock
                            label="Session Type"
                            value={
                              nextSession.location ||
                              nextSession.type ||
                              "Online"
                            }
                            subValue="1 on 1 Consultation"
                            icon={VideoIcon}
                            iconColor="text-accent"
                          />
                          <div className="md:col-span-2">
                            <InfoBlock
                              label="Session Focus"
                              value={
                                nextSession.relatedTo ||
                                nextSession.serviceName ||
                                "General Consultation"
                              }
                              subValue={
                                nextSession.notes ||
                                nextSession.description ||
                                "Status updated to live"
                              }
                              icon={Activity}
                              iconColor="text-success"
                            />
                          </div>
                        </div>
                      </RightPanelCard>
                    ) : (
                      <RightPanelCard title="Upcoming Session">
                        <div className="py-8 text-center space-y-4">
                          <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                            <Calendar className="h-8 w-8 text-slate-300" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900">
                              No Upcoming Sessions
                            </h3>
                            <p className="text-slate-500 font-medium max-w-xs mx-auto">
                              You don't have any sessions scheduled at the
                              moment.
                            </p>
                          </div>
                        </div>
                      </RightPanelCard>
                    )}
                  </>
                )}

                {selectedSection === "sessionHistory" && (
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
                      <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                  Service
                                </th>

                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                  Date & Time
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                  Type
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                  Duration
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                                  Status
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                                  Actions
                                </th>

                              </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                              {sessions.map((s) => {
                                const isCompleted = s.status === "completed";

                                return (
                                  <tr
                                    key={s._id}
                                    className="hover:bg-slate-50/50 transition-colors"
                                  >
                                    {/* Service */}
                                    <td className="px-6 py-4">
                                      <div className="font-bold text-slate-900">
                                        {s.bookingId?.serviceName ||
                                          "Therapy Session"}
                                      </div>
                                    </td>

                                    {/* Date & Time */}
                                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
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
                                      <br />
                                      <span className="text-xs">
                                        {s.time || "—"}
                                      </span>
                                    </td>

                                    {/* Type */}
                                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                      {s.type || "1-on-1"}
                                    </td>

                                    {/* Duration */}
                                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                      {s.duration ? `${s.duration} min` : "—"}
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4 text-center">
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
                                                  : "bg-amber-100 text-amber-700"
                                            }`}
                                        >
                                          {s.status}
                                        </span>
                                      )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-center">
                                      {(s.status === "scheduled" || s.status === "pending") && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="font-bold border-primary text-primary hover:bg-primary hover:text-white"
                                          onClick={() => {
                                            setSessionToReschedule(s);
                                            setRescheduleDate("");
                                            setRescheduleTime("");
                                            setRescheduleError(null);
                                            setIsRescheduleModalOpen(true);
                                          }}
                                        >
                                          <CalendarDays className="h-3 w-3 mr-1" />
                                          Reschedule
                                        </Button>
                                      )}
                                    </td>



                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    ) : (
                      <RightPanelCard title="Session History">
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
                      </RightPanelCard>
                    )}
                  </div>
                )}

                {selectedSection === "bookings" && (
                  <div className="space-y-6">
                    {/* HEADER */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                          Your Bookings
                        </h2>

                        {bookingList.filter((b) => b.status === "confirmed")
                          .length > 0 && (
                          <Badge className="bg-green-100 text-green-700 font-black flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {
                              bookingList.filter(
                                (b) => b.status === "confirmed"
                              ).length
                            }{" "}
                            Confirmed
                          </Badge>
                        )}
                      </div>

                      {/* CREATE SESSION BUTTON */}
                      <Button
                        size="sm"
                        className="rounded-xl font-black"
                        disabled={
                          bookingList.filter(
                            (b) => b.status === "confirmed" && !b.sessionCreated
                          ).length === 0
                        }
                        onClick={() => {
                          const confirmedBooking = bookingList.find(
                            (b) => b.status === "confirmed" && !b.sessionCreated
                          );

                          if (!confirmedBooking) {
                            toast({
                              title:
                                "No confirmed booking available to create a session",
                              variant: "default",
                            });
                            return;
                          }

                          navigate("/schedule", {
                            state: {
                              bookingId: confirmedBooking._id,
                              serviceId: confirmedBooking.serviceId,
                              therapistId: confirmedBooking.therapistId,
                              date: confirmedBooking.date,
                              time: confirmedBooking.time,
                            },
                          });
                        }}
                      >
                        Create Session
                      </Button>
                    </div>

                    {/* TABLE */}
                    {bookingList.length > 0 ? (
                      <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                  Service
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                  Date & Time
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                  Therapist
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                                  Amount
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                                  Status
                                </th>
                              </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                              {bookingList.map((booking) => (
                                <tr
                                  key={booking._id}
                                  className="hover:bg-slate-50/50 transition-colors"
                                >
                                  {/* SERVICE */}
                                  <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900">
                                      {booking.serviceName || "N/A"}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                      {booking.serviceId?.name || "N/A"}
                                    </div>
                                  </td>

                                  {/* DATE & TIME */}
                                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                    {new Date(booking.date).toLocaleDateString(
                                      "en-IN",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )}
                                    <br />
                                    <span className="text-xs">
                                      {booking.time}
                                    </span>
                                  </td>

                                  {/* THERAPIST */}
                                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                    {booking.therapistName || "N/A"}
                                  </td>

                                  {/* AMOUNT */}
                                  <td className="px-6 py-4 text-right">
                                    <span className="font-black text-slate-900">
                                      ₹{booking.amount || 0}
                                    </span>
                                  </td>

                                  {/* STATUS */}
                                  <td className="px-6 py-4 text-center">
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-black uppercase
                        ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                                    >
                                      {booking.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    ) : (
                      <RightPanelCard title="Booking History">
                        <div className="py-12 text-center space-y-4">
                          <h3 className="text-xl font-black text-slate-900">
                            No Bookings Found
                          </h3>
                          <p className="text-slate-500 font-medium">
                            You haven't made any bookings yet.
                          </p>
                          <Button
                            asChild
                            className="h-11 rounded-xl px-8 font-black"
                          >
                            <Link to="/services">Explore Services</Link>
                          </Button>
                        </div>
                      </RightPanelCard>
                    )}
                  </div>
                )}

                {selectedSection === "subscriptionHistory" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                          Subscription History
                        </h2>
                        <p className="text-slate-500 font-medium text-sm">
                          History of your plan purchases and renewals
                        </p>
                      </div>
                    </div>

                    {userSubscriptions && userSubscriptions.length > 0 ? (
                      <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                  Plan Name
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                  Purchase Date
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                                  Amount
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                                  Status
                                </th>
                              </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                              {userSubscriptions.map((p) => (
                                <tr
                                  key={p._id}
                                  className="hover:bg-slate-50/50 transition-colors"
                                >
                                  {/* Plan Name */}
                                  <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900">
                                      {p.planName}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                      via {p.paymentGateway}
                                    </div>
                                  </td>

                                  {/* Purchase Date */}
                                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                    {new Date(p.createdAt).toLocaleDateString(
                                      "en-IN",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      }
                                    )}
                                  </td>

                                  {/* Amount */}
                                  <td className="px-6 py-4 text-right">
                                    <span className="font-black text-slate-900">
                                      ₹{p.amount}
                                    </span>
                                  </td>

                                  {/* Status */}
                                  <td className="px-6 py-4 text-center">
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-black uppercase
                    ${
                      p.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                                    >
                                      {p.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    ) : (
                      <RightPanelCard title="Subscription History">
                        <div className="py-12 text-center space-y-4">
                          <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                            <FileText className="h-8 w-8 text-slate-300" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900">
                              No Subscription History
                            </h3>
                            <p className="text-slate-500 font-medium">
                              You haven't purchased any plans yet.
                            </p>
                          </div>
                          {/* <Button
                            asChild
                            className="h-11 rounded-xl bg-primary hover:bg-primary/90 px-8 font-black"
                          >
                            <Link to="/plans">Explore Our Plans</Link>
                          </Button> */}
                        </div>
                      </RightPanelCard>
                    )}
                  </div>
                )}
              </div>

              {/* Show only when user selects Personal Info or Medical History */}
              {selectedSection === "personal" && (
                <div className="space-y-8">
                  <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="grid w-full grid-cols-1 h-14 p-1.5 bg-slate-200/50 backdrop-blur-md rounded-2xl mb-8 border border-slate-200 shadow-sm">
                      <TabsTrigger
                        value="personal"
                        className="rounded-xl font-black text-sm transition-all duration-300 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md"
                      >
                        Personal Info
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal">
                      <RightPanelCard
                        title="Personal Details"
                        footer={
                          <Button
                            className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-black transition-all"
                            onClick={handleSaveChanges}
                          >
                            <Save className="h-5 w-5 mr-2" /> Save Changes
                          </Button>
                        }
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Full Name */}
                          <div className="space-y-2.5">
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                              Full Name
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                              <Input
                                id="name"
                                defaultValue={user?.name ?? "User"}
                                className="h-12 pl-10 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 font-bold"
                              />
                            </div>
                          </div>

                          {/* Email */}
                          <div className="space-y-2.5">
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                              Email Address
                            </Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                              <Input
                                defaultValue={user?.email}
                                disabled
                                className="h-12 pl-10 rounded-xl bg-slate-50 border-slate-200 font-bold text-slate-500"
                              />
                            </div>
                          </div>

                          {/* Phone */}
                          <div className="space-y-2.5">
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                              Phone Number
                            </Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                              <Input
                                id="phone"
                                defaultValue={user?.phone ?? ""}
                                className="h-12 pl-10 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 font-bold"
                              />
                            </div>
                          </div>

                          {/* Location */}
                          <div className="space-y-2.5">
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">
                              Location
                            </Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                              <Input
                                placeholder="Enter your location"
                                className="h-12 pl-10 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 font-bold"
                              />
                            </div>
                          </div>
                        </div>
                      </RightPanelCard>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-2xl p-6 transition-transform transform animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Profile Sections
                </h3>
                <p className="text-slate-500 font-medium text-xs uppercase tracking-widest mt-1">
                  Navigate your profile
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl bg-slate-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-3 pb-8">
              {sections.map((section) => {
                const isSelected =
                  selectedSection === section.id && !section.isAction;

                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      if (section.isAction) {
                        navigate("/schedule"); // 👈 action
                      } else {
                        setSelectedSection(section.id);
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all
          ${
            isSelected
              ? "bg-primary/10 border-primary/20 shadow-inner"
              : "bg-slate-50 border-slate-100 hover:bg-white hover:border-primary/30"
          }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl
            ${isSelected ? "bg-white shadow-sm" : "bg-white/50"}`}
                    >
                      <section.icon className={`h-5 w-5 ${section.color}`} />
                    </div>

                    <div className="text-left flex-1">
                      <p
                        className={`font-black text-sm
              ${isSelected ? "text-primary" : "text-slate-700"}`}
                      >
                        {section.label}
                      </p>

                      <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                        {section.sub}
                      </p>
                    </div>

        {/* Active dot only for real sections */}
        {isSelected && (
          <div className="h-2 w-2 rounded-full bg-primary" />
        )}
      </button>
    );
  })}
</div>

            </div>
          </div>
        )
      }
      
      {/* Reschedule Modal */}
  {isRescheduleModalOpen && sessionToReschedule && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4">
    <div
      className="
        bg-white w-full max-w-4xl rounded-2xl shadow-xl
        max-h-[95vh] flex flex-col
      "
    >
      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-4 border-b">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900">
            Reschedule Session
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Select a new date and time for this session.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            setIsRescheduleModalOpen(false);
            setSessionToReschedule(null);
            setRescheduleError(null);
            setRescheduleDate("");
            setRescheduleTime("");
            setSelectedDate(null);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* ================= BODY (SCROLLABLE) ================= */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* CURRENT SESSION INFO */}
        <div className="p-4 rounded-lg bg-slate-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <p className="text-sm">
              <span className="text-slate-500">Current Date:</span>{" "}
              <span className="font-medium">
                {sessionToReschedule.date
                  ? new Date(sessionToReschedule.date).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "N/A"}
              </span>
            </p>

            <p className="text-sm">
              <span className="text-slate-500">Current Time:</span>{" "}
              <span className="font-medium">
                {sessionToReschedule.startTime
                  ? new Date(
                      sessionToReschedule.startTime
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : sessionToReschedule.time || "N/A"}
              </span>
            </p>
          </div>
        </div>

        {/* CALENDAR + SLOTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CALENDAR */}
          <div className="border rounded-lg p-3 bg-slate-50">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-slate-800 text-sm">
                Select Date
              </h4>

              <div className="flex items-center gap-1">
                <button
                  className="h-8 w-8 rounded-md border bg-white hover:bg-slate-100 flex items-center justify-center"
                  onClick={() => {
                    if (currentMonth === 0) {
                      setCurrentMonth(11);
                      setCurrentYear(currentYear - 1);
                    } else {
                      setCurrentMonth(currentMonth - 1);
                    }
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="text-xs font-semibold px-2">
                  {new Date(currentYear, currentMonth).toLocaleString(
                    "default",
                    { month: "short", year: "numeric" }
                  )}
                </span>

                <button
                  className="h-8 w-8 rounded-md border bg-white hover:bg-slate-100 flex items-center justify-center"
                  onClick={() => {
                    if (currentMonth === 11) {
                      setCurrentMonth(0);
                      setCurrentYear(currentYear + 1);
                    } else {
                      setCurrentMonth(currentMonth + 1);
                    }
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 mb-2">
              {"Su Mo Tu We Th Fr Sa".split(" ").map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarWeeks.flat().map((day, i) =>
                day ? (
                  <button
                    key={i}
                    disabled={isPastDate(day.date) }
                    onClick={() => {
                      setSelectedDate(day.date);
                      setRescheduleDate(day.date);
                    }}
                    className={`
                      h-8 w-8 rounded-full text-xs flex items-center justify-center
                      ${isPastDate(day.date)
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : getStatusColor(day.status)}
                      ${rescheduleDate === day.date
                        ? "ring-2 ring-primary bg-primary text-white"
                        : ""}
                    `}
                  >
                    {day.day}
                  </button>
                ) : (
                  <div key={i} />
                )
              )}
            </div>
          </div>

          {/* TIME SLOTS */}
          <div className="border rounded-lg p-3 bg-slate-50">
            <h4 className="font-bold text-slate-800 mb-3 text-sm">
              Available Time Slots
            </h4>

            {rescheduleDate ? (
              <div className="space-y-2 max-h-48 md:max-h-80 overflow-y-auto">
                {availability
                  .find((a: any) => a.date === rescheduleDate)
                  ?.timeSlots?.map((slot: any, i: number) => (
                    <button
                      key={i}
                      disabled={slot.status !== "available"}
                      onClick={() =>
                        slot.status === "available" &&
                        handleTimeSlotClick(rescheduleDate, slot)
                      }
                      className={`
                        w-full p-2 rounded-lg border text-left text-sm
                        ${slot.status === "available"
                          ? "border-green-300 hover:bg-green-50"
                          : slot.status === "booked"
                          ? "border-red-300 opacity-50"
                          : "border-gray-300 opacity-50"}
                        ${rescheduleTime === slot.start
                          ? "ring-2 ring-primary bg-primary/10"
                          : ""}
                      `}
                    >
                      {formatTime(slot.start)} – {formatTime(slot.end)}
                    </button>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Select a date to see time slots
              </p>
            )}
          </div>
        </div>

        {/* ERROR */}
        {rescheduleError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">
              {rescheduleError}
            </p>
          </div>
        )}
      </div>

      {/* ================= FOOTER ================= */}
      <div className="px-4 sm:px-6 py-4 border-t bg-slate-50 flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            setIsRescheduleModalOpen(false);
            setSessionToReschedule(null);
            setRescheduleError(null);
            setRescheduleDate("");
            setRescheduleTime("");
            setSelectedDate(null);
          }}
        >
          Cancel
        </Button>

        <Button
          className="flex-1 bg-gradient-to-r from-primary to-accent"
          disabled={!rescheduleDate || !rescheduleTime}
          onClick={handleReschedule}
        >
          Confirm
        </Button>
      </div>
    </div>
  </div>
)}

    </Layout >
  );
}
