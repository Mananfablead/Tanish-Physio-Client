import { Link, useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Calendar,
  Video,
  ArrowRight,
  Mail,
  User,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateGuestBookingStatus, getBookingDetails } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { fetchPublicAdmins } from "@/store/slices/adminSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { register } from "@/store/slices/authSlice";

export default function BookingConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { admins: publicAdmins, } = useSelector((state: RootState) => state.admins);
  const primaryDoctor = publicAdmins?.[0];
  console.log("isAuthenticated", isAuthenticated)
  const bookingData = location.state;
  console.log("booking data", bookingData)
  const dispatch = useDispatch<AppDispatch>();
  const guestUser = bookingData?.guestUser;
  const user = useSelector((state: RootState) => state.auth.user);

  const [isQuestionnaireFilled, setIsQuestionnaireFilled] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    dispatch(fetchPublicAdmins());
  }, [dispatch]);
  /* ---------------- Questionnaire Check ---------------- */
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("qw_questionnaire");
      if (stored) { 
        const parsed = JSON.parse(stored);
        const now = Date.now();
        const RECENT_DAYS = 90;
        if (parsed.updatedAt && now - parsed.updatedAt < RECENT_DAYS * 86400000) {
          setIsQuestionnaireFilled(true);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* ---------------- Fetch Booking Details ---------------- */
  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingData?.bookingId) return;
      
      try {
        setLoadingDetails(true);
        let clientEmail = null;
        
        // Determine email based on user type
        if (guestUser?.email) {
          clientEmail = guestUser.email;
        } else if (user?.email) {
          clientEmail = user.email;
        }
        
        if (!clientEmail) {
          console.warn("No email found for booking details request");
          return;
        }
        
        const response = await getBookingDetails(bookingData.bookingId, clientEmail);
        if (response.data?.success) {
          setBookingDetails(response.data.data.booking);
        }
      } catch (error) {
        console.error("Failed to fetch booking details:", error);
        // Don't show error toast as this is supplementary information
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchBookingDetails();
  }, [bookingData?.bookingId, guestUser?.email, user?.email]);

  /* ---------------- Extract Booking Data ---------------- */
  // Use bookingDetails if available, fallback to bookingData
  const serviceName =
    bookingDetails?.serviceName ||
    bookingData?.service?.name || 
    bookingData?.plan?.name || 
    "Physiotherapy";

  const serviceDuration =
    bookingDetails?.serviceId?.duration ||
    bookingData?.session?.duration ||
    bookingData?.service?.duration ||
    bookingData?.plan?.duration;

  const servicePrice =
    bookingDetails?.amount ||
    bookingData?.finalPrice ||
    bookingData?.service?.price ||
    bookingData?.plan?.price;

  const sessionDate = bookingDetails?.date 
    ? new Date(bookingDetails.date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : bookingData?.scheduleDate
    ? new Date(bookingData.scheduleDate).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  const sessionTime = bookingDetails?.time || bookingData?.scheduleTime || "Scheduled";

  const therapist = {
    name: bookingDetails?.therapistName || 
          primaryDoctor?.name || 
          "Physiotherapy Specialist",
    title: bookingDetails?.therapistId?.doctorProfile?.specialization ||
           primaryDoctor?.doctorProfile?.specialization ||
           bookingData?.session?.type ||
           "Senior Physiotherapist",
    avatar: bookingDetails?.therapistId?.profilePicture ||
            primaryDoctor?.profilePicture ||
            "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face",
    experience: bookingDetails?.therapistId?.doctorProfile?.experience
      ? `${bookingDetails.therapistId.doctorProfile.experience}+ Years`
      : primaryDoctor?.doctorProfile?.experience
      ? `${primaryDoctor.doctorProfile.experience}+ Years`
      : "Experienced",
    qualification: bookingDetails?.therapistId?.doctorProfile?.education ||
                   primaryDoctor?.doctorProfile?.education || 
                   "MPT (Physiotherapy)",
    languages: (() => {
      try {
        const langs = bookingDetails?.therapistId?.doctorProfile?.languages?.[0] ||
                      primaryDoctor?.doctorProfile?.languages?.[0];
        return langs ? JSON.parse(langs).join(", ") : "";
      } catch {
        return "";
      }
    })(),
  };

  const isSubscription = bookingData?.fromSubscription === true;
  const isServiceBooking = !isSubscription;

  /* ---------------- Confirm Guest Booking ---------------- */
  useEffect(() => {
    const confirmBooking = async () => {
      try {
        if (
          bookingData?.bookingId &&
          guestUser?.email &&
          bookingData?.fromServices
        ) {
          await updateGuestBookingStatus(
            bookingData.bookingId,
            "confirmed",
            guestUser.email
          );
          toast.success("Booking confirmed successfully!");
        }
      } catch (error) {
        console.error("Booking confirmation failed:", error);
      }
    };

    confirmBooking();
  }, [bookingData, guestUser]);

  /* ---------------- Handle Guest to Auth Transition ---------------- */
  useEffect(() => {
    // If user was a guest but is now authenticated, clear guest user data from state
    if (isAuthenticated && guestUser) {
      // Remove guest user from session storage if user is now logged in
      sessionStorage.removeItem("qw_guest_user");
    }
    
    // If user is a guest and hasn't registered yet, register them automatically
    if (!isAuthenticated && guestUser && guestUser.email) {
      const registerGuestUser = async () => {
        try {
          // Attempt to register the guest user with a default password
          await dispatch(register({
            name: guestUser.name || "Guest User",
            email: guestUser.email,
            password: "1234",
            phone: guestUser.phone
          }));
          
          toast.success("Account created successfully!");
        } catch (error: any) {
          console.error("Auto-registration failed:", error);
          // Continue anyway since this is just for convenience
          toast.info("Please log in to access your account.");
        }
      };
      
      // Delay the registration slightly to allow other UI updates to complete
      const timer = setTimeout(() => {
        registerGuestUser();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, guestUser, dispatch]);

  /* ---------------- Action Buttons ---------------- */
  const renderActionButtons = () => {
    // Show login option for guests who just completed payment
    if (!isAuthenticated && guestUser) {
      return (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={() => {
              // Store booking info in session storage before login
              if (bookingData) {
                sessionStorage.setItem("qw_pending_booking", JSON.stringify(bookingData));
              }
              navigate("/login");
            }}
          >
            <User className="h-5 w-5 mr-2" />
            Login to Your Account
          </Button>

          <Link to="/">
            <Button variant="outline" size="lg" className="w-full">
              Explore More Services
            </Button>
          </Link>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={() => navigate("/login")}
          >
            <User className="h-5 w-5 mr-2" />
            Login to Your Account
          </Button>

          <Link to="/">
            <Button variant="outline" size="lg" className="w-full">
              Explore More Services
            </Button>
          </Link>
        </div>
      );
    }

    if (isQuestionnaireFilled) {
      return (
        <div className="flex justify-center">
          <Link to="/profile">
            <Button variant="hero" size="lg">
              <User className="h-5 w-5 mr-2" />
              Go to Profile
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="flex justify-center">
        <Link
          to="/questionnaire"
          state={{
            serviceToBook: {
              name: serviceName,
              price: servicePrice,
              duration: serviceDuration,
              bookingId: bookingData?.bookingId,
              serviceId: bookingData?.service?.id,
            },
            guestUser: guestUser,
          }}
        >
          <Button variant="hero" size="lg">
            <FileText className="h-5 w-5 mr-2" />
            Complete Questionnaire
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </Link>
      </div>
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center py-12">
        <div className="container max-w-6xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="text-center">
              <CardContent className="p-8 md:p-12">
                <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-success" />
                </div>

                <h1 className="text-3xl font-bold mb-2">
                  Booking Confirmed!
                </h1>

                <p className="text-muted-foreground mb-8">
                  Your <strong>{serviceName}</strong> session has been booked
                  successfully.
                </p>

                {loadingDetails && (
                  <div className="text-center mb-4">
                    <p className="text-muted-foreground">Loading booking details...</p>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
  
  {/* ================= LEFT : SESSION DETAILS ================= */}
  {isServiceBooking && (
    <div className="bg-muted/50 rounded-xl p-6 text-left space-y-4">
      <h3 className="font-semibold text-center mb-4">
        Session Details
      </h3>

      <div className="flex items-center gap-3">
        <img
          src={therapist.avatar}
          alt={therapist.name}
          className="w-12 h-12 rounded-lg"
        />
        <div>
          <p className="font-medium">{therapist.name}</p>
          <p className="text-sm text-muted-foreground">
            {therapist.title}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{sessionDate}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Time</p>
            <p className="font-medium">{sessionTime}</p>
          </div>
        </div>
      </div>

      <div className="pt-4 space-y-2">
        <p>
          <span className="text-muted-foreground">Duration:</span>{" "}
          <span className="font-medium">{serviceDuration || "60 mins"}</span>
        </p>

        <p>
          <span className="text-muted-foreground">Price:</span>{" "}
          <span className="font-medium">₹{servicePrice}</span>
        </p>

        <p className="text-xs text-muted-foreground">
          Booking ID: {bookingData?.bookingId}
        </p>
        
        {bookingDetails?.status && (
          <p className="text-xs">
            Status: <span className="font-medium capitalize">{bookingDetails.status}</span>
          </p>
        )}
        
        {bookingDetails?.paymentStatus && (
          <p className="text-xs">
            Payment: <span className="font-medium capitalize">{bookingDetails.paymentStatus}</span>
          </p>
        )}
      </div>
    </div>
  )}

  {isSubscription && (
    <div className="bg-muted/50 rounded-xl p-6 text-left space-y-4">
      <h3 className="font-semibold text-center mb-4">
        Session Details
      </h3>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">Plan Name</p>
          <p className="font-medium">{serviceName}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Plan Duration</p>
          <p className="font-medium capitalize">
            {bookingData?.service?.duration}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Amount Paid</p>
          <p className="font-medium">₹{servicePrice}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Session Booking
          </p>
          <p className="font-medium">
            {bookingData?.scheduleOption === 'later' 
              ? 'Sessions can be booked later from your profile'
              : 'Sessions can be booked from your profile'}
          </p>
        </div>
        
        {bookingDetails?.status && (
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium capitalize">{bookingDetails.status}</p>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground pt-3">
        You can book multiple sessions during the active subscription period.
      </p>
    </div>
  )}

  {/* ================= RIGHT : USER INFO ================= */}
  {!isAuthenticated && guestUser && (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-left">
      <h3 className="font-semibold text-lg mb-3 text-blue-800 flex items-center gap-2">
        <Mail className="h-5 w-5 text-blue-600" />
        Account Information
      </h3>

      <p className="text-blue-700 mb-3">
        Your account has been <strong>successfully created</strong>.
      </p>

      <p className="text-blue-700 text-sm">
        Login Email: <strong>{guestUser.email}</strong>
      </p>

      <p className="text-sm text-blue-700 mt-2">
        A temporary password has been sent to your email address.
      </p>
    </div>
  )}

  {isAuthenticated && (
    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-left">
      <h3 className="font-semibold text-lg mb-3 text-green-800">
        Session Booking Information
      </h3>

      <ul className="list-disc pl-5 space-y-2 text-green-800 text-sm">
        <li>View upcoming sessions in your profile</li>
        <li>Book new sessions from the Book Session section</li>
        <li>Select service, date & time slot</li>
        <li>Confirm to complete booking</li>
      </ul>

      <p className="text-xs text-green-700 mt-4">
        You can join sessions 5 minutes before the scheduled time.
      </p>
    </div>
  )}

</div>


                {renderActionButtons()}

                <p className="text-sm text-muted-foreground mt-6">
                  You can manage or join your session from your profile.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
