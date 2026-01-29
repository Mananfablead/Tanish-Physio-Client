import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthRedux } from "@/hooks/useAuthRedux";
import VideoCall from "@/components/VideoCall/VideoCall";
import { videoCallApi } from "@/lib/videoCallApi";

const VideoCallPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthRedux();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const initializeCall = async () => {
      try {
        console.log("VideoCallPage - sessionId:", sessionId);
        console.log("VideoCallPage - user:", user);
        console.log("VideoCallPage - token:", token);

        if (!sessionId) {
          setError("Session ID is missing");
          return;
        }

        if (!user) {
          setError("User not authenticated");
          return;
        }

        if (!user.id) {
          setError("User ID is missing");
          return;
        }

        // Check for token in localStorage as fallback
        const localStorageToken = localStorage.getItem("token");
        const effectiveToken = token || localStorageToken;

        if (!effectiveToken) {
          setError("Authentication token not available. Please log in again.");
          return;
        }

        // First, get session details to validate the session
        try {
          const sessionResponse = await videoCallApi.getCallDetails(sessionId);
          console.log("Session details:", sessionResponse);
          if (sessionResponse.success) {
            setSessionDetails(sessionResponse.data);
          }
        } catch (sessionErr) {
          console.warn("Could not fetch session details:", sessionErr);
          // Continue anyway as the token generation will validate access
        }

        console.log(
          "DEBUG: Generating call token for session:",
          sessionId,
          "user:",
          user.id,
          "role:",
          user.role
        );

        // Generate call token
        const response = await videoCallApi.generateJoinLink(
          sessionId,
          user.id, // Use user.id instead of user.userId
          user.role
        );

        console.log("DEBUG: Token generation response:", response);

        if (response.success) {
          // The actual call token is returned by generateJoinLink and used internally
          // We just need to confirm the connection is ready
          setConnected(true);
        } else {
          console.error("Token generation failed:", response);
          setError(response.message || "Failed to generate call token");
        }
      } catch (err) {
        console.error("Error initializing call:", err);
        const errorMessage =
          err.response?.data?.message || "Failed to initialize call";

        // Handle specific session not active error
        if (errorMessage.includes("Session is not active at this time")) {
          setError(
            "This session is not currently active. Please check the scheduled time and try again later."
          );
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeCall();
  }, [sessionId, user, token]);

  const handleEndCall = () => {
    navigate("/");
  };

  const handleRetry = () => {
    // Reset error and try again
    setError(null);
    setLoading(true);
    // This will trigger the useEffect to run again
  };

  // Check for token in localStorage as fallback
  const localStorageToken = localStorage.getItem("token");
  const effectiveToken = token || localStorageToken;

  if (loading || !sessionId || !user || !effectiveToken || !connected) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>
            {loading
              ? "Loading..."
              : !sessionId
              ? "Session ID missing"
              : !user
              ? "User not authenticated"
              : !effectiveToken
              ? "Authentication required"
              : !connected
              ? "Connecting to call..."
              : "Loading video call..."}
          </p>
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
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!effectiveToken) {
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
      user={user}
      isTherapist={user.role === "therapist"}
      onEndCall={handleEndCall}
      sessionId={sessionId}
      sessionDetails={sessionDetails}
      connected={connected}
    />
  );
};

export default VideoCallPage;