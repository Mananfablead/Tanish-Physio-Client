import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthRedux } from "@/hooks/useAuthRedux";
import VideoCall from "@/components/VideoCall/VideoCall";
import { videoCallApi } from "@/lib/videoCallApi";

const VideoCallPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthRedux();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeCall = async () => {
      try {
        if (!sessionId || !user) {
          setError("Invalid session or user");
          return;
        }

        // Generate call token
        const response = await videoCallApi.generateJoinLink(
          sessionId,
          user.userId,
          user.role
        );

        if (response.success) {
          setToken(response.token);
        } else {
          setError(response.message || "Failed to generate call token");
        }
      } catch (err) {
        console.error("Error initializing call:", err);
        setError("Failed to initialize call");
      } finally {
        setLoading(false);
      }
    };

    initializeCall();
  }, [sessionId, user]);

  const handleEndCall = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Initializing video call...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Call Not Available</h2>
          <p className="text-gray-400">Unable to join this video call.</p>
        </div>
      </div>
    );
  }

  return (
    <VideoCall
      roomId={sessionId}
      roomType="session"
      isTherapist={user.role === "therapist"}
      onEndCall={handleEndCall}
      sessionId={sessionId}
    />
  );
};

export default VideoCallPage;
