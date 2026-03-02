import { Link, useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/SEO/SEOHead";
import { getSEOConfig } from "@/components/SEO/seoConfig";
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
  Package,
  Activity,
  Printer,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import {
  updateGuestBookingStatus,
  getBookingDetails,
  updateProfile,
  getUserSubscriptions,
  checkUserExists,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { fetchPublicAdmins } from "@/store/slices/adminSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  register,
  login,
  fetchProfile,
  setCredentials,
} from "@/store/slices/authSlice";
import { checkUserExistsAsync } from "@/store/slices/bookingsSlice";
import {
  fetchActiveQuestionnaire,
  selectActiveQuestionnaire,
} from "@/store/slices/questionnaireSlice";
import InvoiceComponent from "@/components/InvoiceComponent";

export default function BookingConfirmationPage() {
  // Transform questionnaire data to health profile format
  const transformQuestionnaireToHealthProfile = (
    questionnaireData: any,
    questions: any[] = []
  ) => {
    const healthProfile: any = {};

    // Initialize questionnaire metadata
    const questionnaireMetadata = {
      questionnaireId: null,
      completedAt: new Date(),
      responses: [] as any[],
    };

    // Initialize questionnaire responses map
    const questionnaireResponses = new Map<string, string>();

    // Map questionnaire responses to healthProfile fields
    Object.entries(questionnaireData || {}).forEach(([questionId, answer]) => {
      if (!answer) return;

      // Handle common field structure
      let answerValue: any = answer;
      let mainAnswer: any = answer;
      let commonField: string = "";

      if (
        typeof answer === "object" &&
        answer !== null &&
        (answer as any).commonField !== undefined
      ) {
        mainAnswer = (answer as any).mainAnswer;
        commonField = (answer as any).commonField || "";
        // For storage, we want to preserve both values separately
        answerValue = mainAnswer;
      }

      // Convert file objects/URLs to displayable format for storage
      if (typeof answerValue === "object" && answerValue !== null) {
        // If it's an uploaded file with URL, use the URL
        if ((answerValue as any).url) {
          answerValue = (answerValue as any).url;
        } else if ((answerValue as any).name) {
          // If it's just a filename, use the filename
          answerValue = (answerValue as any).name;
        } else {
          // For arrays and other objects, convert to string representation
          answerValue = Array.isArray(answerValue)
            ? JSON.stringify(answerValue)
            : JSON.stringify(answerValue);
        }
      }

      // Store in questionnaire responses map - preserve both values for proper display
      let responseValue = String(answerValue || "");

      // Store the structured data for better retrieval
      if (
        typeof answer === "object" &&
        answer !== null &&
        (answer as any).commonField !== undefined
      ) {
        // Store as JSON string to preserve structure
        responseValue = JSON.stringify({
          mainAnswer: mainAnswer,
          commonField: commonField,
        });
      } else {
        // Simple value
        responseValue = String(answerValue || "");
      }

      questionnaireResponses.set(questionId, responseValue);

      // Find the actual question text from the questions array
      const questionObj = questions.find((q) => q._id === questionId);
      const actualQuestionText = questionObj
        ? questionObj.question
        : questionId;
      const questionType = questionObj ? questionObj.type : "unknown";

      // Store detailed response metadata
      questionnaireMetadata.responses.push({
        questionId: questionId,
        questionText: actualQuestionText,
        answer: responseValue,
        questionType: questionType,
        timestamp: new Date(),
      });

      // Map based on question content or type (for backward compatibility)
      // For now, just store all answers in the responses map
    });

    // Add questionnaire data to healthProfile (convert Map to plain object)
    const responsesObject: { [key: string]: string } = {};
    questionnaireResponses.forEach((value, key) => {
      responsesObject[key] = value;
    });

    healthProfile.questionnaireResponses = responsesObject;
    healthProfile.questionnaireMetadata = questionnaireMetadata;

    return healthProfile;
  };
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { admins: publicAdmins } = useSelector(
    (state: RootState) => state.admins
  );
  const primaryDoctor = publicAdmins?.[0];
  const activeQuestionnaire = useSelector(selectActiveQuestionnaire);
  console.log("isAuthenticated", isAuthenticated);
  const bookingData = location.state;
  console.log("booking data", bookingData);
  const dispatch = useDispatch<AppDispatch>();
  const guestUser = bookingData?.guestUser;
  const user = useSelector((state: RootState) => state.auth.user);

  // Refs for invoice printing and downloading
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Auto-login for guest users who just purchased a subscription
  useEffect(() => {
    const autoLoginGuestUser = async () => {
      if (
        !isAuthenticated &&
        guestUser?.email &&
        bookingData?.fromSubscription
      ) {
        try {
          // Check if user exists and get token for auto-login
          const userCheckResult = await dispatch(
            checkUserExistsAsync(guestUser.email)
          );

          if (checkUserExistsAsync.fulfilled.match(userCheckResult)) {
            const userData = userCheckResult.payload;
            if (userData.exists && userData.token) {
              // Set the token for auto-login
              localStorage.setItem("token", userData.token);
              localStorage.setItem("user", JSON.stringify(userData.user));
              localStorage.setItem("isAuthenticated", "true");

              dispatch(
                setCredentials({
                  user: userData.user,
                  token: userData.token,
                })
              );

              toast.success("Successfully logged in!");
              setIsAutoLoginCompleted(true);
            }
          }
        } catch (error) {
          console.error("Auto-login failed:", error);
          // Continue without auto-login
        }
      }
    };

    autoLoginGuestUser();
  }, [isAuthenticated, guestUser, bookingData, dispatch]);

  const [isQuestionnaireFilled, setIsQuestionnaireFilled] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isAutoLoginCompleted, setIsAutoLoginCompleted] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  useEffect(() => {
    dispatch(fetchPublicAdmins());
  }, [dispatch]);

  useEffect(() => {
    // Fetch active questionnaire if not already loaded
    if (!activeQuestionnaire) {
      dispatch(fetchActiveQuestionnaire());
    }
  }, [dispatch, activeQuestionnaire]);
  /* ---------------- Questionnaire Check ---------------- */
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("qw_questionnaire");
      if (stored) {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        const RECENT_DAYS = 90;
        if (
          parsed.updatedAt &&
          now - parsed.updatedAt < RECENT_DAYS * 86400000
        ) {
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

        const response = await getBookingDetails(
          bookingData.bookingId,
          clientEmail
        );
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

  // Special handling for free consultation
  const isFreeConsultation =
    bookingData?.service?.name?.toLowerCase().includes("free") ||
    bookingData?.service?.name?.toLowerCase().includes("consultation") ||
    bookingData?.plan?.name?.toLowerCase().includes("free") ||
    bookingData?.isFreeConsultation === true;

  const serviceDuration =
    bookingDetails?.serviceId?.duration ||
    bookingData?.session?.duration ||
    bookingData?.service?.duration ||
    bookingData?.plan?.duration ||
    (isFreeConsultation ? "30 mins" : "60 mins");

  const servicePrice =
    // bookingDetails?.amount ||
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
    : bookingData?.selectedSlot?.date
    ? new Date(bookingData.selectedSlot.date).toLocaleDateString("en-US", {
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

  const sessionTime =
    bookingDetails?.time ||
    bookingData?.scheduleTime ||
    bookingData?.selectedSlot?.time ||
    bookingData?.timeSlot?.start ||
    "Scheduled";

  const therapist = {
    name:
      bookingDetails?.therapistName ||
      primaryDoctor?.name ||
      "Physiotherapy Specialist",
    title:
      bookingDetails?.therapistId?.doctorProfile?.specialization ||
      primaryDoctor?.doctorProfile?.specialization ||
      bookingData?.session?.type ||
      "Senior Physiotherapist",
    avatar:
      bookingDetails?.therapistId?.profilePicture ||
      primaryDoctor?.profilePicture ||
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face",
    experience: bookingDetails?.therapistId?.doctorProfile?.experience
      ? `${bookingDetails.therapistId.doctorProfile.experience}+ Years`
      : primaryDoctor?.doctorProfile?.experience
      ? `${primaryDoctor.doctorProfile.experience}+ Years`
      : "Experienced",
    qualification:
      bookingDetails?.therapistId?.doctorProfile?.education ||
      primaryDoctor?.doctorProfile?.education ||
      "MPT (Physiotherapy)",
    languages: (() => {
      try {
        const langs =
          bookingDetails?.therapistId?.doctorProfile?.languages?.[0] ||
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
          // Update booking status to reflect payment completion
          await updateGuestBookingStatus(
            bookingData.bookingId,
            "pending",
            guestUser.email
          );
          toast.success("Booking confirmed successfully!");
        }
      } catch (error) {
        console.error("Booking confirmation failed:", error);
      }
    };

    confirmBooking();
  }, [bookingData, guestUser, isAuthenticated, dispatch]);

  /* ---------------- Handle Auto-Login Token ---------------- */
  useEffect(() => {
    // Check for auto-login token on component mount
    const autoLoginToken = localStorage.getItem("qw_auto_login_token");
    const storedUser = localStorage.getItem("user");

    if (autoLoginToken && !isAuthenticated && storedUser) {
      console.log("Auto-login token found on mount:", autoLoginToken);
      try {
        const user = JSON.parse(storedUser);
        // Set credentials immediately
        dispatch(
          setCredentials({
            user: user,
            token: autoLoginToken,
          })
        );
        // Clean up the temporary token
        localStorage.removeItem("qw_auto_login_token");
        // Set authentication flag
        localStorage.setItem("isAuthenticated", "true");
        setIsAutoLoginCompleted(true);
        toast.success("Successfully logged in!");
      } catch (e) {
        console.error("Error processing auto-login:", e);
        localStorage.removeItem("qw_auto_login_token");
      }
    }
  }, [isAuthenticated, dispatch]);

  /* ---------------- Handle Guest to Auth Transition ---------------- */
  useEffect(() => {
    // If user was a guest but is now authenticated, clear guest user data from state
    if (isAuthenticated && guestUser) {
      // Remove guest user from session storage if user is now logged in
      sessionStorage.removeItem("qw_guest_user");
    }

    // Check if we have an auto-login token from payment verification
    const autoLoginToken = localStorage.getItem("qw_auto_login_token");
    const storedUser = localStorage.getItem("user");
    console.log("Auto-login token found:", autoLoginToken);
    console.log("Is authenticated:", isAuthenticated);
    console.log("Stored user:", storedUser);

    if (autoLoginToken && !isAuthenticated && storedUser) {
      console.log("Processing auto-login...");
      // Set the token in the main storage location
      localStorage.setItem("token", autoLoginToken);
      localStorage.removeItem("qw_auto_login_token"); // Clean up

      // Set credentials immediately to ensure Redux state is updated
      try {
        const user = JSON.parse(storedUser);
        dispatch(
          setCredentials({
            user: user,
            token: autoLoginToken,
          })
        );
      } catch (e) {
        console.error("Error parsing stored user:", e);
      }

      // Refresh user data
      dispatch(fetchProfile())
        .unwrap()
        .then(async (userData) => {
          console.log("Profile fetched successfully:", userData);
          // Update Redux store with fresh user data
          dispatch(
            setCredentials({
              user: userData,
              token: autoLoginToken,
            })
          );
          // Update the authentication context
          localStorage.setItem("isAuthenticated", "true");
          setIsAutoLoginCompleted(true);
          toast.success("Account created and logged in successfully!");

          // Automatically navigate to profile page after successful auto-login
          setTimeout(() => {
            navigate("/profile");
          }, 2000); // Small delay to show the success message

          // Get questionnaire data from session storage and update profile
          try {
            const questionnaireData =
              sessionStorage.getItem("qw_questionnaire");
            console.log("Questionnaire data found:", questionnaireData);
            if (questionnaireData) {
              const parsedQuestionnaire = JSON.parse(questionnaireData);

              // Transform questionnaire data to health profile format
              // The stored data structure is { data: payload, updatedAt: timestamp }
              const healthProfileData = transformQuestionnaireToHealthProfile(
                parsedQuestionnaire.data,
                activeQuestionnaire?.questions || []
              );
              console.log("healthProfileData", healthProfileData);
              // Update profile with questionnaire data
              await updateProfile({
                healthProfile: healthProfileData,
              });

              console.log(
                "Profile updated with questionnaire data successfully"
              );
              // Clear the questionnaire data after successful profile update
              sessionStorage.removeItem("qw_questionnaire");
            }
          } catch (questionnaireError) {
            console.error(
              "Error updating profile with questionnaire data:",
              questionnaireError
            );
          }
        })
        .catch(async (error) => {
          console.error("Failed to fetch profile:", error);
          // If profile fetch fails, clear the invalid token and show error
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.removeItem("isAuthenticated");
          toast.error("Failed to log in. Please try logging in manually.");

          // Don't set credentials with null user
          // Continue with the flow without auto-login
        });

      return;
    }

    // If user is a guest and hasn't registered yet, register them automatically
    // Skip for subscription guests since they should already be created by payment verification
    if (
      !isAuthenticated &&
      guestUser &&
      guestUser.email &&
      !bookingData?.fromSubscription
    ) {
      const registerGuestUser = async () => {
        try {
          // Attempt to register the guest user with a default password
          const result = await dispatch(
            register({
              name: guestUser.name || "Guest User",
              email: guestUser.email,
              password: "123456",
              phone: guestUser.phone,
            })
          );

          toast.success("Account created successfully!");

          // After successful registration, try to log in
          const loginResult = await dispatch(
            login({
              email: guestUser.email,
              password: "123456",
            })
          );

          if (login.fulfilled.match(loginResult)) {
            toast.success("Successfully logged in!");

            // Get questionnaire data from session storage and update profile
            try {
              const questionnaireData =
                sessionStorage.getItem("qw_questionnaire");
              console.log("Questionnaire data found:", questionnaireData);
              if (questionnaireData) {
                const parsedQuestionnaire = JSON.parse(questionnaireData);

                // Transform questionnaire data to health profile format
                // The stored data structure is { data: payload, updatedAt: timestamp }
                const healthProfileData = transformQuestionnaireToHealthProfile(
                  parsedQuestionnaire.data,
                  activeQuestionnaire?.questions || []
                );
                console.log("healthProfileData", healthProfileData);
                // Update profile with questionnaire data
                await updateProfile({
                  healthProfile: healthProfileData,
                });

                console.log(
                  "Profile updated with questionnaire data successfully"
                );
                // Clear the questionnaire data after successful profile update
                sessionStorage.removeItem("qw_questionnaire");
              }
            } catch (questionnaireError) {
              console.error(
                "Error updating profile with questionnaire data:",
                questionnaireError
              );
            }

            // Auto-navigate to questionnaire if not already completed
            if (!isQuestionnaireFilled) {
              setTimeout(() => {
                navigate("/questionnaire", {
                  state: {
                    serviceToBook: {
                      name: serviceName,
                      price: servicePrice,
                      duration: serviceDuration,
                      bookingId: bookingData?.bookingId,
                      serviceId: bookingData?.service?.id,
                    },
                    guestUser: guestUser,
                  },
                });
              }, 2000);
            }
          }
        } catch (error: any) {
          console.error("Auto-registration failed:", error);
          // If user already exists, try to log them in
          if (error.message?.includes("User already exists with this email")) {
            try {
              const loginResult = await dispatch(
                login({
                  email: guestUser.email,
                  password: "123456",
                })
              );

              if (login.fulfilled.match(loginResult)) {
                toast.success("Successfully logged in!");

                // Get questionnaire data from session storage and update profile
                try {
                  const questionnaireData =
                    sessionStorage.getItem("qw_questionnaire");
                  console.log("Questionnaire data found:", questionnaireData);
                  if (questionnaireData) {
                    const parsedQuestionnaire = JSON.parse(questionnaireData);

                    // Transform questionnaire data to health profile format
                    // The stored data structure is { data: payload, updatedAt: timestamp }
                    const healthProfileData =
                      transformQuestionnaireToHealthProfile(
                        parsedQuestionnaire.data,
                        activeQuestionnaire?.questions || []
                      );
                    console.log("healthProfileData", healthProfileData);
                    // Update profile with questionnaire data
                    await updateProfile({
                      healthProfile: healthProfileData,
                    });

                    console.log(
                      "Profile updated with questionnaire data successfully"
                    );
                    // Clear the questionnaire data after successful profile update
                    sessionStorage.removeItem("qw_questionnaire");
                  }
                } catch (questionnaireError) {
                  console.error(
                    "Error updating profile with questionnaire data:",
                    questionnaireError
                  );
                }

                // Auto-navigate to questionnaire if not already completed
                if (!isQuestionnaireFilled) {
                  setTimeout(() => {
                    navigate("/questionnaire", {
                      state: {
                        serviceToBook: {
                          name: serviceName,
                          price: servicePrice,
                          duration: serviceDuration,
                          bookingId: bookingData?.bookingId,
                          serviceId: bookingData?.service?.id,
                        },
                        guestUser: guestUser,
                      },
                    });
                  }, 2000);
                }
              }
            } catch (loginError: any) {
              console.error("Auto-login failed:", loginError);
              toast.info("Please log in to access your account.");
            }
          } else {
            // Continue anyway since this is just for convenience
            toast.info("Please log in to access your account.");
          }
        }
      };

      // Delay the registration slightly to allow other UI updates to complete
      const timer = setTimeout(() => {
        registerGuestUser();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [
    isAuthenticated,
    guestUser,
    dispatch,
    isQuestionnaireFilled,
    serviceName,
    servicePrice,
    serviceDuration,
    bookingData,
    navigate,
    transformQuestionnaireToHealthProfile,
  ]);

  /* ---------------- Fetch Subscription Information ---------------- */
  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      if (isAuthenticated && user) {
        try {
          setLoadingSubscription(true);
          const response = await getUserSubscriptions();
          if (response.data?.success && response.data.data?.subscriptions) {
            // Get the most recent active subscription
            const activeSubscriptions = response.data.data.subscriptions.filter(
              (sub: any) => sub.status === "active" && !sub.isExpired
            );

            if (activeSubscriptions.length > 0) {
              // Get the most recently purchased subscription
              const latestSubscription = activeSubscriptions.reduce(
                (latest: any, current: any) => {
                  return new Date(current.createdAt) >
                    new Date(latest.createdAt)
                    ? current
                    : latest;
                }
              );

              setSubscriptionInfo(latestSubscription);
            }
          }
        } catch (error) {
          console.error("Failed to fetch subscription info:", error);
        } finally {
          setLoadingSubscription(false);
        }
      }
    };

    fetchSubscriptionInfo();
  }, [isAuthenticated, user]);

  /* ---------------- Print and Download Functions ---------------- */
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      // Show loading state
      toast.loading("Generating invoice PDF...");

      // Dynamically import the required libraries
      const html2canvasModule = await import("html2canvas");
      const jsPDFModule = await import("jspdf");

      const html2canvas = html2canvasModule.default;
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;

      if (!html2canvas || !jsPDF) {
        throw new Error("Failed to load required libraries");
      }

      // Create a temporary invoice element to render the content
      const tempInvoiceDiv = document.createElement("div");
      tempInvoiceDiv.id = "temp-invoice";
      tempInvoiceDiv.style.position = "absolute";
      tempInvoiceDiv.style.left = "-9999px";
      tempInvoiceDiv.style.top = "-9999px";
      tempInvoiceDiv.style.width = "800px";
      tempInvoiceDiv.style.backgroundColor = "white";
      tempInvoiceDiv.style.padding = "30px";
      tempInvoiceDiv.style.zIndex = "9999";

      // Create the invoice HTML content
      const invoiceHTML = `
        <div class="invoice-container bg-white p-8 m-4">
          <div class="invoice-header border-b pb-4 mb-6">
            <div class="flex justify-between items-start">
              <div class="flex items-center">
                <img 
                  src="https://tanishphysio.fableadtech.com/public/uploads/clinic_logos/1758630536_logo%20(1).png" 
                  alt="Tanish Physio Logo"
                  style="width: 64px; height: 64px; margin-right: 16px;"
                />
               
              </div>
              <div class="text-right">
                <h2 class="text-xl font-semibold">Tanish Physio</h2>
                <p class="text-gray-600">Physical Therapy & Rehabilitation</p>
                <p class="text-gray-600">India</p>
              </div>
            </div>
          </div>
          
          <div class="invoice-details grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 class="text-lg font-semibold mb-2">Bill To:</h3>
              <p class="font-medium">${
                user?.name || guestUser?.name || "Guest User"
              }</p>
              <p class="text-gray-600">${
                user?.email || guestUser?.email || "N/A"
              }</p>
              <p class="text-gray-600">${
                user?.phone || guestUser?.phone || "N/A"
              }</p>
            </div>
            
            <div class="text-right">
              <div class="mb-4">
                <p class="text-gray-600">Invoice Date:</p>
                <p class="font-medium">${new Date().toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}</p>
              </div>
              <div>
                <p class="text-gray-600">Due Date:</p>
                <p class="font-medium">${new Date().toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}</p>
              </div>
            </div>
          </div>
          
          <div class="invoice-items mb-8">
            <div class="border rounded-lg overflow-hidden">
              <table class="w-full">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="text-left p-3 font-semibold">Description</th>
                    <th class="text-left p-3 font-semibold">Date & Time</th>
                    <th class="text-left p-3 font-semibold">Therapist</th>
                    <th class="text-right p-3 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="p-3 border-t">
                      <div class="font-medium">${serviceName}</div>
                      <div class="text-gray-600 text-sm">
                        ${
                          isSubscription
                            ? "Subscription Plan"
                            : "Service Booking"
                        }
                      </div>
                    </td>
                    <td class="p-3 border-t">
                      <div>${sessionDate}</div>
                      <div>${sessionTime}</div>
                    </td>
                    <td class="p-3 border-t">
                      <div>${therapist.name}</div>
                      <div class="text-gray-600 text-sm">${
                        therapist.title
                      }</div>
                    </td>
                    <td class="p-3 border-t text-right">
                      ₹${servicePrice
                        ?.toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="invoice-summary grid grid-cols-2 gap-8">
            <div>
              <h3 class="text-lg font-semibold mb-2">Payment Method</h3>
              <p class="text-gray-600">
                ${
                  bookingDetails?.paymentMethod ||
                  bookingData?.paymentMethod ||
                  "Online Payment"
                }
              </p>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex justify-between mb-2">
                <span class="text-gray-600">Subtotal:</span>
                <span>₹${servicePrice
                  ?.toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
              </div>
              <div class="flex justify-between mb-2">
                <span class="text-gray-600">Tax:</span>
                <span>₹0.00</span>
              </div>
              <div class="flex justify-between mb-2">
                <span class="text-gray-600">Discount:</span>
                <span>
                  ₹${(bookingDetails?.discountAmount || 0)
                    ?.toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
              </div>
              <div class="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>
                  ₹${servicePrice
                    ?.toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
              </div>
            </div>
          </div>
          
          <div class="invoice-footer mt-8 pt-6 border-t">
            <div class="text-center text-gray-600">
              <p>Thank you for choosing Tanish Physio for your healthcare needs.</p>
              <p class="mt-2">For any inquiries, please contact our support team.</p>
            </div>
          </div>
        </div>
      `;

      tempInvoiceDiv.innerHTML = invoiceHTML;
      document.body.appendChild(tempInvoiceDiv);

      // Wait for the content to render
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Capture the invoice as canvas
      const canvas = await html2canvas(tempInvoiceDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      // Remove the temporary element
      document.body.removeChild(tempInvoiceDiv);

      const imgData = canvas.toDataURL("image/jpeg", 0.8); // Use JPEG for better compression

      // Validate canvas dimensions
      if (!canvas.width || !canvas.height) {
        throw new Error("Canvas is empty or has invalid dimensions");
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF directly to the user's device
      const fileName = `invoice-${bookingData?.bookingId || "booking"}.pdf`;
      pdf.save(fileName);

      // Success message
      toast.dismiss(); // Remove loading toast
      toast.success("Invoice downloaded successfully!");
    } catch (error: any) {
      console.error("Error generating PDF:", error);

      // Remove loading toast before showing error
      toast.dismiss();

      // Provide more specific error messages
      if (error.message?.includes("load required libraries")) {
        toast.error(
          "Failed to load required libraries. Please check your internet connection and try again."
        );
      } else if (error.message?.includes("Canvas is empty")) {
        toast.error(
          "Invoice content is empty. Please refresh the page and try again."
        );
      } else if (error.name === "NetworkError") {
        toast.error(
          "Network error occurred. Please check your internet connection and try again."
        );
      } else {
        toast.error("Failed to download invoice. Please try again.");
      }
    }
  };

  /* ---------------- Print Styles ---------------- */
  const printStyles = `
    @media print {
      body * {
        visibility: hidden;
      }
      .invoice-container,
      .invoice-container * {
        visibility: visible;
      }
      .invoice-container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: auto;
      }
    }
  `;

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
                sessionStorage.setItem(
                  "qw_pending_booking",
                  JSON.stringify(bookingData)
                );
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
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handlePrint}
          >
            <Printer className="h-5 w-5 mr-2" />
            Print Invoice
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleDownload}
          >
            <Download className="h-5 w-5 mr-2" />
            Download Invoice
          </Button>

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
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={handlePrint}
        >
          <Printer className="h-5 w-5 mr-2" />
          Print Invoice
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={handleDownload}
        >
          <Download className="h-5 w-5 mr-2" />
          Download Invoice
        </Button>

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
      <SEOHead {...getSEOConfig("/booking-confirmation")} />
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
                  {isFreeConsultation ? "Free Consultation" : "Booking"}{" "}
                  Confirmed!
                </h1>

                <p className="text-muted-foreground mb-8">
                  Your <strong>{serviceName}</strong>{" "}
                  {isFreeConsultation ? "consultation" : "session"} has been
                  booked successfully.
                </p>

                {loadingDetails && (
                  <div className="text-center mb-4">
                    <p className="text-muted-foreground">
                      Loading booking details...
                    </p>
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
                            <p className="text-sm text-muted-foreground">
                              Date
                            </p>
                            <p className="font-medium">{sessionDate}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {isFreeConsultation ? "Slot" : "Time"}
                            </p>
                            <p className="font-medium">{sessionTime}</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 space-y-2">
                        <p>
                          <span className="text-muted-foreground">
                            {isFreeConsultation
                              ? "Consultation Duration:"
                              : "Duration:"}
                          </span>{" "}
                          <span className="font-medium">
                            {serviceDuration}
                            {isFreeConsultation && " (Free Consultation)"}
                          </span>
                        </p>

                        <p>
                          <span className="text-muted-foreground">Price:</span>{" "}
                          <span className="font-medium">₹{servicePrice}</span>
                        </p>

                        {/* <p className="text-xs text-muted-foreground">
                          Booking ID: {bookingData?.bookingId}
                        </p> */}

                        {bookingDetails?.status && (
                          <p className="text-xs">
                            Status:{" "}
                            <span className="font-medium capitalize">
                              {bookingDetails.status}
                            </span>
                          </p>
                        )}

                        {bookingDetails?.paymentStatus && (
                          <p className="text-xs">
                            Payment:{" "}
                            <span className="font-medium capitalize">
                              {bookingDetails.paymentStatus}
                            </span>
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
                          <p className="text-sm text-muted-foreground">
                            Plan Name
                          </p>
                          <p className="font-medium">{serviceName}</p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">
                            Plan Duration
                          </p>
                          <p className="font-medium capitalize">
                            {bookingData?.service?.duration}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">
                            Amount Paid
                          </p>
                          <p className="font-medium">₹{servicePrice}</p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">
                            Session Booking
                          </p>
                          <p className="font-medium">
                            {bookingData?.scheduleOption === "later"
                              ? "Sessions can be booked later from your profile"
                              : "Sessions can be booked from your profile"}
                          </p>
                        </div>

                        {/* Scheduling Information */}
                        {bookingData?.scheduleOption && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Scheduling Option
                            </p>
                            <p className="font-medium capitalize">
                              {bookingData.scheduleOption === "later"
                                ? "Schedule Later"
                                : "Book Now"}
                            </p>
                          </div>
                        )}

                        {bookingData?.scheduleDate &&
                          bookingData?.scheduleTime && (
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Scheduled Session
                              </p>
                              <p className="font-medium">
                                {new Date(
                                  bookingData.scheduleDate
                                ).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}{" "}
                                at {bookingData.scheduleTime}
                              </p>
                            </div>
                          )}

                        {bookingDetails?.status && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Status
                            </p>
                            <p className="font-medium capitalize">
                              {bookingDetails.status}
                            </p>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground pt-3">
                        You can book multiple sessions during the active
                        subscription period.
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
                        Your account has been{" "}
                        <strong>successfully created</strong>.
                      </p>

                      <p className="text-blue-700 text-sm">
                        Login Email: <strong>{guestUser.email}</strong>
                      </p>

                      <p className="text-sm text-blue-700 mt-2">
                        A temporary password has been sent to your email
                        address.
                      </p>
                    </div>
                  )}

                  {isAuthenticated && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-left">
                      <h3 className="font-semibold text-lg mb-3 text-green-800 flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Subscription Information
                      </h3>

                      {loadingSubscription ? (
                        <p className="text-green-700 mb-3">
                          Loading subscription details...
                        </p>
                      ) : subscriptionInfo ? (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-green-700">Plan:</span>
                            <span className="font-medium">
                              {subscriptionInfo.planName}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-700">
                              Sessions Available:
                            </span>
                            <span className="font-medium">
                              {subscriptionInfo.availableSessions?.remaining !==
                              undefined
                                ? `${subscriptionInfo.availableSessions.remaining} of ${subscriptionInfo.availableSessions.total} sessions remaining`
                                : "Unlimited"}
                            </span>
                          </div>
                          {subscriptionInfo.availableSessions
                            ?.percentageUsed !== undefined && (
                            <div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{
                                    width: `${subscriptionInfo.availableSessions.percentageUsed}%`,
                                  }}
                                ></div>
                              </div>
                              <p className="text-xs text-green-700 text-right">
                                {subscriptionInfo.availableSessions.used} used
                              </p>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-green-700">Valid Until:</span>
                            <span className="font-medium">
                              {new Date(
                                subscriptionInfo.endDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-green-700 mb-3">
                          No active subscription found.
                        </p>
                      )}

                      <div className="mt-4 pt-4 border-t border-green-200">
                        <h4 className="font-semibold text-green-800 mb-2">
                          Next Steps:
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-green-800 text-sm">
                          <li>View upcoming sessions in your profile</li>
                          <li>
                            Book new sessions from the Book Session section
                          </li>
                          <li>Select service, date & time slot</li>
                          <li>Confirm to complete booking</li>
                        </ul>
                      </div>
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

      {/* Hidden Invoice Component for Printing/Downloading */}
      <div
        ref={invoiceRef}
        className="fixed top-[-9999px] left-[-9999px] w-[800px] h-auto min-h-[1000px] bg-white z-[9999] overflow-auto opacity-0 pointer-events-none print:static print:top-0 print:left-0 print:opacity-100 print:pointer-events-auto print:block print:w-full print:p-8 print:shadow-none"
        style={{
          minHeight: "100vh",
          maxHeight: "none",
        }}
      >
        <InvoiceComponent
          bookingData={bookingData}
          bookingDetails={bookingDetails}
          guestUser={guestUser}
          user={user}
          primaryDoctor={primaryDoctor}
          serviceName={serviceName}
          serviceDuration={serviceDuration}
          servicePrice={servicePrice}
          sessionDate={sessionDate}
          sessionTime={sessionTime}
          therapist={therapist}
          isFreeConsultation={isFreeConsultation}
          isSubscription={isSubscription}
        />
      </div>

      {/* Print Styles */}
      <style>{printStyles}</style>
    </Layout>
  );
}
