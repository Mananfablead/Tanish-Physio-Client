import { Layout } from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Award,
  Clock,
  Calendar,
  Play,
  Activity,
  Menu,
  X,
  PlusCircle,
  CalendarDays,
  CheckCircle
} from "lucide-react";
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

// Import new components
import {
  ProfileHeader,
  SidebarNavigation,
  ActivePlanSection,
  SessionHistorySection,
  UpcomingSessionsSection,
  BookingsSection,
  SubscriptionHistorySection,
  PersonalInfoSection,
  RescheduleModal
} from "@/components/profile";

// Import recorded sessions component
import { RecordedSessionsSection } from "@/components/profile/RecordedSessionsSection";

// --- Component Interfaces ---

interface Section {
  id: string;
  label: string;
  sub: string;
  icon: any;
  color: string;
  isAction?: boolean;
}

// --- Main Component ---

export default function ProfilePage() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<string>("personal");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
    activePlan,
    userSubscriptions,
    loading: subsLoading,
    error: subsError,
  } = useSelector((state: any) => state.subscriptions);

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
  // const activePlan = user?.subscriptionData;

  
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
        // status: "pending"
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

  // Handle image change
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      console.error("Please select a valid image");
      return;
    }

    const formData = new FormData();
    formData.append("profilePicture", file);

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
    } catch (error) {
      console.error("Failed to update profile image", error);
    }
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      // Get form data
      const nameInput = document.querySelector("#name") as HTMLInputElement;
      const phoneInput = document.querySelector("#phone") as HTMLInputElement;

      const profileData = {
        name: nameInput?.value || user?.name,
        phone: phoneInput?.value || user?.phone,
      };

      await dispatch(updateProfile(profileData));
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
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
  const sections: Section[] = [
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
      isAction: true,
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
      id: "recordedSessions",
      label: "Recorded Sessions",
      sub: "Your recorded therapy sessions",
      icon: Play,
      color: "text-primary",
    },
    {
      id: "subscriptionHistory",
      label: "Subscription History",
      sub: "Your plan & payment history",
      icon: Calendar,
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

  return (
    <Layout>
      {/* Profile Header */}
      <ProfileHeader
        user={user}
        activePlan={activePlan}
        upcomingSessions={upcomingSessions}
        sessionHistory={sessionHistory}
        onImageChange={handleImageChange}
      />

      <div className="container -mt-16 pb-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Navigation */}
          <SidebarNavigation
            sections={sections}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-slate-200/40 backdrop-blur p-3 rounded-2xl space-y-4 border border-slate-200 shadow-sm">
              {/* Detail panel: shows the selected sidebar item */}
              <div className="space-y-6">
                {selectedSection === "activePlan" && (
                  <ActivePlanSection activePlan={activePlan} />
                )}

                {selectedSection === "upcoming" && (
                  <UpcomingSessionsSection 
                    upcomingSessions={upcomingSessions} 
                    nextSession={nextSession} 
                  />
                )}

                {selectedSection === "sessionHistory" && (
                  <SessionHistorySection 
                    sessions={sessions} 
                    onReschedule={(session) => {
                      setSessionToReschedule(session);
                      setRescheduleDate("");
                      setRescheduleTime("");
                      setRescheduleError(null);
                      setIsRescheduleModalOpen(true);
                    }} 
                  />
                )}

                {selectedSection === "recordedSessions" && (
                  <RecordedSessionsSection />
                )}

                {selectedSection === "bookings" && (
                  <BookingsSection bookingList={bookingList} />
                )}

                {selectedSection === "subscriptionHistory" && (
                  <SubscriptionHistorySection 
                    userSubscriptions={userSubscriptions} 
                    loading={subsLoading}
                    error={subsError}
                  />
                )}

                {selectedSection === "personal" && (
                  <PersonalInfoSection user={user} onSaveChanges={handleSaveChanges} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        sessionToReschedule={sessionToReschedule}
        onClose={() => {
          setIsRescheduleModalOpen(false);
          setSessionToReschedule(null);
          setRescheduleError(null);
          setRescheduleDate("");
          setRescheduleTime("");
          setSelectedDate(null);
        }}
        onConfirm={handleReschedule}
        availability={availability}
        currentMonth={currentMonth}
        currentYear={currentYear}
        setCurrentMonth={setCurrentMonth}
        setCurrentYear={setCurrentYear}
        rescheduleError={rescheduleError}
        rescheduleDate={rescheduleDate}
        rescheduleTime={rescheduleTime}
        setRescheduleDate={setRescheduleDate}
        setRescheduleTime={setRescheduleTime}
        setSelectedDate={setSelectedDate}
      />
    </Layout>
  );
}