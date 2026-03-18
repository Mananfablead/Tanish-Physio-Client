import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthRedux } from "@/hooks/useAuthRedux";
import useSocket from "@/hooks/useSocket";
import { Clock, RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { videoCallApi } from "@/lib/videoCallApi";

const WaitingRoomPage = () => {
  const { user } = useAuthRedux();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("sessionId");
  const type = searchParams.get("type") || "session"; // 'session' | 'group'
  
  const [status, setStatus] = useState("connecting"); // connecting, waiting, approved, rejected
  const [error, setError] = useState(null);
  
  // Connect to socket with null roomId initially (waiting room doesn't need a room yet)
  const { socket, connected } = useSocket(null, "waiting-room");
  
  console.log("🔄 WaitingRoomPage: Session ID:", sessionId);
  console.log("🔄 WaitingRoomPage: Socket connected:", connected);

  // Handle socket connection and request to join
  useEffect(() => {
    // Check if this is a group session and redirect appropriately
    const checkSessionType = async () => {
      if (!sessionId) return;
      
      try {
        const sessionResponse = await videoCallApi.getCallDetails(sessionId);
        if (sessionResponse.success && sessionResponse.data) {
          const isGroupSession = sessionResponse.data.type === "Group" || 
                                sessionResponse.data.sessionType === "group" ||
                                sessionResponse.data.groupSessionId;
          
          if (isGroupSession) {
            console.log("🎯 Group session detected in waiting room");
            const groupSessionId = sessionResponse.data.groupSessionId || sessionId;
            // Redirect to group-video-call page
            navigate(`/group-video-call/${groupSessionId}`);
            return;
          }
        }
      } catch (checkErr) {
        console.warn("Could not check session type:", checkErr);
      }
    };
    
    checkSessionType();
    
    if (!socket || !sessionId || !user) return;
    
    // Check for user ID - backend uses _id, but frontend type uses id
    const userId = user.id || user._id;
    if (!userId) {
      console.error("❌ User ID missing. User object:", user);
      setError("User ID is missing. Please try logging in again.");
      return;
    }
    
    console.log("🔄 WaitingRoomPage: Setting up socket listeners");
    console.log("🔄 Socket connection status:", socket.connected);
    
    const handleSocketConnect = () => {
      console.log("✅ Patient socket connected - requesting to join waiting room");
      setStatus("waiting");
      
      // Request to join the waiting room
      socket.emit("request-to-join", {
        sessionId: sessionId,
        user: {
          userId: userId,
          name: user.firstName && user.lastName ? 
            `${user.firstName} ${user.lastName}` : 
            user.name || user.email || `User ${userId.substring(0, 5)}`,
          email: user.email,
          role: user.role
        }
      });
    };

    // Handle connection state
    if (socket.connected) {
      console.log("✅ Socket already connected, sending request immediately");
      handleSocketConnect();
    } else {
      console.log("🔄 Socket not connected yet, waiting for connection");
      socket.once("connect", handleSocketConnect);
    }

    const handleWaitingRoomJoined = (data) => {
      console.log("✅ Successfully joined waiting room:", data);
      setStatus("waiting");
      toast.success(data.message || "You have been added to the waiting room");
    };

    const handleJoinApproved = (data) => {
      console.log("✅ Join approved:", data);
      setStatus("approved");
      toast.success(data.message || "Your request has been approved!");
      
      // Don't disconnect the socket yet - let the video call page handle the connection
      // The video call page will detect the approved status and join the appropriate room
      
      // Store user role in session storage for use by other components
      if (user && user.role) {
        sessionStorage.setItem('userRole', user.role);
      }
      
      // Shorter delay to ensure backend processing is complete
      setTimeout(() => {
        console.log("➡️ Redirecting to video/group call page");
        if (type === "group") {
          navigate(
            `/group-video-call/${sessionId}?approved=true&userRole=${
              user?.role || "patient"
            }`
          );
        } else {
          navigate(
            `/video-call?sessionId=${sessionId}&approved=true&userRole=${
              user?.role || "patient"
            }`
          );
        }
      }, 1000);
    };

    const handleJoinRejected = (data) => {
      console.log("❌ Join rejected:", data);
      setStatus("rejected");
      setError(data.reason || "Your request was rejected by the therapist");
      toast.error(data.reason || "Your request was rejected");
    };

    const handleError = (data) => {
      console.error("❌ Socket error:", data);
      setError(data.message || "An error occurred");
      setStatus("error");
      toast.error(data.message || "Connection error");
    };

    // Handle connection state
    if (socket.connected) {
      handleSocketConnect();
    } else {
      socket.once("connect", handleSocketConnect);
    }

    // Register event listeners
    socket.on("waiting-room-joined", handleWaitingRoomJoined);
    socket.on("join-approved", handleJoinApproved);
    socket.on("join-rejected", handleJoinRejected);
    socket.on("error", handleError);

    return () => {
      socket.off("connect", handleSocketConnect);
      socket.off("waiting-room-joined", handleWaitingRoomJoined);
      socket.off("join-approved", handleJoinApproved);
      socket.off("join-rejected", handleJoinRejected);
      socket.off("error", handleError);
    };
  }, [socket, sessionId, user, navigate]);

  // Handle manual retry
  const handleRetry = () => {
    if (socket && sessionId) {
      setStatus("connecting");
      setError(null);
      
      // Check for user ID - backend uses _id, but frontend type uses id
      const userId = user.id || user._id;
      if (!userId) {
        console.error("❌ User ID missing for retry");
        setError("User ID is missing. Please try logging in again.");
        return;
      }
      
      socket.emit("request-to-join", {
        sessionId: sessionId,
        user: {
          userId: userId,
          name: user.firstName && user.lastName ? 
            `${user.firstName} ${user.lastName}` : 
            user.name || user.email || `User ${userId.substring(0, 5)}`,
          email: user.email,
          role: user.role
        }
      });
    }
  };

  // Render different states
  const renderContent = () => {
    switch (status) {
      case "connecting":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Connecting...</h2>
            <p className="text-gray-600">Establishing connection to waiting room</p>
          </div>
        );

      case "waiting":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Waiting for Approval</h2>
            <p className="text-gray-600 mb-4">Your therapist will review your request shortly</p>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-blue-800 text-sm">Please keep this page open while waiting</p>
            </div>
          </div>
        );

      case "approved":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Approved!</h2>
            <p className="text-gray-600 mb-4">Redirecting you to the video call...</p>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-green-800 text-sm">You will be automatically redirected in a moment</p>
            </div>
          </div>
        );

      case "rejected":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Request Rejected</h2>
            <p className="text-gray-600 mb-4">{error || "Your request was rejected by the therapist"}</p>
            <button 
              onClick={handleRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Connection Error</h2>
            <p className="text-gray-600 mb-4">{error || "Failed to connect to waiting room"}</p>
            <button 
              onClick={handleRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Retry Connection
            </button>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Initializing...</h2>
            <p className="text-gray-600">Setting up waiting room connection</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Waiting Room</h1>
            <p className="text-gray-600">Session ID: {sessionId || "No session ID provided"}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Information</h2>
            <div className="text-left space-y-2">
              <p><span className="font-medium">Name:</span> {user?.firstName} {user?.lastName || user?.name || "Unknown"}</p>
              <p><span className="font-medium">Email:</span> {user?.email || "Not available"}</p>
              <p><span className="font-medium">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  status === "waiting" ? "bg-blue-100 text-blue-800" :
                  status === "approved" ? "bg-green-100 text-green-800" :
                  status === "rejected" ? "bg-red-100 text-red-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            {renderContent()}
          </div>
          
          <div className="text-center text-sm text-gray-500">
            <p>Need help? Contact your therapist directly.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoomPage;