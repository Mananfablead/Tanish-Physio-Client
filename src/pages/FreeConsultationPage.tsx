import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { createBookingAsync, updateBookingAsync, updateGuestBookingAsync, createPaymentOrderAsync, verifyPaymentAsync, createGuestBookingAsync, createGuestPaymentOrderAsync, verifyGuestPaymentAsync, createSubscriptionPaymentOrderAsync, checkSlotAvailabilityAsync, checkUserExistsAsync } from '@/store/slices/bookingsSlice';
import { verifySubscriptionPaymentTransaction } from '@/store/slices/paymentSlice';
import { createGuestSubscriptionPaymentOrderAsync, verifyGuestSubscriptionPaymentAsync } from '@/store/slices/bookingsSlice';
import { useAppDispatch, useAppSelector, RootState } from '@/store';
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { ScheduleModal } from "@/components/profile/ScheduleModal";
import { fetchPublicAdmins } from '@/store/slices/adminSlice';
import { getAvailability } from '@/lib/api';
import { fetchOffers, validateCoupon, resetCouponValidation } from '@/store/slices/offersSlice';
import { register, setCredentials } from '@/store/slices/authSlice';
import BookingLoginModal from '@/components/BookingLoginModal';

export default function FreeConsultationPage() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const dispatch = useAppDispatch();

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [guestUserData, setGuestUserData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Check if user is a guest (not logged in)
  const isGuestUser = !sessionStorage.getItem("qw_user") && !localStorage.getItem("token");

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

  // Get available slots for free consultation
  const fetchAvailableSlots = async (date: string) => {
    if (!date) return;

    setLoadingSlots(true);
    try {
      const response = await getAvailability();
      const allAvailability = response.data.data.availability;

      // Filter for free consultation slots (assuming they have a special marker or we look for admin availability)
      const freeConsultationSlots = allAvailability
        .filter((avail: any) => avail.therapistId.role === 'admin')
        .flatMap((avail: any) =>
          avail.timeSlots
            .filter((slot: any) => slot.status === 'available')
            .map((slot: any) => ({
              ...slot,
              date: avail.date,
              therapistId: avail.therapistId._id,
              therapistName: avail.therapistId.name,
            }))
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
    setSelectedTime(`${slot.start}-${slot.end}`);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !guestUserData.name || !guestUserData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);

    try {
      const bookingData = {
        serviceId: "free-consultation", // Special ID for free consultation
        serviceName: "Free Consultation",
        therapistId: publicAdmins?.[0]?._id || "",
        therapistName: publicAdmins?.[0]?.name || "Admin",
        userId: user?._id || null,
        clientName: guestUserData.name,
        date: selectedDate,
        time: selectedTime,
        status: "pending",
        notes: "Free 15-minute consultation booking",
        paymentStatus: "verified", // Free consultation
        amount: 0,
        timeSlot: {
          start: selectedTime.split('-')[0],
          end: selectedTime.split('-')[1],
        },
        bookingType: "free-consultation", // Add this field
      };

      if (isGuestUser) {
        // Handle guest booking
        const result = await dispatch(createGuestBookingAsync({
          ...bookingData,
          clientEmail: guestUserData.email,
          clientPhone: guestUserData.phone,
        })).unwrap();

        toast.success("Free consultation booked successfully!");
        navigate("/booking-confirmation", {
          state: {
            booking: result.booking,
            isGuest: true,
          },
        });
      } else {
        // Handle authenticated user booking
        const result = await dispatch(createBookingAsync(bookingData)).unwrap();

        toast.success("Free consultation booked successfully!");
        navigate("/booking-confirmation", {
          state: {
            booking: result.booking,
          },
        });
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to book consultation");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Free Consultation Booking
              </h1>
              <p className="text-lg text-gray-600">
                Book a free 15-minute video consultation with our expert physiotherapist
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Booking Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Book Your Free Consultation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* User Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Your Information</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={guestUserData.name}
                          onChange={(e) =>
                            setGuestUserData({ ...guestUserData, name: e.target.value })
                          }
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={guestUserData.email}
                          onChange={(e) =>
                            setGuestUserData({ ...guestUserData, email: e.target.value })
                          }
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={guestUserData.phone}
                          onChange={(e) =>
                            setGuestUserData({ ...guestUserData, phone: e.target.value })
                          }
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Date Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Select Date</h3>
                    <div>
                      <Label htmlFor="date">Preferred Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  {/* Time Slot Selection */}
                  {selectedDate && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Available Time Slots</h3>
                      {loadingSlots ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-600">Loading available slots...</p>
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {availableSlots.map((slot, index) => (
                            <Button
                              key={index}
                              variant={selectedTime === `${slot.start}-${slot.end}` ? "default" : "outline"}
                              onClick={() => handleTimeSelect(slot)}
                              className="text-sm"
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              {slot.start} - {slot.end}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-4 text-gray-600">
                          No available slots for this date. Please select a different date.
                        </p>
                      )}
                    </div>
                  )}

                  <Separator />

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={isProcessing || !selectedDate || !selectedTime || !guestUserData.name || !guestUserData.email}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Booking...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-5 w-5 mr-2" />
                        Book Free Consultation
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>What to Expect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">15-Minute Session</h4>
                      <p className="text-sm text-gray-600">
                        A focused consultation to understand your needs and provide initial guidance.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Video Call</h4>
                      <p className="text-sm text-gray-600">
                        Secure video consultation from the comfort of your home.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Expert Physiotherapist</h4>
                      <p className="text-sm text-gray-600">
                        Connect with our certified physiotherapy experts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Completely Free</h4>
                      <p className="text-sm text-gray-600">
                        No charges, no commitments. Just quality care.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">After Booking</h4>
                    <p className="text-sm text-blue-800">
                      Once booked, our admin will review and confirm your consultation.
                      You'll receive a confirmation email with the meeting link and instructions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}