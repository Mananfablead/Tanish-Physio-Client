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
import { store, persistor } from './store';
import ScrollToTop from "@/components/ScrollToTop";

// Lazy load pages for better performance and loading states
const LandingPage = lazy(() => import("./pages/LandingPage"));
const QuestionnairePage = lazy(() => import("./pages/QuestionnairePage"));
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
const NotFound = lazy(() => import("./pages/NotFound"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const VideoCallPage = lazy(() => import("./pages/VideoCallPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const ContactUsPage = lazy(() => import("./pages/ContactUsPage"));
const SchedulePage = lazy(() => import("./pages/SchedulePage"));
const ServiceDetailPage = lazy(() => import("./pages/ServiceDetailPage"));

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";


const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <PersistGate loading={<LoadingScreen />} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<LoadingScreen />}>
                <ScrollToTop />
                <Routes>
                  <Route path="/" element={<LandingPage />} />

                  <Route path="/questionnaire" element={<QuestionnairePage />} />
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
                      <ProtectedRoute>
                        <TherapistProfilePage />
                      </ProtectedRoute>
                    }
                  />
         
                  <Route path="/plans" element={<SubscriptionPlansPage />} />

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

                  {/* Support pages */}
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/aboutUs" element={<AboutUsPage />} />
                  <Route path="/terms" element={<TermsOfServicePage />} />
                  <Route path="/contact" element={<ContactUsPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route
                    path="/service/:serviceId"
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

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </PersistGate>
  </Provider>
);

export default App;
