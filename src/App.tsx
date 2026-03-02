import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { store, persistor } from "./store";
import ScrollToTop from "@/components/ScrollToTop";
import ChatWidget from "@/components/ChatWidget";
import { HelmetProvider } from "react-helmet-async";
import PerformanceOptimizer from "@/components/PerformanceOptimizer";

// Lazy load pages for better performance and loading states
const ComingSoonPage = lazy(() => import("./pages/ComingSoonPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const QuestionnairePage = lazy(() => import("./pages/QuestionnairePage"));
const InvoicePage = lazy(() => import("./pages/InvoicePage"));
const TherapistDiscoveryPage = lazy(
  () => import("./pages/TherapistDiscoveryPage")
);
const TherapistProfilePage = lazy(() => import("./pages/TherapistProfilePage"));
const SubscriptionPlansPage = lazy(
  () => import("./pages/SubscriptionPlansPage")
);
const BookingPage = lazy(() => import("./pages/BookingPage"));
const BookingConfirmationPage = lazy(
  () => import("./pages/BookingConfirmationPage")
);
const NotFound = lazy(() => import("./pages/NotFoundPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const VideoCallPage = lazy(() => import("./pages/VideoCallPage"));
const WaitingRoomPage = lazy(() => import("./pages/WaitingRoomPage"));
const GroupVideoCallPage = lazy(() => import("./pages/GroupVideoCallPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const ContactUsPage = lazy(() => import("./pages/ContactUsPage"));
const SchedulePage = lazy(() => import("./pages/SchedulePage"));
const ServiceDetailPage = lazy(() => import("./pages/ServiceDetailPage"));
const RecordedSessionsPage = lazy(() => import("./pages/RecordedSessionsPage"));
const TestimonialsPage = lazy(() => import("./pages/TestimonialsPage"));
const LiveChatHistoryPage = lazy(() => import("./pages/LiveChatHistory"));
const FreeConsultationPage = lazy(() => import("./pages/FreeConsultationPage"));
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <PersistGate loading={<LoadingScreen />} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <AuthProvider>
            <SocketProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Suspense fallback={<LoadingScreen />}>
                    <ScrollToTop />
                    <Routes>
                      {/* <Route path="/" element={<ComingSoonPage />} /> */}
                      <Route path="/" element={<LandingPage />} />

                      <Route
                        path="/free-consultation"
                        element={<FreeConsultationPage />}
                      />
                      <Route
                        path="/questionnaire"
                        element={<QuestionnairePage />}
                      />
                      <Route
                        path="/therapists"
                        element={
                          <ProtectedRoute>
                            <TherapistDiscoveryPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/therapist/:id"
                        element={
                          // <ProtectedRoute>
                          <TherapistProfilePage />
                          // </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/plans"
                        element={<SubscriptionPlansPage />}
                      />

                      <Route
                        path="/login"
                        element={
                          <PublicRoute>
                            <LoginPage />
                          </PublicRoute>
                        }
                      />

                      <Route
                        path="/register"
                        element={
                          <PublicRoute>
                            <RegisterPage />
                          </PublicRoute>
                        }
                      />

                      <Route
                        path="/forgot-password"
                        element={
                          <PublicRoute>
                            <ForgotPasswordPage />
                          </PublicRoute>
                        }
                      />

                      <Route
                        path="/reset-password/:token"
                        element={
                          <PublicRoute>
                            <ResetPasswordPage />
                          </PublicRoute>
                        }
                      />

                      <Route
                        path="/booking"
                        element={
                          <PublicRoute>
                            <BookingPage />
                          </PublicRoute>
                        }
                      />
                      {/* Booking confirmation page - accessible to both authenticated and guest users */}
                      <Route
                        path="/booking-confirmation"
                        element={<BookingConfirmationPage />}
                      />
                      {/* Invoice page - for printing and downloading invoices */}
                      <Route path="/invoice" element={<InvoicePage />} />
                      <Route
                        path="/invoice/:bookingId"
                        element={<InvoicePage />}
                      />
                      <Route
                        path="/profile"
                        element={
                          // <ProtectedRoute>
                          <ProfilePage />
                          // </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/video-call"
                        element={
                          <ProtectedRoute>
                            <VideoCallPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/waiting-room"
                        element={
                          <ProtectedRoute>
                            <WaitingRoomPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/group-video-call/:id"
                        element={
                          <ProtectedRoute>
                            <GroupVideoCallPage />
                          </ProtectedRoute>
                        }
                      />

                      {/* Support pages */}
                      <Route path="/faq" element={<FAQPage />} />
                      <Route path="/about" element={<AboutUsPage />} />
                      <Route path="/terms" element={<TermsOfServicePage />} />
                      <Route path="/contact" element={<ContactUsPage />} />
                      <Route path="/services" element={<ServicesPage />} />
                      <Route
                        path="/testimonials"
                        element={<TestimonialsPage />}
                      />
                      <Route
                        path="/service/:slug"
                        element={<ServiceDetailPage />}
                      />
                      <Route
                        path="/schedule"
                        element={
                          // <ProtectedRoute>
                          <SchedulePage />
                          // </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/recorded-sessions"
                        element={
                          <ProtectedRoute>
                            <RecordedSessionsPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/live-chat-history"
                        element={
                          <ProtectedRoute>
                            <LiveChatHistoryPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    {/* Add the ChatWidget here - it now has access to SocketProvider */}
                    <ChatWidget />
                    {/* Add Performance Optimizer */}
                    <PerformanceOptimizer />
                  </Suspense>
                </BrowserRouter>
              </TooltipProvider>
            </SocketProvider>
          </AuthProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </PersistGate>
  </Provider>
);

export default App;