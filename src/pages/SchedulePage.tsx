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
  Star,
  Check,
  ArrowRight,
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
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { getAvailability, getAllSessions, getUpcomingSessions, getSessionById, createSession, updateSession, deleteSession, getSessionsByUserId, getSessionsByTherapistId, getCompletedSessions, getScheduledSessions, cancelSession, rescheduleSession, getSessionNotes, addSessionNotes, getPastSessions, getTodaySessions, checkSubscriptionEligibility, createFreeSessionWithSubscription, createBookingWithSubscription, getSubscriptionServices } from "@/lib/api";
import { fetchAllServices } from "@/store/slices/serviceSlice";
import { fetchAllSessions, fetchUpcomingSessions, fetchPastSessions, fetchCompletedSessions, fetchScheduledSessions, fetchTodaySessions, fetchSessionById, fetchSessionsByUserId, createNewSession, updateExistingSession, deleteExistingSession, cancelSessionById, rescheduleSessionById, fetchSessionNotes, addSessionNote } from '@/store/slices/sessionSlice';
import { useAppDispatch, useAppSelector } from '@/store';
import { useDispatch, useSelector } from "react-redux";
import { fetchUserSubscriptions } from "@/store/slices/subscriptionSlice";
import { fetchPublicAdmins } from "@/store/slices/adminSlice";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { RootState } from "@/store";
import { fetchSubscriptionPlans } from "@/store/slices/subscriptionSlice";
export default function SchedulePage() {
  const location = useLocation();
  const { admins: publicAdmins, loading: adminsLoading, error: adminsError } = useSelector((state: RootState) => state.admins);
  const user = useSelector(selectCurrentUser);

  const { userSubscriptions, loading: subscriptionLoading, error: subscriptionError } = useSelector((state: RootState) => state.subscriptions);
  const { plans } = useSelector(
    (state: any) => state.subscriptions
  );
  const { services: allServices, loading: servicesLoading } = useSelector((state: RootState) => state.services);

  // Helper function to get service duration from booking data
  const getServiceDuration = () => {
    // Try multiple sources for service duration
    if (bookingData?.service?.duration) {
      // Parse duration string like "45 minutes" to get numeric value
      const durationMatch = bookingData.service.duration.match(/(\d+)/);
      if (durationMatch) return parseInt(durationMatch[1]);
    }

    if (bookingData?.bookingId && user?.purchasedServices) {
      const service = user.purchasedServices.find((s: any) => s.bookingId === bookingData.bookingId);
      if (service && service.duration) {
        const durationMatch = service.duration.match(/(\d+)/);
        if (durationMatch) return parseInt(durationMatch[1]);
      }
    }

    if (bookingData?.fromServices && bookingData?.serviceId?.duration) {
      const durationMatch = bookingData.serviceId.duration.match(/(\d+)/);
      if (durationMatch) return parseInt(durationMatch[1]);
    }

    if (bookingData?.bookingSummary?.duration) {
      const durationMatch = bookingData.bookingSummary.duration.match(/(\d+)/);
      if (durationMatch) return parseInt(durationMatch[1]);
    }

    // Fallback: try to get from session storage or other sources
    try {
      const storedPlan = sessionStorage.getItem("qw_plan");
      if (storedPlan) {
        const planData = JSON.parse(storedPlan);
        if (planData.service?.duration) {
          const durationMatch = planData.service.duration.match(/(\d+)/);
          if (durationMatch) return parseInt(durationMatch[1]);
        }
      }
    } catch (e) {
      console.error('Error getting service duration from storage:', e);
    }

    return null;
  };

  // Extract start and end time from the selected time format
  const getSubscriptionIdFromStorage = () => {
    try {
      const storedPlan = sessionStorage.getItem("qw_plan");
      if (storedPlan) {
        const planData = JSON.parse(storedPlan);
        return planData.subscriptionId || null;
      }
    } catch (e) {
      console.error("Error getting subscription ID:", e);
    }
    return null;
  };

  // Handle session booking
  const handleBooking = async () => {
    try {
      // Extract start and end time from the selected time format (e.g., "10:00 - 11:00" -> startTime: "10:00", endTime: "11:00")
      let startTime, endTime;
      if (selectedTime.includes(' - ')) {
        const timeParts = selectedTime.split(' - ');
        startTime = timeParts[0];
        endTime = timeParts[1];
      } else {
        startTime = selectedTime;
        endTime = null; // Backend will calculate endTime based on duration if not provided
      }

      // Check if user can book with subscription first
      if (subscriptionEligible && subscriptionInfo?.remainingSessions > 0) {
        // Use subscription-based booking API which creates a booking without payment required
        // Determine scheduleType based on whether we have specific scheduled date/time
        const scheduleType = (selectedDate > new Date() || (selectedDate.toDateString() === new Date().toDateString() && startTime > new Date().toTimeString().substring(0, 5))) ? 'later' : 'now';
        
        const subscriptionBookingData = {
          date: format(selectedDate, "yyyy-MM-dd"),
          time: startTime,
          notes: sessionNotesValue,
          clientName: user?.name || '',
          scheduleType: scheduleType, // Set scheduleType based on whether it's a future booking
          therapistId: bookingData?.therapistId || publicAdmins[0]?.id,
          serviceId: null, // For subscription bookings, serviceId can be null
          scheduledDate: format(selectedDate, "yyyy-MM-dd"), // Include scheduled date
          scheduledTime: startTime, // Include scheduled time
          timeSlot: {
            start: startTime,
            end: endTime || startTime // Use endTime if provided, otherwise use start time
          }
        };

        const response: any = await createBookingWithSubscription(subscriptionBookingData);
        
        if (response.data?.success) {
          // Add the new booking to sessions list if available in response
          if (response.data.data?.booking) {
            const newBooking = response.data.data.booking;
            setSessions([...sessions, {
              ...newBooking,
              id: newBooking._id,
              therapist: { name: newBooking.therapistName },
              bookingId: newBooking._id, // Use the booking _id as bookingId
              status: newBooking.status || 'pending'
            }]);
          }
          
          setIsBookingModalOpen(false);
          setBookingError(null);
          setIsSuccessDialogOpen(true);
          toast.success(
            user?.subscriptionData?.status === 'active' 
              ? `Session booked for ${format(selectedDate, "MMM d, yyyy")} at ${selectedTime} with your ${user.subscriptionData.planName} subscription!`
              : `Session booked for ${format(selectedDate, "MMM d, yyyy")} at ${selectedTime}`
          );
          
          // Refresh subscription info
          const refreshResponse = await checkSubscriptionEligibility();
          const { eligible, message, remainingSessions, planName, totalSessions, usedSessions } = refreshResponse.data.data;
          setSubscriptionInfo({
            eligible,
            message,
            remainingSessions,
            planName,
            totalSessions,
            usedSessions
          });
          
          // Navigate to profile page after 5 seconds
          setTimeout(() => {
            setIsSuccessDialogOpen(false);
            navigate("/profile");
          }, 5000);
          return;
        }
      }

      // Fall back to regular booking flow if subscription not eligible
      let subscriptionIdValue = null;
      if (bookingData?.fromSubscription) {
        subscriptionIdValue = bookingData?.subscriptionId || getSubscriptionIdFromStorage();
      } else if (bookingData?.subscriptionId) {
        subscriptionIdValue = bookingData?.subscriptionId;
      } else if (bookingData?.fromSubscription && !subscriptionIdValue) {
        subscriptionIdValue = getSubscriptionIdFromStorage();
      }
      if (bookingData?.plan?.id) {
        subscriptionIdValue = bookingData?.plan?.id;
      }

      // If no subscriptionId found in bookingData, use from user's subscriptionData
      if (!subscriptionIdValue && user?.subscriptionData?.id) {
        subscriptionIdValue = user?.subscriptionData?.id;
      }

      // Determine bookingId and subscriptionId based on user selection
      let finalBookingId = null;
      let finalSubscriptionId = subscriptionIdValue; // Start with existing subscriptionIdValue

      // Priority: Use selected service/subscription from dropdowns
      if (selectedServiceOrSubscription) {
        // Check if it's a service or subscription
        const isService = user?.purchasedServices?.some((service: any) => service.id === selectedServiceOrSubscription);
        const isSubscription = user?.subscriptionData?.id === selectedServiceOrSubscription;

        if (isService) {
          // Find the selected service and use its bookingId
          const selectedServiceData = user?.purchasedServices?.find((service: any) => service.id === selectedServiceOrSubscription);
          finalBookingId = selectedServiceData?.bookingId || null;
          finalSubscriptionId = null; // Clear subscriptionId when service is selected
        } else if (isSubscription) {
          // Use subscription bookingId and set subscriptionId
          finalBookingId = user?.subscriptionData?.bookingId || null;
          finalSubscriptionId = selectedServiceOrSubscription; // Set the subscriptionId to the selected subscription
        }
      } else if (bookingData?.fromServices || (bookingData?.bookingId && !subscriptionIdValue)) {
        finalBookingId = (bookingData?.bookingId || bookingData?.service?.bookingId) || null;
        finalSubscriptionId = null; // Clear subscriptionId when using bookingData service
      } else if (!subscriptionIdValue && user?.purchasedServices && user.purchasedServices.length > 0) {
        // Use the first purchased service bookingId if no specific booking ID and no subscription
        finalBookingId = user.purchasedServices[0].bookingId || null;
        finalSubscriptionId = null; // Clear subscriptionId when using first service
      }

      const sessionData = {
        bookingId: finalBookingId,
        subscriptionId: finalSubscriptionId,
        date: format(selectedDate, "yyyy-MM-dd"),
        time: startTime, // Still send time for backward compatibility
        startTime,
        endTime,
        type: sessionTypeValue,
        status: sessionStatusValue,
        therapistId: bookingData?.therapistId || publicAdmins[0]?.id,
        serviceId: selectedServiceOrSubscription, // Include the selected service ID
        notes: sessionNotesValue
      };

      const response: any = await createSession(sessionData);

      if (response.data?.success) {
        setSessions([...sessions, response.data.data.session]);
        setIsBookingModalOpen(false); // Close booking modal first
        setBookingError(null); // Clear any previous errors
        setIsSuccessDialogOpen(true); // Then show success dialog
        toast.success(
          `Session booked for ${format(selectedDate, "MMM d, yyyy")} at ${selectedTime}`
        );
        // Navigate to profile page after 5 seconds
        setTimeout(() => {
          setIsSuccessDialogOpen(false);
          navigate("/profile");
        }, 5000);
      } else {
        const errorMessage = response.data?.message || "Failed to book session";
        setBookingError(errorMessage);
        // If it's a slot duration error, don't clear selected time so user can pick a different slot
        if (!errorMessage.includes("selected slot is only") && !errorMessage.includes("larger time slot")) {
          // Clear the error after 5 seconds
          setTimeout(() => setBookingError(null), 5000);
        }
      }
    } catch (err) {
      // Check if it's an API error with specific message
      if (err?.response?.data?.message) {
        const errorMessage = err.response.data.message;

        // Handle specific session not active error
        if (errorMessage.includes("Session is not active at this time")) {
          setBookingError(
            "⏰ Session Not Active\n\nThis session is not currently active. Please check your scheduled appointment time and try again later."
          );
        } else {
          setBookingError(errorMessage);
        }
        // If it's a slot duration error, don't clear selected time so user can pick a different slot
        if (
          !errorMessage.includes("selected slot is only") &&
          !errorMessage.includes("larger time slot")
        ) {
          // Clear the error after 5 seconds
          setTimeout(() => setBookingError(null), 5000);
        }
      } else {
        setBookingError("Failed to book session");
        // Clear the error after 5 seconds
        setTimeout(() => setBookingError(null), 5000);
      }
    }
  };

  const navigate = useNavigate()
  const bookingData = location.state;

  const hasBookingSummary =
    bookingData?.fromServices || bookingData?.fromSubscription || bookingData?.bookingSummary;

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState<boolean>(false);
  const [isPlansModalOpen, setIsPlansModalOpen] = useState<boolean>(false);

  // UI Control States for Session Creation
  const [sessionTypeValue, setSessionTypeValue] = useState<string>("1-on-1");
  const [sessionStatusValue, setSessionStatusValue] = useState<string>("pending");
  const [sessionNotesValue, setSessionNotesValue] = useState<string>("");
  const [selectedServiceOrSubscription, setSelectedServiceOrSubscription] = useState<string>("");

  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for displaying error messages in the booking dialog
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Subscription state
  const [subscriptionEligible, setSubscriptionEligible] = useState<boolean>(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [checkingSubscription, setCheckingSubscription] = useState<boolean>(false);
  const [subscriptionServices, setSubscriptionServices] = useState<any[]>([]);

  // Auto-select first service when subscription is eligible
  useEffect(() => {
    if (subscriptionEligible && allServices && allServices.length > 0) {
      // Auto-select the first service since all are free with active subscription
      const firstService = allServices[0];
      const serviceId = 'id' in firstService ? firstService.id : (firstService as any)._id;
      setSelectedServiceOrSubscription(serviceId as string);
    } else if (subscriptionEligible && user?.subscriptionData?.id) {
      // Fallback to subscription if no services available
      setSelectedServiceOrSubscription(user.subscriptionData.id);
    }
  }, [subscriptionEligible, allServices, user?.subscriptionData]);

  // Get available times for selected date from availability API
  const getAvailableTimesForDate = (date: Date | null) => {
    if (!date || !availability) return [];

    const formattedDate = format(date, "yyyy-MM-dd");

    const dayAvailability = availability.find(
      (item: any) => item.date === formattedDate
    );

    if (!dayAvailability || !Array.isArray(dayAvailability.timeSlots)) {
      return [];
    }

    // 🔥 RETURN ONLY 45 MINUTE REGULAR SLOTS
    return dayAvailability.timeSlots.filter((slot: any) => {
      // Calculate slot duration in minutes
      const [startHour, startMinute] = slot.start.split(':').map(Number);
      const [endHour, endMinute] = slot.end.split(':').map(Number);
      const today = new Date();
      const slotStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), startHour, startMinute, 0, 0);
      const slotEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), endHour, endMinute, 0, 0);
      const slotDurationMinutes = Math.round((slotEnd.getTime() - slotStart.getTime()) / (1000 * 60));
      
      // Only return 45-minute regular slots
      return slotDurationMinutes === 45;
    });
  };


  const availableTimes = useMemo(() => {
    if (!availability || !Array.isArray(availability)) return [];
    return getAvailableTimesForDate(selectedDate);
  }, [selectedDate, availability]);

  const [sessions, setSessions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 10;

  const currentSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * sessionsPerPage;
    const endIndex = startIndex + sessionsPerPage;
    return sessions.slice(startIndex, endIndex);
  }, [sessions, currentPage]);
  const dispatch = useAppDispatch();
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Only fetch user subscriptions if user is logged in
        if (user) {
          dispatch(fetchUserSubscriptions() as any);
        }
        dispatch(fetchPublicAdmins() as any);
        // Fetch all services for active plan display
        dispatch(fetchAllServices() as any);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, [dispatch, user]);
  useEffect(() => {
    dispatch(fetchSubscriptionPlans(undefined) as any);
  }, [dispatch]);
  // Show subscription plans modal when user has no services or subscriptions
  useEffect(() => {
    // Check if user is a guest
    const isGuestUser = bookingData?.guestUser || sessionStorage.getItem("qw_guest_user") || (!user && !localStorage.getItem("token"));
    
    const hasNoServices = !user?.purchasedServices || user.purchasedServices.length === 0;
    const hasNoSubscription = !user?.subscriptionData;

    // Automatically show plans modal for guest users
    if (isGuestUser && plans && plans.length > 0 && !subscriptionLoading) {
      // Only show if not already showing another modal
      if (!isBookingModalOpen && !isSuccessDialogOpen && !isPlansModalOpen) {
        setIsPlansModalOpen(true);
      }
    }
    
    if (isBookingModalOpen && hasNoServices && hasNoSubscription) {
      setIsPlansModalOpen(true);
      setIsBookingModalOpen(false);
    }
  }, [isBookingModalOpen, isSuccessDialogOpen, user?.purchasedServices, user?.subscriptionData, userSubscriptions, user, plans, subscriptionLoading, bookingData]);

  // Debug effect to see what booking data is available
  useEffect(() => {
    if (bookingData) {
      // console.log('Booking data:', bookingData);
      const serviceDuration = getServiceDuration();
      // console.log('Detected service duration:', serviceDuration);
    }
  }, [bookingData]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch availability (public data)
        const availabilityResponse = await getAvailability();
        const availabilityData: any = availabilityResponse;
        setAvailability(availabilityData.data?.data?.availability || []);

        // Only fetch sessions if user is authenticated
        if (user) {
          const sessionsResponse = await getAllSessions();
          const sessionsData: any = sessionsResponse;

          if (sessionsData.data?.success) {
            setSessions(sessionsData.data.data.sessions || []);
            // Also dispatch to store in Redux
            // dispatch(fetchAllSessions());
          } else {
            setSessions([]);
          }
        } else {
          // For guest users, initialize with empty sessions
          setSessions([]);
        }

        setError(null);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        
        // Check if the error is due to unauthorized access
        if (err?.response?.status === 401) {
          // For unauthorized users, just set availability and empty sessions
          setSessions([]);
          setError(null); // Don't show error for unauthorized session access
          // Only show info message if user tried to access their sessions
          if (user) {
            toast.info('Please log in to view your sessions');
          }
        } else {
          setError('Failed to load schedule data');
          toast.error('Failed to load schedule data');
        }
        
        // Fallback to empty arrays
        setAvailability([]);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Check subscription eligibility when user changes
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (user) {
        try {
          setCheckingSubscription(true);
          const response = await checkSubscriptionEligibility();
          const { eligible, message, remainingSessions, planName, totalSessions, usedSessions } = response.data.data;
          
          setSubscriptionEligible(eligible);
          setSubscriptionInfo({
            eligible,
            message,
            remainingSessions,
            planName,
            totalSessions,
            usedSessions
          });

          // If eligible, use all available services instead of subscription-specific services
          if (eligible) {
            // Services are already fetched in the services slice
            setSubscriptionServices([]);
          } else {
            setSubscriptionServices([]);
          }
        } catch (error) {
          console.error('Error checking subscription status:', error);
          setSubscriptionEligible(false);
          setSubscriptionInfo(null);
          setSubscriptionServices([]);
        } finally {
          setCheckingSubscription(false);
        }
      } else {
        setSubscriptionEligible(false);
        setSubscriptionInfo(null);
        setSubscriptionServices([]);
      }
    };
    
    checkSubscriptionStatus();
  }, [user]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) =>
      direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };
console.log("user?.purchasedServices",user?.purchasedServices)
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

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return "bg-blue-500 text-white";
      case "confirmed":
        return "bg-indigo-600 text-white";
      case "live":
        return "bg-green-600 text-white animate-pulse";
      case "completed":
        return "bg-emerald-600 text-white";
      case "cancelled":
        return "bg-red-600 text-white";
      case "rescheduled":
        return "bg-yellow-500 text-black";
      default:
        return "bg-gray-400 text-white";
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-primary/5 pt-10 pb-20">
        <div className="container  mx-auto px-4 sm:px-6 lg:px-8">

          <div className="space-y-4 py-4">
            {/* <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  {hasBookingSummary ? "Your Sessions" : "Schedule"}
                </h1>
                <p className="text-slate-600 font-medium">
                  Manage your upcoming and past appointments
                </p>
              </div>
            </div> */}
            {/* Subscription Status Display */}
            {/* {user && subscriptionInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Package className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-bold text-blue-800">{subscriptionInfo.planName}</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      {subscriptionInfo.eligible ? (
                        <>
                          <p>You have <span className="font-bold">{subscriptionInfo.remainingSessions}</span> sessions remaining</p>
                          <p className="mt-1 text-xs">Book sessions for free with your subscription!</p>
                        </>
                      ) : (
                        <p>{subscriptionInfo.message}</p>
                      )}
                    </div>
                    {subscriptionInfo.totalSessions !== 'unlimited' && (
                      <div className="mt-2">
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${((subscriptionInfo.totalSessions - subscriptionInfo.remainingSessions) / subscriptionInfo.totalSessions) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                          {subscriptionInfo.usedSessions} of {subscriptionInfo.totalSessions} sessions used
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )} */}
            
            {/* Notification for users without services or subscriptions */}
            {(user && (!user.purchasedServices || user.purchasedServices.length === 0) && !user.subscriptionData && !subscriptionInfo?.eligible) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 ">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <span className="text-yellow-600 font-bold text-sm">!</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-bold text-yellow-800">No Plans or Services</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>You don't have any plans or services purchased yet.</p>
                      <p className="mt-1">Please select a plan to book a session.</p>
                    </div>
                    <div className="mt-3">
                      <Button 
                        onClick={() => setIsPlansModalOpen(true)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        size="sm"
                      >
                      Explore Our Plans
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {hasBookingSummary ? "Your Sessions" : "Schedule"}
              </h1>
              <p className="text-slate-600 font-medium">
                Manage your upcoming and past appointments
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/free-consultation')}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Book Free Consultation
              </Button>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column - Calendar */}
            <div className="lg:col-span-2">
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



                          const hasAvailableSlots = (day: Date) => {
                            if (!availability || !Array.isArray(availability)) return false;

                            const formattedDate = format(day, "yyyy-MM-dd");

                            const dayAvailability = availability.find(
                              (item: any) => item.date === formattedDate
                            );

                            if (!dayAvailability || !Array.isArray(dayAvailability.timeSlots)) {
                              return false;
                            }

                            return dayAvailability.timeSlots.some(
                              (slot: any) => {
                                // Calculate slot duration in minutes
                                const [startHour, startMinute] = slot.start.split(':').map(Number);
                                const [endHour, endMinute] = slot.end.split(':').map(Number);
                                const now = new Date();
                                const slotStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute, 0, 0);
                                const slotEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute, 0, 0);
                                const slotDurationMinutes = Math.round((slotEnd.getTime() - slotStart.getTime()) / (1000 * 60));
                                
                                // Only consider 45-minute regular slots as available
                                return slot.status === "available" && slotDurationMinutes === 45;
                              }
                            );
                          };
                          const isToday = isSameDay(day, today);
                          const isSelected = isSameDay(day, selectedDate);
                          const isPast = day < today && !isToday;

                          // ✅ NEW
                          const isAvailableDate = hasAvailableSlots(day);

                          const availabilityForDate = getAvailabilityForDate(day);
                          return isPast ? (
                            /* -------- Past Date (Disabled) -------- */
                            <div
                              key={index}
                              className="h-10 rounded-xl text-sm font-medium text-slate-300 flex items-center justify-center cursor-not-allowed"
                            >
                              {format(day, "d")}
                            </div>
                          ) : (
                            /* -------- Today & Future -------- */
                            <button
                              key={index}
                              onClick={() => {
                                setSelectedDate(day);
                                setIsBookingModalOpen(true);
                                setBookingError(null); // Clear any previous error when opening modal
                              }}
                              className={`
      h-10 rounded-xl text-sm font-medium flex items-center justify-center transition-all
      ${isSelected
                                  ? "bg-primary text-white font-black shadow-md"
                                  : availabilityForDate && !isAvailableDate
                                    ? "bg-blue-100 text-blue-700 font-semibold"        /* Booked */
                                    : !availabilityForDate
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"   /* Not Booked */
                                      : isToday
                                        ? "border border-primary/30 text-primary font-bold"
                                        : "bg-green-100 text-green-700 hover:bg-green-200" /* Available */
                                }
    `}
                            >
                              {format(day, "d")}
                            </button>
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
                      {/* Pagination Controls */}
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">
                          Showing {Math.min((currentPage - 1) * sessionsPerPage + 1, sessions.length)} - {Math.min(currentPage * sessionsPerPage, sessions.length)} of {sessions.length} sessions
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <span className="text-sm text-slate-600">
                            Page {currentPage} of {Math.ceil(sessions.length / sessionsPerPage)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(sessions.length / sessionsPerPage)))}
                            disabled={currentPage === Math.ceil(sessions.length / sessionsPerPage)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                      {currentSessions.map((session, index) => (
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
                                      {session.startTime
                                        ? new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : session.time ? session.time.split(' - ')[0] : "N/A"}
                                      {session.endTime && ` - ${new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                                    </span>
                                  
                                    <Badge variant="outline" className="text-xs font-bold">
                                      {session.type || session.sessionType || "1-on-1"}
                                    </Badge>
                                  
                                    {session.bookingId && (
                                      <Badge variant="outline" className="text-xs font-bold bg-blue-100 text-blue-800">
                                        Booking: {String(session.bookingId).substring(0, 8)}...
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Badge className={`text-xs font-bold ${getStatusBadgeClass(session.status)}`}>
                                  {session.status}
                                </Badge>
                                {/* <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button> */}
                              </div>

                              {/* DETAILS */}
                              <p className="text-sm text-slate-500 mt-3 flex gap-1">
                                <User className="h-4 w-4 mt-0.5" />
                                <span className="font-bold">Focus:</span>{" "}
                                {session.relatedTo || session.serviceName || session.service?.name || "General Physiotherapy"}
                              </p>

                              {session.notes && (
                                <p className="text-sm text-slate-500 mt-1 flex gap-1">
                                  <FileText className="h-4 w-4 mt-0.5" />
                                  <span className="font-bold">Notes:</span>{" "}
                                  {session.notes}
                                </p>
                              )}

                              {session.location && (
                                <p className="text-sm text-slate-500 mt-1 flex gap-1">
                                  <MapPin className="h-4 w-4 mt-0.5" />
                                  {session.location}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* ACTIONS */}
                          {/* ACTIONS */}


                        </motion.div>
                      ))}
                      {/* Pagination Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <span className="text-sm text-slate-600">
                            Page {currentPage} of {Math.ceil(sessions.length / sessionsPerPage)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(sessions.length / sessionsPerPage)))}
                            disabled={currentPage === Math.ceil(sessions.length / sessionsPerPage)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
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

                      {/* <p className="text-slate-500 font-medium max-w-xs mx-auto">
                        You don’t have any sessions scheduled for{" "}
                        {format(selectedDate, "MMMM d, yyyy")}.
                      </p> */}

                      <div className="space-y-3">
                        <Button
                          className="h-11 rounded-xl bg-primary text-white font-bold px-6 w-full"
                          onClick={() => setIsBookingModalOpen(true)}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Session
                        </Button>
                        <Button
                          variant="outline"
                          className="h-11 rounded-xl font-bold w-full"
                          onClick={() => navigate('/free-consultation')}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Book Free Consultation
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>

              </Card>


            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <motion.div 
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
            >

            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-xl font-black text-slate-900">
                Book Session
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsBookingModalOpen(false);
                  setBookingError(null);
                  setSessionTypeValue("");
                  setSelectedTime("");
                  setSelectedServiceOrSubscription("");
                }}
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

                {/* SERVICE OR SUBSCRIPTION DROPDOWN */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {subscriptionEligible ? 'Select Free Service (Active Plan Covered)' : 'Select Service or Subscription'}
                  </label>
                  <select
                    value={selectedServiceOrSubscription}
                    onChange={(e) => setSelectedServiceOrSubscription(e.target.value)}
                    className="w-full h-9 px-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">
                      {subscriptionEligible 
                        ? 'Select a free service with your active plan' 
                        : 'Select a service or subscription'}
                    </option>

                    {/* Show all services as free when eligible for active plan */}
                    {subscriptionEligible && allServices && allServices.length > 0 && allServices.map((service: any) => {
                      const serviceId = 'id' in service ? service.id : service._id;
                      const serviceName = service.title || service.name || 'Unnamed Service';
                      const serviceDuration = service.details?.sessionDuration || service.duration || 'N/A';
                      const serviceCategory = service.category || service.details?.category || '';
                      
                      return (
                        <option key={serviceId} value={serviceId}>
                          🎁 FREE: {serviceName} {serviceCategory ? `(${serviceCategory})` : ''} - {serviceDuration} (Active Plan Covered)
                        </option>
                      );
                    })}

                    {/* Show purchased services normally when not eligible for subscription */}
                    {!subscriptionEligible && user?.purchasedServices?.map((service: any) => (
                      <option key={service.id} value={service.id}>
                        Service: {service.name} - {service.duration}
                      </option>
                    ))}

                    {/* Show subscription plan when user has one */}
                    {user?.subscriptionData && (
                      <option value={user.subscriptionData.id}>
                        {user.subscriptionData.planName} ({user.subscriptionData.status})
                      </option>
                    )}
                  </select>
                </div>
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
                    {/* <option value="group">Group</option> */}
                  </select>
                </div>
              </div>


              {/* AVAILABLE TIMES WITH SESSION TYPE */}
              <div>

                <div>
                  <h4 className="font-bold text-slate-800 mb-3">
                    Available Times
                  </h4>

                  {/* STATUS LEGEND */}
                  <div className="flex flex-wrap gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                      <span className="text-slate-600">Available</span>
                    </div>



                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                      <span className="text-slate-600">Unavailable</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      <span className="text-slate-600">Booked</span>
                    </div>
                  </div>
                </div>



                {availableTimes.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {availableTimes
                        .filter((slot: any) => {
                          // Calculate slot duration in minutes
                          const [startHour, startMinute] = slot.start.split(':').map(Number);
                          const [endHour, endMinute] = slot.end.split(':').map(Number);
                          const now = new Date();
                          const slotStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute, 0, 0);
                          const slotEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute, 0, 0);
                          const slotDurationMinutes = Math.round((slotEnd.getTime() - slotStart.getTime()) / (1000 * 60));
                          
                          // Only show 45-minute regular slots (not 15-minute free consultation slots)
                          return slotDurationMinutes === 45;
                        })
                        .map((slot: any) => {
                        const timeValue = `${slot.start} - ${slot.end}`;

                        const isAvailable = slot.status === "available";
                        const isBooked = slot.status === "booked";
                        const isUnavailable = slot.status === "unavailable";

                        // Check if this time slot is in the past
                        const isPastTime = () => {
                          const now = new Date();
                          const selectedDateWithoutTime = new Date(selectedDate);

                          // Create a date object with the selected date and the slot's start time
                          const slotDateTime = new Date(selectedDateWithoutTime);
                          const [startHour, startMinute] = slot.start.split(':').map(Number);
                          slotDateTime.setHours(startHour, startMinute, 0, 0);

                          // Check if the slot time is in the past compared to now
                          return slotDateTime < now;
                        };

                        const isSelected = selectedTime === timeValue;

                        // Calculate slot duration in minutes (already calculated in filter)
                        const [startHour, startMinute] = slot.start.split(':').map(Number);
                        const [endHour, endMinute] = slot.end.split(':').map(Number);
                        const now = new Date();
                        const slotStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute, 0, 0);
                        const slotEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute, 0, 0);
                        const slotDurationMinutes = Math.round((slotEnd.getTime() - slotStart.getTime()) / (1000 * 60));

                        // Check if this slot can accommodate the service duration
                        const serviceDuration = getServiceDuration();
                        const isSuitableForService = serviceDuration ? slotDurationMinutes >= serviceDuration : true;

                        // Determine if the slot should be disabled (if it's past time)
                        const isPast = isPastTime();
                        const isActuallyAvailable = isAvailable && !isPast;

                        // Debug logging to see what's happening
                        // console.log('Slot:', slot, 'Duration:', slotDurationMinutes, 'Service Duration:', serviceDuration, 'Suitable:', isSuitableForService);

                        return (
                          <Button
                            key={slot._id}
                            size="sm"
                            disabled={!isActuallyAvailable}
                            onClick={() => {
                              if (isActuallyAvailable) {
                                setSelectedTime(timeValue);
                                setBookingError(null); // Clear any previous error when selecting a new time
                              }
                            }}
                            className={`
          py-2 text-sm font-medium transition-all 
          ${isSelected
                                ? "bg-green-600 text-white hover:bg-green-600"
                                : isActuallyAvailable
                                  ? isSuitableForService
                                    ? "border border-green-500 text-green-600 bg-green-50"
                                    : "border border-yellow-500 text-yellow-600 bg-yellow-50"
                                  : isBooked
                                    ? " text-red-500 cursor-not-allowed border border-red-500"
                                    : isPast
                                      ? " text-gray-400 cursor-not-allowed border border-gray-300 bg-gray-50"
                                      : " text-gray-400 cursor-not-allowed border border-gray-400"
                              }
        `}
                            variant="outline"
                          >
                            {timeValue}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                ) : (
                  <div className="text-center py-0">
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
                {bookingError && (
                  <div className="mb-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm font-medium">{bookingError}</p>
                    {/* <p className="text-red-600 text-xs mt-1 font-semibold">💡 Tip: Select a time slot that matches or exceeds your service duration.</p> */}
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
                onClick={() => {
                  setIsBookingModalOpen(false);
                  setBookingError(null); // Clear error when closing modal
                  setSelectedTime("");
                  setSelectedServiceOrSubscription("");
                }}
              >
                Cancel
              </Button>

              <div className="flex-1">
                <Button
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  disabled={!selectedTime || !selectedServiceOrSubscription}
                  onClick={handleBooking}
                >
                  {user?.subscriptionData?.status === 'active' ? 'Book Free Session' : 'Confirm'}
                </Button>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Subscription Plans Modal */}
      <AnimatePresence>
        {isPlansModalOpen && (
          <motion.div 
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
            >
              <div className="p-0">
                <div className="p-6 pb-4 border-b">
                  <h2 className="text-2xl font-bold text-center text-slate-900">Choose Your Wellness Plan</h2>
                  <p className="text-center text-slate-600 mt-2">Select the perfect plan for your recovery journey</p>
                </div>
                
                <div className="p-6">
                  {subscriptionLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : subscriptionError ? (
                    <div className="text-center py-8">
                      <p className="text-red-500 font-medium">Failed to load plans: {subscriptionError}</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => dispatch(fetchUserSubscriptions())}
                      >
                        Retry
                      </Button>
                    </div>
                  ) : plans && plans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {plans.map((plan: any) => (
                        <Card key={plan._id || plan.id} className="flex flex-col h-full border-2 hover:shadow-lg transition-all duration-300">
                          <div className="p-6 flex-1">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                            </div>

                            <div className="mb-6">
                              <div className="text-3xl font-black text-primary mb-1">
                                ₹{plan.price?.toLocaleString()}
                              </div>
                              <div className="text-slate-500 text-sm">{plan.duration}</div>
                            </div>

                            <p className="text-slate-600 text-sm mb-6 line-clamp-2">
                              {plan.description}
                            </p>

                            <ul className="space-y-3 mb-6 flex-1">
                              {plan.features?.slice(0, 5).map((feature: string, index: number) => (
                                <li key={index} className="flex items-start gap-3">
                                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-slate-700">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-6 pt-0">
                            <Button
                              className="w-full h-12 text-base font-semibold rounded-xl"
                              onClick={() => {
                                setIsPlansModalOpen(false);

                                if (plan.planId || plan.id) {
                                  const handlePayment = async (selectedPlan: any) => {
                                    try {
                                      // For guest users, we'll use a different approach
                                      // Instead of calling guest API, we'll navigate directly to booking
                                      const isGuestUser = !user || !localStorage.getItem("token");

                                      if (isGuestUser) {
                                        // For guest users, store plan info and navigate to booking
                                        sessionStorage.setItem("qw_selected_plan", JSON.stringify({
                                          plan: selectedPlan,
                                          selectedAt: Date.now()
                                        }));

                                        // Navigate to booking page with plan parameter
                                        navigate("/booking", {
                                          state: {
                                            service: {
                                              id: selectedPlan.planId || selectedPlan.id,
                                              name: selectedPlan.name,
                                              price: String(selectedPlan.price),
                                              duration: selectedPlan.duration,
                                            },
                                            fromSubscription: true,
                                            isGuestFlow: true
                                          }
                                        });
                                      } else {
                                        // For logged-in users, proceed with normal subscription flow
                                        // Navigate to booking page with subscription flow
                                        navigate("/booking", {
                                          state: {
                                            service: {
                                              id: selectedPlan.planId || selectedPlan.id,
                                              name: selectedPlan.name,
                                              price: String(selectedPlan.price),
                                              duration: selectedPlan.duration,
                                            },
                                            fromSubscription: true,
                                            isGuestFlow: false
                                          }
                                        });
                                      }

                                      toast.success(
                                        `You've selected the ${selectedPlan.name} plan. Proceeding to booking...`
                                      );
                                    } catch (error) {
                                      console.error("Error handling plan selection:", error);
                                      toast.error(
                                        "Failed to process plan selection. Please try again."
                                      );
                                    }
                                  };

                                  // Actually call the handlePayment function
                                  handlePayment(plan);
                                }
                              }}
                            >
                              Select Plan
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <Star className="h-8 w-8 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No Plans Available</h3>
                      <p className="text-slate-500">Please check back later or contact support.</p>
                    </div>
                  )}
                </div>
                
                <div className="px-6 py-4 border-t bg-slate-50 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsPlansModalOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        
      {/* Success Dialog */}
      <AnimatePresence>
        {isSuccessDialogOpen && (
          <motion.div 
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
            >
              <div className="p-6 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Booking Successful!
                </h3>
                <p className="text-slate-600 mb-6">
                  {user?.subscriptionData?.status === 'active' 
                    ? `Your session for ${format(selectedDate, "MMMM d, yyyy")} at ${selectedTime} has been successfully booked with your ${user.subscriptionData.planName} subscription.`
                    : `Your session for ${format(selectedDate, "MMMM d, yyyy")} at ${selectedTime} has been successfully booked.`}
                </p>
                <p className="text-sm text-slate-500">
                  You will be redirected to your profile page in a moment...
                </p>
                <div className="mt-6">
                  <Button
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    onClick={() => {
                      setIsSuccessDialogOpen(false);
                      navigate("/profile");
                    }}
                  >
                    Go to Profile Now
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </Layout>
  
  );
}