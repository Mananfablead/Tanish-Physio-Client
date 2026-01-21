import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import VideoCall from "../components/VideoCall/VideoCall";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthRedux } from "../hooks/useAuthRedux";

const VideoCallPage = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthRedux();

  const [roomType, setRoomType] = useState("session"); // 'session' or 'group'
  const [isTherapist, setIsTherapist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determine if user is therapist based on role
  useEffect(() => {
    if (user) {
      setIsTherapist(user.role === "therapist" || user.role === "admin");
    }
  }, [user]);

  // Determine room type based on URL or passed props
  useEffect(() => {
    // Check if it's a group session based on URL or room ID pattern
    if (roomId && roomId.startsWith("group")) {
      setRoomType("group");
    } else {
      setRoomType("session");
    }
    setLoading(false);
  }, [roomId]);

  // Handle call end
  const handleEndCall = () => {
    // Navigate back to dashboard or appointments
    if (roomType === "group") {
      navigate("/therapist/group-sessions");
    } else {
      navigate("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Connecting to call...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Connection Error
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900">
      <VideoCall
        roomId={roomId}
        roomType={roomType}
        isTherapist={isTherapist}
        onEndCall={handleEndCall}
      />
    </div>
  );
};

export default VideoCallPage;
