import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Calendar,
  Clock,
  Users,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useAuthRedux } from "@/hooks/useAuthRedux";
import api from "@/lib/api";
import { SEOHead } from "@/components/SEO/SEOHead";
import { getSEOConfig } from "@/components/SEO/seoConfig";

interface GroupSession {
  _id: string;
  title: string;
  description: string;
  therapistId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    specialization?: string;
  };
  startTime: string;
  endTime: string;
  maxParticipants: number;
  participants: Array<{
    userId: string;
    status: string;
  }>;
  status: string;
  price?: number;
}

export default function GroupSessionRegistrationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: userObj } = useAuthRedux();
  const user = userObj as any;
  const [session, setSession] = useState<GroupSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: "",
    emergencyContact: "",
    medicalConditions: "",
    medications: "",
    expectations: "",
  });

  useEffect(() => {
    if (id) {
      fetchSessionDetails(id);
    }
  }, [id]);

  const fetchSessionDetails = async (sessionId: string) => {
    try {
      setLoading(true);
      // Mock data for demonstration
      // In real implementation: const response = await api.get(`/group-sessions/${sessionId}`);

      const mockSession: GroupSession = {
        _id: sessionId,
        title: "Knee Rehabilitation Group",
        description:
          "Group session focused on knee injury recovery and strengthening exercises",
        therapistId: {
          _id: "t1",
          firstName: "Dr.",
          lastName: "Smith",
          email: "dr.smith@clinic.com",
          specialization: "Orthopedic Physiotherapy",
        },
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(
          Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000
        ).toISOString(),
        maxParticipants: 8,
        participants: [
          { userId: "u1", status: "accepted" },
          { userId: "u2", status: "accepted" },
          { userId: "u3", status: "pending" },
        ],
        status: "scheduled",
        price: 2500,
      };

      setSession(mockSession);
    } catch (error) {
      console.error("Error fetching session details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async () => {
    try {
      setRegistering(true);

      // Validate required fields
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.phone
      ) {
        alert("Please fill in all required fields");
        setRegistering(false);
        return;
      }

      // In real implementation:
      // const response = await api.post(`/group-sessions/${id}/register`, {
      //   ...formData,
      //   userId: user?._id
      // });

      // Mock success
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setConfirmation(true);
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  const handlePayment = async () => {
    try {
      // In real implementation, integrate with payment gateway
      // For now, mock successful payment
      await new Promise((resolve) => setTimeout(resolve, 2000));
      navigate(`/group-video-call/${id}`);
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Session Not Found</h2>
          <p className="text-gray-600 mb-4">
            The group session you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/group-sessions")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sessions
          </Button>
        </div>
      </div>
    );
  }

  if (confirmation) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card className="p-8">
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Registration Confirmed!
            </h1>
            <p className="text-gray-600 mb-8">
              You've been successfully registered for{" "}
              <span className="font-semibold">{session.title}</span>. You'll
              receive a confirmation email with session details shortly.
            </p>

            {session.price && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Complete Your Payment
                </h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-700">Session Fee</span>
                  <span className="font-semibold">₹{session.price}</span>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePayment}
                  disabled={registering}
                >
                  {registering ? "Processing..." : "Pay Now"}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Secure payment powered by Razorpay
                </p>
              </div>
            )}

            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/profile")}
              >
                View in My Profile
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/group-sessions")}
              >
                Browse More Sessions
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <SEOHead {...getSEOConfig("/group-sessions/register")} />
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/group-sessions")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sessions
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          Register for Group Session
        </h1>
        <p className="text-gray-600 mt-2">
          Complete your registration for {session.title}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Session Information */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Session Details</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">{session.title}</h3>
                <p className="text-gray-600 text-sm">{session.description}</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>
                  Dr. {session.therapistId.firstName}{" "}
                  {session.therapistId.lastName}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{new Date(session.startTime).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(session.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(session.endTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>
                  {
                    session.participants.filter((p) => p.status === "accepted")
                      .length
                  }{" "}
                  / {session.maxParticipants} participants
                </span>
              </div>

              {session.price && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{session.price}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Registration Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              Registration Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName" className="block mb-2">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="lastName" className="block mb-2">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="block mb-2">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="block mb-2">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="emergencyContact" className="block mb-2">
                  Emergency Contact
                </Label>
                <Input
                  id="emergencyContact"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  placeholder="Name and phone number"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="medicalConditions" className="block mb-2">
                  Medical Conditions or Injuries
                </Label>
                <Textarea
                  id="medicalConditions"
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleInputChange}
                  placeholder="Please list any relevant medical conditions, injuries, or surgeries..."
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="medications" className="block mb-2">
                  Current Medications
                </Label>
                <Textarea
                  id="medications"
                  name="medications"
                  value={formData.medications}
                  onChange={handleInputChange}
                  placeholder="Please list any medications you're currently taking..."
                  rows={2}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="expectations" className="block mb-2">
                  What are your expectations from this session?
                </Label>
                <Textarea
                  id="expectations"
                  name="expectations"
                  value={formData.expectations}
                  onChange={handleInputChange}
                  placeholder="What would you like to achieve from this group session..."
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="terms"
                  className="rounded"
                  required
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <a href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </Label>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleRegister}
                disabled={registering}
              >
                {registering ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Registration...
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    Complete Registration
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
