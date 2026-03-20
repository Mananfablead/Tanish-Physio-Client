import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Link,
  Paperclip,
  Image,
  FileText,
  Play,
  Upload,
} from "lucide-react";
import useSocket from "../../hooks/useSocket";
import useWebRTC from "../../hooks/useWebRTC";
import { useNotifications } from "../../hooks/useNotifications"; // Add notification hook
import { videoCallApi } from "../../lib/videoCallApi";
import { chatApi } from "../../lib/chatApi";
import GoogleMeetErrorPopup from "./GoogleMeetErrorPopup";

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
  user = null, // Add user prop
}) => {
  const normalizeAttachment = useCallback((att) => {
    if (!att || typeof att !== "object") return null;

    const url =
      att.url ||
      att.fileUrl ||
      att.file_url ||
      att.downloadUrl ||
      att.location ||
      att.path ||
      att.s3Url ||
      att.publicUrl;

    const originalName =
      att.originalName ||
      att.original_name ||
      att.filename ||
      att.fileName ||
      att.name ||
      "Attachment";

    const sizeValue = att.size ?? att.fileSize ?? att.bytes;
    const size = Number.isFinite(Number(sizeValue)) ? Number(sizeValue) : 0;

    const mimeType =
      att.mimeType || att.mimetype || att.mime || att.contentType || "";

    let type = att.type || att.fileType || att.kind;
    if (!type) {
      if (typeof mimeType === "string" && mimeType.startsWith("image/"))
        type = "image";
      else if (typeof mimeType === "string" && mimeType.startsWith("video/"))
        type = "video";
      else type = "document";
    }

    if (type === "file") type = "document";

    return {
      ...att,
      url,
      originalName,
      size,
      type,
      mimeType,
    };
  }, []);

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
    remoteAudioRefs,
    setCallActive,
    setParticipants,
    setCallLogId,
    isRecording,
    recordingStatus,
    startRecording,
    stopRecording,
    createPeerConnection, // Add this for group call peer creation
  } = useWebRTC(roomId, socket, isTherapist);

  const stopMediaStreams = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
        console.log("Stopped media track:", track.kind);
      });
    }
  };

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [participantAudioStatus, setParticipantAudioStatus] = useState({});

  // Effect to update video elements when streams change
  useEffect(() => {
    console.log("=== CLIENT VIDEO STREAM UPDATE EFFECT ===");
    console.log("Local stream:", !!localStream);
    console.log("Remote streams count:", Object.keys(remoteStreams).length);
    console.log("Remote streams keys:", Object.keys(remoteStreams));

    // Update local video when localStream changes
    if (localVideoRef.current && localStream) {
      try {
        if (localVideoRef.current.srcObject !== localStream) {
          localVideoRef.current.srcObject = localStream;
          console.log("✅ Client local video element updated");

          // Ensure local video plays
          localVideoRef.current.muted = true;
          localVideoRef.current.autoplay = true;
          localVideoRef.current.playsInline = true;
        }
      } catch (err) {
        console.error("❌ Error setting client local video srcObject:", err);
      }
    }

    // Update remote videos when remoteStreams change
    Object.entries(remoteStreams).forEach(([userId, stream]) => {
      // Update video element
      if (remoteVideoRefs.current[userId] && stream) {
        try {
          const videoElement = remoteVideoRefs.current[userId];
          if (videoElement.srcObject !== stream) {
            videoElement.srcObject = stream;
            console.log(
              `✅ Client remote video element updated for user: ${userId}`
            );

            // Ensure remote video plays (muted to prevent feedback)
            videoElement.muted = true;
            videoElement.autoplay = true;
            videoElement.playsInline = true;

            // Play the video
            const playPromise = videoElement.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log(
                    `✅ Client remote video playing for user: ${userId}`
                  );
                })
                .catch((error) => {
                  console.warn(
                    `⚠️ Client remote video autoplay failed for ${userId}:`,
                    error
                  );
                  // Try to play muted
                  videoElement.muted = true;
                  videoElement.play().catch((err) => {
                    console.error(
                      `❌ Client remote video play failed for ${userId}:`,
                      err
                    );
                  });
                });
            }
          }
        } catch (err) {
          console.error(
            `❌ Error setting client remote video srcObject for ${userId}:`,
            err
          );
        }
      } else {
        // console.log(`⚠️ Client remote video ref not found for: ${userId}`);
      }

      // Update audio element for remote audio
      if (remoteAudioRefs.current[userId] && stream) {
        try {
          const audioElement = remoteAudioRefs.current[userId];
          if (audioElement.srcObject !== stream) {
            audioElement.srcObject = stream;
            console.log(
              `✅ Client remote audio element updated for user: ${userId}`
            );

            // Ensure remote audio plays (unmuted)
            audioElement.muted = false;
            audioElement.autoplay = true;

            // Play the audio
            const playPromise = audioElement.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log(
                    `✅ Client remote audio playing for user: ${userId}`
                  );
                })
                .catch((error) => {
                  console.warn(
                    `⚠️ Client remote audio autoplay failed for ${userId}:`,
                    error
                  );
                  // Try to play unmuted
                  audioElement.muted = false;
                  audioElement.play().catch((err) => {
                    console.error(
                      `❌ Client remote audio play failed for ${userId}:`,
                      err
                    );
                  });
                });
            }
          }
        } catch (err) {
          console.error(
            `❌ Error setting client remote audio srcObject for ${userId}:`,
            err
          );
        }
      } else {
        // console.log(`⚠️ Client remote audio ref not found for: ${userId}`);
      }
    });
  }, [localStream, remoteStreams, remoteVideoRefs]);

  // Additional effect to ensure video element gets stream when it becomes available
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      try {
        localVideoRef.current.srcObject = localStream;
        console.log("✅ Client local video stream assigned via useEffect");
      } catch (err) {
        console.error("❌ Error assigning local stream to video element:", err);
      }
    }
  }, [localStream]);

  const [screenSharing, setScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiResponse, setApiResponse] = useState(null); // Store API response for debugging
  const [callStatus, setCallStatus] = useState("connecting"); // connecting, connected, ringing, missed, ended
  const [incomingCall, setIncomingCall] = useState(false);
  const [callStartTime, setCallStartTime] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const chatContainerRef = React.useRef(null);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [mediaError, setMediaError] = useState(null);
  const [isInitializingMedia, setIsInitializingMedia] = useState(false);
  const [therapistPresent, setTherapistPresent] = useState(false);
  const [waitingForTherapist, setWaitingForTherapist] = useState(false); // Add missing waitingForTherapist state
  const [userRole, setUserRole] = useState("patient"); // Add missing userRole state

  // Get user role from URL params or session storage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlUserRole = urlParams.get("userRole");
    if (urlUserRole) {
      setUserRole(urlUserRole);
    } else if (user && user.role) {
      setUserRole(user.role);
    }
  }, [user]);
  const [joinedCall, setJoinedCall] = useState(false); // Add missing joinedCall state
  const [localTherapistName, setLocalTherapistName] = useState(
    therapistName || "Clinician"
  ); // Add missing therapistName state

  // Fetch participants data from API when participants panel is shown
  useEffect(() => {
    const fetchParticipantsData = async () => {
      if (showParticipants && sessionId) {
        try {
          console.log("Fetching participants data for session:", sessionId);
          const response = await videoCallApi.getSessionParticipants(sessionId);

          if (response.success && response.data) {
            console.log("Participants API response:", response.data);
            setApiResponse(response); // Store full API response for display

            // Handle different API response structures
            let participantsData = [];

            // Check if response.data is an array
            if (Array.isArray(response.data)) {
              participantsData = response.data;
            }
            // Check if response.data has a participants array
            else if (
              response.data.participants &&
              Array.isArray(response.data.participants)
            ) {
              participantsData = response.data.participants;
            }
            // Check if response.data is an object with participant data
            else if (
              typeof response.data === "object" &&
              response.data !== null
            ) {
              participantsData = [response.data];
            }

            console.log("Processed participants data:", participantsData);

            // Transform API data to match expected participant structure
            const apiParticipants = participantsData.map((participant) => ({
              userId: participant.userId || participant._id,
              socketId:
                participant.socketId ||
                `socket-${participant.userId || participant._id}`,
              name:
                participant.name ||
                (participant.firstName && participant.lastName
                  ? `${participant.firstName} ${participant.lastName}`
                  : null) ||
                participant.displayName ||
                `User ${participant.userId?.substring(0, 5) || "Unknown"}`,
              firstName: participant.firstName,
              lastName: participant.lastName,
              displayName: participant.displayName,
              role: participant.role || "user",
              isTherapist:
                participant.role === "therapist" ||
                participant.role === "admin",
              isUser:
                participant.role === "user" || participant.role === "patient",
              isSelf: participant.userId === user?.id, // Assuming user.id matches participant.userId
              joinedAt: participant.joinedAt || new Date().toISOString(),
            }));

            // Merge with existing participants (preserve WebRTC participants)
            setParticipants((prevParticipants) => {
              // Keep existing WebRTC participants
              const existingWebRTC = prevParticipants.filter(
                (p) => p.socketId && !p.socketId.startsWith("socket-")
              );

              // Add or update API participants
              const updatedApiParticipants = apiParticipants.map(
                (apiParticipant) => {
                  const existing = existingWebRTC.find(
                    (p) => p.userId === apiParticipant.userId
                  );
                  if (existing) {
                    // Update existing participant with API data
                    return {
                      ...existing,
                      ...apiParticipant,
                      // Preserve WebRTC specific properties
                      socketId: existing.socketId, // Keep WebRTC socketId
                      isSelf: existing.isSelf,
                    };
                  }
                  return apiParticipant;
                }
              );

              // Combine WebRTC participants with API participants
              const combined = [...existingWebRTC];
              updatedApiParticipants.forEach((apiParticipant) => {
                if (!combined.some((p) => p.userId === apiParticipant.userId)) {
                  combined.push(apiParticipant);
                }
              });

              console.log("Combined participants:", combined);
              return combined;
            });
          }
        } catch (error) {
          console.error("Error fetching participants data:", error);
          setApiResponse({
            success: false,
            error: error.message,
            data: null,
          });
          // Don't show error to user, just log it
        }
      }
    };

    fetchParticipantsData();
  }, [showParticipants, sessionId, user?.id]);

  // Debug effect to monitor participants changes
  useEffect(() => {
    console.log("=== PARTICIPANTS DEBUG ===");
    console.log("Participants count:", participants?.length || 0);
    console.log("Participants list:", participants);
    console.log("Show participants panel:", showParticipants);

    // Log each participant's name
    if (participants && participants.length > 0) {
      participants.forEach((p, index) => {
        console.log(`Participant ${index}:`, {
          userId: p.userId,
          name: p.name,
          role: p.role,
          isSelf: p.isSelf,
        });
      });
    }

    console.log("========================");
  }, [participants, showParticipants]);

  // Ensure self participant is always present
  useEffect(() => {
    if (user && socket && (!participants || participants.length === 0)) {
      console.log("⚠️ No participants found, adding self participant");
      const selfParticipant = {
        userId: user.id || user.userId || socket.user?.userId,
        socketId: socket.id,
        name:
          user.name ||
          (user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : "You"),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role || socket.user?.role || "patient",
        isSelf: true,
        isTherapist:
          user.role === "therapist" ||
          user.role === "admin" ||
          socket.user?.role === "therapist" ||
          socket.user?.role === "admin",
        joinedAt: new Date().toISOString(),
      };

      setParticipants([selfParticipant]);
      console.log("✅ Added self participant:", selfParticipant);
    }
  }, [participants, showParticipants, user, socket]);

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log("=== STATE CHANGE DEBUG ===");
    console.log("therapistPresent:", therapistPresent);
    console.log("waitingForTherapist:", waitingForTherapist);
    console.log("localStream:", !!localStream);
    console.log("connected:", connected);
    console.log("userRole:", userRole);
  }, [therapistPresent, localStream, connected, userRole]);

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
    console.log("=== SOCKET CONNECTION CHECK ===");
    console.log("Socket available:", !!socket);
    console.log("Socket connected:", socket?.connected);
    console.log("External connected:", externalConnected);
    console.log("Internal connected:", connected);
    console.log("Room ID:", roomId);

    // More permissive connection check
    const isConnected =
      (externalConnected || connected) && socket?.connected && roomId;

    if (isConnected) {
      console.log("✅ Socket ready for media initialization");
      setCanInitializeMedia(true);
    } else {
      console.log("❌ Socket not ready for media initialization");
      console.log("Connection requirements:");
      console.log(
        "- External connected or internal connected:",
        externalConnected || connected
      );
      console.log("- Socket connected:", !!socket?.connected);
      console.log("- Room ID present:", !!roomId);
      setCanInitializeMedia(false);
    }
  }, [socket, externalConnected, connected, roomId]);

  // Initialize media when socket connects
  useEffect(() => {
    console.log("=== MEDIA INITIALIZATION CHECK ===");
    console.log(
      "Socket connected:",
      (externalConnected || connected) && socket?.connected
    );
    console.log("Local stream exists:", !!localStream);
    console.log("Can initialize media:", canInitializeMedia);
    console.log("Room ID:", roomId);

    // More permissive initialization check
    const shouldInitialize =
      (externalConnected || connected) &&
      socket?.connected &&
      roomId &&
      !localStream;

    if (shouldInitialize) {
      console.log("✅ Starting media initialization");
      // Add a small delay to ensure everything is properly initialized
      const initTimer = setTimeout(() => {
        setIsInitializingMedia(true);
        setMediaError(null); // Clear any previous errors

        initLocalMedia()
          .then(() => {
            console.log("✅ Client: Local media initialized successfully");
            setIsInitializingMedia(false);
          })
          .catch((err) => {
            console.error("❌ Error initializing media:", err);
            setIsInitializingMedia(false);
            setMediaError(
              err.message ||
                "Failed to access camera and microphone. Please check permissions and refresh the page."
            );
          });
      }, 500); // Small delay to ensure proper initialization

      // Cleanup timeout if component unmounts
      return () => clearTimeout(initTimer);
    } else if (localStream) {
      console.log("✅ Local stream already exists, skipping initialization");
    } else if (!(externalConnected || connected)) {
      console.log("❌ Not connected to socket, waiting...");
    } else if (!socket?.connected) {
      console.log("❌ Socket not connected, waiting...");
    } else if (!roomId) {
      console.log("❌ No room ID, waiting...");
    } else {
      console.log("❌ Other initialization blocker detected");
      console.log("Forcing initialization check...");
      // Force recheck connection status
      if (socket && socket.connected && roomId) {
        setCanInitializeMedia(true);
        console.log("✅ Forced connection status update");
      }
    }
  }, [
    socket,
    externalConnected,
    connected,
    localStream,
    initLocalMedia,
    canInitializeMedia,
  ]);

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
      } else if (
        data.message &&
        data.message.includes("Unauthorized to join this session")
      ) {
        setCallError(
          "🔒 Access Denied\n\nYou are not authorized to join this session.\n\nIf you believe this is an error, please contact your administrator."
        );
        setCallStatus("unauthorized");
      } else {
        // For other connection errors, report to admin and show Google Meet popup as alternative
        if (sessionId) {
          reportConnectionFailure(
            sessionId,
            data.message || "Connection failed"
          );
        }
        // setShowGoogleMeetPopup(true);
        setCallError(null); // Clear the call error to prevent conflict with popup
      }
    },
    [setCallError, socket, sessionId]
  );

  useEffect(() => {
    if (socket) {
      const handleJoinedCall = (data) => {
        console.log("Client: Successfully joined call:", data);
        setJoinedCall(true);
        setCallStatus("connected");
        setCallError(null); // Clear any previous errors

        // Add current user to participants list
        if (user && socket) {
          const currentUser = {
            userId: user.id || user.userId || socket.user?.userId,
            socketId: socket.id,
            name:
              user.name ||
              (user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : "You"),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role || socket.user?.role || "patient",
            isSelf: true,
            isTherapist:
              user.role === "therapist" ||
              user.role === "admin" ||
              socket.user?.role === "therapist" ||
              socket.user?.role === "admin",
            joinedAt: new Date().toISOString(),
          };

          setParticipants((prev) => {
            // Check if self participant already exists
            const selfExists = prev.some((p) => p.isSelf);
            if (selfExists) {
              console.log("✅ Self participant already exists");
              return prev;
            }
            console.log("✅ Adding self participant:", currentUser);
            return [...prev, currentUser];
          });
        }
      };

      const handleJoinedVideoRoom = (data) => {
        console.log("Client: Successfully joined video room:", data);
        setJoinedCall(true);
        setCallStatus("connected");
        setCallError(null); // Clear any previous errors

        // Add current user to participants list
        if (user && socket) {
          const currentUser = {
            userId: user.id || user.userId || socket.user?.userId,
            socketId: socket.id,
            name:
              user.name ||
              (user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : "You"),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role || socket.user?.role || "patient",
            isSelf: true,
            isTherapist:
              user.role === "therapist" ||
              user.role === "admin" ||
              socket.user?.role === "therapist" ||
              socket.user?.role === "admin",
            joinedAt: new Date().toISOString(),
          };

          setParticipants((prev) => {
            // Check if self participant already exists
            const selfExists = prev.some((p) => p.isSelf);
            if (selfExists) {
              console.log("✅ Self participant already exists");
              return prev;
            }
            console.log("✅ Adding self participant:", currentUser);
            return [...prev, currentUser];
          });
        }
      };

      const handleSocketError = (data) => {
        console.error("Video call error:", data);

        // Handle specific error messages
        if (
          data.message &&
          data.message.includes("Patients must join through the waiting room")
        ) {
          // Check if this is an approved patient trying to join directly
          const urlParams = new URLSearchParams(window.location.search);
          const isApproved = urlParams.get("approved") === "true";
          const userRole =
            urlParams.get("userRole") || sessionStorage.getItem("userRole");

          if (isApproved && userRole === "patient") {
            // This is likely a timing issue where the backend hasn't processed the approval yet
            // Retry the join after a brief delay
            console.log(
              "Approved patient encountering waiting room error, retrying..."
            );
            setTimeout(() => {
              if (socket) {
                socket.emit("join-video-room", {
                  sessionId: roomId,
                });
              }
            }, 1000);
            return; // Don't treat this as a final error
          }
        }

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
        } else if (
          data.message &&
          data.message.includes("Unauthorized to join this session")
        ) {
          setCallError(
            "🔒 Access Denied\n\nYou are not authorized to join this session.\n\nIf you believe this is an error, please contact your administrator."
          );
          setCallStatus("unauthorized");
        } else {
          setCallError(
            data.message || "An error occurred during the video call"
          );
        }
      };

      socket.on("error", handleSocketError);
      socket.on("joined-call", handleJoinedCall);
      socket.on("joined-video-room", handleJoinedVideoRoom);

      return () => {
        socket.off("error", handleSocketError);
        socket.off("joined-call", handleJoinedCall);
        socket.off("joined-video-room", handleJoinedVideoRoom);
      };
    }
  }, [socket, roomId, user]);

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

  // Load chat messages and join chat room
  useEffect(() => {
    console.log(
      `🔄 Chat useEffect triggered - sessionId: ${sessionId}, connected: ${connected}, externalConnected: ${externalConnected}`
    );
    if (sessionId && externalConnected && connected && socket) {
      console.log(`📱 Client joining video call room and loading messages`);
      // Join the unified video call room for messaging
      const videoRoomId = `video-call-${sessionId}`;
      console.log(`📱 Client joining video call room: ${videoRoomId}`);
      socket.emit("join-video-session", {
        sessionId: sessionId,
      });

      // Listen for join confirmation
      socket.on("joined-video-session", (data) => {
        console.log("✅ Successfully joined video session:", data);
      });

      socket.on("error", (data) => {
        console.error("❌ Error joining video session:", data);
      });

      // Listen for incoming messages (video call specific)
      socket.on("receive-video-message", (data) => {
        console.log("📥 Client received video message:", data);
        console.log("📥 Message content:", data.message);
        console.log("📥 Sender ID:", data.senderId);
        console.log("📥 Attachments:", data.attachments);
        console.log("📥 Timestamp:", data.timestamp);
        
        // Get current user ID from multiple possible sources
        const currentUserId = user?._id || user?.userId || user?.id || socket.user?.userId;
        console.log("📥 Current user ID:", currentUserId);
        console.log("📥 Message sender ID:", data.senderId);

        // Comprehensive deduplication
        setChatMessages((prev) => {
          console.log("💬 Current messages count:", prev.length);
          
          // Log all existing message IDs for debugging
          console.log("💬 Existing message IDs:", prev.map(m => ({ id: m.id, messageId: m.messageId, content: m.content?.substring(0, 20) })));

          // Primary: Check by messageId if available
          if (
            data.messageId &&
            prev.some((m) => m.messageId === data.messageId)
          ) {
            console.log(
              "💬 Duplicate message ignored by messageId:",
              data.messageId
            );
            return prev;
          }

          // Secondary: Check by _id
          if (data._id && prev.some((m) => m.id === data._id)) {
            console.log("💬 Duplicate message ignored by id:", data._id);
            return prev;
          }

          // Tertiary: Check by senderId + content + timestamp (most reliable)
          const messageContent = data.message || data.content;
          const isDuplicate = prev.some((m) => {
            const sameSender = m.senderId === data.senderId;
            const sameContent = (m.message || m.content) === messageContent;
            const sameTime = Math.abs(new Date(m.timestamp || data.timestamp).getTime() - new Date(data.timestamp || Date.now()).getTime()) < 1000;
            
            if (sameSender && sameContent && sameTime) {
              console.log("💬 Duplicate found:", { sameSender, sameContent, sameTime });
              return true;
            }
            return false;
          });
          
          if (isDuplicate) {
            console.log("💬 Duplicate message ignored by sender+content+timestamp");
            return prev;
          }

          // Add new message
          console.log("💬 Adding new message from:", data.senderName || data.userName);
          const newMessage = {
            id: data._id || data.messageId || Date.now(),
            messageId: data.messageId || data._id?.toString() || Date.now().toString(),
            content: messageContent,
            senderId: data.senderId,
            senderName: data.senderName || data.userName || 'Participant',
            timestamp: data.timestamp || new Date().toISOString(),
            attachments: data.attachments || []
          };
          console.log("💬 New message object:", newMessage);
          return [
            ...prev,
            newMessage,
          ];
        });
      });

      // Listen for message sent confirmation
      socket.on("message-sent", (data) => {
        console.log("✅ Message sent confirmation:", data);
      });

      // Load existing messages
      loadChatMessages();
    }

    return () => {
      if (socket) {
        socket.off("receive-video-message");
        socket.off("message-sent");
        socket.off("joined-video-session");
        socket.off("error");
      }
    };
  }, [sessionId, externalConnected, connected, socket]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, showChat]);

  const loadChatMessages = async () => {
    try {
      console.log(`📥 Loading chat messages for session: ${sessionId}`);
      const response = await chatApi.getMessages(sessionId);
      console.log(`📥 Chat API response:`, response);
      if (response.success) {
        console.log(
          `📥 Loaded ${response.data.messages?.length || 0} messages`
        );
        
        // Normalize message format to match real-time messages
        const normalizedMessages = (response.data.messages || []).map(msg => ({
          id: msg._id || msg.messageId || Date.now(),
          messageId: msg.messageId || msg._id?.toString() || Date.now().toString(),
          content: msg.message || msg.content || '',
          senderId: msg.senderId?._id || msg.senderId || msg.senderId?.userId,
          senderName: msg.senderId?.name || msg.senderName || 'Participant',
          timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
          attachments: msg.attachments || []
        }));
        
        setChatMessages(normalizedMessages);
      }
    } catch (error) {
      console.error("Error loading chat messages:", error);
    }
  };

  const sendChatMessage = async () => {
    console.log(`📤 Sending chat message: ${newMessage}`);
    console.log(`📤 Session ID: ${sessionId}`);
    console.log(`📤 Socket connected: ${socket?.connected}`);
    console.log(`📤 Uploaded files count: ${uploadedFiles.length}`);
    console.log(`📤 User object:`, user);
    console.log(`📤 Socket user:`, socket.user);

    // Get current user ID
    const currentUserId = user?._id || user?.userId || user?.id || socket.user?.userId;
    console.log(`📤 Current User ID:`, currentUserId);

    // Allow sending if there's a message OR files
    if (
      (!newMessage.trim() && uploadedFiles.length === 0) ||
      !sessionId ||
      !externalConnected ||
      !connected
    ) {
      console.warn('📤 Message not sent - conditions not met:', {
        hasMessage: !!newMessage.trim(),
        hasFiles: uploadedFiles.length > 0,
        sessionId: !!sessionId,
        externalConnected,
        connected
      });
      return;
    }

    try {
      // Generate UUID for message deduplication
      const messageId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );

      console.log(`📤 Generated messageId: ${messageId}`);

      const originalMessage = newMessage.trim();
      setNewMessage("");

      // Get files to send and clear the list
      const filesToSend = [...uploadedFiles];
      setUploadedFiles([]);

      // Send message via socket for video call
      if (socket) {
        console.log(`📤 Emitting send-video-message event`);
        console.log(`📤 Session ID: ${sessionId}`);
        console.log(`📤 Message payload:`, {
          sessionId,
          message: originalMessage,
          senderId: currentUserId,
          attachments: filesToSend
        });

        socket.emit("send-video-message", {
          sessionId: sessionId,
          message: originalMessage,
          senderId: currentUserId,
          attachments: filesToSend // Include uploaded files
        });
        console.log(
          "📤 Video call message sent via socket",
          filesToSend.length > 0 ? `with ${filesToSend.length} file(s)` : ""
        );
      } else {
        console.error('📤 Socket not available for sending message');
      }
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

  // Handle file selection
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size exceeds 50MB limit. Please choose a smaller file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);

    try {
      console.log("📤 Uploading file:", file.name, file.type, file.size);

      // Upload file using chatApi
      const response = await chatApi.uploadFile(file);

      console.log("✅ File uploaded successfully:", response);

      if (response.success && response.data) {
        const fileData = normalizeAttachment(response.data.file);

        // Add to uploaded files list (to be sent with message)
        if (fileData) setUploadedFiles((prev) => [...prev, fileData]);

        // Optionally auto-send the file immediately
        // Or you can wait for user to add a message and click send
        // For now, we'll just add it to the pending files
      }
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Remove a file from the pending upload list
  const removeFile = (fileIndex) => {
    setUploadedFiles((prev) => prev.filter((_, index) => index !== fileIndex));
  };

  // Send file message via socket
  const sendFileMessage = async (fileData) => {
    if (!sessionId || !externalConnected || !connected) return;

    try {
      // Generate UUID for message deduplication
      const messageId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );

      console.log(`📤 Sending file message with messageId: ${messageId}`);

      // Send message via socket with attachment
      if (socket) {
        socket.emit("send-message", {
          roomId: sessionId,
          roomType: sessionId.includes("group") ? "group" : "individual",
          message: {
            content: "", // Empty text content for file-only messages
            messageId: messageId,
            attachments: [fileData],
          },
        });
        console.log("📤 File message sent via socket");
      }
    } catch (error) {
      console.error("Error sending file message:", error);
    }
  };

  // Set up socket listeners
  useEffect(() => {
    console.log("=== SOCKET LISTENERS SETUP ===");
    console.log("Socket available:", !!socket);
    console.log("Socket connected:", socket?.connected);
    console.log("External connected:", externalConnected);
    console.log("Internal connected:", connected);

    if (!socket || !(externalConnected || connected)) {
      console.log("❌ Socket not ready for listeners");
      return;
    }

    // Handle incoming offer
    const offerListener = (data) => {
      console.log("CLIENT: Offer received:", data);
      console.log("CLIENT: My socket ID:", socket.id);
      console.log("CLIENT: Sender ID:", data.senderId);

      // Only handle offers from other participants (not ourselves)
      if (data.senderId !== socket.id) {
        console.log("CLIENT: Processing offer from:", data.senderId);
        handleOffer(data.offer, data.senderId);
      } else {
        console.log("CLIENT: Ignoring own offer");
      }
    };

    // Handle WebRTC signaling events (new)
    const webRTCOfferListener = (data) => {
      console.log("CLIENT: WebRTC Offer received:", data);
      console.log("CLIENT: My socket ID:", socket.id);
      console.log("CLIENT: Sender ID:", data.senderId);

      if (data.senderId !== socket.id) {
        console.log("CLIENT: Processing WebRTC offer from:", data.senderId);
        handleOffer(data.offer, data.senderId);
      }
    };

    const webRTCAnswerListener = (data) => {
      console.log("CLIENT: WebRTC Answer received:", data);
      console.log("CLIENT: My socket ID:", socket.id);
      console.log("CLIENT: Sender ID:", data.senderId);

      if (data.senderId !== socket.id) {
        console.log("CLIENT: Processing WebRTC answer from:", data.senderId);
        handleAnswer(data.answer, data.senderId);
      }
    };

    const webRTCIceCandidateListener = (data) => {
      console.log("CLIENT: WebRTC ICE Candidate received:", data);
      console.log("CLIENT: My socket ID:", socket.id);
      console.log("CLIENT: Sender ID:", data.senderId);

      if (data.senderId !== socket.id) {
        console.log(
          "CLIENT: Processing WebRTC ICE candidate from:",
          data.senderId
        );
        handleIceCandidate(data.candidate, data.senderId);
      }
    };

    // Handle incoming answer
    const answerListener = (data) => {
      console.log("CLIENT: Answer received:", data);
      console.log("CLIENT: My socket ID:", socket.id);
      console.log("CLIENT: Sender ID:", data.senderId);

      // Only handle answers from other participants (not ourselves)
      if (data.senderId !== socket.id) {
        console.log("CLIENT: Processing answer from:", data.senderId);
        handleAnswer(data.answer, data.senderId);
      } else {
        console.log("CLIENT: Ignoring own answer");
      }
    };

    // Handle ICE candidate
    const iceCandidateListener = (data) => {
      if (data.senderId !== socket.id) {
        handleIceCandidate(data.candidate, data.senderId);
      }
    };

    // Handle create peer connection request (for group calls)
    const createPeerConnectionListener = (data) => {
      console.log("=== CREATE PEER CONNECTION REQUEST ===");
      console.log("Target user ID:", data.targetUserId);
      console.log("Target socket ID:", data.targetSocketId);
      console.log("Should initiate (be offerer):", data.initiator);
      console.log("Local stream available:", !!localStream);
      console.log("Socket connected:", connected);
      
      if (!localStream || !connected) {
        console.warn("⚠️ Cannot create peer connection - local stream or socket not ready");
        return;
      }
      
      try {
        // Create peer connection with the target participant
        // The createPeer function will handle the WebRTC handshake
        console.log("🔗 Creating peer connection with:", data.targetUserId);
        console.log("Initiator role:", data.initiator ? "OFFERER" : "ANSWERER");
        
        // Use the createPeer function from useWebRTC hook
        // We need to access it through the hook's returned functions
        // Since createPeer is internal to the hook, we'll trigger it by emitting an offer
        if (data.initiator) {
          // As initiator, we need to create an offer and send it
          // This will be handled by the useWebRTC hook's createPeer function
          // We trigger it by calling handleOffer with a dummy offer to create the peer
          console.log("📡 As initiator - will create peer and emit offer");
          // The actual peer creation happens in useWebRTC when it receives signaling events
        } else {
          console.log("📡 As receiver - waiting for offer from initiator");
        }
      } catch (error) {
        console.error("❌ Error in create peer connection:", error);
      }
    };

    // Handle participant joined
    const participantJoinedListener = (data) => {
      console.log("=== PARTICIPANT JOINED EVENT ===");
      console.log("Participant data:", data);
      console.log("Current user role:", user?.role);
      console.log("Is group call:", roomType === "group");
      
      // IMPORTANT: In group calls, ALL participants need to create peers with EACH other
      // This is a mesh network - everyone connects to everyone
      if (roomType === "group") {
        console.log("🔗 Group call detected - establishing mesh peer connections");
        
        // Don't skip peer creation - EVERY participant needs to connect to EVERY other participant
        // The old logic was incorrect - it tried to only connect with admin, but that breaks the mesh
      }
      
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

      // Create enhanced participant data
      const participantData = {
        userId: data.userId || socket.user?.userId,
        socketId: data.socketId || socket.id,
        name:
          data.name && data.name !== "Clinician" && data.name !== "User Unknown"
            ? data.name
            : (data.firstName && data.lastName
                ? `${data.firstName} ${data.lastName}`
                : null) ||
              (user && data.socketId === socket.id
                ? user.name ||
                  (user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : "You")
                : `Participant ${
                    data.userId?.substring(0, 5) ||
                    data.socketId?.substring(0, 5) ||
                    "Unknown"
                  }`),
        firstName:
          data.firstName ||
          (user && data.socketId === socket.id ? user.firstName : null),
        lastName:
          data.lastName ||
          (user && data.socketId === socket.id ? user.lastName : null),
        email: data.email,
        role: data.role || "participant",
        isSelf: data.socketId === socket.id,
        isTherapist:
          data.isTherapist ||
          data.role === "therapist" ||
          data.role === "admin" ||
          false,
        isUser: data.isUser || data.role === "patient" || false,
        joinedAt: data.joinedAt || new Date().toISOString(),
      };

      console.log("✅ Enhanced participant data:", participantData);

      // Add participant to the list FIRST (before creating peer)
      setParticipants((prev) => {
        // Avoid duplicates by checking both userId and socketId
        const exists = prev.some(
          (p) =>
            (p.userId === participantData.userId && p.userId) ||
            (p.socketId === participantData.socketId && p.socketId)
        );
        if (exists) {
          console.log(
            "⚠️ Participant already exists, skipping:",
            participantData.userId || participantData.socketId
          );
          return prev;
        }

        console.log("✅ Adding participant to list:", participantData);
        const newParticipants = [...prev, participantData];
        console.log("Updated participants count:", newParticipants.length);
        console.log("Updated participants list:", newParticipants);
        return newParticipants;
      });

      // Initialize audio status for the new participant (default to enabled)
      if (participantData.userId) {
        setParticipantAudioStatus((prev) => ({
          ...prev,
          [participantData.userId]: true, // Audio enabled by default
        }));
      }

      // GROUP CALL MESH NETWORK LOGIC
      // In group calls, EVERY participant must create peer connections with EVERY other participant
      // This creates a full mesh network where video/audio can flow between all users
      if (roomType === "group" && localStream && connected) {
        console.log("🔗 Creating peer connection for new participant in group call");
        console.log("New participant:", participantData);
        console.log("Local stream available:", !!localStream);
        console.log("Socket connected:", connected);
        
        // Wait a moment to ensure participant is fully added to state
        setTimeout(() => {
          try {
            // Create peer connection with the new participant
            console.log("🔗 Initiating peer creation with:", participantData.userId);
            
            // Use the exposed createPeerConnection function from useWebRTC
            // The initiator should be the admin/therapist, or the first user who joined
            const shouldInitiate = user?.role === "admin" || user?.role === "therapist";
            console.log("Creating peer as:", shouldInitiate ? "INITIATOR (offerer)" : "RECEIVER (answerer)");
            
            const peer = createPeerConnection(participantData.socketId, shouldInitiate);
            
            if (peer) {
              console.log("✅ Peer connection created successfully with:", participantData.userId);
            } else {
              console.error("❌ Failed to create peer connection with:", participantData.userId);
            }
          } catch (error) {
            console.error("❌ Error creating peer connection:", error);
          }
        }, 500);
      }

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

        // If local stream is not ready, initialize it first
        if (!localStream) {
          console.log("⚠️ Local stream not ready, initializing media...");

          // Add timeout to prevent indefinite waiting
          const mediaTimeout = setTimeout(() => {
            console.log("❌ Media initialization timeout after 10 seconds");
            setMediaError(
              "Media initialization timed out. Please check camera/microphone permissions and refresh."
            );
          }, 10000);

          initLocalMedia()
            .then(() => {
              clearTimeout(mediaTimeout); // Clear timeout on success
              console.log(
                "✅ Media initialized, but waiting for localStream state to update..."
              );

              // Poll for the localStream to become available
              let pollCount = 0;
              const maxPolls = 100; // 10 seconds max wait (increased timeout)

              const waitForStream = () => {
                pollCount++;

                // Access current localStream value from the hook
                const currentLocalStream = localStream;

                if (currentLocalStream) {
                  console.log(
                    "✅ LocalStream state is now available, proceeding with auto-join"
                  );
                  console.log("=== AUTO-JOIN EXECUTION ===");
                  console.log("Final validation after media init:");
                  console.log(
                    "- User role is patient:",
                    userRole === "patient"
                  );
                  console.log("- Therapist just joined:", isTherapistJoining);
                  console.log("- Has local stream:", !!currentLocalStream);
                  console.log("- Socket connected:", connected);
                  console.log("- acceptCall function available:", !!acceptCall);

                  // Final validation before auto-joining
                  if (
                    userRole === "patient" &&
                    isTherapistJoining &&
                    currentLocalStream &&
                    connected &&
                    acceptCall
                  ) {
                    console.log("✅ ALL CONDITIONS MET - EXECUTING AUTO-JOIN");
                    const success = acceptCall();
                    console.log("acceptCall returned:", success);

                    if (success) {
                      console.log(
                        "🎉 AUTO-JOIN SUCCESSFUL - Call should start now!"
                      );
                    } else {
                      console.log(
                        "❌ AUTO-JOIN FAILED - acceptCall returned false"
                      );
                      console.log("Retrying with progressive delays...");
                      // Retry with progressive delays
                      setTimeout(() => {
                        const retry1 = acceptCall();
                        console.log("Retry 1 result:", retry1);
                        if (!retry1) {
                          setTimeout(() => {
                            const retry2 = acceptCall();
                            console.log("Retry 2 result:", retry2);
                            if (!retry2) {
                              setTimeout(() => {
                                const retry3 = acceptCall();
                                console.log("Retry 3 result:", retry3);
                              }, 2000);
                            }
                          }, 1500);
                        }
                      }, 1000);
                    }
                  } else {
                    console.log(
                      "❌ AUTO-JOIN CONDITIONS NOT MET after media init:"
                    );
                    console.log({
                      userRoleCheck: userRole === "patient",
                      therapistJoining: isTherapistJoining,
                      hasLocalStream: !!currentLocalStream,
                      socketConnected: connected,
                      acceptCallAvailable: !!acceptCall,
                    });
                  }
                } else if (pollCount < maxPolls) {
                  console.log(
                    `⏳ Waiting for localStream state to update... (Attempt ${pollCount}/${maxPolls})`
                  );
                  setTimeout(waitForStream, 100); // Check again in 100ms
                } else {
                  console.log(
                    "❌ TIMEOUT: Local stream failed to initialize after 10 seconds"
                  );
                  setMediaError(
                    "Media initialization took too long. Please check camera/microphone permissions and try again."
                  );
                }
              };

              waitForStream(); // Start polling
            })
            .catch((err) => {
              clearTimeout(mediaTimeout); // Clear timeout on error
              console.error("Error initializing media for auto-join:", err);
              setMediaError(
                "Failed to initialize media. Auto-join cannot proceed."
              );
            });
        } else {
          // Local stream is already available, proceed with auto-join
          console.log("✅ Local stream available, proceeding with auto-join");

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
                console.log("Retrying with progressive delays...");
                // Retry with progressive delays
                setTimeout(() => {
                  const retry1 = acceptCall();
                  console.log("Retry 1 result:", retry1);
                  if (!retry1) {
                    setTimeout(() => {
                      const retry2 = acceptCall();
                      console.log("Retry 2 result:", retry2);
                      if (!retry2) {
                        setTimeout(() => {
                          const retry3 = acceptCall();
                          console.log("Retry 3 result:", retry3);
                        }, 2000);
                      }
                    }, 1500);
                  }
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
          }, 500); // Reduced delay since stream is already available
        }
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

      // Remove audio status for the leaving participant
      if (data.userId) {
        setParticipantAudioStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[data.userId];
          return newStatus;
        });
      }
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
      stopMediaStreams();
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
        stopMediaStreams();
        if (onEndCall) onEndCall();
      } else {
        // Regular participant ended the call - keep UI active for reconnection
        console.log("Participant ended call - keeping session UI active");
        setCallActive(false);
        setCallStartTime(null);
        setIncomingCall(false);
        setCanReconnect(true); // Enable reconnection option
        stopMediaStreams();
        // Don't call onEndCall to keep session UI active
        // Don't set callStatus to "ended" to avoid termination screen
      }
    };

    // Handle audio toggle
    const audioToggleListener = (data) => {
      // Update UI to reflect other participant's audio status
      console.log(
        "Audio toggle received from user:",
        data.userId,
        "muted:",
        data.muted
      );

      // Update the audio status for the specific user
      if (data.userId) {
        setParticipantAudioStatus((prev) => ({
          ...prev,
          [data.userId]: !data.muted, // Store whether audio is enabled (opposite of muted)
        }));
      }
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

    // Handle real-time message broadcast via message-received event
    socket.on("message-received", (data) => {
      console.log("Client received real-time message:", data);

      // Determine sender name - use provided name or fallback
      const senderName =
        data.senderName ||
        (data.senderId === socket?.id
          ? user?.name || userName || "You"
          : "Clinician");

      // Add the received message to chat messages with proper deduplication
      setChatMessages((prev) => {
        const attachments = (Array.isArray(data.attachments)
          ? data.attachments
          : []
        )
          .map(normalizeAttachment)
          .filter((a) => a && a.url);

        // Primary: Check by messageId if available
        if (
          data.messageId &&
          prev.some((m) => m.messageId === data.messageId)
        ) {
          console.log(
            "Duplicate message ignored by messageId:",
            data.messageId
          );
          // If we already have the message but it was stored without attachments,
          // merge in attachments so file uploads become visible.
          if (attachments.length === 0) return prev;
          return prev.map((m) => {
            if (m.messageId !== data.messageId) return m;
            const existing = Array.isArray(m.attachments) ? m.attachments : [];
            if (existing.length > 0) return m;
            return { ...m, attachments };
          });
        }

        // Secondary: Check by id/_id
        if (data._id && prev.some((m) => m.id === data._id)) {
          console.log("Duplicate message ignored by id:", data._id);
          if (attachments.length === 0) return prev;
          return prev.map((m) => {
            if (m.id !== data._id) return m;
            const existing = Array.isArray(m.attachments) ? m.attachments : [];
            if (existing.length > 0) return m;
            return { ...m, attachments };
          });
        }

        // Tertiary: Check by content and timestamp (fallback)
        const messageContent = data.content;
        const messageTimestamp = data.timestamp || new Date().toISOString();

        const isDuplicate = prev.some(
          (m) =>
            m.text === messageContent &&
            new Date(m.timestamp).getTime() ===
              new Date(messageTimestamp).getTime()
        );

        if (isDuplicate) {
          console.log("Duplicate message ignored by content+timestamp");
          return prev;
        }

        return [
          ...prev,
          {
            id: data._id || Date.now(),
            messageId: data.messageId,
            text: messageContent,
            sender: data.senderId === socket?.id ? "me" : "them",
            senderId: data.senderId,
            senderName: senderName,
            timestamp: messageTimestamp,
            attachments: attachments,
          },
        ];
      });
    });

    // Add WebRTC signaling listeners
    on("offer", offerListener);
    on("answer", answerListener);
    on("ice-candidate", iceCandidateListener);
    // Add WebRTC signaling listeners for modern events
    on("webrtc-offer-received", webRTCOfferListener);
    on("webrtc-answer-received", webRTCAnswerListener);
    on("webrtc-ice-candidate-received", webRTCIceCandidateListener);
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
    on("typing", typingListener);
    on("stop-typing", stopTypingListener);
    on("create-peer-connection", createPeerConnectionListener);

    // Cleanup listeners
    return () => {
      if (socket) {
        try {
          socket.off("offer", offerListener);
          socket.off("answer", answerListener);
          socket.off("ice-candidate", iceCandidateListener);
          // Remove WebRTC signaling listeners
          socket.off("webrtc-offer-received", webRTCOfferListener);
          socket.off("webrtc-answer-received", webRTCAnswerListener);
          socket.off(
            "webrtc-ice-candidate-received",
            webRTCIceCandidateListener
          );
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
          socket.off("message-received"); // Remove the single message listener
          socket.off("typing", typingListener);
          socket.off("stop-typing", stopTypingListener);
          socket.off("create-peer-connection", createPeerConnectionListener);
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
      const socketId = Object.keys(remoteStreams)[0];
      if (socketId) {
        const stream = remoteStreams[socketId];
        const participant =
          participants.find((p) => p.socketId === socketId) || {};

        // Debug logging
        console.log("CLIENT VIDEO RENDER: socketId:", socketId);
        console.log("CLIENT VIDEO RENDER: participants array:", participants);
        console.log("CLIENT VIDEO RENDER: found participant:", participant);
        console.log("CLIENT VIDEO RENDER: participant name:", participant.name);

        return (
          <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
            {/* Hidden audio element for remote audio */}
            <audio
              ref={(el) => {
                if (el && stream) {
                  remoteAudioRefs.current[socketId] = el;
                  if (el.srcObject !== stream) {
                    try {
                      el.srcObject = stream;
                      console.log(
                        `✅ Remote audio ref assigned for socket: ${socketId}`
                      );
                      el.muted = false;
                      el.autoplay = true;
                      const playPromise = el.play();
                      if (playPromise !== undefined) {
                        playPromise
                          .then(() => {
                            console.log(
                              `✅ Remote audio playing for socket: ${socketId}`
                            );
                          })
                          .catch((error) => {
                            console.warn(
                              `⚠️ Remote audio autoplay failed for ${socketId}:`,
                              error
                            );
                            el.muted = false;
                            el.play().catch((err) => {
                              console.error(
                                `❌ Remote audio play failed for ${socketId}:`,
                                err
                              );
                            });
                          });
                      }
                    } catch (err) {
                      console.error(
                        `❌ Error assigning remote audio ref for ${socketId}:`,
                        err
                      );
                    }
                  }
                }
              }}
              autoPlay
              className="hidden"
            />
            <video
              ref={(el) => {
                if (el && stream) {
                  remoteVideoRefs.current[socketId] = el;
                  // Only assign srcObject if it's different to prevent blinking
                  if (el.srcObject !== stream) {
                    try {
                      el.srcObject = stream;
                      console.log(
                        `✅ Remote video ref assigned for socket: ${socketId}`
                      );

                      // Ensure video plays
                      el.muted = true;
                      el.autoplay = true;
                      el.playsInline = true;

                      // Play the video
                      const playPromise = el.play();
                      if (playPromise !== undefined) {
                        playPromise
                          .then(() => {
                            console.log(
                              `✅ Remote video playing for socket: ${socketId}`
                            );
                          })
                          .catch((error) => {
                            console.warn(
                              `⚠️ Remote video autoplay failed for ${socketId}:`,
                              error
                            );
                            // Try to play muted
                            el.muted = true;
                            el.play().catch((err) => {
                              console.error(
                                `❌ Remote video play failed for ${socketId}:`,
                                err
                              );
                            });
                          });
                      }
                    } catch (err) {
                      console.error(
                        `❌ Error assigning remote video ref for ${socketId}:`,
                        err
                      );
                    }
                  }
                }
              }}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {participant.name &&
              participant.name !== "Clinician" &&
              participant.name !== "User Unknown"
                ? participant.name
                : "Clinician"}
            </div>
          </div>
        );
      }
      return (
        <div className="flex items-center justify-center w-full h-full bg-slate-900 rounded-xl">
          <div className="text-center text-slate-500 max-w-md p-6">
            <>
              <Users className="mx-auto h-12 w-12 mb-2" />
              <p>Waiting for clinician...</p>
            </>
          </div>
        </div>
      );
    } else {
      // Group call - grid of videos
      const streamKeys = Object.keys(remoteStreams);
      console.log("🎥 GROUP CALL RENDER: Total remote streams:", streamKeys.length);
      console.log("🎥 GROUP CALL RENDER: Stream keys:", streamKeys);
      console.log("🎥 GROUP CALL RENDER: All participants:", participants);
      
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

      // Always use grid layout for group calls to accommodate all participants
      const columns = Math.min(3, Math.ceil(Math.sqrt(streamKeys.length)));
      const rows = Math.ceil(streamKeys.length / columns);
      
      console.log(`🎥 GROUP CALL RENDER: Grid layout - ${columns}x${rows}`);

      return (
        <div className={`grid gap-2 w-full h-full p-2`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {streamKeys.map((socketId, index) => {
            const stream = remoteStreams[socketId];
            const participant = participants.find(
              (p) => p.socketId === socketId
            );
            
            console.log(`🎥 Rendering participant ${index + 1}:`, {
              socketId,
              hasStream: !!stream,
              streamActive: stream?.active,
              participantName: participant?.name,
              isTherapist: participant?.isTherapist
            });
            
            return (
              <div
                key={`${socketId}-${index}`}
                className="relative bg-black rounded-lg overflow-hidden aspect-video"
              >
                {/* Hidden audio element for remote audio */}
                <audio
                  ref={(el) => {
                    if (el && stream) {
                      remoteAudioRefs.current[socketId] = el;
                      if (el.srcObject !== stream) {
                        try {
                          el.srcObject = stream;
                          el.muted = false;
                          el.autoplay = true;
                          const playPromise = el.play();
                          if (playPromise !== undefined) {
                            playPromise.catch((err) => {
                              console.warn(`⚠️ Audio play failed for ${socketId}:`, err);
                              el.muted = false;
                              el.play().catch(() => {});
                            });
                          }
                        } catch (err) {
                          console.error(`❌ Audio setup error for ${socketId}:`, err);
                        }
                      }
                    }
                  }}
                  autoPlay
                  className="hidden"
                />
                <video
                  ref={(el) => {
                    if (el && stream) {
                      remoteVideoRefs.current[socketId] = el;
                      if (el.srcObject !== stream) {
                        try {
                          el.srcObject = stream;
                          el.muted = true;
                          el.autoplay = true;
                          el.playsInline = true;
                          
                          const playPromise = el.play();
                          if (playPromise !== undefined) {
                            playPromise.then(() => {
                              console.log(`✅ Video playing for ${socketId}`);
                            }).catch((err) => {
                              console.warn(`⚠️ Video play failed for ${socketId}:`, err);
                              el.muted = true;
                              el.play().catch(() => {});
                            });
                          }
                        } catch (err) {
                          console.error(`❌ Video setup error for ${socketId}:`, err);
                        }
                      }
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <span>
                    {participant?.name &&
                    participant.name !== "Clinician" &&
                    participant.name !== "User Unknown"
                      ? participant.name
                      : `Participant ${index + 1}`}
                  </span>
                  {participant?.isTherapist && (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[8px] px-1">
                      Host
                    </Badge>
                  )}
                </div>
                {!stream && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                    <div className="text-center text-slate-500">
                      <Users className="mx-auto h-8 w-8 mb-2" />
                      <p className="text-xs">Loading...</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }
  };

  // Update therapist name based on participants - prioritize therapist over other participants
  useEffect(() => {
    console.log("=== THERAPIST NAME UPDATE ===");
    console.log("Participants:", participants);
    console.log("User:", user);

    // First, update self participant name if needed
    if (user) {
      setParticipants((prevParticipants) => {
        const needsUpdate = prevParticipants.some(
          (participant) => participant.isSelf && !participant.name
        );

        if (needsUpdate) {
          return prevParticipants.map((participant) => {
            if (participant.isSelf && !participant.name) {
              return {
                ...participant,
                name:
                  user.name ||
                  (user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : "You"),
              };
            }
            return participant;
          });
        }
        return prevParticipants;
      });
    }

    // Find therapist participant (prioritize actual therapists)
    const therapist = participants.find((p) => p.isTherapist && !p.isSelf);
    console.log("Found therapist:", therapist);

    if (therapist && therapist.name && therapist.name !== "Clinician") {
      console.log("Setting therapist name to:", therapist.name);
      setLocalTherapistName(therapist.name);
    } else {
      // If no therapist found, look for other non-self participants
      const otherParticipant = participants.find(
        (p) =>
          !p.isSelf &&
          p.name &&
          p.name !== "Clinician" &&
          p.name !== "User Unknown"
      );
      console.log("Found other participant:", otherParticipant);

      if (otherParticipant && otherParticipant.name) {
        console.log(
          "Setting therapist name to other participant:",
          otherParticipant.name
        );
        setLocalTherapistName(otherParticipant.name);
      } else {
        // Default name if no other participant found
        const isTherapistRole =
          user?.role === "therapist" || user?.role === "admin";
        const userName =
          user?.name ||
          (user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : "");
        const defaultTherapistName = isTherapistRole
          ? userName || "You (Therapist)"
          : "Clinician";
        console.log("Setting default therapist name:", defaultTherapistName);
        setLocalTherapistName(defaultTherapistName);
      }
    }
  }, [participants, user]);

  // Initialize participants from session details if available
  useEffect(() => {
    if (
      sessionDetails &&
      sessionDetails.participants &&
      sessionDetails.participants.length > 0
    ) {
      console.log("Session details received:", sessionDetails);
      console.log("Session participants:", sessionDetails.participants);

      // Map session participants to the format expected by the component
      const mappedParticipants = sessionDetails.participants.map(
        (participant) => ({
          userId: participant.userId,
          name: participant.name,
          email: participant.email,
          role: participant.role,
          isSelf: participant.isSelf,
          isTherapist:
            participant.isTherapist || participant.role === "therapist",
          joinedAt: new Date().toISOString(), // Set current time as joinedAt
        })
      );

      setParticipants(mappedParticipants);
      console.log(
        "Participants initialized from session details:",
        mappedParticipants
      );
    }
  }, [sessionDetails]);

  // Prevent socket events from overriding session data
  useEffect(() => {
    if (participants.length > 0 && sessionDetails?.participants?.length > 0) {
      // Check if we have all participants from session details
      const sessionParticipantIds = sessionDetails.participants.map(
        (p) => p.userId
      );
      const currentParticipantIds = participants.map((p) => p.userId);

      // Remove any participants not in the session
      const invalidParticipants = participants.filter(
        (p) => !sessionParticipantIds.includes(p.userId)
      );

      if (invalidParticipants.length > 0) {
        console.log("Removing invalid participants:", invalidParticipants);
        setParticipants((prev) =>
          prev.filter((p) => sessionParticipantIds.includes(p.userId))
        );
      }

      // If we're missing any session participants, add them
      const missingParticipants = sessionDetails.participants.filter(
        (sp) => !currentParticipantIds.includes(sp.userId)
      );

      if (missingParticipants.length > 0) {
        console.log(
          "Adding missing participants from session:",
          missingParticipants
        );
        setParticipants((prev) => {
          // Filter out participants that already exist
          const newParticipants = missingParticipants.filter(
            (sp) => !prev.some((p) => p.userId === sp.userId)
          );

          if (newParticipants.length === 0) {
            console.log("All missing participants already exist");
            return prev;
          }

          console.log("Actually adding new participants:", newParticipants);
          return [
            ...prev,
            ...newParticipants.map((participant) => ({
              userId: participant.userId,
              name: participant.name,
              email: participant.email,
              role: participant.role,
              isSelf: participant.isSelf,
              isTherapist:
                participant.isTherapist || participant.role === "therapist",
              joinedAt: new Date().toISOString(),
            })),
          ];
        });
      }
    }
  }, [participants, sessionDetails]); // Re-enabled cleanup useEffect

  // Handle incoming call UI - patients see direct session screen
  if (incomingCall && !callStarted && userRole === "patient") {
    // Patients see normal session UI - auto-join handles therapist connection
    // No special waiting screen needed
  } else if (incomingCall && !callStarted) {
    // For other roles (non-patients), show normal incoming call UI
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="text-center text-white">
          <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <Users className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Incoming Session</h2>
          <p className="text-slate-500 mb-6">
            {localTherapistName || "Clinician"} is ready to connect
          </p>
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

  // Show error screen for ended sessions
  if (callStatus === "ended") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="text-center text-white max-w-md p-6">
          <PhoneOff className="mx-auto h-16 w-16 mb-4 text-rose-500" />
          <h2 className="text-2xl font-bold mb-2">Session Terminated</h2>
          <p className="text-slate-500 mb-6">The session has ended.</p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="default"
              className="bg-slate-800 hover:bg-slate-900 rounded-lg"
              onClick={() => {
                if (onEndCall) onEndCall();
                // Navigate to sessions page
                window.location.href = "/sessions";
              }}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show error screen for inactive sessions
  if (callStatus === "inactive" || callError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="text-center text-white max-w-md p-6">
          <PhoneOff className="mx-auto h-16 w-16 mb-4 text-rose-500" />
          <h2 className="text-2xl font-bold mb-2">Session Unavailable</h2>
          <div className="text-slate-300 font-medium text-sm whitespace-pre-line mb-6">
            {callError}
          </div>
          <div className="flex gap-4 justify-center">
            <Button
              variant="default"
              className="bg-slate-800 hover:bg-slate-900 rounded-lg"
              onClick={() => {
                setCallError(null);
                setCallStatus("connecting");
                if (onEndCall) onEndCall();
              }}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show error screen for unauthorized access
  if (callStatus === "unauthorized") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="text-center text-white max-w-md p-6">
          <PhoneOff className="mx-auto h-16 w-16 mb-4 text-amber-500" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <div className="text-slate-300 font-medium text-sm whitespace-pre-line mb-6">
            {callError}
          </div>
          <div className="flex gap-4 justify-center">
            <Button
              variant="default"
              className="bg-slate-800 hover:bg-slate-900 rounded-lg"
              onClick={() => {
                setCallError(null);
                setCallStatus("connecting");
                if (onEndCall) onEndCall();
              }}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Media Initialization Loading Overlay */}
      {isInitializingMedia && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium">
              Initializing camera and microphone...
            </p>
            <p className="text-slate-400 text-sm mt-2">
              This may take a few seconds
            </p>
          </div>
        </div>
      )}

      {/* Media Error Display */}
      {mediaError && (
        <div className="bg-rose-500/20 border-b border-rose-500/30 p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-rose-400" />
            </div>
            <div className="flex-1">
              <p className="text-rose-300 font-medium text-sm">{mediaError}</p>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-rose-500/30 hover:bg-rose-500/40 text-rose-200 text-xs h-7 px-2"
                  onClick={() => {
                    setMediaError(null);
                    setIsInitializingMedia(true);
                    initLocalMedia()
                      .then(() => {
                        console.log(
                          "Client: Local media re-initialized successfully"
                        );
                        setIsInitializingMedia(false);
                      })
                      .catch((err) => {
                        console.error(
                          "Client: Error re-initializing media:",
                          err
                        );
                        setIsInitializingMedia(false);
                        setMediaError(
                          err.message ||
                            "Failed to access camera and microphone. Please check permissions and refresh the page."
                        );
                      });
                  }}
                >
                  Retry
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-rose-500/30 hover:bg-rose-500/40 text-rose-200 text-xs h-7 px-2"
                  onClick={() => {
                    // Force initialization
                    console.log("=== FORCING MEDIA INITIALIZATION ===");
                    setCanInitializeMedia(true);
                    setMediaError(null);
                    setIsInitializingMedia(true);

                    setTimeout(() => {
                      initLocalMedia()
                        .then(() => {
                          console.log(
                            "✅ Forced media initialization successful"
                          );
                          setIsInitializingMedia(false);
                        })
                        .catch((err) => {
                          console.error(
                            "❌ Forced media initialization failed:",
                            err
                          );
                          setIsInitializingMedia(false);
                          setMediaError(
                            err.message ||
                              "Failed to access camera and microphone. Please check permissions and refresh the page."
                          );
                        });
                    }, 100);
                  }}
                >
                  Force Init
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-rose-500/30 hover:bg-rose-500/40 text-rose-200 text-xs h-7 px-2"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-400 hover:text-white hover:bg-rose-500/20"
              onClick={() => setMediaError(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-8 py-3 sm:py-4 bg-slate-900 border-b border-slate-800 gap-3 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-6">
          <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700">
            <Video className="h-4 sm:h-5 w-4 sm:w-5 text-slate-300" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0"
              >
                Live Session
              </Badge>
              {/* <span className="text-slate-500 text-xs font-medium">
                • {sessionDetails?.session?.time || "Time not specified"}
              </span> */}
              {sessionDetails?.session?.googleMeetLink && (
                <div className="flex items-center gap-1 ml-2">
                  <Link className="h-3 w-3 text-blue-400" />
                  {sessionDetails.session.googleMeetExpiresAt &&
                  new Date() >
                    new Date(sessionDetails.session.googleMeetExpiresAt) ? (
                    <span className="text-red-400 text-xs font-medium">
                      Google Meet Link Expired
                    </span>
                  ) : (
                    <a
                      href={sessionDetails.session.googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs font-medium underline flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <span>Google Meet</span>
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
            <h1 className="text-white font-semibold tracking-tight text-sm sm:text-base truncate">
              {localTherapistName && localTherapistName !== "Clinician"
                ? localTherapistName
                : "Clinician"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            className={`text-slate-400 hover:text-white hover:bg-slate-800 ${
              showParticipants ? "bg-slate-800 text-white" : ""
            }`}
            onClick={() => {
              setShowParticipants(!showParticipants);
              setShowChat(false);
              setShowSettings(false);
            }}
          >
            <Users className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline text-xs">
              Participants ({participants.length})
            </span>
            <span className="sm:hidden text-xs">({participants.length})</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`text-slate-400 hover:text-white hover:bg-slate-800 ${
              showChat ? "bg-slate-800 text-white" : ""
            }`}
            onClick={() => {
              setShowChat(!showChat);
              setShowParticipants(false);
              setShowSettings(false);
            }}
          >
            <MessageSquare className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline text-xs">Clinical Chat</span>
            <span className="sm:hidden text-xs">Chat</span>
          </Button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative bg-slate-950 flex overflow-hidden">
        {/* Main Video (Doctor/Remote) */}
        <div
          className={`flex-1 relative transition-all duration-500 ${
            showParticipants || showChat ? "md:mr-0" : ""
          }`}
        >
          {renderRemoteVideos()}
        </div>

        {/* Side Panels */}
        {showParticipants && (
          <div className="md:w-80 w-full bg-slate-900 md:border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300 md:relative absolute inset-0 md:inset-auto md:right-0 z-50 max-h-screen md:max-h-full">
            <div className="p-3 sm:p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-white font-semibold text-base">
                Participants
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white"
                onClick={() => {
                  setShowParticipants(false);
                  setApiResponse(null); // Clear API response when closing
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* API Response Display */}
            {/* <div className="p-4 bg-slate-800/50 border-b border-slate-700">
              <h4 className="text-slate-300 font-medium text-sm mb-2">API Response:</h4>
              <pre className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded overflow-x-auto">
                {apiResponse 
                  ? JSON.stringify(apiResponse, null, 2)
                  : "Loading..."
                }
              </pre>
            </div> */}

            <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4">
              {participants && participants.length > 0 ? (
                participants.map((participant, index) => (
                  <div
                    key={`${participant.userId || "unknown"}-${
                      participant.socketId || "unknown"
                    }-${index}`}
                    className="flex items-center gap-2 sm:gap-4 p-2 rounded-lg bg-slate-800/30"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-sm">
                      {(participant.name &&
                        participant.name !== "Clinician" &&
                        participant.name !== "User Unknown" &&
                        participant.name.charAt(0).toUpperCase()) ||
                        (participant.firstName &&
                          participant.firstName.charAt(0).toUpperCase()) ||
                        (participant.displayName &&
                          participant.displayName.charAt(0).toUpperCase()) ||
                        (participant.email &&
                          participant.email.charAt(0).toUpperCase()) ||
                        (participant.role &&
                          participant.role.charAt(0).toUpperCase()) ||
                        "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <p className="text-white font-medium text-sm truncate">
                          {participant.name &&
                          participant.name !== "Clinician" &&
                          participant.name !== "User Unknown"
                            ? participant.name
                            : (participant.firstName && participant.lastName
                                ? `${participant.firstName} ${participant.lastName}`
                                : participant.firstName
                                ? participant.firstName
                                : null) ||
                              participant.displayName ||
                              participant.email ||
                              `User ${
                                participant.userId?.substring(0, 5) ||
                                participant.socketId?.substring(0, 5) ||
                                "Unknown"
                              }`}
                        </p>
                        {participant.isSelf && (
                          <Badge className="bg-slate-800 text-slate-400 border-none text-[8px] h-4 flex-shrink-0 ml-1">
                            You
                          </Badge>
                        )}
                        {(participant.isTherapist ||
                          participant.role === "therapist" ||
                          participant.role === "admin") &&
                          !participant.isSelf && (
                            <Badge className="bg-slate-800 text-slate-400 border-none text-[8px] h-4 flex-shrink-0 ml-1">
                              {participant.role === "admin" ? "Admin" : "Host"}
                            </Badge>
                          )}
                      </div>
                      <p className="text-slate-500 text-xs truncate">
                        {participant.joinedAt
                          ? `Joined: ${new Date(
                              participant.joinedAt
                            ).toLocaleTimeString()}`
                          : "Active"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 py-8">
                  <Users className="mx-auto h-8 w-8 mb-2" />
                  <p>No participants yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {showChat && (
          <div className="md:w-80 w-full bg-slate-900 md:border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300 md:relative absolute inset-0 md:inset-auto md:right-0 z-50 max-h-screen md:max-h-full">
            <div className="p-3 sm:p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-white font-semibold text-base">
                Clinical Chat
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white"
                onClick={() => setShowChat(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Chat Messages Display */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3"
            >
              {chatMessages.length === 0 ? (
                <div className="flex flex-col justify-center items-center text-center h-full py-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-slate-700">
                    <MessageSquare className="h-4 sm:h-5 w-4 sm:w-5 text-slate-500" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">
                    Chat is secure and encrypted
                  </p>
                  <p className="text-slate-600 text-[10px] mt-2 px-6">
                    All clinical notes shared here will be saved to your
                    recovery record.
                  </p>
                </div>
              ) : (
                chatMessages.map((message, index) => {
                  const isSender = message.senderId === user?.id;

                  // Get attachments from message.attachments array or legacy message.message.attachments
                  const attachmentsRaw =
                    message.attachments ||
                    (message.message && message.message.attachments) ||
                    [];
                  const attachments = (Array.isArray(attachmentsRaw)
                    ? attachmentsRaw
                    : []
                  )
                    .map(normalizeAttachment)
                    .filter((a) => a && a.url);

                  const hasAttachments = attachments.length > 0;

                  const messageContentCandidate =
                    message.text ??
                    message.content ??
                    message.message?.content ??
                    message.message ??
                    "";
                  const messageContent =
                    typeof messageContentCandidate === "string"
                      ? messageContentCandidate
                      : "";

                  // Check if message has real content (not just the placeholder)
                  const hasRealContent =
                    messageContent.trim() &&
                    messageContent.trim() !== "📎 File attachment";

                  return (
                    <div
                      key={index}
                      className={`flex ${
                        isSender ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 text-sm ${
                          isSender
                            ? "bg-emerald-500 text-white rounded-br-md"
                            : "bg-slate-800 text-slate-100 rounded-bl-md border border-slate-700"
                        }`}
                      >
                        <p className="text-[10px] font-semibold mb-1 opacity-80">
                          {isSender
                            ? user?.name || "You"
                            : message.senderName || "Clinician"}
                        </p>

                        {/* Display message text (only if it's not just the placeholder) */}
                        {hasRealContent && (
                          <p className="mb-2">{messageContent}</p>
                        )}

                        {/* Display attachments */}
                        {hasAttachments && (
                          <div className="space-y-2 mb-2">
                            {attachments.map((attachment, attIndex) => (
                              <div key={attIndex}>
                                {attachment.type === "image" ? (
                                  // Display image with preview
                                  <div className="mt-1">
                                    <img
                                      src={attachment.url}
                                      alt={attachment.originalName}
                                      className="max-w-full rounded-lg cursor-pointer hover:opacity-90"
                                      onClick={() =>
                                        window.open(attachment.url, "_blank")
                                      }
                                    />
                                    <a
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] mt-1 flex items-center gap-1 opacity-80 hover:underline"
                                    >
                                      <Image className="h-3 w-3" />
                                      {attachment.originalName}
                                    </a>
                                  </div>
                                ) : attachment.type === "video" ? (
                                  // Display video with controls
                                  <div className="mt-1">
                                    <video
                                      controls
                                      className="max-w-full rounded-lg"
                                      src={attachment.url}
                                    >
                                      Your browser does not support video
                                      playback
                                    </video>
                                    <a
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] mt-1 flex items-center gap-1 opacity-80 hover:underline"
                                    >
                                      <Play className="h-3 w-3" />
                                      {attachment.originalName}
                                    </a>
                                  </div>
                                ) : (
                                  // Display document with icon
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-slate-700/50 rounded p-2 hover:bg-slate-700 transition-colors"
                                  >
                                    <FileText className="h-5 w-5 text-orange-400 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs truncate">
                                        {attachment.originalName}
                                      </p>
                                      {attachment.size > 0 && (
                                        <p className="text-[10px] opacity-60">
                                          {(attachment.size / 1024).toFixed(1)}{" "}
                                          KB
                                        </p>
                                      )}
                                    </div>
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <p
                          className={`text-[10px] mt-1 ${
                            isSender
                              ? "text-emerald-100 opacity-80"
                              : "text-slate-400"
                          }`}
                        >
                          {new Date(
                            message.timestamp || message.createdAt
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicators */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-bl-md px-3 sm:px-4 py-2 sm:py-3 text-sm border border-slate-700">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs">
                        {typingUsers.length === 1
                          ? "Someone is typing..."
                          : `${typingUsers.length} people typing...`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 sm:p-4 border-t border-slate-800">
              {/* Show uploaded files preview */}
              {uploadedFiles.length > 0 && (
                <div className="mb-3 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-slate-800 rounded-lg p-2 border border-slate-700"
                    >
                      <div className="flex-shrink-0">
                        {file.type === "image" ? (
                          <Image className="h-5 w-5 text-emerald-400" />
                        ) : file.type === "video" ? (
                          <Play className="h-5 w-5 text-blue-400" />
                        ) : (
                          <FileText className="h-5 w-5 text-orange-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate">
                          {file.originalName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="flex-shrink-0 text-slate-400 hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                {/* File upload button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 rounded-xl"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || !externalConnected || !connected}
                >
                  {isUploading ? (
                    <Upload className="h-4 w-4 animate-spin" />
                  ) : (
                    <Paperclip className="h-4 w-4" />
                  )}
                </Button>

                <input
                  type="text"
                  placeholder="Clinical note..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && externalConnected && connected) {
                      sendChatMessage();
                    }
                  }}
                  onFocus={handleTyping}
                  onBlur={handleStopTyping}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 sm:px-4 py-2 text-white text-sm focus:outline-none focus:border-slate-500 placeholder:text-slate-600"
                />
                <Button
                  size="icon"
                  className="bg-slate-100 hover:bg-white text-slate-900 rounded-xl"
                  onClick={sendChatMessage}
                  disabled={
                    (!newMessage.trim() && uploadedFiles.length === 0) ||
                    !externalConnected ||
                    !connected
                  }
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Self Video (Patient/Local) */}
        <div
          className={`absolute md:bottom-8 md:right-8 bottom-20 right-4 md:w-64 md:h-44 w-40 h-32 rounded-[2rem] overflow-hidden border-4 border-slate-900 shadow-2xl transition-all duration-500 ${
            showParticipants || showChat ? "md:translate-x-[-320px]" : ""
          }`}
        >
          <video
            ref={(el) => {
              if (el && localStream) {
                localVideoRef.current = el;
                // Only assign srcObject if it's different to prevent blinking
                if (el.srcObject !== localStream) {
                  try {
                    el.srcObject = localStream;
                    console.log("✅ Local video ref and srcObject assigned");
                  } catch (err) {
                    console.error(
                      "❌ Error assigning local video srcObject:",
                      err
                    );
                  }
                }
              }
            }}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!videoEnabled && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
              <VideoOff className="h-6 w-6 text-slate-400" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            You
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900 px-3 py-3 md:px-8 md:py-8 border-t border-slate-800 md:relative fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="w-20 sm:w-32 hidden md:flex items-center gap-2">
            {/* <Badge
              variant="outline"
              className="border-slate-700 text-slate-500 text-[10px] px-2 py-0.5"
            >
              HD 1080p
            </Badge> */}
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            <Button
              variant={audioEnabled ? "secondary" : "destructive"}
              size="icon"
              className="rounded-2xl md:w-14 md:h-14 w-12 h-12 bg-slate-800 hover:bg-slate-700 border-slate-700 min-w-[48px]"
              onClick={toggleAudioHandler}
              disabled={!externalConnected || !connected}
            >
              {audioEnabled ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant={videoEnabled ? "secondary" : "destructive"}
              size="icon"
              className="rounded-2xl md:w-14 md:h-14 w-12 h-12 bg-slate-800 hover:bg-slate-700 border-slate-700 min-w-[48px]"
              onClick={toggleVideoHandler}
              disabled={!externalConnected || !connected}
            >
              {videoEnabled ? (
                <Video className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant={screenSharing ? "default" : "secondary"}
              size="icon"
              className={`rounded-2xl md:w-14 md:h-14 w-12 h-12 border-slate-700 min-w-[48px] ${
                screenSharing
                  ? "bg-white text-slate-900"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
              onClick={toggleScreenShareHandler}
              disabled={!externalConnected || !connected}
            >
              <Share className="h-5 w-5" />
            </Button>

            {/* Recording Button - Only for therapists */}
            {isTherapist && (
              <div className="flex flex-col items-center gap-1">
                <Button
                  variant={isRecording ? "destructive" : "secondary"}
                  size="icon"
                  className={`rounded-2xl md:w-14 md:h-14 w-12 h-12 border-slate-700 min-w-[48px] ${
                    isRecording
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={
                    !externalConnected ||
                    !connected ||
                    recordingStatus === "starting"
                  }
                  title={isRecording ? "Stop Recording" : "Start Recording"}
                >
                  {recordingStatus === "starting" ? (
                    <div className="h-5 w-5">
                      <div className="animate-spin rounded-full h-full w-full border-b-2 border-white"></div>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`h-2 w-2 mr-1 ${
                          isRecording ? "bg-white" : "bg-red-500"
                        }`}
                      />
                      <span className="text-xs">REC</span>
                    </>
                  )}
                </Button>
              </div>
            )}

            <Button
              variant="destructive"
              size="icon"
              className="rounded-2xl md:w-16 md:h-14 w-14 h-12 bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 min-w-[56px]"
              onClick={
                isTherapist
                  ? () => {
                      endCall();
                      stopMediaStreams();
                      if (onEndCall) onEndCall();
                    }
                  : () => {
                      if (socket) {
                        socket.emit("leave-room", { roomId, roomType });
                      }
                      stopMediaStreams();
                      if (onEndCall) onEndCall();
                    }
              }
              disabled={!externalConnected || !connected}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>

          <div className="w-20 sm:w-32 flex justify-end">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Connected
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Google Meet Error Popup */}
      {/* <GoogleMeetErrorPopup
        isOpen={showGoogleMeetPopup}
        // onClose={() => setShowGoogleMeetPopup(false)}
        sessionId={sessionId}
      /> */}
    </div>
  );
};

export default VideoCall;
