import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import {
  CreditCard,
  Lock,
  Shield,
  CheckCircle,
  Calendar,
  Clock,
  User,
  Wallet,
  CalendarClock,
  CircleAlert
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { createBookingAsync, updateBookingAsync, updateGuestBookingAsync, createPaymentOrderAsync, verifyPaymentAsync, createGuestBookingAsync, createGuestPaymentOrderAsync, verifyGuestPaymentAsync, createSubscriptionPaymentOrderAsync, checkSlotAvailabilityAsync, checkUserExistsAsync, createSubscriptionBookingAsync } from '@/store/slices/bookingsSlice';
import { verifySubscriptionPaymentTransaction } from '@/store/slices/paymentSlice';
import { createGuestSubscriptionPaymentOrderAsync, verifyGuestSubscriptionPaymentAsync } from '@/store/slices/bookingsSlice';
import { createBookingWithSubscription, checkSubscriptionEligibility, checkSubscriptionBookingEligibility } from '@/lib/api';
import { useAppDispatch, useAppSelector, RootState } from '@/store';
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { ScheduleModal } from "@/components/profile/ScheduleModal";
import { fetchPublicAdmins } from '@/store/slices/adminSlice';
import { getAvailability } from '@/lib/api';
import { fetchOffers, validateCoupon, resetCouponValidation } from '@/store/slices/offersSlice';
import { register, setCredentials, decrementSubscriptionSessions } from '@/store/slices/authSlice';
import BookingLoginModal from '@/components/BookingLoginModal';
import { fetchAllServices } from "@/store/slices/serviceSlice";
export default function BookingPage() {

  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const bookingData = location.state || {};
  
  // Check if user has active subscription
  const hasActivePlan = user?.subscriptionData && 
                       user.subscriptionData.status === 'active' && 
                       !user.subscriptionData.isExpired;
  const activePlan = user?.subscriptionData || null;
  console.log("bookingData", bookingData)
  // Extract questionnaire data if present
  const questionnaireData = bookingData.questionnaireData || null;
  const fromQuestionnaire = bookingData.fromQuestionnaire || false;
  const guestUserFromQuestionnaire = bookingData.guestUser || null;
  // console.log("bookingData", bookingData);
  const [isProcessing, setIsProcessing] = useState(false);
  const dispatch = useAppDispatch();
  const { admins: publicAdmins } = useSelector((state: RootState) => state.admins);
  const { offers: storeOffers, loading: offersStoreLoading } = useSelector((state: RootState) => state.offers);
  // console.log("publicAdmins", publicAdmins)

  const [guestUserData, setGuestUserData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Validation states
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Scheduling states
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: string, end: string } | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<any[]>([]);

  // Subscription state
  const [subscriptionEligible, setSubscriptionEligible] = useState<boolean>(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [checkingSubscription, setCheckingSubscription] = useState<boolean>(false);
  // console.log("availabilitylllllllll", availability)
  const [scheduleOption, setScheduleOption] = useState<"now" | "later" | null>(null);
  

  const { services, loading, error } = useSelector((state: RootState) => state.services);



  console.log("services", services)
  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");

  // Available Offers dialog state
  const [isOffersDialogOpen, setIsOffersDialogOpen] = useState(false);

  // Available offers state
  const [availableOffers, setAvailableOffers] = useState<any[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);

  // Login modal state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  
  // Session limit exceeded modal state
  const [isSessionLimitExceededModalOpen, setIsSessionLimitExceededModalOpen] = useState(false);
  const [sessionLimitExceededInfo, setSessionLimitExceededInfo] = useState<any>(null);

  // Fetch available offers from API
  useEffect(() => {
    dispatch(fetchOffers());
    dispatch(fetchPublicAdmins());
    dispatch(fetchAllServices());
  }, [dispatch]);


  // Update local state when store offers change
  useEffect(() => {
    if (!offersStoreLoading) {
      setAvailableOffers(storeOffers);
      setOffersLoading(false);
    }
  }, [storeOffers, offersStoreLoading]);

  useEffect(() => {
    if (user) {
      setGuestUserData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // Check subscription eligibility when user changes
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (user) {
        try {
          setCheckingSubscription(true);
          const response = await checkSubscriptionEligibility();
          const data = response.data.data;
          const { eligible, message, remainingSessions, planName, totalSessions, usedSessions, totalUsed, remainingServices, usedServices } = data;
          
          // Use API values directly since they now include combined counting
          const safeRemainingSessions = (remainingSessions != null && !isNaN(remainingSessions)) ? remainingSessions : 0;
          const safeTotalSessions = (totalSessions != null && !isNaN(totalSessions)) ? totalSessions : 0;
          const safeUsedSessions = totalUsed || usedSessions || 0; // Use totalUsed if available, otherwise usedSessions
          const safePlanName = planName || user.subscriptionData?.planName || 'your plan';
          
          setSubscriptionEligible(eligible);
          setSubscriptionInfo({
            eligible,
            message,
            remainingSessions: safeRemainingSessions,
            planName: safePlanName,
            totalSessions: safeTotalSessions,
            usedSessions: safeUsedSessions,
            totalUsed: totalUsed || safeUsedSessions,
            remainingServices: remainingServices || safeRemainingSessions,
            usedServices: usedServices || 0
          });
          
          console.log('Subscription info updated:', {
            eligible,
            remainingSessions: safeRemainingSessions,
            totalSessions: safeTotalSessions,
            usedSessions: safeUsedSessions,
            totalUsed: totalUsed || safeUsedSessions,
            planName: safePlanName
          });
        } catch (error) {
          console.error('Error checking subscription status:', error);
          setSubscriptionEligible(false);
          setSubscriptionInfo(null);
        } finally {
          setCheckingSubscription(false);
        }
      } else {
        setSubscriptionEligible(false);
        setSubscriptionInfo(null);
      }
    };
    
    checkSubscriptionStatus();
  }, [user]);

  // Helper function to refresh subscription eligibility
  const refreshSubscriptionEligibility = async () => {
    if (!user) return;
    try {
      setCheckingSubscription(true);
      const response = await checkSubscriptionEligibility();
      const data = response.data.data;
      const { eligible, message, remainingSessions, planName, totalSessions, usedSessions, totalUsed, remainingServices, usedServices } = data;
      
      const safeRemainingSessions = (remainingSessions != null && !isNaN(remainingSessions)) ? remainingSessions : 0;
      const safeTotalSessions = (totalSessions != null && !isNaN(totalSessions)) ? totalSessions : 0;
      const safeUsedSessions = totalUsed || usedSessions || 0;
      const safePlanName = planName || user.subscriptionData?.planName || 'your plan';
      
      setSubscriptionEligible(eligible);
      setSubscriptionInfo({
        eligible,
        message,
        remainingSessions: safeRemainingSessions,
        planName: safePlanName,
        totalSessions: safeTotalSessions,
        usedSessions: safeUsedSessions,
        totalUsed: totalUsed || safeUsedSessions,
        remainingServices: remainingServices || safeRemainingSessions,
        usedServices: usedServices || 0
      });
      
      console.log('Subscription eligibility refreshed:', {
        eligible,
        remainingSessions: safeRemainingSessions,
        totalSessions: safeTotalSessions,
        usedSessions: safeUsedSessions,
        totalUsed: totalUsed || safeUsedSessions,
        planName: safePlanName
      });
      
      return {
        eligible,
        remainingSessions: safeRemainingSessions
      };
    } catch (error) {
      console.error('Error refreshing subscription status:', error);
      setSubscriptionEligible(false);
      setSubscriptionInfo(null);
      return null;
    } finally {
      setCheckingSubscription(false);
    }
  };

  // Check if user is a guest (not logged in)
  // User is considered logged in if either qw_user exists in sessionStorage OR token exists in localStorage
  const isGuestUser =
    !sessionStorage.getItem("qw_user") && !localStorage.getItem("token");

  // Handle service-based booking data
  // Handle subscription-based booking data

  const therapist = bookingData?.therapist || (publicAdmins && publicAdmins.length > 0 ? {
    id: publicAdmins[0]?.id,
    name: publicAdmins[0]?.name,
  } : undefined);
  // console.log("therapist", therapist)
  const serviceBooking = bookingData?.fromServices === true;
  const subscriptionBooking = bookingData?.fromSubscription === true;

  const plan = bookingData?.plan ?? {
    name: subscriptionBooking && bookingData.service
      ? bookingData.service.name
      : (bookingData.service ? `${bookingData.service.name} Plan` : "Default Plan"),

    price: hasActivePlan ? 0 : (bookingData.service ? Number(bookingData.service.price) : 0),

    duration: subscriptionBooking && bookingData.service
      ? bookingData.service.duration // "monthly", "quarterly"
      : (bookingData.service ? bookingData.service.duration : "60 min"), // "52 min"
  };

  // Determine booking type for Schedule Modal
  const bookingType = (() => {
    const serviceOrPlanName = serviceBooking ? bookingData?.service?.name?.toLowerCase() : plan?.name?.toLowerCase();
    return serviceOrPlanName?.includes('free') ? 'free-consultation' : 'regular';
  })();

  // Format date to YYYY-MM-DD
  const formatDate = (dateString: string) => {
    if (!dateString) {
      // Return current date if no date provided
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // Try to parse various date formats and convert to YYYY-MM-DD
    try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) {
        // Return current date if parsing fails
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }

      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    } catch (e) {
      // Return current date if exception occurs
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  };

  // Format time to HH:MM
  const formatTime = (timeString: string) => {
    if (!timeString) {
      // Return current time (exact) if no time provided
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
    }

    // If already in HH:MM format, return as is
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
      return timeString;
    }

    // Try to parse various time formats
    try {
      // Handle "10:00 AM" or "10:00 AM (45 min)" formats
      if (timeString.includes("AM") || timeString.includes("PM")) {
        const timePart = timeString.split(" ")[0];
        const [hours, minutes] = timePart.split(":");

        let hour = parseInt(hours, 10);
        const period = timeString.split(" ")[1];

        if (period === "AM" && hour === 12) {
          hour = 0;
        } else if (period === "PM" && hour !== 12) {
          hour += 12;
        }

        return `${hour.toString().padStart(2, "0")}:${minutes}`;
      }

      // If it's just HH format, add :00
      if (/^\d{1,2}$/.test(timeString.trim())) {
        return `${timeString.padStart(2, "0")}:00`;
      }

      return timeString;
    } catch (e) {
      // Return current time if parsing fails
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
    }
  };

  // Use selected schedule date/time when schedule option is 'now', otherwise use bookingData
  const date = scheduleOption === "now" && scheduleDate
    ? scheduleDate
    : formatDate(bookingData?.date);

  // Use selected time slot when schedule option is 'now', otherwise use bookingData
  const time = scheduleOption === "now" && selectedTimeSlot
    ? selectedTimeSlot.start
    : formatTime(bookingData?.time);
  const promoApplied = bookingData?.promoApplied || false;

  // Calculate final price with coupon discount
  const basePrice = plan.price;
  const discountAmount = isCouponApplied
    ? couponDiscount
    : promoApplied
      ? Math.round(basePrice * 0.2)
      : 0;
  // console.log("discountAmount", discountAmount);
  const finalPrice = basePrice - discountAmount;
  // console.log("finalPrice", finalPrice);
  // Check stored intake
  let storedIntake = null;
  try {
    const raw = sessionStorage.getItem("qw_questionnaire");
    if (raw) storedIntake = JSON.parse(raw);
  } catch (e) {
    storedIntake = null;
  }

  const RECENT_DAYS = 90;
  const now = Date.now();
  const intakeIsRecent =
    storedIntake &&
    storedIntake.updatedAt &&
    now - storedIntake.updatedAt < RECENT_DAYS * 24 * 60 * 60 * 1000;

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Name validation function
  const validateName = (name: string) => {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/; // Only letters and spaces, 2-50 characters
    return nameRegex.test(name.trim());
  };

  // Phone validation function
  const validatePhone = (phone: string) => {
    // International mobile number validation (10-15 digits)
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone);
  };

  // Coupon validation function
  const handleValidateCoupon = async (code: string) => {
    // Clear previous errors
    setCouponError("");

    if (!code.trim()) {
      setCouponError("Please enter a coupon code");
      return false;
    }

    try {
      // Determine booking type
      const bookingType = subscriptionBooking ? "subscription" : "booking";

      // Get user ID if available
      const token = localStorage.getItem("token");
      let userId = null;
      if (token) {
        try {
          // Decode JWT token to get user ID
          const payload = JSON.parse(atob(token.split(".")[1]));
          userId = payload.userId || payload.sub;
        } catch (e) {
          console.warn("Could not decode token to get user ID:", e);
        }
      }

      // Call Redux store to validate coupon
      const actionResult = await dispatch(
        validateCoupon({
          code: code,
          amount: plan.price,
          bookingType,
          userId,
        })
      );

      if (validateCoupon.fulfilled.match(actionResult)) {
        // If validation successful, apply the coupon
        const offer = actionResult.payload;
        let calculatedDiscount = 0;

        if (offer.type === "percentage") {
          calculatedDiscount = Math.round(plan.price * (offer.value / 100));
          // Apply max discount limit if set
          if (
            offer.maxDiscountAmount &&
            calculatedDiscount > offer.maxDiscountAmount
          ) {
            calculatedDiscount = offer.maxDiscountAmount;
          }
        } else {
          calculatedDiscount = offer.value;
        }

        setIsCouponApplied(true);
        setCouponDiscount(calculatedDiscount);
        setCouponError("");
        toast.success(`Coupon applied! You saved ₹${calculatedDiscount}`);
        return true;
      } else {
        // Handle rejection
        const errorMessage =
          (actionResult.payload as string) || "Invalid coupon code";
        setCouponError(errorMessage);
        return false;
      }
    } catch (error: any) {
      console.error("Coupon validation error:", error);
      setCouponError(error.message || "Invalid coupon code");
      return false;
    }
  };

  // Apply coupon function
  const handleApplyCoupon = async () => {
    await handleValidateCoupon(couponCode);
  };

  // Remove coupon function
  const handleRemoveCoupon = () => {
    setIsCouponApplied(false);
    setCouponDiscount(0);
    setCouponCode("");
    setCouponError("");
    toast.info("Coupon removed");
  };

  // Scheduling functions
  const openScheduleModal = async () => {
    // Don't set scheduleOption yet, wait for actual selection

    try {
      // Fetch real availability data from API
      const response: any = await getAvailability();
      const fetchedAvailability = response.data?.data?.availability || [];
      // console.log("fetchedAvailability", fetchedAvailability);

      setAvailability(fetchedAvailability);
      setIsScheduleModalOpen(true);
      setScheduleError(null);
    } catch (error) {
      console.error("Failed to fetch availability:", error);
      setScheduleError("Failed to load availability. Please try again.");

      // Set empty availability on error
      setAvailability([]);
      setIsScheduleModalOpen(true);
    }
  };

  const closeScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setSelectedDate(null);
    setScheduleError(null);

    // If no date/time is selected, clear the schedule option
    if (!scheduleDate || !scheduleTime) {
      setScheduleOption(null);
    }
  };

  const handleScheduleConfirm = (
    date: string,
    time: string,
    timeSlot?: { start: string; end: string },
    selectedService?: any
  ) => {
    // Save the scheduled session to sessionStorage with complete time slot info
    const scheduledSession = {
      date,
      time,
      timeSlot, // Store complete time slot info including start and end times
      therapist: { ...therapist, id: publicAdmins?.[0]?.id }, // Use the correct therapist ID
      service: selectedService || bookingData?.service || plan,
      locked: true, // Will be unlocked after payment
      createdAt: Date.now(),
    };

    sessionStorage.setItem(
      "qw_scheduled_session",
      JSON.stringify(scheduledSession)
    );

    // Update the schedule state
    setScheduleOption("now"); // Set the schedule option when confirmed
    setScheduleDate(date);
    setScheduleTime(time);
    if (timeSlot) {
      setSelectedTimeSlot(timeSlot);
    }

    const timeDisplay = timeSlot ? `${timeSlot.start} - ${timeSlot.end}` : time;
    // toast.success(`Session scheduled for ${new Date(date).toLocaleDateString()} at ${timeDisplay}`);
    closeScheduleModal();
  };

  const clearSchedule = () => {
    setScheduleDate("");
    setScheduleTime("");
    setSelectedTimeSlot(null);
    sessionStorage.removeItem("qw_scheduled_session");
    setScheduleOption(null);
    toast.info("Schedule cleared");
  };

  const selectScheduleLater = () => {
    // Clear any existing date/time selection
    setScheduleDate("");
    setScheduleTime("");
    sessionStorage.removeItem("qw_scheduled_session");

    setScheduleOption("later");
    // toast.info("You can schedule your session after payment completion");
  };

  const clearSelection = () => {
    setScheduleOption(null);
    setScheduleDate("");
    setScheduleTime("");
    setSelectedTimeSlot(null);
    sessionStorage.removeItem("qw_scheduled_session");
    toast.info("Selection cleared");
  };

  const handlePayment = async () => {
    // Calculate remaining sessions from local user data for accurate session management
    const remainingSessions = user?.subscriptionData?.sessions || 0;
    const totalSessions = user?.subscriptionData?.totalService || 0;
    const usedSessions = totalSessions - remainingSessions;
    const planName = user?.subscriptionData?.planName || 'your plan';

    // 🔹 NEW: Check if user has active subscription and can book for free
    if (hasActivePlan && !subscriptionBooking && subscriptionInfo && subscriptionInfo.remainingSessions > 0) {
      // User has active subscription, create booking directly without payment
      try {
        setIsProcessing(true);
        
        // Validate schedule option
        if (!scheduleOption) {
          setScheduleError("Please select a scheduling option");
          setIsProcessing(false);
          return;
        }
        
        // For "Schedule Now", validate that date and time are selected
        if (scheduleOption === "now" && (!scheduleDate || !scheduleTime)) {
          setScheduleError("Please select a date and time for your session");
          setIsProcessing(false);
          return;
        }
        
        // Use subscription-based booking API
        const subscriptionBookingData = {
          serviceId: bookingData?.service?.id || null,
          date: scheduleOption === "now" ? scheduleDate : new Date().toISOString().split('T')[0],
          time: scheduleOption === "now" ? scheduleTime : "09:00",
          notes: "",
          clientName: user?.name || "",
          scheduleType: scheduleOption || "now",
          scheduledDate: scheduleOption === "now" ? scheduleDate : null,
          scheduledTime: scheduleOption === "now" ? scheduleTime : null,
          timeSlot: scheduleOption === "now" ? selectedTimeSlot : null
        };
        
        const response: any = await createBookingWithSubscription(subscriptionBookingData);
        
        if (response.data?.success) {
          // Decrement subscription sessions after successful booking
          dispatch(decrementSubscriptionSessions());
          
          // Refresh subscription eligibility to get updated counts from API
          const updatedEligibility = await refreshSubscriptionEligibility();
          
          toast.success("Session booked successfully with your subscription!");
          
          // Navigate to confirmation page
          navigate("/booking-confirmation", {
            state: {
              ...bookingData,
              finalPrice: 0,
              fromSubscription: false,
              scheduleOption: scheduleOption,
              scheduleDate: scheduleOption === "now" ? scheduleDate : null,
              scheduleTime: scheduleOption === "now" ? scheduleTime : null,
              timeSlot: scheduleOption === "now" ? selectedTimeSlot : null,
              isFreeWithSubscription: true
            },
          });
        } else {
          toast.error(response.data?.message || "Failed to book session");
        }
      } catch (error) {
        console.error("Error booking with subscription:", error);
        toast.error("Failed to book session with subscription");
      } finally {
        setIsProcessing(false);
      }
      return;
    }
    
    // If user has an active plan but no remaining sessions or invalid plan
    if (hasActivePlan && !subscriptionBooking && subscriptionInfo && subscriptionInfo.remainingSessions <= 0) {
      const message = `You have reached your session limit. Your ${subscriptionInfo.planName} includes ${subscriptionInfo.totalSessions} sessions/services and you have used ${subscriptionInfo.totalUsed || subscriptionInfo.usedSessions} of them.`;
      
      // Set the session limit exceeded info and open the modal
      setSessionLimitExceededInfo({
        message,
        planName: subscriptionInfo.planName,
        totalSessions: subscriptionInfo.totalSessions,
        usedSessions: subscriptionInfo.totalUsed || subscriptionInfo.usedSessions,
        remainingSessions: subscriptionInfo.remainingSessions
      });
      setIsSessionLimitExceededModalOpen(true);
      setIsProcessing(false);
      return;
    }
    
    // Validate guest user data if applicable
    if (isGuestUser) {
      let hasError = false;

      // Name validation
      if (!guestUserData.name.trim()) {
        setNameError("Name is required");
        hasError = true;
      } else if (!validateName(guestUserData.name)) {
        setNameError("Please enter a valid name (2-50 letters only)");
        hasError = true;
      } else {
        setNameError("");
      }

      // Email validation
      if (!guestUserData.email.trim()) {
        setEmailError("Email is required");
        hasError = true;
      } else if (!validateEmail(guestUserData.email)) {
        setEmailError("Please enter a valid email address");
        hasError = true;
      } else {
        setEmailError("");
      }

      // Phone validation
      if (!guestUserData.phone.trim()) {
        setPhoneError("Phone number is required");
        hasError = true;
      } else if (guestUserData.phone.length < 10) {
        setPhoneError("Phone number must be at least 10 digits");
        hasError = true;
      } else if (guestUserData.phone.length > 15) {
        setPhoneError("Phone number cannot exceed 15 digits");
        hasError = true;
      } else if (!validatePhone(guestUserData.phone)) {
        setPhoneError("Please enter a valid mobile number (10-15 digits)");
        hasError = true;
      } else {
        setPhoneError("");
      }

      if (hasError) {
        return;
      }

      // Schedule option validation
      if (!scheduleOption) {
        setScheduleError("Please select a scheduling option");
        return;
      } else {
        setScheduleError("");
      }

      // For "Schedule Now", validate that date and time are selected
      if (scheduleOption === "now" && (!scheduleDate || !scheduleTime)) {
        setScheduleError("Please select a date and time for your session");
        return;
      }

      // 🔹 2. Backend Email Check Kare
      try {
        const checkResult = await dispatch(
          checkUserExistsAsync(guestUserData.email)
        );
        if (checkUserExistsAsync.fulfilled.match(checkResult)) {
          const userData = checkResult.payload;
          if (userData.exists) {
            // 👉 Agar user mil jaye (exists: true)
            // Open login modal instead of just showing toast
            setLoginEmail(guestUserData.email);
            setIsLoginModalOpen(true);
            // console.log("User already exists, opening login modal");

            // STOP ALL FURTHER PROCESSING
            return;
          } else {
            // 👉 Agar user na mile (exists: false)
            // Naya user create karo - this will happen after payment verification
            // console.log("New user will be created after payment");
          }
        }
      } catch (error) {
        console.error("Failed to check user existence:", error);
        // Continue with the flow even if user check fails
      }
    }

    // Prepare guest user data
    if (isGuestUser) {
      try {
        const guestInfo = {
          ...guestUserData,
          createdAt: Date.now(),
        };
        sessionStorage.setItem("qw_guest_user", JSON.stringify(guestInfo));
      } catch (e) {
        console.error("Failed to save guest user data", e);
      }
    }

    // Schedule option validation for all users
    if (!scheduleOption) {
      setScheduleError("Please select a scheduling option");
      return;
    } else {
      setScheduleError("");
    }

    // For "Schedule Now", validate that date and time are selected
    if (scheduleOption === "now" && (!scheduleDate || !scheduleTime)) {
      setScheduleError("Please select a date and time for your session");
      return;
    }

    // Create booking before initiating payment
    try {
      setIsProcessing(true);

      // Check if this is a subscription flow (from SubscriptionPlansPage)
      if (subscriptionBooking) {
        // Direct subscription payment flow
        let paymentOrderResult;
        if (isGuestUser) {
          // Prepare guest subscription payment order payload
          const guestSubscriptionPaymentOrderData = {
            planId: bookingData.service.id || bookingData.service.planId,
            amount: finalPrice,
            currency: "INR",
            clientName: guestUserData.name,
            clientEmail: guestUserData.email,
            clientPhone: guestUserData.phone,
            couponCode: isCouponApplied ? couponCode : undefined,
            discountAmount: isCouponApplied ? couponDiscount : 0,
            // Add scheduling information
            scheduleType: scheduleOption || "now",
            scheduledDate: scheduleOption === "now" ? scheduleDate : null,
            scheduledTime: scheduleOption === "now" ? (selectedTimeSlot ? `${selectedTimeSlot.start}-${selectedTimeSlot.end}` : scheduleTime) : null,
            timeSlot: scheduleOption === "now" ? selectedTimeSlot : null,
            // Add therapistId if available
            therapistId: therapist?.id || undefined,
          };
          // console.log("guestSubscriptionPaymentOrderData", guestSubscriptionPaymentOrderData);
          paymentOrderResult = await dispatch(
            createGuestSubscriptionPaymentOrderAsync(
              guestSubscriptionPaymentOrderData
            )
          );
        } else {
          // console.log("📤 Sending subscription payment order:", {
          //   planId: bookingData.service.id || bookingData.service.planId,
          //   amount: finalPrice,
          //   originalPrice: plan.price,
          //   discountAmount: isCouponApplied ? couponDiscount : 0,
          //   couponCode: isCouponApplied ? couponCode : undefined,
          //   therapistId: therapist?.id || null,
          // });
          const subscriptionPaymentOrderData = {
            planId: bookingData.service.id || bookingData.service.planId,
            amount: finalPrice,
            currency: "INR",
            couponCode: isCouponApplied ? couponCode : undefined,
            discountAmount: isCouponApplied ? couponDiscount : 0,
            // Add scheduling information
            scheduleType: scheduleOption || "now",
            scheduledDate: scheduleOption === "now" ? scheduleDate : null,
            scheduledTime: scheduleOption === "now" ? (selectedTimeSlot ? `${selectedTimeSlot.start}-${selectedTimeSlot.end}` : scheduleTime) : null,
            timeSlot: scheduleOption === "now" ? selectedTimeSlot : null,
            // Add therapistId if available
            therapistId: therapist?.id || undefined,
          };
          paymentOrderResult = await dispatch(
            createSubscriptionPaymentOrderAsync(subscriptionPaymentOrderData)
          );
        }

        if (
          !createSubscriptionPaymentOrderAsync.fulfilled.match(
            paymentOrderResult
          ) &&
          !createGuestSubscriptionPaymentOrderAsync.fulfilled.match(
            paymentOrderResult
          )
        ) {
          toast.error(
            "Failed to create subscription payment order. Please try again."
          );
          setIsProcessing(false);
          return;
        }

        if (!paymentOrderResult.payload) {
          console.error("Payment order creation failed:", paymentOrderResult);
          toast.error(
            paymentOrderResult.payload?.message ||
            "Payment order creation failed. Please try again."
          );
          setIsProcessing(false);
          return;
        }
        // Extract order details from the response - the structure depends on which API was called
        const orderData =
          paymentOrderResult.payload.order || paymentOrderResult.payload;
        const { orderId, key: razorpayKey } = orderData;

        // Razorpay options for subscription
        const options = {
          key:
            razorpayKey ||
            "rzp_test_SHYwF83mxS594F",
          order_id: orderId, // Use the order ID from the backend
          amount: orderData.amount || finalPrice * 100, // Use backend amount or fallback to local calculation
          currency: "INR",
          name: "Tanish physio & fitness",
          description: `Subscription Payment - Plan: ${bookingData.service.name
            }${publicAdmins?.[0]?.name ? ` for ${publicAdmins[0].name}` : ""}`,
          image: "https://your-wellness-path.com/logo.png", // Replace with your logo URL
          handler: async function (response: any) {
            // Payment successful - send response to backend for verification
            const paymentVerificationData = {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            };
            // Set processing to false as payment was successful and we're moving to verification
            setIsProcessing(false);

            // Dispatch subscription payment verification action
            let verifyResult;
            if (isGuestUser) {
              verifyResult = await dispatch(
                verifyGuestSubscriptionPaymentAsync(paymentVerificationData)
              );
            } else {
              verifyResult = await dispatch(
                verifySubscriptionPaymentTransaction(paymentVerificationData)
              );
            }
            if (
              (isGuestUser &&
                verifyGuestSubscriptionPaymentAsync.fulfilled.match(
                  verifyResult
                )) ||
              (!isGuestUser &&
                verifySubscriptionPaymentTransaction.fulfilled.match(
                  verifyResult
                ))
            ) {
              // 🔹 6. JWT Token Generate Karo & 7. Token Frontend Ko Do
              // Handle auto-login token if provided
              if (verifyResult.payload?.token) {
                // Store token for auto-login on confirmation page
                localStorage.setItem(
                  "qw_auto_login_token",
                  verifyResult.payload.token
                );
                if (verifyResult.payload?.userId) {
                  // Store complete user data for auto-login
                  localStorage.setItem(
                    "user",
                    JSON.stringify({
                      id: verifyResult.payload.userId,
                      email: guestUserData.email,
                      name: guestUserData.name,
                      phone: guestUserData.phone,
                      role: 'patient'
                    })
                  );
                }
                // Update Redux store
                dispatch({
                  type: "auth/setUser",
                  payload: { id: verifyResult.payload.userId },
                });
              }

              // Verification successful - process subscription
              try {
                // Get subscription ID from response
                const subscriptionId =
                  verifyResult.payload?.subscription?.id ||
                  verifyResult.payload?.data?.subscription?.id;

                // Persist plan as active subscription with subscription ID
                sessionStorage.setItem(
                  "qw_plan",
                  JSON.stringify({
                    plan,
                    subscriptionId, // Store the actual subscription ID
                    purchasedAt: Date.now(),
                    active: true,
                  })
                );

                // Check for existing intake
                let stored = null;
                try {
                  const raw = sessionStorage.getItem("qw_questionnaire");
                  if (raw) stored = JSON.parse(raw);
                } catch (e) {
                  stored = null;
                }
                const RECENT_DAYS = 90;
                const now = Date.now();
                const isRecent = (ts: number | undefined | null) =>
                  ts && now - ts < RECENT_DAYS * 24 * 60 * 60 * 1000;

                // Check for any previously reserved session (from intake-first scheduling)
                let scheduled = null;
                try {
                  const raw = sessionStorage.getItem("qw_scheduled_session");
                  if (raw) scheduled = JSON.parse(raw);
                } catch (e) {
                  scheduled = null;
                }

                if (!stored || !isRecent(stored?.updatedAt)) {
                  // Plan purchased, but intake missing or outdated: require intake to unlock sessions
                  toast.success(
                    "Payment successful! Please complete a short intake to unlock sessions."
                  );
                  // Save a pending marker to ensure plan activation after intake
                  try {
                    sessionStorage.setItem(
                      "qw_pending_plan",
                      JSON.stringify(plan)
                    );
                  } catch (e) { }
                  // Navigate to booking confirmation page - questionnaire will be handled there after auto-login
                  // Remove direct navigation to questionnaire from here
                }

                try {
                  const therapist = {
                    id: publicAdmins?.[0]?.id,
                    name: publicAdmins?.[0]?.name,
                    title: publicAdmins?.[0]?.role || "Therapist",
                    assignedAt: Date.now(),
                  };
                  sessionStorage.setItem(
                    "qw_assigned",
                    JSON.stringify(therapist)
                  );

                  if (scheduled) {
                    scheduled.locked = false;
                    scheduled.therapist = therapist;
                    scheduled.confirmedAt = Date.now();
                    sessionStorage.setItem(
                      "qw_scheduled_session",
                      JSON.stringify(scheduled)
                    );
                  }
                } catch (e) { }

                // Check if user is a guest (not logged in)
                const wasGuestUser =
                  !sessionStorage.getItem("qw_user") &&
                  !localStorage.getItem("token");

                toast.success("Payment successful!.");
                // Navigate to booking confirmation page for all users
                navigate("/booking-confirmation", {
                  state: {
                    ...bookingData,
                    finalPrice,
                    guestUser: wasGuestUser
                      ? JSON.parse(
                        sessionStorage.getItem("qw_guest_user") || "{}"
                      )
                      : undefined,
                    fromSubscription: true,
                    scheduleOption: scheduleOption,
                    scheduleDate:
                      scheduleOption === "now" ? scheduleDate : null,
                    scheduleTime:
                      scheduleOption === "now" ? scheduleTime : null,
                    timeSlot:
                      scheduleOption === "now" ? selectedTimeSlot : null,
                  },
                });
              } catch (error) {
                console.error(
                  "Error processing subscription payment success:",
                  error
                );
                toast.error(
                  "Something went wrong after payment. Please contact support."
                );
              }
            } else {
              console.error(
                "Subscription payment verification failed:",
                verifyResult.payload
              );

              // For subscription payments, we don't need to update booking status
              // The subscription is already activated via the payment verification
              {
                // Get subscription ID from response (even in fallback scenario)
                const subscriptionId =
                  verifyResult.payload?.subscription?.id ||
                  verifyResult.payload?.data?.subscription?.id;
                // Persist plan as active subscription with subscription ID
                sessionStorage.setItem(
                  "qw_plan",
                  JSON.stringify({
                    plan,
                    subscriptionId, // Store the actual subscription ID
                    purchasedAt: Date.now(),
                    active: true,
                  })
                );

                // Check for existing intake
                let stored = null;
                try {
                  const raw = sessionStorage.getItem("qw_questionnaire");
                  if (raw) stored = JSON.parse(raw);
                } catch (e) {
                  stored = null;
                }
                const RECENT_DAYS = 90;
                const now = Date.now();
                const isRecent = (ts: number | undefined | null) =>
                  ts && now - ts < RECENT_DAYS * 24 * 60 * 60 * 1000;

                // Check for any previously reserved session (from intake-first scheduling)
                let scheduled = null;
                try {
                  const raw = sessionStorage.getItem("qw_scheduled_session");
                  if (raw) scheduled = JSON.parse(raw);
                } catch (e) {
                  scheduled = null;
                }

                if (!stored || !isRecent(stored?.updatedAt)) {
                  // Plan purchased, but intake missing or outdated: require intake to unlock sessions
                  toast.success(
                    "Payment successful! Please complete a short intake to unlock sessions."
                  );
                  // Save a pending marker to ensure plan activation after intake
                  try {
                    sessionStorage.setItem(
                      "qw_pending_plan",
                      JSON.stringify(plan)
                    );
                  } catch (e) { }
                  // Navigate to booking confirmation page - questionnaire will be handled there after auto-login
                  // Remove direct navigation to questionnaire from here
                }

                // Intake exists and is recent: assign therapist, unlock scheduled session if present & proceed
                try {
                  const therapist = {
                    id: publicAdmins?.[0]?.id,
                    name: publicAdmins?.[0]?.name,
                    title: publicAdmins?.[0]?.role || "Therapist",
                    assignedAt: Date.now(),
                  };
                  sessionStorage.setItem(
                    "qw_assigned",
                    JSON.stringify(therapist)
                  );

                  if (scheduled) {
                    scheduled.locked = false;
                    scheduled.therapist = therapist;
                    scheduled.confirmedAt = Date.now();
                    sessionStorage.setItem(
                      "qw_scheduled_session",
                      JSON.stringify(scheduled)
                    );
                  }
                } catch (e) { }

                // Check if user is a guest (not logged in)
                const wasGuestUser =
                  !sessionStorage.getItem("qw_user") &&
                  !localStorage.getItem("token");

                try {
                  toast.success("Payment successful!.");
                  // Navigate to booking confirmation page for all users
                  navigate("/booking-confirmation", {
                    state: {
                      ...bookingData,
                      finalPrice,
                      guestUser: wasGuestUser
                        ? JSON.parse(
                          sessionStorage.getItem("qw_guest_user") || "{}"
                        )
                        : undefined,
                      fromSubscription: true,
                      scheduleOption: scheduleOption,
                      scheduleDate:
                        scheduleOption === "now" ? scheduleDate : null,
                      scheduleTime:
                        scheduleOption === "now" ? scheduleTime : null,
                      timeSlot:
                        scheduleOption === "now" ? selectedTimeSlot : null,
                    },
                  });
                } catch (innerError) {
                  console.error(
                    "Error in subscription fallback flow:",
                    innerError
                  );
                  toast.error(
                    "Payment was successful but there was an issue processing your subscription. Please contact support."
                  );
                }
              }
            }
          },

          prefill: {
            name: isGuestUser ? guestUserData.name : "",
            email: isGuestUser ? guestUserData.email : "",
            contact: isGuestUser ? guestUserData.phone : "",
          },
          theme: {
            color: "#3b82f6", // Tailwind blue-500
          },
          modal: {
            ondismiss: function () {
              // Handle when user closes the payment modal without completing payment
              toast.info("Payment was cancelled. You can try again later.");
              setIsProcessing(false); // Close the loading state
            },
            escape: function () {
              // Handle when user presses escape key to close the modal
              setIsProcessing(false);
            },
            onload: function () {
              // Ensure processing state is set when modal loads
              setIsProcessing(true);
            },
          },
          callback: function (error) {
            // Handle payment failure
            if (error) {
              console.error("Payment failed:", error);
              toast.error(
                "Payment failed. Please try again or contact support."
              );
              setIsProcessing(false);
            }
          },
        };

        // Initialize and open Razorpay checkout
        if (typeof window !== "undefined" && (window as any).Razorpay) {
          // Check if key exists before creating Razorpay instance
          // console.log("Razorpay key:", options);
          if (!options.key || options.key === "rzp_test_1234567890") {
            toast.error(
              "Razorpay key is not configured properly. Please contact support."
            );
            setIsProcessing(false);
            return;
          }

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } else {
          console.error("Razorpay SDK not loaded");
          toast.error("Payment gateway not loaded. Please try again.");
          setIsProcessing(false);
        }
      } else {
        // console.log(bookingData);
        // Determine booking type based on service name or other criteria
        const isFreeConsultation = (serviceBooking ? bookingData.service.name.toLowerCase().includes('free') : plan.name.toLowerCase().includes('free'));
        const bookingType = isFreeConsultation ? 'free-consultation' : 'regular';
        // Get service information - use bookingData.service since selectedService is not available
        const serviceInfo = serviceBooking ? bookingData.service : null;
        
        const bookingPayload = {
          serviceId: serviceInfo?.id || null,
          serviceName: serviceInfo?.name || plan.name,
          therapistId: therapist?.id || null,
          therapistName: therapist?.name || "Default Therapist",
          userId: isGuestUser ? null : localStorage.getItem("user"),
          clientName: isGuestUser ? guestUserData.name : guestUserData.name,
          date: date,
          time: time,
          status: "pending",
          notes: "Session booking from frontend",
          paymentStatus: "pending",
          amount: plan.price,
          finalAmount: finalPrice,
          couponCode: isCouponApplied ? couponCode : undefined,
          discountAmount: isCouponApplied ? couponDiscount : 0,
          bookingId: serviceInfo?.bookingId || null,
          scheduleType: scheduleOption || "now",
          scheduledDate: scheduleOption === "now" ? scheduleDate : null,
          scheduledTime: scheduleOption === "now" ? (selectedTimeSlot ? `${selectedTimeSlot.start}-${selectedTimeSlot.end}` : scheduleTime) : null,
          timeSlot: scheduleOption === "now" ? selectedTimeSlot : null,
          bookingType: bookingType,
        };
        // console.log("Booking payload:", bookingPayload);
        // Check if user can book with subscription (session-based)
        let useSubscriptionBooking = false;
        let subscriptionCheckResult = null;
        let subscriptionInfo = null;
        
        if (!isGuestUser && serviceInfo?.id) {
          try {
            subscriptionCheckResult = await checkSubscriptionBookingEligibility(serviceInfo.id);
            useSubscriptionBooking = subscriptionCheckResult.data?.data?.eligible === true;
            subscriptionInfo = subscriptionCheckResult.data?.data?.subscription;
            console.log('Subscription info:', subscriptionInfo); // Debug log
          } catch (error) {
            console.log('Subscription check failed, proceeding with regular booking');
            useSubscriptionBooking = false;
          }
        }
        
        // Create the booking - use appropriate method based on subscription eligibility
        let bookingResult;
        if (isGuestUser) {
          // Prepare guest booking payload
          const guestBookingPayload = {
            ...bookingPayload,
            clientName: guestUserData.name,
            clientEmail: guestUserData.email,
            clientPhone: guestUserData.phone,
          };

          bookingResult = await dispatch(
            createGuestBookingAsync(guestBookingPayload)
          );
        } else if (useSubscriptionBooking) {
          // Use subscription booking (no payment required)
          const subscriptionBookingPayload = {
            ...bookingPayload,
            serviceId: serviceInfo?.id || null,
            // Remove payment-related fields for subscription booking
            amount: 0,
            finalAmount: 0,
            paymentStatus: 'paid',
            status: 'pending', // Always pending for admin approval
            bookingType: 'subscription-covered'
          };
          
          bookingResult = await dispatch(createSubscriptionBookingAsync(subscriptionBookingPayload));
          
          if (createSubscriptionBookingAsync.fulfilled.match(bookingResult)) {
            toast.success("Session booked successfully with your subscription! Awaiting admin confirmation.");
            // Navigate to confirmation page without payment
            navigate("/booking-confirmation", {
              state: {
                booking: bookingResult.payload.booking,
                isGuest: false,
                requiresPayment: false,
                subscriptionBooking: true,
                subscriptionInfo: subscriptionInfo || bookingResult.payload.subscriptionInfo
              },
            });
            setIsProcessing(false);
            return;
          }
        } else {
          bookingResult = await dispatch(createBookingAsync(bookingPayload));
        }

        if (
          !createBookingAsync.fulfilled.match(bookingResult) &&
          !createGuestBookingAsync.fulfilled.match(bookingResult)
        ) {
          toast.error("Failed to create booking. Please try again.");
          setIsProcessing(false);
          return;
        }

        const bookingId =
          bookingResult.payload?._id ||
          (bookingResult.payload as any)?.booking?._id;

        // Create payment order with booking ID
        let paymentOrderResult;
        if (isGuestUser) {
          // Prepare guest payment order payload
          const guestPaymentOrderData = {
            bookingId: bookingId,
            amount: finalPrice,
            currency: "INR",
            clientName: guestUserData.name,
            clientEmail: guestUserData.email,
            clientPhone: guestUserData.phone,
            couponCode: isCouponApplied ? couponCode : undefined,
            discountAmount: isCouponApplied ? couponDiscount : 0,
          };

          paymentOrderResult = await dispatch(
            createGuestPaymentOrderAsync(guestPaymentOrderData)
          );
        } else {
          const paymentOrderData = {
            bookingId: bookingId,
            amount: finalPrice,
            currency: "INR",
            couponCode: isCouponApplied ? couponCode : undefined,
            discountAmount: isCouponApplied ? couponDiscount : 0,
          };

          paymentOrderResult = await dispatch(
            createPaymentOrderAsync(paymentOrderData)
          );
        }

        if (
          !createPaymentOrderAsync.fulfilled.match(paymentOrderResult) &&
          !createGuestPaymentOrderAsync.fulfilled.match(paymentOrderResult)
        ) {
          toast.error("Failed to create payment order. Please try again.");
          setIsProcessing(false);
          return;
        }

        if (!paymentOrderResult.payload) {
          console.error("Payment order creation failed:", paymentOrderResult);
          toast.error(
            paymentOrderResult.payload?.message ||
            "Payment order creation failed. Please try again."
          );
          setIsProcessing(false);
          return;
        }
        // Extract order details from the response - the structure depends on which API was called
        const orderData =
          paymentOrderResult.payload.order || paymentOrderResult.payload;
        const { orderId, key: razorpayKey } = orderData;

        // Razorpay options
        const options = {
          key:
            razorpayKey ||
            "rzp_test_SHYwF83mxS594F",
          order_id: orderId, // Use the order ID from the backend
          amount: orderData.amount || finalPrice * 100, // Use backend amount or fallback to local calculation
          currency: "INR",
          name: "Tanish physio & fitness",
          description: `Session Booking Payment - Booking ID: ${bookingId}${publicAdmins?.[0]?.name ? ` for ${publicAdmins[0].name}` : ""
            }`,
          image: "https://your-wellness-path.com/logo.png", // Replace with your logo URL
          handler: async function (response: any) {
            // Payment successful - send response to backend for verification
            const paymentVerificationData = {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            };
            // Set processing to false as payment was successful and we're moving to verification
            setIsProcessing(false);

            // Dispatch payment verification action
            let verifyResult;
            if (isGuestUser) {
              verifyResult = await dispatch(
                verifyGuestPaymentAsync(paymentVerificationData)
              );
            } else {
              verifyResult = await dispatch(
                verifyPaymentAsync(paymentVerificationData)
              );
            }
            if (
              (isGuestUser &&
                verifyGuestPaymentAsync.fulfilled.match(verifyResult)) ||
              (!isGuestUser && verifyPaymentAsync.fulfilled.match(verifyResult))
            ) {
              // 🔹 6. JWT Token Generate Karo & 7. Token Frontend Ko Do
              // Handle auto-login token if provided
              if (verifyResult.payload?.token) {
                // Store token for auto-login on confirmation page
                localStorage.setItem(
                  "qw_auto_login_token",
                  verifyResult.payload.token
                );
                if (verifyResult.payload?.userId) {
                  localStorage.setItem(
                    "user",
                    JSON.stringify({
                      id: verifyResult.payload.userId,
                      // User data will be fetched in useEffect
                    })
                  );
                }
                // Update Redux store
                dispatch(
                  setCredentials({
                    user: {
                      id: verifyResult.payload.userId,
                      email: guestUserData.email,
                      name: guestUserData.name || "Guest User",
                    },
                    token: verifyResult.payload.token,
                  })
                );
              }

              // Verification successful - update booking status based on schedule option
              if (isGuestUser) {
                // For guest users, use guest booking update with client email
                const guestUser = JSON.parse(
                  sessionStorage.getItem("qw_guest_user") || "{}"
                );
                await dispatch(
                  updateGuestBookingAsync({
                    id: bookingId,
                    bookingData: {
                      status: "pending",
                      paymentStatus: "paid",
                      couponCode: isCouponApplied ? couponCode : undefined,
                      discountAmount: isCouponApplied ? couponDiscount : 0,
                      finalAmount: finalPrice,
                    },
                    clientEmail: guestUser.email,
                  })
                );
              } else {
                // For authenticated users, use regular booking update
                await dispatch(
                  updateBookingAsync({
                    id: bookingId,
                    bookingData: {
                      status: "pending",
                      paymentStatus: "paid",
                      couponCode: isCouponApplied ? couponCode : undefined,
                      discountAmount: isCouponApplied ? couponDiscount : 0,
                      finalAmount: finalPrice,
                    },
                  })
                );
              }

              // Process success flow
              try {
                // Persist plan as active subscription
                sessionStorage.setItem(
                  "qw_plan",
                  JSON.stringify({
                    plan,
                    purchasedAt: Date.now(),
                    active: true,
                  })
                );

                // Check for existing intake
                let stored = null;
                try {
                  const raw = sessionStorage.getItem("qw_questionnaire");
                  if (raw) stored = JSON.parse(raw);
                } catch (e) {
                  stored = null;
                }
                const RECENT_DAYS = 90;
                const now = Date.now();
                const isRecent = (ts: number | undefined | null) =>
                  ts && now - ts < RECENT_DAYS * 24 * 60 * 60 * 1000;

                // Check for any previously reserved session (from intake-first scheduling)
                let scheduled = null;
                try {
                  const raw = sessionStorage.getItem("qw_scheduled_session");
                  if (raw) scheduled = JSON.parse(raw);
                } catch (e) {
                  scheduled = null;
                }

                if (!stored || !isRecent(stored?.updatedAt)) {
                  // Plan purchased, but intake missing or outdated: require intake to unlock sessions
                  toast.success(
                    "Payment successful! Please complete a short intake to unlock sessions."
                  );
                  // Save a pending marker to ensure plan activation after intake
                  try {
                    sessionStorage.setItem(
                      "qw_pending_plan",
                      JSON.stringify(plan)
                    );
                  } catch (e) { }
                  // Navigate to booking confirmation page - questionnaire will be handled there after auto-login
                  // Remove direct navigation to questionnaire from here
                }

                // Intake exists and is recent: assign therapist, unlock scheduled session if present & proceed
                try {
                  if (scheduled) {
                    scheduled.locked = false;
                    scheduled.therapist = therapist;
                    scheduled.confirmedAt = Date.now();
                    sessionStorage.setItem(
                      "qw_scheduled_session",
                      JSON.stringify(scheduled)
                    );
                  }
                } catch (e) { }
                const wasGuestUser =
                  !sessionStorage.getItem("qw_user") &&
                  !localStorage.getItem("token");

                // Auto-register guest user after successful payment
                if (isGuestUser && guestUserData.email) {
                  try {
                    const registerResult = await dispatch(
                      register({
                        name: guestUserData.name || "Guest User",
                        email: guestUserData.email,
                        password: "123456",
                        phone: guestUserData.phone,
                      })
                    );
                    
                    if (register.fulfilled.match(registerResult)) {
                      toast.success("Account created and logged in successfully!");
                    } else {
                      toast.success("Account created successfully!");
                    }

                    // No need to check user existence or login again - register already handles authentication
                  } catch (registrationError: any) {
                    console.error(
                      "Auto-registration failed:",
                      registrationError
                    );
                    // If user already exists, try to check if they exist and get token
                    if (
                      registrationError.message?.includes(
                        "User already exists with this email"
                      )
                    ) {
                      try {
                        const userCheckResult = await dispatch(
                          checkUserExistsAsync(guestUserData.email)
                        );
                        if (
                          checkUserExistsAsync.fulfilled.match(userCheckResult)
                        ) {
                          const userData = userCheckResult.payload;
                          if (userData.exists && userData.token) {
                            // Set the token for auto-login
                            localStorage.setItem("token", userData.token);
                            localStorage.setItem(
                              "user",
                              JSON.stringify(userData.user)
                            );
                            dispatch(
                              setCredentials({
                                user: userData.user,
                                token: userData.token,
                              })
                            );
                            toast.success("Logged in successfully!");
                          }
                        }
                      } catch (checkError) {
                        console.error(
                          "User check failed:",
                          checkError
                        );
                      }
                    }
                    // Continue anyway since this is just for convenience
                  }
                }

                toast.success("Payment successful!.");

                // Show loading state for 1 second before navigating to confirmation page
                setIsProcessing(true);

                // Wait for 1 second to show the loader
                await new Promise(resolve => setTimeout(resolve, 1000));

                if (wasGuestUser) {
                  // For guest users, navigate to booking confirmation page
                  navigate("/booking-confirmation", {
                    state: {
                      ...bookingData,
                      bookingId: bookingId,
                      finalPrice,
                      guestUser: JSON.parse(
                        sessionStorage.getItem("qw_guest_user") || "{}"
                      ),
                      fromServices: true,
                      scheduleOption: scheduleOption,
                      scheduleDate:
                        scheduleOption === "now" ? scheduleDate : null,
                      scheduleTime:
                        scheduleOption === "now" ? scheduleTime : null,
                      timeSlot:
                        scheduleOption === "now" ? selectedTimeSlot : null,
                    },
                  });
                } else {
                  // For logged-in users, continue with existing flow
                  navigate("/booking-confirmation", {
                    state: {
                      ...bookingData,
                      bookingId: bookingId,
                      finalPrice,
                      guestUser: undefined,
                      fromServices: true,
                      scheduleOption: scheduleOption,
                      scheduleDate:
                        scheduleOption === "now" ? scheduleDate : null,
                      scheduleTime:
                        scheduleOption === "now" ? scheduleTime : null,
                      timeSlot:
                        scheduleOption === "now" ? selectedTimeSlot : null,
                    },
                  });
                }

                // Note: We don't reset setIsProcessing(false) here as navigation will unmount the component
              } catch (error) {
                console.error("Error processing payment success:", error);
                toast.error(
                  "Something went wrong after payment. Please contact support."
                );
              }
            } else {
              console.error(
                "Payment verification failed:",
                verifyResult.payload
              );

              if (isGuestUser) {
                const guestUser = JSON.parse(
                  sessionStorage.getItem("qw_guest_user") || "{}"
                );
                // console.log("Guest User:", guestUser);
                // console.log("Client Email:", guestUser.email);

                if (!guestUser.email) {
                  console.error(
                    "Client email is missing from guest user data!"
                  );
                  toast.error("Client email is missing. Please try again.");
                  setIsProcessing(false);
                  return;
                }

                await dispatch(
                  updateGuestBookingAsync({
                    id: bookingId,
                    bookingData: { status: "pending" },
                    clientEmail: guestUser.email,
                  })
                );
              } else {
                await dispatch(
                  updateBookingAsync({
                    id: bookingId,
                    bookingData: { status: "pending" },
                  })
                );
              }

              try {
                // Persist plan as active subscription
                sessionStorage.setItem(
                  "qw_plan",
                  JSON.stringify({
                    plan,
                    purchasedAt: Date.now(),
                    active: true,
                  })
                );

                // Check for existing intake
                let stored = null;
                try {
                  const raw = sessionStorage.getItem("qw_questionnaire");
                  if (raw) stored = JSON.parse(raw);
                } catch (e) {
                  stored = null;
                }
                const RECENT_DAYS = 90;
                const now = Date.now();
                const isRecent = (ts: number | undefined | null) =>
                  ts && now - ts < RECENT_DAYS * 24 * 60 * 60 * 1000;

                // Check for any previously reserved session (from intake-first scheduling)
                let scheduled = null;
                try {
                  const raw = sessionStorage.getItem("qw_scheduled_session");
                  if (raw) scheduled = JSON.parse(raw);
                } catch (e) {
                  scheduled = null;
                }

                if (!stored || !isRecent(stored?.updatedAt)) {
                  toast.success(
                    "Payment successful! Please complete a short intake to unlock sessions."
                  );
                  // Save a pending marker to ensure plan activation after intake
                  try {
                    sessionStorage.setItem(
                      "qw_pending_plan",
                      JSON.stringify(plan)
                    );
                  } catch (e) { }
                  // Navigate to booking confirmation page - questionnaire will be handled there after auto-login
                  // Remove direct navigation to questionnaire from here
                }

                // Intake exists and is recent: assign therapist, unlock scheduled session if present & proceed
                try {
                  const therapist = {
                    id: publicAdmins?.[0]?.id || "",
                    name: publicAdmins?.[0]?.name || "",
                    role: publicAdmins?.[0]?.role || "Therapist",
                    assignedAt: Date.now(),
                  };
                  sessionStorage.setItem(
                    "qw_assigned",
                    JSON.stringify(therapist)
                  );

                  if (scheduled) {
                    scheduled.locked = false;
                    scheduled.therapist = therapist;
                    scheduled.confirmedAt = Date.now();
                    sessionStorage.setItem(
                      "qw_scheduled_session",
                      JSON.stringify(scheduled)
                    );
                  }
                } catch (e) { }

                // Check if user is a guest (not logged in)
                const wasGuestUser =
                  !sessionStorage.getItem("qw_user") &&
                  !localStorage.getItem("token");

                toast.success("Payment successful!.");
                // Navigate to booking confirmation page for all users
                navigate("/booking-confirmation", {
                  state: {
                    ...bookingData,
                    bookingId: bookingId,
                    finalPrice,
                    guestUser: wasGuestUser
                      ? JSON.parse(
                        sessionStorage.getItem("qw_guest_user") || "{}"
                      )
                      : undefined,
                    fromServices: true,
                  },
                });
              } catch (innerError) {
                console.error("Error in fallback flow:", innerError);
                toast.error(
                  "Payment was successful but there was an issue processing your booking. Please contact support."
                );
              }
            }
          },

          prefill: {
            name: isGuestUser ? guestUserData.name : "",
            email: isGuestUser ? guestUserData.email : "",
            contact: isGuestUser ? guestUserData.phone : "",
          },
          theme: {
            color: "#3b82f6", // Tailwind blue-500
          },
          modal: {
            ondismiss: function () {
              // Handle when user closes the payment modal without completing payment
              toast.info("Payment was cancelled. You can try again later.");
              setIsProcessing(false); // Close the loading state
            },
            escape: function () {
              // Handle when user presses escape key to close the modal
              setIsProcessing(false);
            },
            onload: function () {
              // Ensure processing state is set when modal loads
              setIsProcessing(true);
            },
          },
          callback: function (error) {
            // Handle payment failure
            if (error) {
              console.error("Payment failed:", error);
              toast.error(
                "Payment failed. Please try again or contact support."
              );
              setIsProcessing(false);
            }
          },
        };

        // Initialize and open Razorpay checkout
        if (typeof window !== "undefined" && (window as any).Razorpay) {
          // Check if key exists before creating Razorpay instance
          if (!options.key || options.key === "rzp_test_1234567890") {
            toast.error(
              "Razorpay key is not configured properly. Please contact support."
            );
            setIsProcessing(false);
            return;
          }

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } else {
          console.error("Razorpay SDK not loaded");
          toast.error("Payment gateway not loaded. Please try again.");
          setIsProcessing(false);
        }
      }
    } catch (error) {
      // console.log("Error creating booking:", error);
      toast.error("Failed to create booking. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="bg-muted/30 py-8">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Complete Your Booking</h1>
              <p className="text-muted-foreground">
                Review your session details and complete payment
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* <div
                className={`px-3 py-1 rounded-lg text-sm font-black ${intakeIsRecent
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-yellow-50 text-yellow-800"
                  }`}
              >
                {intakeIsRecent ? "Intake: Complete" : "Intake: Required"}
              </div> */}
              {/* <div
                className={`px-3 py-1 rounded-lg text-sm font-black ${sessionStorage.getItem("qw_plan")
                  ? "bg-primary/10 text-primary"
                  : "bg-slate-100 text-slate-400"
                  }`}
              >
                {sessionStorage.getItem("qw_plan")
                  ? subscriptionBooking
                    ? "Subscription: Active"
                    : "Plan: Active"
                  : subscriptionBooking
                    ? "Subscription: Not Purchased"
                    : "Plan: Not Purchased"}
              </div> */}
            </div>
          </div>
        </div>
      </div>

      <div className="container pb-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Guest User Form and Payment Form - Sticky on larger screens */}
          <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-8 lg:self-start lg:h-fit">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Your Information
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <Label htmlFor="guestName">Full Name *</Label>
                    <Input
                      id="guestName"
                      placeholder="Enter your full name (2-50 letters)"
                      value={guestUserData.name}
                      disabled={!!user}
                      onChange={(e) => {
                        setGuestUserData({
                          ...guestUserData,
                          name: e.target.value,
                        });
                        // Clear error when user starts typing
                        if (nameError) setNameError("");
                      }}
                      className={`mt-2 disabled:text-black disabled:bg-white disabled:opacity-100 ${nameError ? "border-destructive" : ""
                        }`}
                    />
                    {nameError && (
                      <p className="text-destructive text-sm mt-1">
                        {nameError}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter 2-50 letters only
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <Label htmlFor="guestEmail">Email Address *</Label>
                      <Input
                        id="guestEmail"
                        type="email"
                        placeholder="Enter your email address"
                        value={guestUserData.email}
                        disabled={!!user}
                        onChange={(e) => {
                          setGuestUserData({
                            ...guestUserData,
                            email: e.target.value,
                          });
                          // Clear error when user starts typing
                          if (emailError) setEmailError("");
                        }}
                        className={`mt-2 disabled:text-black disabled:bg-white disabled:opacity-100 ${emailError ? "border-destructive" : ""
                          }`}
                      />
                      {emailError && (
                        <p className="text-destructive text-sm mt-1">
                          {emailError}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <Label htmlFor="guestPhone">Phone Number *</Label>
                      <Input
                        id="guestPhone"
                        placeholder="Enter your phone number (10-15 digits)"
                        value={guestUserData?.phone}
                        disabled={!!user}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
                          if (value.length <= 15) {
                            setGuestUserData({
                              ...guestUserData,
                              phone: value,
                            });
                            // Clear error when user starts typing
                            if (phoneError) setPhoneError("");
                          }
                        }}
                        maxLength={15}
                        className={`mt-2 disabled:text-black disabled:bg-white disabled:opacity-100 ${phoneError ? "border-destructive" : ""
                          }`}
                      />
                      {phoneError && (
                        <p className="text-destructive text-sm mt-1">
                          {phoneError}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter 10-15 digit mobile number (any country)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scheduling Options */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-primary" />
                  Schedule Session
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select your preferred option:
                  </p>

                  <RadioGroup
                    value={scheduleOption || ""}
                    onValueChange={(value: "now" | "later" | "") => {
                      if (value === "") {
                        clearSelection();
                      } else {
                        value === "now"
                          ? openScheduleModal()
                          : selectScheduleLater();
                      }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {/* Immediate Booking Option */}
                    <div className="flex items-start space-x-3 border rounded-lg p-4 hover:border-primary/50 transition-colors">
                      <RadioGroupItem
                        value="now"
                        id="schedule-now"
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="schedule-now"
                          className="font-medium cursor-pointer text-base"
                        >
                          Book Session Now
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Select a date and time for your session immediately
                        </p>

                        {scheduleOption === "now" &&
                          scheduleDate &&
                          scheduleTime && (
                            <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                              <div className="flex items-center gap-2 text-primary font-medium">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm">
                                  {new Date(scheduleDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-primary font-medium mt-1">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">
                                  {selectedTimeSlot
                                    ? `${selectedTimeSlot.start} - ${selectedTimeSlot.end}`
                                    : scheduleTime}
                                </span>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Schedule Later Option */}
                    <div className="flex items-start space-x-3 border rounded-lg p-4 hover:border-primary/50 transition-colors">
                      <RadioGroupItem
                        value="later"
                        id="schedule-later"
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor="schedule-later"
                          className="font-medium cursor-pointer text-base"
                        >
                          Schedule Later
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Book now, schedule your session after payment
                        </p>

                        {scheduleOption === "later" && (
                          <div className="mt-3 p-3 rounded-lg bg-secondary/50 border border-secondary/20">
                            <div className="flex items-center gap-2 text-secondary-foreground font-medium">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">
                                Session will be scheduled later
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              You can schedule your session from your profile
                              after payment
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </RadioGroup>

                  {scheduleError && (
                    <div className="mt-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <CircleAlert className="h-4 w-4" />
                        {scheduleError}
                      </p>
                    </div>
                  )}

                  {scheduleOption && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card variant="outline">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Secure Payment</p>
                    <p className="text-xs text-muted-foreground">
                      Your payment is encrypted and secure. We never store your
                      card details.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Therapist Information Card */}
 <Card variant="elevated">
  <CardHeader className="border-b bg-primary/5">
   <CardTitle>Therapist Information</CardTitle>
 
  </CardHeader>

  <CardContent className="space-y-4 pt-4">
    <div className="flex items-center gap-4 p-4 rounded-xl bg-background shadow-sm border">
      
      <img
        src={
          subscriptionBooking
            ? "https://placehold.co/100x100?text=SUB"
            : publicAdmins?.[0]?.profilePicture ||
              "https://placehold.co/100x100?text=DOC"
        }
        alt={
          subscriptionBooking
            ? plan.name
            : publicAdmins?.[0]?.name || "Doctor"
        }
        className="w-14 h-14 rounded-xl object-cover border-2"
      />

      <div>
        <p className="font-semibold text-base">
          {publicAdmins?.[0]?.name || "Doctor"}
        </p>

        <p className="text-sm text-muted-foreground">
          {publicAdmins?.[0]?.doctorProfile?.specialization ||
            bookingData?.therapist?.title ||
            "Physiotherapist"}
        </p>

        {publicAdmins?.[0]?.doctorProfile?.experience && (
          <p className="text-sm text-primary font-medium mt-1">
            {publicAdmins[0].doctorProfile.experience}+ Years Experience
          </p>
        )}
      </div>
    </div>
  </CardContent>
</Card>


            {/* Service/Plan Details Card */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>
                  {subscriptionBooking
                    ? "Subscription Plan"
                    : "Service Details"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {subscriptionBooking
                        ? plan.name
                        : bookingData?.service?.name || plan.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {subscriptionBooking
                        ? plan.duration
                        : bookingData?.service?.duration || plan.duration}
                    </p>
                    {subscriptionBooking && (
                      <p className="text-sm text-muted-foreground">
                        Sessions: {plan.sessions || bookingData?.service
                          ? bookingData?.service?.sessions
                          : plan.sessions}
                      </p>
                    )}
                    {/* {!subscriptionBooking && bookingData?.service && (
                      <p className="text-sm text-muted-foreground">
                        Service ID: {bookingData.service.id}
                      </p>
                    )} */}
                  </div>
                  {hasActivePlan ? (
                    <div className="text-right">
                      <p className="font-semibold text-green-600">FREE</p>
                      <p className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        with {activePlan?.planName || "your plan"}
                      </p>
                      {activePlan?.availableSessions && (
                        <div className="mt-1 text-xs">
                          <p className="text-green-700">
                            {activePlan.availableSessions.remaining} of {activePlan.availableSessions.total} sessions left
                          </p>
                          <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-green-600 h-1.5 rounded-full" 
                              style={{ width: `${activePlan.availableSessions.percentageUsed}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="font-semibold">₹{plan.price}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Available Offers Dialog Trigger */}
                <div className="space-y-3 p-4 rounded-lg bg-muted/30">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-sm">Available Offers</h3>
                      <p className="text-xs text-muted-foreground">
                        Click to view and apply coupons
                      </p>
                    </div>
                    <Dialog
                      open={isOffersDialogOpen}
                      onOpenChange={setIsOffersDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          View Offers
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Available Offers & Coupons</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                          <div className="space-y-3">
                            {offersLoading ? (
                              <div className="flex justify-center items-center h-20">
                                <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                              </div>
                            ) : availableOffers.length > 0 ? (
                              availableOffers.map((offer) => (
                                <div
                                  key={offer._id || offer.id}
                                  className={`p-3 rounded-md border cursor-pointer transition-all ${isCouponApplied &&
                                    couponCode.toUpperCase() === offer.code
                                    ? "border-success bg-success/10"
                                    : "border-muted hover:border-primary/50 hover:bg-muted/50"
                                    }`}
                                  onClick={() => {
                                    if (!isCouponApplied) {
                                      setCouponCode(offer.code);

                                      setTimeout(() => {
                                        setIsOffersDialogOpen(false);
                                      }, 100);
                                    }
                                  }}
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-primary">
                                          {offer.discount}
                                        </span>
                                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                          {offer.code}
                                        </span>
                                        {isCouponApplied &&
                                          couponCode.toUpperCase() ===
                                          offer.code && (
                                            <span className="text-success text-xs">
                                              ✓ Applied
                                            </span>
                                          )}
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {offer.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-muted-foreground"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                </div>
                                <h3 className="font-medium text-lg text-foreground">
                                  No offers available
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Check back later for exciting discounts and
                                  promotions
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Manual Coupon Entry */}
                          {/* <div className="pt-4 border-t">
                            <Label htmlFor="dialogCouponCode" className="text-sm">Or Enter Coupon Code</Label>
                            <div className="flex gap-2 mt-2">
                              <Input
                                id="dialogCouponCode"
                                placeholder="Enter coupon code"
                                value={couponCode}
                                onChange={(e) => {
                                  setCouponCode(e.target.value);
                                  if (couponError) setCouponError("");
                                }}
                                disabled={isCouponApplied}
                                className={couponError ? "border-destructive" : ""}
                              />
                              {!isCouponApplied ? (
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApplyCoupon();
                                    setIsOffersDialogOpen(false);
                                  }}
                                  disabled={!couponCode.trim()}
                                  variant="outline"
                                  size="sm"
                                >
                                  Apply
                                </Button>
                              ) : (
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveCoupon();
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                            {couponError && (
                              <p className="text-destructive text-sm mt-1">{couponError}</p>
                            )}
                          </div> */}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <Separator />

                {/* Applied Coupon Display
                {(promoApplied || isCouponApplied) && (
                  <div className="space-y-3 p-3 rounded-lg bg-muted/20">
                    <h4 className="font-medium text-sm">Applied Discounts</h4>
                    {promoApplied && !isCouponApplied && (
                      <div className="flex justify-between items-center text-success">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Promo Discount</span>
                          <span className="text-xs bg-success/10 text-success px-2 py-1 rounded">20% OFF</span>
                        </div>
                        <span className="font-medium">-₹{Math.round(basePrice * 0.2)}</span>
                      </div>
                    )}
                    {isCouponApplied && (
                      <div className="flex justify-between items-center text-success">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Coupon Discount</span>
                          <span className="text-xs bg-success/10 text-success px-2 py-1 rounded">
                            {couponCode.toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">-₹{couponDiscount}</span>
                      </div>
                    )}
                    <div className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOffersDialogOpen(true)}
                        className="text-primary hover:text-primary"
                      >
                        Change Offer
                      </Button>
                    </div>
                  </div>
                )} */}

                <Separator />

                {/* Manual Coupon Code Section */}
                <div className="space-y-2">
                  <Label htmlFor="couponCode">Or Enter Coupon Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="couponCode"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        if (couponError) setCouponError("");
                      }}
                      disabled={isCouponApplied}
                      className={couponError ? "border-destructive" : ""}
                    />
                    {!isCouponApplied ? (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyCoupon();
                        }}
                        disabled={!couponCode.trim()}
                        variant="outline"
                      >
                        Apply
                      </Button>
                    ) : (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCoupon();
                        }}
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  {couponError && (
                    <p className="text-destructive text-sm">{couponError}</p>
                  )}
                  {/* {isCouponApplied && (
                    <p className="text-success text-sm font-medium">
                      ✓ Coupon applied successfully!
                    </p>
                  )} */}
                </div>

                <Separator />

                {/* Discount Display */}
                {(promoApplied || isCouponApplied) && (
                  <div className="space-y-2">
                    {promoApplied && !isCouponApplied && (
                      <div className="flex justify-between items-center text-success">
                        <span className="text-sm">Promo Discount (20%)</span>
                        <span>-₹{Math.round(plan.price * 0.2)}</span>
                      </div>
                    )}
                    {isCouponApplied && (
                      <div className="flex justify-between items-center text-success">
                        <span className="text-sm">Coupon Discount</span>
                        <span>-₹{couponDiscount}</span>
                      </div>
                    )}
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-lg">Total</span>
                    <p className="text-sm text-muted-foreground">
                      {subscriptionBooking
                        ? "Subscription Payment"
                        : "Service Booking Payment"}
                    </p>
                    {(promoApplied || isCouponApplied) && (
                      <p className="text-xs text-muted-foreground line-through">
                        Original: ₹{basePrice}
                      </p>
                    )}
                  </div>
                  {hasActivePlan ? (
                    <div className="text-right">
                      <span className="font-bold text-2xl text-green-600">FREE</span>
                      <p className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full mt-1">
                        with {activePlan?.planName || "your plan"}
                      </p>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="font-bold text-2xl text-primary">
                        ₹{finalPrice}
                      </span>
                      {(promoApplied || isCouponApplied) && (
                        <p className="text-xs text-success">
                          You save ₹{discountAmount}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {!intakeIsRecent && (
                  <div className="p-3 rounded-md bg-yellow-50 border border-yellow-100 text-yellow-800 text-sm mb-4">
                    {subscriptionBooking
                      ? "We noticed you don't have a recent intake on file. After payment you'll be prompted to complete the intake to unlock services."
                      : "We noticed you don't have a recent intake on file. After payment you'll be prompted to complete the intake to unlock sessions."}
                  </div>
                )}

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={handlePayment}
                  disabled={
                    isProcessing ||
                    !scheduleOption ||
                    (scheduleOption === "now" &&
                      (!scheduleDate || !scheduleTime)) ||
                    (isGuestUser &&
                      (!guestUserData.name ||
                        !guestUserData.email ||
                        !guestUserData.phone))
                  }
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      {hasActivePlan ? (
                        "Book Session"
                      ) : subscriptionBooking ? (
                        `Pay ₹${finalPrice} for Subscription${promoApplied || isCouponApplied
                          ? ` (Save ₹${discountAmount})`
                          : ""
                        }`
                      ) : (
                        `Pay ₹${finalPrice} for Booking${promoApplied || isCouponApplied
                          ? ` (Save ₹${discountAmount})`
                          : ""
                        }`
                      )}
                    </>
                  )}
                </Button>

                {isGuestUser && (nameError || emailError || phoneError) && (
                  <div className="text-xs text-center text-destructive space-y-1">
                    {nameError && <p>{nameError}</p>}
                    {emailError && <p>{emailError}</p>}
                    {phoneError && <p>{phoneError}</p>}
                  </div>
                )}
                {/* <p className="text-xs text-center text-muted-foreground">
                  By completing this purchase, you agree to our Terms of
                  Service.
                </p> */}
              </CardContent>
            </Card>

            {/* Cancellation Policy */}
            {/* <Card variant="outline">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">
                  {subscriptionBooking ? "Subscription Terms" : "Booking Terms"}
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {subscriptionBooking ? (
                    <>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                        Access to all services included in the plan
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                        Cancel subscription anytime, no hidden fees
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                        Free cancellation up to 24 hours before session
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                        Reschedule as needed through your dashboard
                      </li>
                    </>
                  )}
                </ul>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={closeScheduleModal}
        onConfirm={handleScheduleConfirm}
        availability={availability}
        currentMonth={currentMonth}
        currentYear={currentYear}
        setCurrentMonth={setCurrentMonth}
        setCurrentYear={setCurrentYear}
        scheduleError={scheduleError}
        scheduleDate={scheduleDate}
        scheduleTime={scheduleTime}
        setScheduleDate={setScheduleDate}
        setScheduleTime={setScheduleTime}
        setSelectedDate={setSelectedDate}
        therapistName={therapist?.name}
        selectedTimeSlot={selectedTimeSlot}
        setSelectedTimeSlot={setSelectedTimeSlot}
        bookingType={bookingType}
      />

      {/* Session Limit Exceeded Modal */}
      <Dialog open={isSessionLimitExceededModalOpen} onOpenChange={setIsSessionLimitExceededModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
              <CircleAlert className="h-6 w-6" />
              Session Limit Reached
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 mb-2">
                {sessionLimitExceededInfo?.message || 'Your subscription session limit has been reached.'}
              </p>
              <p className="text-red-700 text-sm">
                You have used all {sessionLimitExceededInfo?.usedSessions} sessions from your {sessionLimitExceededInfo?.planName} plan.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Next Steps:</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>You can now book services by paying the regular price</li>
                <li>Your subscription benefits are no longer available for additional sessions</li>
                <li>Consider upgrading your subscription for more sessions</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={() => {
                  setIsSessionLimitExceededModalOpen(false);
                  navigate('/services');
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Browse Services
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsSessionLimitExceededModalOpen(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Login Modal for existing users */}
      <BookingLoginModal
        
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsLoginModalOpen(false);
          toast.success("Login successful! You can now continue with your booking.");
          // You can add any additional logic here after successful login
        }}

        // onError={() => {
        //   setIsLoginModalOpen(true);
        // }}
        email={loginEmail}
      />
    </Layout>
  );
}
