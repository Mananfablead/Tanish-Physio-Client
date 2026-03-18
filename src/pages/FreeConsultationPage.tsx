import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEO/SEOHead";
import { getSEOConfig } from "@/components/SEO/seoConfig";
import axios from "axios";
import {
  CheckCircle,
  Calendar,
  Clock,
  Video,
  User,
  CalendarCheck,
  Sparkles,
  Star,
  ArrowRight,
  Heart,
  Shield,
  Zap,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  createBookingAsync,
  createGuestBookingAsync,
} from "@/store/slices/bookingsSlice";
import { useAppDispatch, useAppSelector, RootState } from "@/store";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { fetchPublicAdmins } from "@/store/slices/adminSlice";
import { getAvailability, checkSubscriptionEligibility } from "@/lib/api";
import { register } from "@/store/slices/authSlice";
import api from "@/lib/api";

export default function FreeConsultationPage() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const dispatch = useAppDispatch();

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<any>(null); // Store the full slot object
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [guestUserData, setGuestUserData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Subscription state
  const [subscriptionEligible, setSubscriptionEligible] =
    useState<boolean>(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [checkingSubscription, setCheckingSubscription] =
    useState<boolean>(false);

  // Free consultation eligibility state
  const [freeConsultationEligible, setFreeConsultationEligible] =
    useState<boolean>(true);
  const [freeConsultationInfo, setFreeConsultationInfo] = useState<any>(null);

  // Check if user is a guest (not logged in)
  const isGuestUser =
    !sessionStorage.getItem("qw_user") && !localStorage.getItem("token");

  // Fetch public admins for therapist selection
  const {
    admins: publicAdmins,
    loading: adminsLoading,
    error: adminsError,
  } = useSelector((state: RootState) => state.admins);

  useEffect(() => {
    dispatch(fetchPublicAdmins());
  }, [dispatch]);

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
          const {
            eligible,
            message,
            remainingSessions,
            planName,
            totalSessions,
            usedSessions,
          } = data;

          // Ensure we have proper values, fallback to 0 if null/undefined
          const safeRemainingSessions =
            remainingSessions != null && !isNaN(remainingSessions)
              ? remainingSessions
              : 0;
          const safeTotalSessions =
            totalSessions != null && !isNaN(totalSessions) ? totalSessions : 0;
          const safeUsedSessions =
            usedSessions != null && !isNaN(usedSessions) ? usedSessions : 0;
          const safePlanName = planName || "your plan";

          setSubscriptionEligible(eligible);
          setSubscriptionInfo({
            eligible,
            message,
            remainingSessions: safeRemainingSessions,
            planName: safePlanName,
            totalSessions: safeTotalSessions,
            usedSessions: safeUsedSessions,
          });
        } catch (error) {
          console.error("Error checking subscription status:", error);
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

  // Check free consultation eligibility when user changes
  useEffect(() => {
    const checkFreeConsultationStatus = async () => {
      if (user) {
        try {
          const response = await api.get(
            "/subscriptions/free-consultation-eligibility",
          );
          const data = response.data.data;

          setFreeConsultationEligible(data.eligible);
          setFreeConsultationInfo({
            eligible: data.eligible,
            maxFreeConsultations: data.maxFreeConsultations,
            freeConsultationsUsed: data.freeConsultationsUsed,
            remainingFreeConsultations: data.remainingFreeConsultations,
            message: data.message,
          });
        } catch (error: any) {
          console.error("Error checking free consultation eligibility:", error);

          // If token is required but not present, treat as guest
          if (
            error.response?.status === 400 &&
            error.response?.data?.message === "Access token required"
          ) {
            setFreeConsultationEligible(true);
            setFreeConsultationInfo({
              eligible: true,
              maxFreeConsultations: 1,
              freeConsultationsUsed: 0,
              remainingFreeConsultations: 1,
              message: "You have 1 free consultation remaining.",
            });
          } else {
            // For other errors, assume eligible
            setFreeConsultationEligible(true);
            setFreeConsultationInfo(null);
          }
        }
      } else {
        // Guest users are always eligible for 1 free consultation
        setFreeConsultationEligible(true);
        setFreeConsultationInfo({
          eligible: true,
          maxFreeConsultations: 1,
          freeConsultationsUsed: 0,
          remainingFreeConsultations: 1,
          message: "You have 1 free consultation remaining.",
        });
      }
    };

    checkFreeConsultationStatus();
  }, [user]);

  // Get available slots for free consultation
  const fetchAvailableSlots = async (date: string) => {
    if (!date) return;

    setLoadingSlots(true);
    try {
      const response = await getAvailability();
      const allAvailability = response.data.data.availability;

      // Filter for free consultation slots only (available slots with bookingType 'free-consultation' from admin therapists)
      const freeConsultationSlots = allAvailability
        .filter((avail: any) => avail.therapistId.role === "admin")
        .flatMap((avail: any) =>
          avail.timeSlots
            .filter(
              (slot: any) =>
                slot.status === "available" &&
                slot.bookingType === "free-consultation",
            )
            .map((slot: any) => ({
              ...slot,
              date: avail.date,
              therapistId: avail.therapistId._id,
              therapistName: avail.therapistId.name,
              // Use originalStart/originalEnd if available (admin's actual time), otherwise use start/end
              displayStart: slot.originalStart || slot.start,
              displayEnd: slot.originalEnd || slot.end,
            })),
        )
        .filter((slot: any) => slot.date === date);

      setAvailableSlots(freeConsultationSlots);
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast.error("Failed to load available slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  const handleTimeSelect = (slot: any) => {
    // Use the original admin time (not converted client time)
    setSelectedTime(`${slot.displayStart}-${slot.displayEnd}`);
    // Store the actual slot data for booking
    setSelectedSlot(slot);
  };

  const handleSubmit = async () => {
    if (
      !selectedDate ||
      !selectedTime ||
      !guestUserData.name ||
      !guestUserData.email
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);

    try {
      const bookingData = {
        serviceId: null, // Will be determined by backend for free consultation
        serviceName: "Free Consultation",
        therapistId: publicAdmins?.[0]?.id || "",
        therapistName: publicAdmins?.[0]?.name || "Admin",
        userId: user?.id || null,
        clientName: guestUserData.name,
        date: selectedDate,
        time: selectedTime,
        status: "pending",
        notes: "Free 15-minute consultation booking",
        paymentStatus: "paid", // Free consultation is automatically paid
        amount: 0,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        timeSlot: selectedSlot
          ? {
              start: selectedSlot.displayStart || selectedSlot.start,
              end: selectedSlot.displayEnd || selectedSlot.end,
            }
          : {
              start: selectedTime.split("-")[0],
              end: selectedTime.split("-")[1],
            },
        bookingType: "free-consultation", // Add this field
      };

      if (isGuestUser) {
        // Handle guest booking
        const result = await dispatch(
          createGuestBookingAsync({
            ...bookingData,
            clientEmail: guestUserData.email,
            clientPhone: guestUserData.phone,
          }),
        ).unwrap();

        toast.success(
          "Free consultation booked successfully! You are now logged in.",
        );
        navigate("/booking-confirmation", {
          state: {
            booking: result,
            isGuest: false, // User is now logged in
          },
        });
      } else {
        // Handle authenticated user booking
        const result = await dispatch(createBookingAsync(bookingData)).unwrap();

        toast.success("Free consultation booked successfully!");
        navigate("/booking-confirmation", {
          state: {
            booking: result,
          },
        });
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error || "Failed to book consultation");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <SEOHead {...getSEOConfig("/free-consultation")} />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-100/20 via-transparent to-transparent"></div>

        <div className="container relative z-10 text-center space-y-4 px-4 max-w-6xl mx-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge
              variant="secondary"
              className="mb-3 px-4 py-1.5 text-xs font-semibold bg-[hsl(174_62%_45%)] text-white border-0 shadow-md"
            >
              Free Consultation
            </Badge>

            <h2 className="text-2xl lg:text-3xl font-bold mb-4 bg-gradient-to-r from-[hsl(174_62%_45%)] to-teal-600 bg-clip-text text-transparent">
              Book a Free Consultation
            </h2>

            {/* <p className="text-gray-600 text-base">
              Book a complimentary video consultation with our expert physiotherapists
            </p> */}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 -mt-8">
        <div className=" mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Single Card Layout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-5xl mx-auto"
            >
              <Card variant="elevated" className="overflow-hidden ">
                <CardContent className="pt-8 px-8 pb-8">
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column - Booking Form */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-gradient-to-br from-[hsl(174_62%_45%)] to-teal-600 p-2 rounded-lg">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Your Information
                        </h3>
                      </div>

                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="name"
                            className="font-semibold text-gray-700 flex items-center gap-2"
                          >
                            Full Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            value={guestUserData.name}
                            onChange={(e) =>
                              setGuestUserData({
                                ...guestUserData,
                                name: e.target.value,
                              })
                            }
                            placeholder="John Doe"
                            className="h-12 border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 rounded-xl transition-all duration-200 bg-white/50 hover:bg-white"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="font-semibold text-gray-700 flex items-center gap-2"
                          >
                            Email Address{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={guestUserData.email}
                            onChange={(e) =>
                              setGuestUserData({
                                ...guestUserData,
                                email: e.target.value,
                              })
                            }
                            placeholder="john@example.com"
                            className="h-12 border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 rounded-xl transition-all duration-200 bg-white/50 hover:bg-white"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="phone"
                            className="font-semibold text-gray-700 flex items-center gap-2"
                          >
                            Phone Number <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="phone"
                            value={guestUserData.phone}
                            onChange={(e) =>
                              setGuestUserData({
                                ...guestUserData,
                                phone: e.target.value,
                              })
                            }
                            placeholder="+91 98765 43210"
                            className="h-12 border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 rounded-xl transition-all duration-200 bg-white/50 hover:bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label className="font-semibold text-gray-700 flex items-center gap-2">
                              Select Date & Time{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                          </div>
                          <Input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => handleDateChange(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="h-12 border-2 border-gray-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 rounded-xl transition-all duration-200 bg-white/50 hover:bg-white font-medium"
                          />

                          {/* Time Slot Selection */}
                          {selectedDate && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="space-y-3"
                            >
                              {loadingSlots ? (
                                <div className="text-center py-8 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border-2 border-dashed border-teal-200">
                                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent mx-auto mb-3"></div>
                                  <p className="text-sm text-gray-600 font-semibold">
                                    Loading available slots...
                                  </p>
                                </div>
                              ) : availableSlots.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                  {availableSlots.map((slot, index) => (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: index * 0.05 }}
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <Button
                                        variant={
                                          selectedTime ===
                                          `${slot.displayStart}-${slot.displayEnd}`
                                            ? "hero"
                                            : "outline"
                                        }
                                        onClick={() => handleTimeSelect(slot)}
                                        className={`w-full h-12 text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${
                                          selectedTime ===
                                          `${slot.displayStart}-${slot.displayEnd}`
                                            ? "bg-gradient-to-r from-[hsl(174_62%_45%)] to-teal-600 text-white"
                                            : "bg-white hover:bg-gradient-to-r  border-2"
                                        }`}
                                      >
                                        <Clock className="h-4 w-4 mr-1" />
                                        {slot.displayStart} - {slot.displayEnd}
                                      </Button>
                                    </motion.div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border-2 border-dashed border-red-200">
                                  <Calendar className="h-12 w-12 text-red-400 mx-auto mb-3" />
                                  <p className="text-gray-700 font-bold">
                                    No slots available for this date
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1 font-medium">
                                    Please select another date
                                  </p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Information */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-gradient-to-br from-[hsl(174_62%_45%)] to-teal-600 p-2 rounded-lg">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                          What to Expect
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {[
                          {
                            icon: <Clock className="h-5 w-5" />,
                            gradient: "from-[hsl(174_62%_45%)] to-teal-600",
                            title: "15-Minute Session",
                            desc: "Focused consultation for your condition",
                          },
                          {
                            icon: <Video className="h-5 w-5" />,
                            gradient: "from-teal-500 to-cyan-600",
                            title: "Secure Video Call",
                            desc: "HD consultation from home",
                          },

                          {
                            icon: <Zap className="h-5 w-5" />,
                            gradient: "from-yellow-500 to-orange-600",
                            title: "100% Free",
                            desc: "No charges or commitments",
                          },
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            whileHover={{ x: 5, scale: 1.02 }}
                            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-md transition-all duration-300 group whitespace-nowrap overflow-hidden"
                          >
                            <div className="flex-1 overflow-hidden ">
                              <h4 className="font-semibold text-gray-900 text-sm mb-2  transition-colors truncate">
                                {item.title}
                              </h4>
                              <p className="text-xs text-gray-600 leading-tight group-hover:text-gray-700 transition-colors truncate">
                                {item.desc}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Next Steps */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="bg-white ps-2 rounded-2xl "
                      >
                        <div className="flex items-start">
                          <div>
                            <h4 className="font-bold  text-base mb-1">
                              Next Steps
                            </h4>
                            <p className="text-xs  leading-relaxed font-medium">
                              After booking, our admin will confirm within 24
                              hours. You'll receive a confirmation email with
                              the video link.
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Submit Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={handleSubmit}
                          disabled={
                            isProcessing ||
                            !selectedDate ||
                            !selectedTime ||
                            !guestUserData.name ||
                            !guestUserData.email
                          }
                          className="w-full h-14 text-base font-bold rounded-xl shadow-xl hover:shadow-2xl bg-gradient-to-r from-[hsl(174_62%_45%)] via-teal-600 to-teal-700 hover:from-teal-700 hover:via-teal-700 hover:to-teal-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          size="lg"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              <span>Booking...</span>
                            </>
                          ) : (
                            <>
                              <CalendarCheck className="h-5 w-5 mr-2" />
                              <span>Confirm Free Consultation</span>
                              <ArrowRight className="h-5 w-5 ml-2" />
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-center text-gray-500 mt-5 font-medium">
                          <Shield className="w-4 h-4 inline mr-1 mb-1" />
                          No payment required • Free consultation
                        </p>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}