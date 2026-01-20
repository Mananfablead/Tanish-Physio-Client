import { Layout } from "@/components/layout/Layout";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { fetchUserSubscriptions } from '@/store/slices/subscriptionSlice';
import { fetchUserPayments } from '@/store/slices/paymentSlice';
import { fetchUpcomingSessions } from '@/store/slices/sessionSlice';
import { getAllBookingsAsync } from '@/store/slices/bookingsSlice';
import { getUpcomingSessions } from "@/lib/api";
import { updateProfile, setCredentials, fetchProfile } from '@/store/slices/authSlice';
import api from "@/lib/api";

// Define types for API responses
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

// --- Sub-components for Right Panel consistency ---

const RightPanelCard = ({ title, badge, children, footer }: { title: string, badge?: React.ReactNode, children: React.ReactNode, footer?: React.ReactNode }) => (
  <Card className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 min-h-[260px] flex flex-col justify-between overflow-hidden">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{title}</h3>
        {badge}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
    {footer && (
      <div className="flex justify-end items-center gap-3 pt-6 border-t border-slate-50 mt-auto">
        {footer}
      </div>
    )}
  </Card>
);

const InfoBlock = ({ label, value, subValue, icon: Icon, iconColor = "text-primary" }: { label: string, value: React.ReactNode, subValue?: string, icon: any, iconColor?: string }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-100 p-4 flex gap-3 items-start transition-all hover:bg-slate-200">
    <div className={`h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0`}>
      <Icon className={`h-5 w-5 ${iconColor}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <div className="font-black text-slate-900 truncate">{value}</div>
      {subValue && <p className="text-xs font-bold text-primary mt-0.5">{subValue}</p>}
    </div>
  </div>
);


export default function ProfilePage() {

  const user = useSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<string>('personal');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  console.log("previewImage", previewImage)
  console.log("Current user", user)
  // Get data from Redux store
  const { userSubscriptions, loading: subsLoading, error: subsError } = useSelector((state: any) => state.subscriptions);
  const { userPayments, loading: paymentsLoading, error: paymentsError } = useSelector((state: any) => state.payment);
  const {
    upcomingSessions,
    loading: sessionsLoading,
    error: sessionsError,
  } = useSelector((state: { sessions: any }) => state.sessions);
  const { bookings, loading: bookingsLoading, error: bookingsError } = useSelector((state: any) => state.bookings);
  const bookingList = bookings?.bookings || [];
  const activePlan = user?.subscriptionData;
  console.log("active plan", activePlan)
  console.log("upcoming sessions", upcomingSessions);
  // Set state based on Redux data
  const [planHistory, setPlanHistory] = useState<any[]>([]);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [intake, setIntake] = useState<any | null>(null);

  // Get next session from upcoming sessions
  const nextSession = upcomingSessions && upcomingSessions.length > 0 ? upcomingSessions[0] : null;

  // Fetch user data when component mounts
  useEffect(() => {
    dispatch(fetchUserSubscriptions());
    dispatch(fetchUserPayments());
    dispatch(fetchUpcomingSessions());
    dispatch(getAllBookingsAsync());
    // Also fetch the user profile to ensure profile picture is loaded
    dispatch(fetchProfile());
  }, [dispatch]);

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
      id: "upcoming",
      label: "Upcoming",
      sub: "Your appointments",
      icon: Clock,
      color: "text-primary",
    },
    {
      id: "sessionHistory",
      label: "Session History",
      sub: "Past consultations",
      icon: Play,
      color: "text-primary",
    },
    {
      id: "subscriptionHistory",
      label: "Subscription History",
      sub: "Payment history",
      icon: FileText,
      color: "text-primary",
    },
    {
      id: "bookings",
      label: "Bookings",
      sub: "Your appointment bookings",
      icon: Calendar,
      color: "text-primary",
    },

  ];

  // Handler functions
  const handleCancelPlan = () => {
    console.log("Cancel plan clicked");
    // Implement cancel plan functionality
  };



  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

      console.log("Profile image updated successfully");
    } catch (error) {
      console.error("Failed to update profile image", error);
    }
  };


  const handleSaveChanges = async () => {
    try {
      // Get form data
      const nameInput = document.querySelector('#name') as HTMLInputElement;
      const phoneInput = document.querySelector('#phone') as HTMLInputElement;
      const locationInput = document.querySelector('#location') as HTMLInputElement;

      const profileData = {
        name: nameInput?.value || user?.name,
        phone: phoneInput?.value || user?.phone,
        // Note: location field doesn't exist in User interface, so we'll skip it
        // If backend supports other fields, add them here
      };

      await dispatch(updateProfile(profileData));

      // Show success message
      console.log("Profile updated successfully");
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
                  onClick={() => document.getElementById('profile-image-upload')?.click()}
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
                  value: nextSession ? "1" : "0",
                  icon: Clock,
                  color: "text-success",
                  bg: "bg-success/10",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 hover:shadow-md transition-all group shadow-sm"
                >
                  <div
                    className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
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
                    onClick={() => setSelectedSection(item.id)}
                    className={`w-full text-left p-3.5 rounded-xl transition-all duration-300 group ${selectedSection === item.id
                      ? "bg-primary/10 shadow-inner"
                      : "hover:bg-primary/5"
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg transition-colors ${selectedSection === item.id
                          ? "bg-white shadow-sm"
                          : "bg-primary/5 group-hover:bg-white"
                          }`}
                      >
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-black text-sm transition-colors ${selectedSection === item.id
                            ? "text-primary"
                            : "text-slate-700"
                            }`}
                        >
                          {item.label}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate">
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

            <div className="bg-slate-200/40 backdrop-blur p-6 rounded-2xl space-y-6 border border-slate-200 shadow-sm">
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
                      activePlan ? (
                        <>
                          {/* <Button
                            variant="outline"
                            className="h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-primary font-bold"
                            onClick={handleCancelPlan}
                          >
                            Cancel Plan
                          </Button> */}
                          <Button
                            className="h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-black"
                            onClick={() => navigate("/schedule")}
                          >
                            Create Session
                          </Button>
                        </>
                      ) : (
                        <Button
                          asChild
                          className="h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-black"
                        >
                          <Link to="/plans">Explore Our Plans</Link>
                        </Button>
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
                              Payment via {activePlan?.paymentGateway || "Razorpay"} • Status:{" "}
                              {activePlan?.status || "inactive"}
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
                                ? new Date(activePlan.startDate).toLocaleDateString()
                                : "-"
                            }
                            icon={Clock}
                            iconColor="text-warning"
                          />

                          <InfoBlock
                            label="Valid Till"
                            value={
                              activePlan?.endDate
                                ? new Date(activePlan.endDate).toLocaleDateString()
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
                      <RightPanelCard title="Assigned Therapist">
                        <div className="space-y-4">
                          {upcomingSessions.map((session) => (
                            <div
                              key={session.id}
                              className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl bg-white hover:shadow-sm transition"
                            >
                              {/* Avatar */}
                              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                <User className="h-6 w-6 text-slate-400" />
                              </div>

                              {/* Therapist + Session Info */}
                              <div className="flex-1">
                                <h4 className="font-black text-slate-900">
                                  {session.therapistName}
                                </h4>
                                <p className="text-sm text-slate-500 font-medium">
                                  {new Date(session.date).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                  • {session.startTime} - {session.endTime}
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
                            CONFIRMED
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
                            <Link to="/video-call" className="flex-1">
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
                              nextSession.start
                            ).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                            subValue={`${new Date(
                              nextSession.start
                            ).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })} — ${new Date(
                              nextSession.end
                            ).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`}
                            icon={Calendar}
                            iconColor="text-primary"
                          />
                          <InfoBlock
                            label="Session Type"
                            value={nextSession.location}
                            subValue="1 on 1 Consultation"
                            icon={VideoIcon}
                            iconColor="text-accent"
                          />
                          <div className="md:col-span-2">
                            <InfoBlock
                              label="Session Focus"
                              value={
                                nextSession.relatedTo || "General Consultation"
                              }
                              subValue={nextSession.notes}
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
                          <Button asChild className="h-11 rounded-xl bg-primary hover:bg-primary/90 px-8 font-black">
                            <Link to="/schedule">Book a Session</Link>
                          </Button>
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
                          Session History
                        </h2>
                        <p className="text-slate-500 font-medium text-sm">
                          Your past consultations and recorded sessions
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="px-4 py-1.5 rounded-full border-slate-200 text-slate-600 font-bold bg-white"
                      >
                        {sessionHistory?.length || 0} Sessions
                      </Badge>
                    </div>

                    {sessionHistory && sessionHistory.length > 0 ? (
                      <div className="grid grid-cols-1 gap-6">
                        {sessionHistory.map((s, idx) => (
                          <RightPanelCard
                            key={idx}
                            title={s.relatedTo || "General Consultation"}
                            badge={
                              <Badge className="bg-success/10 hover:text-white text-success border-none font-bold">
                                COMPLETED
                              </Badge>
                            }
                            footer={
                              <div className="flex gap-3">
                                <Button
                                  variant="ghost"
                                  className="h-11 rounded-xl font-bold text-primary hover:text-primary hover:bg-primary/5"
                                >
                                  <FileText className="h-4 w-4 mr-2" /> Summary
                                </Button>
                                <Button
                                  asChild
                                  className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-6"
                                >
                                  <Link to={s.recordingUrl || "#"}>
                                    Watch Recording
                                  </Link>
                                </Button>
                              </div>
                            }
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <InfoBlock
                                label="Therapist"
                                value={s.therapist?.name}
                                icon={User}
                                iconColor="text-primary"
                              />
                              <InfoBlock
                                label="Date & Duration"
                                value={new Date(s.start).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                                subValue={`${s.duration} session`}
                                icon={Clock}
                                iconColor="text-accent"
                              />
                              <div className="md:col-span-2">
                                <InfoBlock
                                  label="Session Notes"
                                  value={s.notes}
                                  icon={FileText}
                                  iconColor="text-slate-400"
                                />
                              </div>
                            </div>
                          </RightPanelCard>
                        ))}
                      </div>
                    ) : (
                      <RightPanelCard
                        title="Session History"
                        footer={
                          <Button
                            asChild
                            className="h-11 rounded-xl bg-primary hover:bg-primary/90 px-8 font-black"
                          >
                            <Link to="/schedule">Book a Session</Link>
                          </Button>
                        }
                      >
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
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                          Your Bookings
                        </h2>
                        <p className="text-slate-500 font-medium text-sm">
                          History of your appointment bookings
                        </p>
                      </div>
                    </div>

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
                                  <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900">
                                      {booking.serviceName || 'N/A'}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                      {booking.serviceId?.name || 'N/A'}
                                    </div>
                                  </td>

                                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                    {new Date(booking.date).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                    <br />
                                    <span className="text-xs">{booking.time}</span>
                                  </td>

                                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                    {booking.therapistName || 'N/A'}
                                  </td>

                                  <td className="px-6 py-4 text-right">
                                    <span className="font-black text-slate-900">
                                      ₹{booking.amount || '0'}
                                    </span>
                                  </td>

                                  <td className="px-6 py-4 text-center">
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-black uppercase
                    ${booking.status === "confirmed"
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
                          <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                            <Calendar className="h-8 w-8 text-slate-300" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900">
                              No Bookings Found
                            </h3>
                            <p className="text-slate-500 font-medium">
                              You haven't made any bookings yet.
                            </p>
                          </div>
                          <Button
                            asChild
                            className="h-11 rounded-xl bg-primary hover:bg-primary/90 px-8 font-black"
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
                                    {new Date(p.createdAt).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
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
                    ${p.status === "active"
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
                          <Button
                            asChild
                            className="h-11 rounded-xl bg-primary hover:bg-primary/90 px-8 font-black"
                          >
                            <Link to="/plans">Explore Our Plans</Link>
                          </Button>
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
      {
        isMobileMenuOpen && (
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
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setSelectedSection(section.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${selectedSection === section.id
                      ? "bg-primary/10 border-primary/20 shadow-inner"
                      : "bg-slate-50 border-slate-100 hover:bg-white hover:border-primary/30"
                      }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl ${selectedSection === section.id
                        ? "bg-white shadow-sm"
                        : "bg-white/50"
                        }`}
                    >
                      <section.icon className={`h-5 w-5 ${section.color}`} />
                    </div>
                    <div className="text-left flex-1">
                      <p
                        className={`font-black text-sm ${selectedSection === section.id
                          ? "text-primary"
                          : "text-slate-700"
                          }`}
                      >
                        {section.label}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                        {section.sub}
                      </p>
                    </div>
                    {selectedSection === section.id && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      }
    </Layout >
  );
}
