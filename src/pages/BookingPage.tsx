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
  CreditCard,
  Lock,
  Shield,
  CheckCircle,
  Calendar,
  Clock,
  User,
  Wallet,
  CalendarClock
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { createBookingAsync, updateBookingAsync, updateGuestBookingAsync, createPaymentOrderAsync, verifyPaymentAsync, createGuestBookingAsync, createGuestPaymentOrderAsync, verifyGuestPaymentAsync, createSubscriptionPaymentOrderAsync, checkSlotAvailabilityAsync } from '@/store/slices/bookingsSlice';
import { verifySubscriptionPaymentTransaction } from '@/store/slices/paymentSlice';
import { createGuestSubscriptionPaymentOrderAsync, verifyGuestSubscriptionPaymentAsync } from '@/store/slices/bookingsSlice';
import { useAppDispatch, useAppSelector, RootState } from '@/store';
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { ScheduleModal } from "@/components/profile/ScheduleModal";
import { fetchPublicAdmins } from '@/store/slices/adminSlice';
import { getAvailability } from '@/lib/api';
export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const bookingData = location.state;
  const [isProcessing, setIsProcessing] = useState(false);
  const dispatch = useAppDispatch();
  const { admins: publicAdmins } = useSelector((state: RootState) => state.admins);
  console.log("publicAdmins", publicAdmins)

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
  console.log("availabilitylllllllll", availability)
  const [scheduleOption, setScheduleOption] = useState<"now" | "later" | null>(null);
  useEffect(() => {
    if (user) {
      setGuestUserData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);
  useEffect(() => {
   
    dispatch(fetchPublicAdmins());
  }, [dispatch]);
  // Check if user is a guest (not logged in)
  // User is considered logged in if either qw_user exists in sessionStorage OR token exists in localStorage
  const isGuestUser =
    !sessionStorage.getItem("qw_user") && !localStorage.getItem("token");

  // Handle service-based booking data
  // Handle subscription-based booking data

  const therapist = bookingData?.therapist


  const serviceBooking = bookingData?.fromServices === true;
  const subscriptionBooking = bookingData?.fromSubscription === true;

  const plan = bookingData?.plan ?? {
    name: subscriptionBooking
      ? bookingData.service.name
      : `${bookingData.service.name} Plan`,

    price: Number(bookingData.service.price),

    duration: subscriptionBooking
      ? bookingData.service.duration   // "monthly", "quarterly"
      : bookingData.service.duration,  // "52 min"
  };


  // Format date to YYYY-MM-DD
  const formatDate = (dateString: string) => {
    if (!dateString) {
      // Return current date if no date provided
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
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
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }

      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (e) {
      // Return current date if exception occurs
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  };

  const date = formatDate(bookingData?.date);
  // Format time to HH:MM
  const formatTime = (timeString: string) => {
    if (!timeString) {
      // Return current time (exact) if no time provided
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    // If already in HH:MM format, return as is
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
      return timeString;
    }

    // Try to parse various time formats
    try {
      // Handle "10:00 AM" or "10:00 AM (45 min)" formats
      if (timeString.includes('AM') || timeString.includes('PM')) {
        const timePart = timeString.split(' ')[0];
        const [hours, minutes] = timePart.split(':');

        let hour = parseInt(hours, 10);
        const period = timeString.split(' ')[1];

        if (period === 'AM' && hour === 12) {
          hour = 0;
        } else if (period === 'PM' && hour !== 12) {
          hour += 12;
        }

        return `${hour.toString().padStart(2, '0')}:${minutes}`;
      }

      // If it's just HH format, add :00
      if (/^\d{1,2}$/.test(timeString.trim())) {
        return `${timeString.padStart(2, '0')}:00`;
      }

      return timeString;
    } catch (e) {
      // Return current time if parsing fails
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  };

  const time = formatTime(bookingData?.time);
  const promoApplied = bookingData?.promoApplied || false;

  const finalPrice = promoApplied ? Math.round(plan.price * 0.8) : plan.price;

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

  // Scheduling functions
  const openScheduleModal = async () => {
    // Select "Schedule Now" option
    setScheduleOption("now");

    try {
      // Fetch real availability data from API
      const response: any = await getAvailability();
      const fetchedAvailability = response.data?.data?.availability || [];
      console.log("fetchedAvailability", fetchedAvailability)
      
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
  };

  const handleScheduleConfirm = (date: string, time: string, timeSlot?: { start: string, end: string }) => {
    // Save the scheduled session to sessionStorage
    const scheduledSession = {
      date,
      time,
      timeSlot, // Store complete time slot info
      therapist: { ...therapist, id: publicAdmins?.[0]?.id }, // Use the correct therapist ID
      service: bookingData?.service || plan,
      locked: true, // Will be unlocked after payment
      createdAt: Date.now()
    };

    sessionStorage.setItem("qw_scheduled_session", JSON.stringify(scheduledSession));

    // Update the schedule state
    setScheduleDate(date);
    setScheduleTime(time);
    if (timeSlot) {
      setSelectedTimeSlot(timeSlot);
    }

    const timeDisplay = timeSlot ? `${timeSlot.start} - ${timeSlot.end}` : time;
    toast.success(`Session scheduled for ${new Date(date).toLocaleDateString()} at ${timeDisplay}`);
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
    toast.info("You can schedule your session after payment completion");
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
          };

          paymentOrderResult = await dispatch(
            createGuestSubscriptionPaymentOrderAsync(
              guestSubscriptionPaymentOrderData
            )
          );
        } else {
          const subscriptionPaymentOrderData = {
            planId: bookingData.service.id || bookingData.service.planId,
            amount: finalPrice,
            currency: "INR",
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
            import.meta.env.VITE_RAZORPAY_KEY_ID ||
            "rzp_test_S250uIjk1rVbsT",
          order_id: orderId, // Use the order ID from the backend
          amount: finalPrice * 100, // Convert to paise (multiply by 100)
          currency: "INR",
          name: "Tanish physio & fitness",
          description: `Subscription Payment - Plan: ${bookingData.service.name}`,
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
                  navigate("/questionnaire", {
                    state: { planToActivate: plan },
                  });
                  return;
                }

                try {
                  const therapist = {
                    id: `th-${Math.floor(Math.random() * 10000)}`,
                    name: "Assigned Clinician",
                    title: "Matched Specialist",
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
                    scheduleDate: scheduleOption === "now" ? scheduleDate : null,
                    scheduleTime: scheduleOption === "now" ? scheduleTime : null,
                    timeSlot: scheduleOption === "now" ? selectedTimeSlot : null,
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

              try {
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
                  navigate("/questionnaire", {
                    state: { planToActivate: plan },
                  });
                  return;
                }

                // Intake exists and is recent: assign therapist, unlock scheduled session if present & proceed
                try {
                  const therapist = {
                    id: `th-${Math.floor(Math.random() * 10000)}`,
                    name: "Assigned Clinician",
                    title: "Matched Specialist",
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
                    scheduleDate: scheduleOption === "now" ? scheduleDate : null,
                    scheduleTime: scheduleOption === "now" ? scheduleTime : null,
                    timeSlot: scheduleOption === "now" ? selectedTimeSlot : null,
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
      } else {
        console.log(bookingData);
        const bookingPayload = {
          serviceId: serviceBooking ? bookingData.service.id : null,
          serviceName: serviceBooking ? bookingData.service.name : plan.name,
          therapistId: therapist.id || null,
          therapistName: therapist.name,
          userId: isGuestUser ? null : localStorage.getItem("user"),
          clientName: isGuestUser ? guestUserData.name : guestUserData.name,
          date: date,
          time: time,
          status: scheduleOption === "later" ? "pending" : "scheduled",
          notes: "Session booking from frontend",
          paymentStatus: "pending",
          amount: finalPrice,
          bookingId: serviceBooking ? bookingData.service.bookingId : null,
          scheduleType: scheduleOption || "now",
          scheduledDate: scheduleOption === "now" ? scheduleDate : null,
          scheduledTime: scheduleOption === "now" ? scheduleTime : null,
          timeSlot: scheduleOption === "now" ? selectedTimeSlot : null,
        };
        // Create the booking - use guest booking if user is not logged in
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
          };

          paymentOrderResult = await dispatch(
            createGuestPaymentOrderAsync(guestPaymentOrderData)
          );
        } else {
          const paymentOrderData = {
            bookingId: bookingId,
            amount: finalPrice,
            currency: "INR",
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
            import.meta.env.VITE_RAZORPAY_KEY_ID ||
            "rzp_test_S250uIjk1rVbsT",
          order_id: orderId, // Use the order ID from the backend
          amount: finalPrice * 100, // Convert to paise (multiply by 100)
          currency: "INR",
          name: "Tanish physio & fitness",
          description: `Session Booking Payment - Booking ID: ${bookingId}`,
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
                      status: scheduleOption === "later" ? "pending" : "scheduled",
                      paymentStatus: "paid"
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
                      status: scheduleOption === "later" ? "pending" : "scheduled",
                      paymentStatus: "paid"
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
                  navigate("/questionnaire", {
                    state: { planToActivate: plan },
                  });
                  return;
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

                toast.success("Payment successful!.");
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
                      scheduleDate: scheduleOption === "now" ? scheduleDate : null,
                      scheduleTime: scheduleOption === "now" ? scheduleTime : null,
                      timeSlot: scheduleOption === "now" ? selectedTimeSlot : null,
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
                      scheduleDate: scheduleOption === "now" ? scheduleDate : null,
                      scheduleTime: scheduleOption === "now" ? scheduleTime : null,
                      timeSlot: scheduleOption === "now" ? selectedTimeSlot : null,
                    },
                  });
                }
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
                console.log("Guest User:", guestUser);
                console.log("Client Email:", guestUser.email);

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
                  navigate("/questionnaire", {
                    state: { planToActivate: plan },
                  });
                  return;
                }

                // Intake exists and is recent: assign therapist, unlock scheduled session if present & proceed
                try {
                  const therapist = {
                    id: `th-${Math.floor(Math.random() * 10000)}`,
                    name: "Assigned Clinician",
                    title: "Matched Specialist",
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
      console.log("Error creating booking:", error);
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
              <div
                className={`px-3 py-1 rounded-lg text-sm font-black ${intakeIsRecent
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-yellow-50 text-yellow-800"
                  }`}
              >
                {intakeIsRecent ? "Intake: Complete" : "Intake: Required"}
              </div>
              <div
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Guest User Form and Payment Form */}
          <div className="lg:col-span-2 space-y-6">
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
                      className={`mt-2 disabled:text-black disabled:bg-white disabled:opacity-100 ${nameError ? "border-destructive" : ""}`}
                    />
                    {nameError && (
                      <p className="text-destructive text-sm mt-1">{nameError}</p>
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
                        className={`mt-2 disabled:text-black disabled:bg-white disabled:opacity-100 ${emailError ? "border-destructive" : ""}`}
                      />
                      {emailError && (
                        <p className="text-destructive text-sm mt-1">{emailError}</p>
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
                        className={`mt-2 disabled:text-black disabled:bg-white disabled:opacity-100 ${phoneError ? "border-destructive" : ""}`}
                      />
                      {phoneError && (
                        <p className="text-destructive text-sm mt-1">{phoneError}</p>
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
                        value === "now" ? openScheduleModal() : selectScheduleLater();
                      }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {/* Column 1 */}
                    <div className="flex items-start space-x-3 border rounded-lg p-4">
                      <RadioGroupItem value="now" id="schedule-now" className="mt-1" />
                      <div className="flex-1">
                        <Label
                          htmlFor="schedule-now"
                          className="font-medium cursor-pointer"
                        >
                          Schedule Now
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Pick date & time
                        </p>

                        {scheduleOption === "now" && scheduleDate && scheduleTime && (
                          <div className="mt-2 text-xs text-primary font-medium">
                            {new Date(scheduleDate).toLocaleDateString()} | {
                              selectedTimeSlot 
                                ? `${selectedTimeSlot.start} - ${selectedTimeSlot.end}`
                                : scheduleTime
                            }
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 2 */}
                    <div className="flex items-start space-x-3 border rounded-lg p-4">
                      <RadioGroupItem value="later" id="schedule-later" className="mt-1" />
                      <div className="flex-1">
                        <Label
                          htmlFor="schedule-later"
                          className="font-medium cursor-pointer"
                        >
                          Schedule Later
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          After payment
                        </p>

                        {scheduleOption === "later" && (
                          <div className="mt-2 text-xs text-primary font-medium">
                            Will schedule later
                          </div>
                        )}
                      </div>
                    </div>
                  </RadioGroup>

                  {scheduleOption && (
                    <div className="pt-2">
                      <Button variant="outline" size="sm" onClick={clearSelection}>
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
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Therapist or Plan Info depending on flow */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <img
                    src={
                      subscriptionBooking
                        ? "https://placehold.co/100x100?text=SUB"
                        : publicAdmins?.[0]?.profilePicture ||
                        "https://placehold.co/100x100?text=DOC"
                    }
                    alt={subscriptionBooking ? plan.name : publicAdmins?.[0]?.name || "Doctor"}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium">
                      {subscriptionBooking 
                        ? plan.name 
                        : publicAdmins?.[0]?.name || therapist.name || "Doctor"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {subscriptionBooking
                        ? `Subscription Plan - ${plan.duration}`
                        : publicAdmins?.[0]?.doctorProfile?.specialization || therapist.title || "Physiotherapist"}
                    </p>
                    {subscriptionBooking && (
                      <p className="text-sm text-muted-foreground">
                        Sessions: {plan.sessions || "Unlimited"}
                      </p>
                    )}
                    {!subscriptionBooking && publicAdmins?.[0]?.doctorProfile?.experience && (
                      <p className="text-sm text-muted-foreground">
                        Experience: {publicAdmins[0].doctorProfile.experience} years
                      </p>
                    )}
                  </div>
                </div>

                <Separator />
                {/* Plan or Service Info depending on flow */}
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
                    {!subscriptionBooking && bookingData?.service && (
                      <p className="text-sm text-muted-foreground">
                        Service ID: {bookingData.service.id}
                      </p>
                    )}
                  </div>
                  <p className="font-semibold">₹{plan.price}</p>
                </div>

                {promoApplied && (
                  <div className="flex justify-between items-center text-success">
                    <span className="text-sm">Promo Discount (20%)</span>
                    <span>-₹{Math.round(plan.price * 0.2)}</span>
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
                  </div>
                  <span className="font-bold text-2xl text-primary">
                    ₹{finalPrice}
                  </span>
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
                      {subscriptionBooking
                        ? `Pay ₹${finalPrice} for Subscription`
                        : `Pay ₹${finalPrice} for Booking`}
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

      {/* Schedule Modal */}
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
        therapistName={therapist?.name || "your therapist"}
      />
    </Layout>
  );
}
