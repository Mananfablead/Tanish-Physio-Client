import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Calendar, Video, ArrowRight, Download, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function BookingConfirmationPage() {

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

                <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
                <p className="text-muted-foreground mb-8">
                  Your session has been successfully booked. You'll receive a confirmation email shortly.
                </p>
                
                {/* Email Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
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

                {/* Session Details */}
                <div className="bg-muted/50 rounded-xl p-6 mb-8 text-left space-y-4">
                  <h3 className="font-semibold text-center mb-4">Session Details</h3>
                  
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&h=80&fit=crop&crop=face"
                      alt="Dr. Sarah Johnson"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium">Dr. Sarah Johnson</p>
                      <p className="text-sm text-muted-foreground">Sports Injury Specialist</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">Mon, Dec 30, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p className="font-medium">10:00 AM (45 min)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Resend Confirmation
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/login">
                    <Button variant="hero" size="lg" className="w-full">
                      Login to Your Account
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/">
                    <Button variant="outline" size="lg" className="w-full">
                      Continue to Home
                    </Button>
                  </Link>
                </div>

                <p className="text-sm text-muted-foreground mt-6">
                  You can join the video session from your profile 5 minutes before the scheduled time.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
