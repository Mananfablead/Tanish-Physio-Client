import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthRedux } from "@/hooks/useAuthRedux";
import VideoCall from "@/components/VideoCall/VideoCall";
import { videoCallApi } from "@/lib/videoCallApi";
import { SEOHead } from "@/components/SEO/SEOHead";
import { getSEOConfig } from "@/components/SEO/seoConfig";

const VideoCallPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthRedux();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Prevent page refresh on socket disconnect
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Prevent accidental page refresh
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Prevent re-initialization if there's already an error
    if (error) {
      console.log("🛑 Skipping initialization due to existing error");
      return;
    }

    let cleanupFunction;

    // Cleanup function
    cleanupFunction = () => {
      console.log("🧹 Cleaning up VideoCallPage resources");
    };

    const initializeCall = async () => {
      try {
        console.log("VideoCallPage - sessionId:", sessionId);
        console.log("VideoCallPage - user:", user);
        console.log("VideoCallPage - token:", token);
        console.log("VideoCallPage - user role:", user?.role);

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

        // Redirect patients to waiting room (unless they have approval token)
        if (user.role === "patient" || user.role === "user") {
          // Check if this is an approved patient coming from waiting room
          const urlParams = new URLSearchParams(window.location.search);
          const approved = urlParams.get("approved");

          if (approved === "true") {
            console.log("✅ Approved patient proceeding to video call");
            console.log("📍 Current URL before cleanup:", window.location.href);
            console.log("🆔 Session ID from URL:", sessionId);

            // Remove the approved parameter from URL
            urlParams.delete("approved");
            const newUrl = `${window.location.pathname}${
              urlParams.toString() ? "?" + urlParams.toString() : ""
            }`;
            window.history.replaceState({}, "", newUrl);
            console.log("📍 URL after cleanup:", window.location.href);

            // Add delay to ensure everything is ready
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Set a flag to indicate this is an approved patient
            window.__APPROVED_PATIENT__ = true;
          } else {
            console.log("Redirecting patient to waiting room");
            navigate(`/waiting-room?sessionId=${sessionId}`);
            return;
          }
        }

        // Admins and therapists proceed to video call directly
        console.log("Admin/Therapist proceeding to video call");

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

        // Participants will be populated through peer connections, not API calls
        console.log("Participants will be populated through peer connections");

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

          // Handle specific session not active error
          console.error("Token generation failed:", response);
          console.error("Response details:", JSON.stringify(response, null, 2));

          if (
            response.message &&
            response.message.includes("Session is not active at this time")
          ) {
            setError(
              "⏰ Session Not Active\n\nThis session is not currently active. Please check:\n• Your scheduled appointment time\n• That you're joining at the correct time\n\nIf you believe this is an error, please contact support."
            );
          } else if (
            response.message &&
            response.message.includes("approved")
          ) {
            // Don't redirect for approval-related errors
            setError(`Approval Error: ${response.message}`);
            console.log("Keeping user on page to see approval error");
          } else {
            setError(response.message || "Failed to generate call token");
          }
        }
      } catch (err) {
        console.error("Error initializing call:", err);
        console.error("Error details:", JSON.stringify(err, null, 2));
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to initialize call";

        setError(`Connection Error: ${errorMessage}`);
        console.log("Keeping user on page to see connection error");
      } finally {
        setLoading(false);
      }
    };

    initializeCall();

    return () => {
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, [sessionId, user, token, error]);

  const handleEndCall = () => {
    navigate("/profile");
  };

  // Extract participant names from session details
  const getParticipantNames = () => {
    if (!sessionDetails || !sessionDetails.session) {
      return { therapistName: "", userName: "" };
    }

    const sessionData = sessionDetails.session;
    return {
      therapistName: sessionData.therapist?.name || "",
      userName: sessionData.user?.name || "",
    };
  };

  const { therapistName, userName } = getParticipantNames();

  const handleRetry = () => {
    // Reset error and try again
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
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show error screen if there's an error
  if (error) {
    console.log("🚨 RENDERING ERROR SCREEN:", error);
    console.log("📍 Current URL:", window.location.href);
    console.log("👤 User role:", user?.role);
    console.log("🆔 Session ID:", sessionId);

    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center text-white max-w-md p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-400 mb-6 whitespace-pre-line">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                console.log("🔙 Back to Dashboard button clicked");
                navigate("/");
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                console.log("🔄 Retry button clicked");
                setError(null);
                setLoading(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading states for other conditions (but not if there's an error)
  if (!sessionId || !user || !effectiveToken || (!connected && !error)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>
            {!sessionId
              ? "Session ID missing"
              : !user
              ? "User not authenticated"
              : !effectiveToken
              ? "Authentication required"
              : "Connecting to call..."}
          </p>
        </div>
      </div>
    );
  }

  if (!effectiveToken && !error) {
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
    <>
      <SEOHead {...getSEOConfig("/video-call")} />
      <VideoCall
        key={sessionDetails ? sessionDetails.session?.id : "initial"}
        roomId={sessionId}
        roomType="session"
        user={user}
        isTherapist={user?.role === "therapist"}
        onEndCall={handleEndCall}
        sessionId={sessionId}
        sessionDetails={sessionDetails}
        connected={connected}
        therapistName={therapistName}
        userName={userName}
      />
    </>
  );
};

export default VideoCallPage;