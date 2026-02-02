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
  Wallet
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { createBookingAsync, updateBookingAsync, updateGuestBookingAsync, createPaymentOrderAsync, verifyPaymentAsync, createGuestBookingAsync, createGuestPaymentOrderAsync, verifyGuestPaymentAsync, createSubscriptionPaymentOrderAsync } from '@/store/slices/bookingsSlice';
import { verifySubscriptionPaymentTransaction } from '@/store/slices/paymentSlice';
import { createGuestSubscriptionPaymentOrderAsync, verifyGuestSubscriptionPaymentAsync } from '@/store/slices/bookingsSlice';
import { useAppDispatch, useAppSelector } from '@/store';
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/slices/authSlice";

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const bookingData = location.state;
  const [isProcessing, setIsProcessing] = useState(false);
  const dispatch = useAppDispatch();

  const [guestUserData, setGuestUserData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  useEffect(() => {
    if (user) {
      setGuestUserData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

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

  const handlePayment = async () => {

    // Validate guest user data if applicable
    if (isGuestUser && (!guestUserData.name || !guestUserData.email)) {
      toast.error("Please fill in your name and email to continue");
      return;
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

          paymentOrderResult = await dispatch(createGuestSubscriptionPaymentOrderAsync(guestSubscriptionPaymentOrderData));
        } else {
          const subscriptionPaymentOrderData = {
            planId: bookingData.service.id || bookingData.service.planId,
            amount: finalPrice,
            currency: "INR"
          };
          paymentOrderResult = await dispatch(createSubscriptionPaymentOrderAsync(subscriptionPaymentOrderData));
        }

        if (!createSubscriptionPaymentOrderAsync.fulfilled.match(paymentOrderResult) && !createGuestSubscriptionPaymentOrderAsync.fulfilled.match(paymentOrderResult)) {
          toast.error("Failed to create subscription payment order. Please try again.");
          setIsProcessing(false);
          return;
        }

        if (!paymentOrderResult.payload) {
          console.error("Payment order creation failed:", paymentOrderResult);
          toast.error(paymentOrderResult.payload?.message || "Payment order creation failed. Please try again.");
          setIsProcessing(false);
          return;
        }
        // Extract order details from the response - the structure depends on which API was called
        const orderData = paymentOrderResult.payload.order || paymentOrderResult.payload;
        const { orderId, key: razorpayKey } = orderData;

        // Razorpay options for subscription
        const options = {
          key: razorpayKey || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_S250uIjk1rVbsT",
          order_id: orderId, // Use the order ID from the backend
          amount: finalPrice * 100, // Convert to paise (multiply by 100)
          currency: "INR",
          name: "Tanish physio",
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
              verifyResult = await dispatch(verifyGuestSubscriptionPaymentAsync(paymentVerificationData));
            } else {
              verifyResult = await dispatch(verifySubscriptionPaymentTransaction(paymentVerificationData));
            }
            if ((isGuestUser && verifyGuestSubscriptionPaymentAsync.fulfilled.match(verifyResult)) || (!isGuestUser && verifySubscriptionPaymentTransaction.fulfilled.match(verifyResult))) {
              // Verification successful - process subscription
              try {
                // Get subscription ID from response
                const subscriptionId = verifyResult.payload?.subscription?.id || verifyResult.payload?.data?.subscription?.id;

                // Persist plan as active subscription with subscription ID
                sessionStorage.setItem(
                  "qw_plan",
                  JSON.stringify({
                    plan,
                    subscriptionId, // Store the actual subscription ID
                    purchasedAt: Date.now(),
                    active: true
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
                    sessionStorage.setItem("qw_pending_plan", JSON.stringify(plan));
                  } catch (e) { }
                  navigate("/questionnaire", { state: { planToActivate: plan } });
                  return;
                }

                try {
                  const therapist = {
                    id: `th-${Math.floor(Math.random() * 10000)}`,
                    name: "Assigned Clinician",
                    title: "Matched Specialist",
                    assignedAt: Date.now(),
                  };
                  sessionStorage.setItem("qw_assigned", JSON.stringify(therapist));

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
                  !localStorage.getItem("token")

                toast.success("Payment successful!.");
                // Navigate to booking confirmation page for all users
                navigate("/booking-confirmation", {
                  state: {
                    ...bookingData,
                    finalPrice,
                    guestUser: wasGuestUser ? JSON.parse(sessionStorage.getItem("qw_guest_user") || "{}") : undefined,
                    fromSubscription: true,
                  },
                });
              } catch (error) {
                console.error("Error processing subscription payment success:", error);
                toast.error("Something went wrong after payment. Please contact support.");
              }
            } else {
              console.error("Subscription payment verification failed:", verifyResult.payload);

              // For subscription payments, we don't need to update booking status
              // The subscription is already activated via the payment verification

              try {
                // Get subscription ID from response (even in fallback scenario)
                const subscriptionId = verifyResult.payload?.subscription?.id || verifyResult.payload?.data?.subscription?.id;
                // Persist plan as active subscription with subscription ID
                sessionStorage.setItem(
                  "qw_plan",
                  JSON.stringify({
                    plan,
                    subscriptionId, // Store the actual subscription ID
                    purchasedAt: Date.now(),
                    active: true
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
                    sessionStorage.setItem("qw_pending_plan", JSON.stringify(plan));
                  } catch (e) { }
                  navigate("/questionnaire", { state: { planToActivate: plan } });
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
                  sessionStorage.setItem("qw_assigned", JSON.stringify(therapist));

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
                  !localStorage.getItem("token")

                toast.success("Payment successful!.");
                // Navigate to booking confirmation page for all users
                navigate("/booking-confirmation", {
                  state: {
                    ...bookingData,
                    finalPrice,
                    guestUser: wasGuestUser ? JSON.parse(sessionStorage.getItem("qw_guest_user") || "{}") : undefined,
                    fromSubscription: true,
                  },
                });
              } catch (innerError) {
                console.error("Error in subscription fallback flow:", innerError);
                toast.error("Payment was successful but there was an issue processing your subscription. Please contact support.");
              }
            }
          },

          prefill: {
            name: isGuestUser ? guestUserData.name : "Customer",
            email: isGuestUser ? guestUserData.email : "customer@example.com",
            contact: isGuestUser ? guestUserData.phone : "9999999999",
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
            }
          },
          callback: function (error) {
            // Handle payment failure
            if (error) {
              console.error("Payment failed:", error);
              toast.error("Payment failed. Please try again or contact support.");
              setIsProcessing(false);
            }
          }
        };

        // Initialize and open Razorpay checkout
        if (typeof window !== 'undefined' && (window as any).Razorpay) {
          // Check if key exists before creating Razorpay instance
          if (!options.key || options.key === "rzp_test_1234567890") {
            toast.error("Razorpay key is not configured properly. Please contact support.");
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
        console.log(bookingData)
        const bookingPayload = {
          serviceId: serviceBooking ? bookingData.service.id : null,
          serviceName: serviceBooking ? bookingData.service.name : plan.name,
          therapistId: therapist.id || null,
          therapistName: therapist.name,
          userId: isGuestUser ? null : localStorage.getItem('user'),
          clientName: isGuestUser ? guestUserData.name : guestUserData.name,
          date: date,
          time: time,
          status: "pending",
          notes: "Session booking from frontend",
          paymentStatus: "pending",
          amount: finalPrice,
          bookingId: serviceBooking ? bookingData.service.bookingId : null,
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

          bookingResult = await dispatch(createGuestBookingAsync(guestBookingPayload));
        } else {

          bookingResult = await dispatch(createBookingAsync(bookingPayload));
        }

        if (!createBookingAsync.fulfilled.match(bookingResult) && !createGuestBookingAsync.fulfilled.match(bookingResult)) {
          toast.error("Failed to create booking. Please try again.");
          setIsProcessing(false);
          return;
        }

        const bookingId = bookingResult.payload?._id || (bookingResult.payload as any)?.booking?._id;

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

          paymentOrderResult = await dispatch(createGuestPaymentOrderAsync(guestPaymentOrderData));
        } else {

          const paymentOrderData = {
            bookingId: bookingId,
            amount: finalPrice,
            currency: "INR"
          };

          paymentOrderResult = await dispatch(createPaymentOrderAsync(paymentOrderData));
        }

        if (!createPaymentOrderAsync.fulfilled.match(paymentOrderResult) && !createGuestPaymentOrderAsync.fulfilled.match(paymentOrderResult)) {
          toast.error("Failed to create payment order. Please try again.");
          setIsProcessing(false);
          return;
        }

        if (!paymentOrderResult.payload) {
          console.error("Payment order creation failed:", paymentOrderResult);
          toast.error(paymentOrderResult.payload?.message || "Payment order creation failed. Please try again.");
          setIsProcessing(false);
          return;
        }
        // Extract order details from the response - the structure depends on which API was called
        const orderData = paymentOrderResult.payload.order || paymentOrderResult.payload;
        const { orderId, key: razorpayKey } = orderData;

        // Razorpay options
        const options = {
          key: razorpayKey || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_S250uIjk1rVbsT",
          order_id: orderId, // Use the order ID from the backend
          amount: finalPrice * 100, // Convert to paise (multiply by 100)
          currency: "INR",
          name: "Tanish physio",
          description: `Session Booking Payment - Booking ID: ${bookingId}`,
          image: "https://your-wellness-path.com/logo.png", // Replace with your logo URL
          handler: async function (response: any) {
            // Payment successful - send response to backend for verification
            const paymentVerificationData = {
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              bookingId: bookingId, // Pass the booking ID for verification
            };
            // Set processing to false as payment was successful and we're moving to verification
            setIsProcessing(false);

            // Dispatch payment verification action
            let verifyResult;
            if (isGuestUser) {

              verifyResult = await dispatch(verifyGuestPaymentAsync(paymentVerificationData));
            } else {

              verifyResult = await dispatch(verifyPaymentAsync(paymentVerificationData));
            }
            if ((isGuestUser && verifyGuestPaymentAsync.fulfilled.match(verifyResult)) || (!isGuestUser && verifyPaymentAsync.fulfilled.match(verifyResult))) {
              // Verification successful - update booking status to confirmed
              if (isGuestUser) {

                // For guest users, use guest booking update with client email
                const guestUser = JSON.parse(sessionStorage.getItem("qw_guest_user") || "{}");
                await dispatch(updateGuestBookingAsync({
                  id: bookingId,
                  bookingData: { status: 'confirmed' },
                  clientEmail: guestUser.email
                }));
                
              } else {

                // For authenticated users, use regular booking update
                await dispatch(updateBookingAsync({ id: bookingId, bookingData: { status: 'pending' } }));
              }

              // Process success flow
              try {
                // Persist plan as active subscription
                sessionStorage.setItem(
                  "qw_plan",
                  JSON.stringify({ plan, purchasedAt: Date.now(), active: true })
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
                    sessionStorage.setItem("qw_pending_plan", JSON.stringify(plan));
                  } catch (e) { }
                  navigate("/questionnaire", { state: { planToActivate: plan } });
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
                  !localStorage.getItem("token")

                toast.success("Payment successful!.");
                if (wasGuestUser) {
                  // For guest users, navigate to booking confirmation page
                  navigate("/booking-confirmation", {
                    state: {
                      ...bookingData,
                      bookingId: bookingId,
                      finalPrice,
                      guestUser: JSON.parse(sessionStorage.getItem("qw_guest_user") || "{}"),
                      fromServices: true,
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
                    },
                  });
                }
              } catch (error) {
                console.error("Error processing payment success:", error);
                toast.error("Something went wrong after payment. Please contact support.");
              }
            } else {
              console.error("Payment verification failed:", verifyResult.payload);

              if (isGuestUser) {

                const guestUser = JSON.parse(sessionStorage.getItem("qw_guest_user") || "{}");
                console.log("Guest User:", guestUser);
                console.log("Client Email:", guestUser.email);
                
                if (!guestUser.email) {
                  console.error("Client email is missing from guest user data!");
                  toast.error("Client email is missing. Please try again.");
                  setIsProcessing(false);
                  return;
                }
                
                await dispatch(updateGuestBookingAsync({
                  id: bookingId,
                  bookingData: { status: 'pending' },
                  clientEmail: guestUser.email
                }));
              } else {

                await dispatch(updateBookingAsync({ id: bookingId, bookingData: { status: 'confirmed' } }));
              }

              try {
                // Persist plan as active subscription
                sessionStorage.setItem(
                  "qw_plan",
                  JSON.stringify({ plan, purchasedAt: Date.now(), active: true })
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
                    sessionStorage.setItem("qw_pending_plan", JSON.stringify(plan));
                  } catch (e) { }
                  navigate("/questionnaire", { state: { planToActivate: plan } });
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
                  sessionStorage.setItem("qw_assigned", JSON.stringify(therapist));

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
                  !localStorage.getItem("token")

                toast.success("Payment successful!.");
                // Navigate to booking confirmation page for all users
                navigate("/booking-confirmation", {
                  state: {
                    ...bookingData,
                    bookingId: bookingId,
                    finalPrice,
                    guestUser: wasGuestUser ? JSON.parse(sessionStorage.getItem("qw_guest_user") || "{}") : undefined,
                    fromServices: true,
                  },
                });
              } catch (innerError) {
                console.error("Error in fallback flow:", innerError);
                toast.error("Payment was successful but there was an issue processing your booking. Please contact support.");
              }
            }
          },

          prefill: {
            name: isGuestUser ? guestUserData.name : "Customer",
            email: isGuestUser ? guestUserData.email : "customer@example.com",
            contact: isGuestUser ? guestUserData.phone : "9999999999",
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
            }
          },
          callback: function (error) {
            // Handle payment failure
            if (error) {
              console.error("Payment failed:", error);
              toast.error("Payment failed. Please try again or contact support.");
              setIsProcessing(false);
            }
          }
        };

        // Initialize and open Razorpay checkout
        if (typeof window !== 'undefined' && (window as any).Razorpay) {
          // Check if key exists before creating Razorpay instance
          if (!options.key || options.key === "rzp_test_1234567890") {
            toast.error("Razorpay key is not configured properly. Please contact support.");
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
                  ? (subscriptionBooking ? "Subscription: Active" : "Plan: Active")
                  : (subscriptionBooking ? "Subscription: Not Purchased" : "Plan: Not Purchased")}
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
                    <Label htmlFor="guestName">Full Name</Label>
                    <Input
                      id="guestName"
                      placeholder="Enter your full name"
                      value={guestUserData.name}
                      disabled={!!user}
                      onChange={(e) =>
                        setGuestUserData({
                          ...guestUserData,
                          name: e.target.value,
                        })
                      }
                      className="mt-2 disabled:text-black disabled:bg-white disabled:opacity-100"

                    />
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="guestEmail">Email Address</Label>
                    <Input
                      id="guestEmail"
                      type="email"
                      placeholder="Enter your email address"
                      value={guestUserData.email}
                      disabled={!!user}
                      onChange={(e) =>
                        setGuestUserData({
                          ...guestUserData,
                          email: e.target.value,
                        })
                      }
                      className="mt-2 disabled:text-black disabled:bg-white disabled:opacity-100"

                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="guestPhone">Phone Number</Label>
                   <Input
  id="guestPhone"
  placeholder="Enter your phone number"
  value={guestUserData.phone}
  disabled={!!user}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, ""); // sirf number
    if (value.length <= 10) {
      setGuestUserData({
        ...guestUserData,
        phone: value,
      });
    }
  }}
  maxLength={10}
  className="mt-2 disabled:text-black disabled:bg-white disabled:opacity-100"
/>

                  </div>
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
                      Your payment is encrypted and secure. We never store your card details.
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
                    src={subscriptionBooking
                      ? "https://placehold.co/100x100?text=SUB"
                      : (therapist.avatar || "https://placehold.co/100x100?text=DOC")}
                    alt={subscriptionBooking ? plan.name : therapist.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium">{subscriptionBooking ? plan.name : therapist.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {subscriptionBooking ? `Subscription Plan - ${plan.duration}` : therapist.title}
                    </p>
                    {subscriptionBooking && (
                      <p className="text-sm text-muted-foreground">
                        Sessions: {plan.sessions || 'Unlimited'}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />
                {/* Plan or Service Info depending on flow */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{subscriptionBooking ? plan.name : (bookingData?.service?.name || plan.name)}</p>
                    <p className="text-sm text-muted-foreground">
                      {subscriptionBooking ? plan.duration : (bookingData?.service?.duration || plan.duration)}
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
                      {subscriptionBooking ? "Subscription Payment" : "Service Booking Payment"}
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
                      : "We noticed you don't have a recent intake on file. After payment you'll be prompted to complete the intake to unlock sessions."
                    }
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
                      (!guestUserData.name || !guestUserData.email))
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
                      {subscriptionBooking ? `Pay ₹${finalPrice} for Subscription` : `Pay ₹${finalPrice} for Booking`}
                    </>
                  )}
                </Button>

                {isGuestUser &&
                  (!guestUserData.name || !guestUserData.email) && (
                    <p className="text-xs text-center text-destructive">
                      Please fill in your name and email to continue
                    </p>
                  )}
                <p className="text-xs text-center text-muted-foreground">
                  By completing this purchase, you agree to our Terms of
                  Service.
                </p>
              </CardContent>
            </Card>

            {/* Cancellation Policy */}
            <Card variant="outline">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">{subscriptionBooking ? "Subscription Terms" : "Booking Terms"}</h4>
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
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
