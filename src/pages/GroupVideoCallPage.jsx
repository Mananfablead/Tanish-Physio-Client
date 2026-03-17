import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthRedux } from "@/hooks/useAuthRedux";
import VideoCall from "@/components/VideoCall/VideoCall";
import { videoCallApi } from "@/lib/videoCallApi";
import { SEOHead } from "@/components/SEO/SEOHead";
import { getSEOConfig } from "@/components/SEO/seoConfig";

export default function GroupVideoCallPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token } = useAuthRedux();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [groupSessionDetails, setGroupSessionDetails] = useState(null);

  useEffect(() => {
    const initializeCall = async () => {
      try {
        if (!id) {
          setError("Group session ID is missing");
          return;
        }

        if (!user) {
          setError("User not authenticated");
          return;
        }

        // Check for user ID - backend uses _id, but frontend type uses id
        const userId = user.id || user._id;
        if (!userId) {
          console.error("❌ User ID missing. User object:", user);
          setError("User ID is missing. Please try logging in again.");
          return;
        }

        // Route patients through waiting room unless already approved
        if (user.role === "patient" || user.role === "user") {
          const approved = searchParams.get("approved");
          if (approved !== "true") {
            navigate(`/waiting-room?sessionId=${id}&type=group`);
            return;
          }
        }

        // Check for token in localStorage as fallback
        const localStorageToken = localStorage.getItem("token");
        const effectiveToken = token || localStorageToken;

        if (!effectiveToken) {
          setError("Authentication token not available. Please log in again.");
          return;
        }

        // First, get group session details
        try {
          const sessionResponse = await videoCallApi.getGroupSessionDetails(id);
          console.log("Group session details:", sessionResponse);
          if (sessionResponse.success) {
            setGroupSessionDetails(sessionResponse.data);
          }
        } catch (sessionErr) {
          console.warn("Could not fetch group session details:", sessionErr);
        }

        // Then, get participant details for the group session
        try {
          const participantsResponse =
            await videoCallApi.getGroupSessionParticipants(id);
          console.log("Group session participants:", participantsResponse);
          if (participantsResponse.success) {
            setGroupSessionDetails(participantsResponse.data);
          }
        } catch (participantsErr) {
          console.warn(
            "Could not fetch group session participants:",
            participantsErr
          );
        }

        // Generate call token for group session
        const response = await videoCallApi.generateGroupJoinLink(
          id,
          userId, // Use the correct user ID (either id or _id)
          user.role
        );

        console.log("Group call token generation response:", response);

        if (response.success) {
          setConnected(true);
        } else {
          console.error("Group token generation failed:", response);
          setError(response.message || "Failed to generate group call token");
        }
      } catch (err) {
        console.error("Error initializing group call:", err);
        const errorMessage =
          err.response?.data?.message || "Failed to initialize group call";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initializeCall();
  }, [id, user, token]);

  const handleEndCall = () => {
    navigate("/profile");
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // This will trigger the useEffect to run again
  };

  // Check for token in localStorage as fallback
  const localStorageToken = localStorage.getItem("token");
  const effectiveToken = token || localStorageToken;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Joining group session...</p>
        </div>
      </div>
    );
  }

  // Show error screen if there's an error
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white max-w-md p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-400 mb-6 whitespace-pre-line">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading states for other conditions
  if (!id || !user || !effectiveToken || !connected) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>
            {!id
              ? "Session ID missing"
              : !user
              ? "User not authenticated"
              : !effectiveToken
              ? "Authentication required"
              : "Connecting to group call..."}
          </p>
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
          <p className="text-gray-400">Unable to join this group video call.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead {...getSEOConfig("/group-video-call")} />
      <VideoCall
        key={groupSessionDetails ? groupSessionDetails._id : "initial"}
        roomId={id}
        roomType="group"
        user={user}
        isTherapist={user?.role === "therapist"}
        onEndCall={handleEndCall}
        sessionId={id}
        groupSessionDetails={groupSessionDetails}
        connected={connected}
      />
    </>
  );
}
