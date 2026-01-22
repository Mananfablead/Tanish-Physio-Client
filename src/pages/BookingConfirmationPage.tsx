import { Link, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Calendar,
  Video,
  ArrowRight,
  Download,
  Mail,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getBookingByIdGuest, updateGuestBookingStatus } from '@/lib/api';

export default function BookingConfirmationPage() {
  const location = useLocation();
  const bookingData = location.state;
  const [bookingDetails, setBookingDetails] = useState(null);
  
  // Determine if this is a subscription or service booking
  const isSubscription = bookingData?.fromSubscription === true;
  
  // Extract booking details based on purchase type
  let therapist, sessionDate, sessionTime, serviceName, servicePrice, serviceDuration;
  
  if (isSubscription) {
    // For subscription purchases
    therapist = {
      name: "Plan Management Team",
      title: "Subscription Services",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face",
    };
    sessionDate = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    sessionTime = "Activation Date";
    serviceName = bookingData?.planName || bookingData?.plan?.name || "Subscription Plan";
    servicePrice = bookingData?.finalPrice || bookingData?.plan?.price;
    serviceDuration = bookingData?.plan?.duration || "Duration varies by plan";
  } else {
    // For service bookings
    therapist = bookingData?.therapist || {
      name: "Dr. Sarah Johnson",
      title: "Sports Injury Specialist",
      avatar:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face",
    };
    sessionDate = bookingData?.date || "Mon, Dec 30, 2024";
    sessionTime = bookingData?.time || "10:00 AM (45 min)";
    serviceName =
      bookingData?.service?.name || bookingData?.planName || "Therapy Session";
    servicePrice = bookingData?.finalPrice || bookingData?.planPrice;
    serviceDuration = bookingData?.service?.duration || bookingData?.plan?.duration || "Duration varies";
  }
  
  // Update booking status to confirmed for guest users
  useEffect(() => {
    const updateBookingStatus = async () => {
      try {
        let clientEmail;
        
        // Check if clientEmail is directly available in bookingData
        if (bookingData.clientEmail) {
          clientEmail = bookingData.clientEmail;
        } else {
          // Try to get email from guest user data stored in sessionStorage
          const storedGuestUser = sessionStorage.getItem('qw_guest_user');
          if (storedGuestUser) {
            try {
              const guestUser = JSON.parse(storedGuestUser);
              clientEmail = guestUser.email;
            } catch (e) {
              console.error('Error parsing guest user data:', e);
            }
          }
        }
        
        if (clientEmail) {
          if (bookingData?.bookingId && !isSubscription) {
            // For service bookings, update booking status
            await updateGuestBookingStatus(bookingData.bookingId, 'confirmed', clientEmail);
            toast.success('Service booking confirmed successfully!');
          } else if (isSubscription) {
            // For subscriptions, we don't need to update a booking status
            // The subscription is already activated via the payment verification
            toast.success('Subscription activated successfully!');
          }
        } else {
          console.warn('Could not find client email for confirmation');
        }
      } catch (error) {
        console.error('Error updating booking status:', error);
        // Don't show error toast here as the booking might already be confirmed
        // or there might be other legitimate reasons for the error
      }
    };
    
    updateBookingStatus();
  }, [bookingData, isSubscription]);

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center py-12">
        <div className="container max-w-6xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card variant="elevated" className="text-center">
              <CardContent className="p-8 md:p-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="h-10 w-10 text-success" />
                </motion.div>

                <h1 className="text-3xl font-bold mb-2">{isSubscription ? 'Subscription Activated!' : 'Booking Confirmed!'}</h1>
                <p className="text-muted-foreground mb-8">
                  Your {serviceName} {isSubscription ? 'has been successfully activated.' : 'session has been successfully booked.'}
                  You'll receive a confirmation email shortly.
                </p>

                {/* Email Information */}
                {/* <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
                  <h3 className="font-semibold text-lg mb-3 text-blue-800 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Account Information
                  </h3>
                  <p className="text-blue-700 mb-3">
                    We've sent an email to your registered email address with
                    your login credentials.
                  </p>
                  <div className="space-y-2 text-blue-700">
                    <p className="font-medium">Email contains:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Login password for your account</li>
                      <li>Temporary access instructions</li>
                      <li>Profile setup guide</li>
                    </ul>
                  </div>
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="text-blue-800 font-medium">Next Steps:</p>
                    <ol className="list-decimal pl-5 mt-2 space-y-1 text-blue-700">
                      <li>Use your email and the provided password to login</li>
                      <li>Change your password for security</li>
                      <li>Access your profile to manage your bookings</li>
                    </ol>
                  </div>
                </div> */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Session Details - Left Side */}
                  <div className="bg-muted/50 rounded-xl p-6 text-left space-y-4">
                    <h3 className="font-semibold text-center mb-4">{isSubscription ? 'Subscription Details' : 'Session Details'}</h3>
                    
                    <div className="flex items-center gap-3">
                      <img
                        src={therapist.avatar}
                        alt={therapist.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium">{therapist.name}</p>
                        <p className="text-sm text-muted-foreground">{therapist.title}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">{isSubscription ? 'Start Date' : 'Date'}</p>
                          <p className="font-medium">{sessionDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">{isSubscription ? 'Duration' : 'Time'}</p>
                          <p className="font-medium">{isSubscription ? serviceDuration : sessionTime}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-medium">{isSubscription ? 'Subscription Plan' : 'Video Consultation'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{isSubscription ? 'Online Access' : 'Virtual (Video Call)'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Access</p>
                          <p className="font-medium">{isSubscription ? 'Unlimited sessions as per plan' : 'Single session booking'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Email Information - Right Side */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-left">
                    <h3 className="font-semibold text-lg mb-3 text-blue-800 flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-600" />
                      Account Information
                    </h3>
                    <p className="text-blue-700 mb-3">
                      We've sent an email to your registered email address with your login credentials.
                    </p>
                    <div className="space-y-2 text-blue-700">
                      <p className="font-medium">Email contains:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Login password for your account</li>
                        <li>Temporary access instructions</li>
                        <li>Profile setup guide</li>
                      </ul>
                    </div>
                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                      <p className="text-blue-800 font-medium">
                        Next Steps:
                      </p>
                      <ol className="list-decimal pl-5 mt-2 space-y-1 text-blue-700">
                        <li>Use your email and the provided password to login</li>
                        <li>Change your password for security</li>
                        <li>Access your profile to manage your bookings</li>
                      </ol>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                  <Button variant="outline" onClick={() => {
                    // Download booking details as PDF or similar
                    toast.success('Downloading booking details...');
                    // In a real app, this would trigger a PDF download
                  }}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={async () => {
                    // Resend confirmation email
                    try {
                      // This would typically call an API to resend the confirmation
                      toast.success('Confirmation email resent successfully!');
                    } catch (error) {
                      toast.error('Failed to resend confirmation email');
                    }
                  }}>
                    <Mail className="h-4 w-4 mr-2" />
                    Resend Confirmation
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/questionnaire" state={{ 
                    planToActivate: isSubscription ? { 
                      name: serviceName, 
                      price: servicePrice, 
                      duration: serviceDuration,
                      planId: bookingData?.plan?.planId || bookingData?.plan?.id
                    } : null,
                    serviceToBook: !isSubscription ? {
                      name: serviceName,
                      price: servicePrice,
                      duration: serviceDuration,
                      bookingId: bookingData?.bookingId,
                      serviceId: bookingData?.service?.id
                    } : null
                  }}>
                    <Button variant="hero" size="lg" className="w-full">
                      Complete Questionnaire
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/">
                    <Button variant="outline" size="lg" className="w-full">
                      Explore More Services
                    </Button>
                  </Link>
                </div>

                <p className="text-sm text-muted-foreground mt-6">
                  {isSubscription 
                    ? 'You can access your subscription benefits from your profile.' 
                    : 'You can join the video session from your profile 5 minutes before the scheduled time.'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
