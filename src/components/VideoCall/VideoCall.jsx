import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Users,
  Settings,
  Share,
  ArrowRight,
  X,
  Clock,
} from "lucide-react";
import useSocket from "../../hooks/useSocket";
import useWebRTC from "../../hooks/useWebRTC";
import { videoCallApi } from "../../lib/videoCallApi";
import { chatApi } from "../../lib/chatApi";

const VideoCall = ({
  roomId,
  roomType = "session",
  isTherapist = false,
  onEndCall,
  sessionId, // Add sessionId prop for API calls
  connected: externalConnected = false, // Add connected prop from parent
  therapistName = "",
  userName = "",
  sessionDetails = null,
}) => {
  const { socket, connected, error, emit, on } = useSocket(roomId, roomType);
  const {
    localStream,
    remoteStreams,
    callActive,
    callStarted,
    callLogId,
    participants,
    initLocalMedia,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    muteUser,
    endCall,
    startCall,
    acceptCall: originalAcceptCall,
    rejectCall,
    localVideoRef,
    remoteVideoRefs,
    setCallActive,
    setParticipants,
    setCallLogId,
  } = useWebRTC(roomId, socket, isTherapist);

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [callStatus, setCallStatus] = useState("connecting"); // connecting, connected, ringing, missed, ended
  const [incomingCall, setIncomingCall] = useState(false);
  const [callStartTime, setCallStartTime] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [mediaError, setMediaError] = useState(null);
  const [therapistPresent, setTherapistPresent] = useState(false);
  const [waitingForTherapist, setWaitingForTherapist] = useState(true);

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log("=== STATE CHANGE DEBUG ===");
    console.log("therapistPresent:", therapistPresent);
    console.log("waitingForTherapist:", waitingForTherapist);
    console.log("localStream:", !!localStream);
    console.log("connected:", connected);
    console.log("userRole:", userRole);
  }, [therapistPresent, waitingForTherapist, localStream, connected, userRole]);

  // Wrapped acceptCall function that enforces therapist presence restriction
  const acceptCall = useCallback(() => {
    // Only enforce restriction for patients
    if (userRole === "patient") {
      return originalAcceptCall(true, therapistPresent);
    } else {
      // For other roles, no restriction
      return originalAcceptCall(false, false);
    }
  }, [originalAcceptCall, userRole, therapistPresent]);
  const [canReconnect, setCanReconnect] = useState(false);
  const [callError, setCallError] = useState(null);
  const [canInitializeMedia, setCanInitializeMedia] = useState(false);

  // Effect to check when socket is connected
  useEffect(() => {
    if (socket && (externalConnected || connected) && socket.connected) {
      setCanInitializeMedia(true);
    }
  }, [socket, externalConnected, connected]);

  // Initialize media when socket connects
  useEffect(() => {
    if ((externalConnected || connected) && !localStream && canInitializeMedia) {
      initLocalMedia()
        .then(() => {
          // Clear any previous media error on success
          setMediaError(null);
        })
        .catch((err) => {
          console.error("Error initializing media:", err);
          // Set a user-friendly message for media errors
          if (err.name === "NotFoundError") {
            setMediaError(
              "No camera or microphone found. The call will continue with limited functionality."
            );
            console.warn(
              "No camera or microphone found. The call will continue with limited functionality."
            );
          } else if (err.name === "NotAllowedError") {
            setMediaError(
              "Camera and/or microphone access denied. Please allow access in your browser settings."
            );
            console.warn(
              "Camera and/or microphone access was denied. Please allow access to use video/audio features."
            );
          } else {
            setMediaError(
              "There was an issue accessing media devices: " + err.message
            );
            console.warn(
              "There was an issue accessing media devices:",
              err.message
            );
          }
        });
    }
  }, [socket, externalConnected, connected, localStream, initLocalMedia]);

  // Handle socket errors and join events
  const handleError = useCallback(
    (data) => {
      console.error("Video call error:", data);

      // Handle specific session not active error
      if (
        data.message &&
        data.message.includes("Session is not active at this time")
      ) {
        setCallError(
          "⏰ Session Not Active\n\nThis session is not currently active. Please check:\n• Your scheduled appointment time\n• That you're joining at the correct time\n\nIf you believe this is an error, please contact support."
        );
        // Set appropriate call status for inactive session
        setCallStatus("inactive");
      } else {
        setCallError(data.message || "An error occurred during the video call");
      }
    },
    [setCallError]
  );

  useEffect(() => {
    if (socket) {
      const handleJoinedCall = (data) => {
        console.log("Client: Successfully joined call:", data);
        setJoinedCall(true);
        setCallStatus("connected");
        setCallError(null); // Clear any previous errors
      };

      socket.on("error", handleError);

      return () => {
        socket.off("error", handleError);
      };
    }
  }, [socket]);

  // Timer for call duration
  useEffect(() => {
    let interval = null;
    if (callActive && callStartTime) {
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
    } else {
      setCallDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callActive, callStartTime]);

  // Load chat messages
  useEffect(() => {
    if (sessionId && externalConnected && connected) {
      loadChatMessages();
    }
  }, [sessionId, externalConnected, connected]);

  const loadChatMessages = async () => {
    try {
      const response = await chatApi.getMessages(sessionId);
      if (response.success) {
        setChatMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error("Error loading chat messages:", error);
    }
  };

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !sessionId || !externalConnected || !connected)
      return;

    try {
      await chatApi.sendMessage(sessionId, newMessage.trim());
      setNewMessage("");
      await loadChatMessages(); // Refresh messages
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = async () => {
    if (sessionId && externalConnected && connected) {
      try {
        await chatApi.sendTyping();
      } catch (error) {
        console.error("Error sending typing indicator:", error);
      }
    }
  };

  const handleStopTyping = async () => {
    if (sessionId && externalConnected && connected) {
      try {
        await chatApi.sendStopTyping();
      } catch (error) {
        console.error("Error sending stop typing indicator:", error);
      }
    }
  };

  // Set up socket listeners
  useEffect(() => {
    if (!socket || !(externalConnected || connected)) return;

    // Handle incoming offer
    const offerListener = (data) => {
      if (data.senderId !== socket.id) {
        handleOffer(data.offer, data.senderId);
      }
    };

    // Handle incoming answer
    const answerListener = (data) => {
      if (data.senderId !== socket.id) {
        handleAnswer(data.answer, data.senderId);
      }
    };

    // Handle ICE candidate
    const iceCandidateListener = (data) => {
      if (data.senderId !== socket.id) {
        handleIceCandidate(data.candidate, data.senderId);
      }
    };

    // Handle participant joined
    const participantJoinedListener = (data) => {
      setParticipants((prev) => [...prev, data]);
      if (data.isTherapist && !isTherapist) {
        setIncomingCall(true);
      console.log("=== PARTICIPANT JOINED EVENT ===");
      console.log("Participant data:", data);
      console.log("Current user role:", userRole);
      console.log("Current therapistPresent state:", therapistPresent);
      console.log("Current localStream state:", !!localStream);
      console.log("Current socket connected:", connected);

      // Check if this is a therapist or admin joining
      let isTherapistJoining = false;
      if (
        data.isTherapist ||
        data.role === "admin" ||
        data.role === "therapist"
      ) {
        console.log("✅ THERAPIST/ADMIN DETECTED - enabling auto-join");
        isTherapistJoining = true;
        setTherapistPresent(true);
        setWaitingForTherapist(false);
        console.log("TherapistPresent state set to TRUE");
      } else {
        console.log("Participant is not therapist/admin");
      }

      // Enhance participant data with name if available
      let participantData = { ...data, isSelf: data.socketId === socket.id };

      // If the participant doesn't have a name, try to get it from the user prop
      if (!participantData.name) {
        // If this is the current user, use the name from the user prop
        if (participantData.isSelf && user) {
          participantData.name =
            user.name ||
            (user.firstName && user.lastName
              ? user.firstName + " " + user.lastName
              : "You");
        } else {
          // For other participants, if we have user data and it matches, use it
          // This might happen if the socket event didn't include the name
          if (user && data.userId && data.userId === user.id) {
            participantData.name =
              user.name ||
              (user.firstName && user.lastName
                ? user.firstName + " " + user.lastName
                : "User");
          }
        }
      }

      setParticipants((prev) => {
        // Avoid duplicates by checking both userId and socketId
        const exists = prev.some(
          (p) => p.userId === data.userId && p.socketId === data.socketId
        );
        if (exists) return prev;
        return [...prev, participantData];
      });

      // AUTO-JOIN LOGIC - Patient auto-joins when therapist joins
      console.log("=== AUTO-JOIN CHECK ===");
      console.log("isTherapistJoining:", isTherapistJoining);
      console.log("userRole:", userRole);
      console.log("therapistPresent:", therapistPresent);
      console.log("localStream:", !!localStream);
      console.log("connected:", connected);

      if (isTherapistJoining && userRole === "patient") {
        console.log(
          "✅ AUTO-JOIN TRIGGERED - Therapist joined, patient auto-accepting"
        );
        console.log("Local stream available:", !!localStream);
        console.log("Socket connected:", connected);

        // Wait for WebRTC to be fully ready
        setTimeout(() => {
          console.log("=== AUTO-JOIN EXECUTION ===");
          console.log("Final validation:");
          console.log("- User role is patient:", userRole === "patient");
          console.log("- Therapist just joined:", isTherapistJoining);
          console.log("- Has local stream:", !!localStream);
          console.log("- Socket connected:", connected);
          console.log("- acceptCall function available:", !!acceptCall);

          // Final validation before auto-joining
          if (
            userRole === "patient" &&
            isTherapistJoining &&
            localStream &&
            connected &&
            acceptCall
          ) {
            console.log("✅ ALL CONDITIONS MET - EXECUTING AUTO-JOIN");
            const success = acceptCall();
            console.log("acceptCall returned:", success);

            if (success) {
              console.log("🎉 AUTO-JOIN SUCCESSFUL - Call should start now!");
            } else {
              console.log("❌ AUTO-JOIN FAILED - acceptCall returned false");
              console.log("Retrying in 1 second...");
              // Retry once more after a longer delay
              setTimeout(() => {
                const retrySuccess = acceptCall();
                console.log("Retry attempt result:", retrySuccess);
              }, 1000);
            }
          } else {
            console.log("❌ AUTO-JOIN CONDITIONS NOT MET:");
            console.log({
              userRoleCheck: userRole === "patient",
              therapistJoining: isTherapistJoining,
              hasLocalStream: !!localStream,
              socketConnected: connected,
              acceptCallAvailable: !!acceptCall,
            });
          }
        }, 1000); // Longer delay to ensure everything is ready
      } else if (
        (data.isTherapist ||
          data.role === "admin" ||
          data.role === "therapist") &&
        userRole !== "therapist" &&
        userRole !== "admin"
      ) {
        // For other roles (non-patients), show incoming call UI
        setIncomingCall(true);
      }
    };

    // Handle participant left
    const participantLeftListener = (data) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== data.userId));
    };

    // Handle call started
    const callStartedListener = (data) => {
      setCallStatus("connected");
      setCallActive(true);
      setCallStartTime(Date.now());
      if (data.callLogId) {
        setCallLogId(data.callLogId);
      }
      if (data.startedBy !== socket.id) {
        setIncomingCall(false);
      }
    };

    // Handle call accepted
    const callAcceptedListener = (data) => {
      console.log("=== CALL ACCEPTED EVENT RECEIVED ===");
      console.log("call-accepted data:", data);
      console.log("Setting call status to connected");
      console.log("Current callActive:", callActive);
      console.log("Current callStatus:", callStatus);
      
      setCallStatus("connected");
      setCallActive(true);
      setIncomingCall(false);
      
      console.log("✅ Call accepted - UI should now show connected state");
    };

    // Handle call rejected
    const callRejectedListener = (data) => {
      setCallStatus("missed");
      setIncomingCall(false);
    };

    // Handle call ended
    const callEndedListener = (data) => {
      setCallStatus("ended");
      setCallActive(false);
      setCallStartTime(null);
      setIncomingCall(false);
      if (onEndCall) onEndCall();
      console.log("Call ended by:", data.endedBy);
      console.log("Initiator role:", data.initiatorRole);

      // Check if this was initiated by admin/therapist
      const isAdminTermination =
        data.initiatorRole === "admin" || data.initiatorRole === "therapist";

      if (isAdminTermination) {
        // Admin/therapist ended the call - client call should end completely
        console.log("Admin/therapist terminated call - ending client session");
        setCallStatus("ended");
        setCallActive(false);
        setCallStartTime(null);
        setIncomingCall(false);
        setCanReconnect(false); // Disable reconnection for admin-terminated calls
        if (onEndCall) onEndCall();
      } else {
        // Regular participant ended the call - keep UI active for reconnection
        console.log("Participant ended call - keeping session UI active");
        setCallActive(false);
        setCallStartTime(null);
        setIncomingCall(false);
        setCanReconnect(true); // Enable reconnection option
        // Don't call onEndCall to keep session UI active
        // Don't set callStatus to "ended" to avoid termination screen
      }
    };

    // Handle audio toggle
    const audioToggleListener = (data) => {
      // Update UI to reflect other participant's audio status
    };

    // Handle video toggle
    const videoToggleListener = (data) => {
      // Update UI to reflect other participant's video status
    };

    // Handle screen share toggle
    const screenShareToggleListener = (data) => {
      // Update UI to reflect other participant's screen sharing status
    };

    // Handle user muted
    const userMutedListener = (data) => {
      // Handle if current user was muted by therapist
      if (data.userId === socket.id) {
        setAudioEnabled(false);
      }
    };

    // Handle chat message
    const chatMessageListener = (data) => {
      setChatMessages((prev) => [...prev, data.message]);
    };

    // Handle typing indicator
    const typingListener = (data) => {
      setTypingUsers((prev) => {
        if (!prev.includes(data.userId)) {
          return [...prev, data.userId];
        }
        return prev;
      });
    };

    // Handle stop typing indicator
    const stopTypingListener = (data) => {
      setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
    };

    // Add listeners
    on("offer", offerListener);
    on("answer", answerListener);
    on("ice-candidate", iceCandidateListener);
    on("participant-joined", participantJoinedListener);
    on("participant-left", participantLeftListener);
    on("call-started", callStartedListener);
    on("call-accepted", callAcceptedListener);
    on("call-rejected", callRejectedListener);
    on("call-ended", callEndedListener);
    on("audio-toggle", audioToggleListener);
    on("video-toggle", videoToggleListener);
    on("screen-share-toggle", screenShareToggleListener);
    on("user-muted", userMutedListener);
    on("new-message", chatMessageListener);
    on("typing", typingListener);
    on("stop-typing", stopTypingListener);

    // Cleanup listeners
    return () => {
      if (socket) {
        try {
          socket.off("offer", offerListener);
          socket.off("answer", answerListener);
          socket.off("ice-candidate", iceCandidateListener);
          socket.off("participant-joined", participantJoinedListener);
          socket.off("participant-left", participantLeftListener);
          socket.off("call-started", callStartedListener);
          socket.off("call-accepted", callAcceptedListener);
          socket.off("call-rejected", callRejectedListener);
          socket.off("call-ended", callEndedListener);
          socket.off("audio-toggle", audioToggleListener);
          socket.off("video-toggle", videoToggleListener);
          socket.off("screen-share-toggle", screenShareToggleListener);
          socket.off("user-muted", userMutedListener);
          socket.off("new-message", chatMessageListener);
          socket.off("typing", typingListener);
          socket.off("stop-typing", stopTypingListener);
        } catch (err) {
          console.error("Error removing socket listeners:", err);
        }
      }
    };
  }, [
    socket,
    externalConnected,
    connected,
    on,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    isTherapist,
    onEndCall,
  ]);

  // Toggle audio
  const toggleAudioHandler = () => {
    const enabled = toggleAudio();
    setAudioEnabled(enabled);
  };

  // Toggle video
  const toggleVideoHandler = () => {
    const enabled = toggleVideo();
    setVideoEnabled(enabled);
  };

  // Toggle screen sharing
  const toggleScreenShareHandler = () => {
    toggleScreenShare();
    setScreenSharing(!screenSharing);
  };

  // Render remote videos based on room type
  const renderRemoteVideos = () => {
    if (roomType === "session") {
      // 1-on-1 call - single remote video
      const userId = Object.keys(remoteStreams)[0];
      if (userId) {
        return (
          <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
            <video
              ref={(el) => (remoteVideoRefs.current[userId] = el)}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        );
      }
      return (
        <div className="flex items-center justify-center w-full h-full bg-slate-900 rounded-xl">
          <div className="text-center text-slate-500 max-w-md p-6">
            {waitingForTherapist && userRole === "patient" ? (
              <>
                <Clock className="mx-auto h-12 w-12 mb-4 text-blue-500" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Waiting for Clinician
                </h3>
                <p className="mb-4">
                  Please wait while your clinician joins the session. The call
                  will start automatically once they connect.
                </p>
                <div className="animate-pulse flex space-x-2 justify-center">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                </div>
              </>
            ) : (
              <>
                <Users className="mx-auto h-12 w-12 mb-2" />
                <p>Waiting for clinician...</p>
              </>
            )}
          </div>
        </div>
      );
    } else {
      // Group call - grid of videos
      const streamKeys = Object.keys(remoteStreams);
      if (streamKeys.length === 0) {
        return (
          <div className="flex items-center justify-center w-full h-full bg-slate-900 rounded-xl">
            <div className="text-center text-slate-500">
              <Users className="mx-auto h-12 w-12 mb-2" />
              <p>Waiting for participants...</p>
            </div>
          </div>
        );
      }

      if (streamKeys.length === 1) {
        // Single participant
        return (
          <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
            <video
              ref={(el) => (remoteVideoRefs.current[streamKeys[0]] = el)}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        );
      } else {
        // Multiple participants - grid layout
        return (
          <div className="grid grid-cols-2 grid-rows-2 gap-2 w-full h-full">
            {streamKeys.map((userId, index) => (
              <div
                key={userId}
                className="relative bg-black rounded-lg overflow-hidden"
              >
                <video
                  ref={(el) => (remoteVideoRefs.current[userId] = el)}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  Participant {index + 1}
                </div>
              </div>
            ))}
          </div>
        );
      }
    }
  };

  if (callStatus === "ended") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="text-center text-white">
          <PhoneOff className="mx-auto h-16 w-16 mb-4 text-rose-500" />
          <h2 className="text-2xl font-bold mb-2">Call Ended</h2>
          <p className="text-slate-500">The session has been completed.</p>
        </div>
      </div>
    );
  }

  if (incomingCall && !callStarted) {
  // Update participants with user names when user data is available
  useEffect(() => {
    if (user) {
      setParticipants((prevParticipants) => {
        // Check if any participant needs name update
        const needsUpdate = prevParticipants.some(
          (participant) => participant.isSelf && !participant.name
        );

        if (needsUpdate) {
          return prevParticipants.map((participant) => {
            // If it's the current user and doesn't have a name, add the name from user context
            if (participant.isSelf && !participant.name) {
              return {
                ...participant,
                name:
                  user.name ||
                  (user.firstName && user.lastName
                    ? user.firstName + " " + user.lastName
                    : "") ||
                  "You",
              };
            }
            return participant;
          });
        }
        // Return unchanged if no updates needed
        return prevParticipants;
      });
    }

    // Update therapist name based on participants - prioritize therapist over other participants
    const therapist = participants.find((p) => p.isTherapist && !p.isSelf);
    if (therapist && therapist.name) {
      setTherapistName(therapist.name);
    } else {
      // If no therapist found, look for other non-self participants
      const otherParticipant = participants.find(
        (p) => !p.isSelf && !p.isTherapist
      );
      if (otherParticipant && otherParticipant.name) {
        setTherapistName(otherParticipant.name);
      } else {
        // Default name if no other participant found
        const isTherapistRole = user?.role === "therapist";
        const userName =
          user?.name ||
          (user?.firstName && user?.lastName
            ? user.firstName + " " + user.lastName
            : "");
        const defaultTherapistName = isTherapistRole
          ? userName || "You (Therapist)"
          : "Clinician";
        setTherapistName(defaultTherapistName);
      }
    }
  }, [participants, user, setParticipants]);

  // Handle incoming call UI with therapist presence restriction
  if (incomingCall && !callStarted) {
    // For patients, show waiting screen instead of accept/reject options
    if (userRole === "patient") {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-black">
          <div className="text-center text-white max-w-md p-6">
            <Clock className="mx-auto h-16 w-16 mb-4 text-blue-500" />
            <h2 className="text-2xl font-bold mb-2">Waiting for Clinician</h2>
            <p className="text-slate-500 mb-6">
              Please wait while your clinician joins the session. The call will
              start automatically once they connect.
            </p>
            <div className="animate-pulse flex space-x-2 justify-center">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
      );
    }

    // For other roles (non-patients), show normal incoming call UI
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="text-center text-white">
          <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <Users className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Incoming Session</h2>
          <p className="text-slate-500 mb-6">{therapistName || "Clinician"} is ready to connect</p>
          <div className="flex justify-center gap-4">
            <Button
              variant="destructive"
              size="lg"
              className="rounded-2xl h-16 w-16 bg-rose-500 hover:bg-rose-600"
              onClick={rejectCall}
              disabled={!externalConnected || !connected}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
            <Button
              variant="default"
              size="lg"
              className="rounded-2xl h-16 w-16 bg-emerald-500 hover:bg-emerald-600"
              onClick={acceptCall}
              disabled={!externalConnected || !connected}
            >
              <Video className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
            <Video className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0">Live Session</Badge>
              <span className="text-slate-500 text-xs font-medium">• {sessionDetails?.session?.time || 'Time not specified'}</span>
            </div>
            <h1 className="text-white font-semibold tracking-tight">{therapistName || "Clinician"}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className={`text-slate-400 hover:text-white hover:bg-slate-800 ${showParticipants ? 'bg-slate-800 text-white' : ''}`}
            onClick={() => {
              setShowParticipants(!showParticipants);
              setShowChat(false);
              setShowSettings(false);
            }}
          >
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Participants</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`text-slate-400 hover:text-white hover:bg-slate-800 ${showChat ? 'bg-slate-800 text-white' : ''}`}
            onClick={() => {
              setShowChat(!showChat);
              setShowParticipants(false);
              setShowSettings(false);
            }}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Clinical Chat</span>
          </Button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative bg-slate-950 flex overflow-hidden">
        {/* Main Video (Doctor) */}
        <div className={`flex-1 relative flex items-center justify-center transition-all duration-500 ${showParticipants || showChat ? 'md:mr-0' : ''}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-950/50 pointer-events-none" />
          <div className="text-center">
            <div className="w-40 h-40 bg-slate-900 rounded-[2.5rem] mx-auto mb-6 flex items-center justify-center border border-slate-800 shadow-2xl relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face" 
                alt={therapistName || "Clinician"} 
                className="w-full h-full object-cover opacity-60" 
              />
            </div>
            <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">{therapistName || "Clinician"}</h2>
            <p className="text-slate-500 font-medium">Clinical Physiotherapist • Spinal Recovery</p>
          </div>
        </div>

        {/* Side Panels */}
        {showParticipants && (
          <div className="md:w-80 w-full bg-slate-900 md:border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300 md:relative absolute inset-0 md:inset-auto md:right-0 z-50">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-white font-semibold">Participants</h3>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => setShowParticipants(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="flex-1 p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-sm">{(therapistName && therapistName.charAt(0)) || 'C'}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium text-sm">{therapistName || "Clinician"}</p>
                    <Badge className="bg-slate-800 text-slate-400 border-none text-[8px] h-4">Host</Badge>
                  </div>
                  <p className="text-slate-500 text-xs">Active</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-sm">{(userName && userName.charAt(0)) || 'P'}</div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{userName || "Patient"}</p>
                  <p className="text-slate-500 text-xs">You</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {showChat && (
          <div className="md:w-80 w-full bg-slate-900 md:border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300 md:relative absolute inset-0 md:inset-auto md:right-0 z-50">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-white font-semibold">Clinical Chat</h3>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => setShowChat(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="flex-1 p-6 flex flex-col justify-center items-center text-center">
              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-slate-700">
                <MessageSquare className="h-5 w-5 text-slate-500" />
              </div>
              <p className="text-slate-400 text-sm font-medium">Chat is secure and encrypted</p>
              <p className="text-slate-600 text-[10px] mt-2 px-6">All clinical notes shared here will be saved to your recovery record.</p>
            </div>
            <div className="p-6 border-t border-slate-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Clinical note..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && externalConnected && connected) {
                      sendChatMessage();
                    }
                  }}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-slate-500 placeholder:text-slate-600"
                />
                <Button size="icon" className="bg-slate-100 hover:bg-white text-slate-900 rounded-xl" onClick={sendChatMessage}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Self Video (Patient) */}
        <div className={`absolute md:bottom-8 md:right-8 bottom-4 right-4 md:w-64 md:h-44 w-44 h-36 rounded-[2rem] overflow-hidden border-4 border-slate-900 shadow-2xl transition-all duration-500 ${showParticipants || showChat ? 'md:translate-x-[-320px]' : ''}`}>
          <div className="w-full h-full bg-slate-800 relative flex items-center justify-center">
            <div className="text-center">
              <div className="w-14 h-14 bg-slate-700 rounded-2xl mx-auto mb-2 flex items-center justify-center border border-slate-600">
                <Video className="h-6 w-6 text-slate-500" />
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">You</p>
            </div>
            {!videoEnabled && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
                <VideoOff className="h-6 w-6 text-slate-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900 px-4 py-4 md:px-8 md:py-8 border-t border-slate-800 md:relative fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="w-32 hidden md:flex items-center gap-2">
            <Badge variant="outline" className="border-slate-700 text-slate-500">HD 1080p</Badge>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={audioEnabled ? "secondary" : "destructive"}
              size="icon"
              className="rounded-2xl md:w-14 md:h-14 w-12 h-12 bg-slate-800 hover:bg-slate-700 border-slate-700"
              onClick={toggleAudioHandler}
              disabled={!externalConnected || !connected}
            >
              {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>

            <Button
              variant={videoEnabled ? "secondary" : "destructive"}
              size="icon"
              className="rounded-2xl md:w-14 md:h-14 w-12 h-12 bg-slate-800 hover:bg-slate-700 border-slate-700"
              onClick={toggleVideoHandler}
              disabled={!externalConnected || !connected}
            >
              {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            <Button
              variant={screenSharing ? "default" : "secondary"}
              size="icon"
              className={`rounded-2xl md:w-14 md:h-14 w-12 h-12 border-slate-700 ${screenSharing ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              onClick={toggleScreenShareHandler}
              disabled={!externalConnected || !connected}
            >
              <Share className="h-5 w-5" />
            </Button>

            <Button
              variant="secondary"
              size="icon"
              className="rounded-2xl md:w-14 md:h-14 w-12 h-12 bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
              onClick={() => setShowSettings(true)}
              disabled={!externalConnected || !connected}
            >
              <Settings className="h-5 w-5" />
            </Button>

            <Button
              variant="destructive"
              size="icon"
              className="rounded-2xl md:w-16 md:h-14 w-14 h-12 bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 ml-4"
              onClick={
                isTherapist
                  ? endCall
                  : () => {
                      if (socket) {
                        socket.emit("leave-room", { roomId, roomType });
                      }
                      if (onEndCall) onEndCall();
                    }
              }
              disabled={!externalConnected || !connected}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>

          <div className="w-32 flex justify-end">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl md:rounded-3xl w-full md:w-96 max-w-md mx-4 mb-0 md:mb-auto animate-in slide-in-from-bottom md:slide-in-from-top duration-300">
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Settings</h3>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => setShowSettings(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-slate-300 font-medium mb-3 text-sm">Audio Input</h4>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-600">
                  <option>Default Microphone</option>
                  <option>External USB Microphone</option>
                </select>
              </div>
              <div>
                <h4 className="text-slate-300 font-medium mb-3 text-sm">Video Input</h4>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-600">
                  <option>Default Camera</option>
                  <option>External Webcam</option>
                </select>
              </div>
              <div>
                <h4 className="text-slate-300 font-medium mb-3 text-sm">Connection Quality</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-3/4"></div>
                  </div>
                  <span className="text-xs text-slate-500">Good</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;