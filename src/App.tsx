import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

// Lazy load pages for better performance and loading states
const LandingPage = lazy(() => import("./pages/LandingPage"));
const QuestionnairePage = lazy(() => import("./pages/QuestionnairePage"));
const TherapistDiscoveryPage = lazy(() => import("./pages/TherapistDiscoveryPage"));
const TherapistProfilePage = lazy(() => import("./pages/TherapistProfilePage"));
const SubscriptionPlansPage = lazy(() => import("./pages/SubscriptionPlansPage"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const BookingConfirmationPage = lazy(() => import("./pages/BookingConfirmationPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/login"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const VideoCallPage = lazy(() => import("./pages/VideoCallPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const AboutUsPage = lazy(() => import("./pages/AboutUsPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const ContactUsPage = lazy(() => import("./pages/ContactUsPage"));
const SchedulePage = lazy(() => import("./pages/SchedulePage"));
const ServiceDetailPage = lazy(() => import("./pages/ServiceDetailPage"));

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import PublicRoute from "./components/routing/PublicRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
          
            <Route path="/questionnaire" element={<QuestionnairePage />} />
            <Route path="/therapists" element={
              <ProtectedRoute>
                <TherapistDiscoveryPage />
              </ProtectedRoute>
            } />
            <Route path="/therapist/:id" element={
              <ProtectedRoute>
                <TherapistProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/plans" element={<SubscriptionPlansPage />} />
            
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />

            <Route path="/booking" element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            } />
            <Route path="/booking-confirmation" element={
              <ProtectedRoute>
                <BookingConfirmationPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/video-call" element={
              <ProtectedRoute>
                <VideoCallPage />
              </ProtectedRoute>
            } />

            {/* Support pages */}
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/aboutUs" element={<AboutUsPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/contact" element={<ContactUsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/service/:serviceId" element={<ServiceDetailPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
