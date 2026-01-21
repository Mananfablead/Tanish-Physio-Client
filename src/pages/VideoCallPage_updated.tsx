import React, { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  MoreVertical,
  X,
  ArrowRight,
  Copy,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import io from "socket.io-client";
import Peer from "simple-peer";

declare global {
  interface Window {
    MediaRecorder: any;
  }
}

export default function VideoCallPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // State variables
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<
    { id: string; sender: string; text: string; timestamp: Date }[]
  >([]);
  const [participants, setParticipants] = useState<
    { id: string; name: string; isLocal?: boolean }[]
  >([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{
    [id: string]: MediaStream;
  }>({});

  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [id: string]: HTMLVideoElement | null }>({});
  const peerConnections = useRef<{ [id: string]: Peer.Instance }>({});
  const socketRef = useRef<any>(null);
  const mediaRecorderRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // New state variables based on your design
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenShared, setIsScreenShared] = useState(false);
  const [therapist, setTherapist] = useState("Dr. Sarah Johnson"); // This could come from props or context
  const [user, setUser] = useState("John Doe"); // This could come from auth context
  const [sessionId, setSessionId] = useState<string>(""); // Extract from URL or props
  const [isConnected, setIsConnected] = useState(false);

  // Extract session ID from URL or location state
  useEffect(() => {
    // Extract session ID from URL parameters or location state
    const params = new URLSearchParams(location.search);
    const extractedSessionId =
      params.get("sessionId") || location.pathname.split("/")[2];
    if (extractedSessionId) {
      setSessionId(extractedSessionId);
    }
  }, [location]);

  // Guard: ensure intake + plan active before allowing access
  useEffect(() => {
    try {
      const planRaw = sessionStorage.getItem("qw_plan");
      const intakeRaw = sessionStorage.getItem("qw_questionnaire");
      const plan = planRaw ? JSON.parse(planRaw) : null;
      const intake = intakeRaw ? JSON.parse(intakeRaw) : null;
      const RECENT_DAYS = 90;
      const now = Date.now();
      const intakeIsRecent =
        intake &&
        intake.updatedAt &&
        now - intake.updatedAt < RECENT_DAYS * 24 * 60 * 60 * 1000;

      if (!plan || !plan.active || !intakeIsRecent) {
        // redirect to profile (or intake) if not eligible
        navigate("/profile");
      }
    } catch (e) {
      navigate("/profile");
    }
  }, [navigate]);

  // Initialize socket connection
  useEffect(() => {
    if (!sessionId) return;

    // Connect to socket server
    socketRef.current = io(
      process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
      {
        auth: {
          token: localStorage.getItem("token") || "", // Assuming JWT token is stored in localStorage
        },
      }
    );

    socketRef.current.on("connect", () => {
      console.log("Connected to video call server");
      setIsConnected(true);

      // Join the video call room
      socketRef.current.emit("join-video-call", {
        sessionId,
        userId: localStorage.getItem("userId") || "",
      });
    });

    socketRef.current.on("joined-call", (data) => {
      console.log("Successfully joined call:", data);
      initializeMedia();
    });

    socketRef.current.on("participant-joined", (data) => {
      console.log("Participant joined:", data);
      setParticipants((prev) => [
        ...prev,
        { id: data.userId, name: data.isTherapist ? therapist : user },
      ]);
    });

    socketRef.current.on("participant-left", (data) => {
      console.log("Participant left:", data);
      setParticipants((prev) => prev.filter((p) => p.id !== data.userId));
      // Close peer connection if exists
      if (peerConnections.current[data.userId]) {
        peerConnections.current[data.userId].destroy();
        delete peerConnections.current[data.userId];
      }
    });

    socketRef.current.on("offer", (data) => {
      handleOffer(data.offer, data.senderId);
    });

    socketRef.current.on("answer", (data) => {
      handleAnswer(data.answer, data.senderId);
    });

    socketRef.current.on("ice-candidate", (data) => {
      handleIceCandidate(data.candidate, data.senderId);
    });

    socketRef.current.on("new-message", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: data.sender,
          text: data.text,
          timestamp: new Date(),
        },
      ]);
    });

    socketRef.current.on("audio-toggle", (data) => {
      console.log("Audio toggle received:", data);
      // Update UI to reflect audio status of remote participant
    });

    socketRef.current.on("video-toggle", (data) => {
      console.log("Video toggle received:", data);
      // Update UI to reflect video status of remote participant
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from video call server");
      setIsConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-video-call", {
          sessionId,
          userId: localStorage.getItem("userId") || "",
        });
        socketRef.current.disconnect();
      }

      // Stop all streams
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      // Stop media recorder if active
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [sessionId]);

  // Initialize media devices
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      streamRef.current = stream;
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };

  // Handle WebRTC offer
  const handleOffer = async (offer: any, senderId: string) => {
    try {
      const peer = createPeerConnection(senderId, true);

      await peer.setRemoteDescription(offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socketRef.current.emit("answer", {
        sessionId,
        answer,
        senderId: socketRef.current.id,
        targetId: senderId,
      });
    } catch (err) {
      console.error("Error handling offer:", err);
    }
  };

  // Handle WebRTC answer
  const handleAnswer = async (answer: any, senderId: string) => {
    try {
      if (peerConnections.current[senderId]) {
        await peerConnections.current[senderId].setRemoteDescription(answer);
      }
    } catch (err) {
      console.error("Error handling answer:", err);
    }
  };

  // Handle ICE candidate
  const handleIceCandidate = async (candidate: any, senderId: string) => {
    try {
      if (peerConnections.current[senderId]) {
        await peerConnections.current[senderId].addIceCandidate(candidate);
      }
    } catch (err) {
      console.error("Error handling ICE candidate:", err);
    }
  };

  // Create WebRTC peer connection
  const createPeerConnection = (peerId: string, isInitiator: boolean) => {
    const peer = new Peer({
      initiator: isInitiator,
      trickle: false,
      stream: localStream || undefined,
    });

    peer.on("signal", (data) => {
      if (data.type === "offer") {
        socketRef.current.emit("offer", {
          sessionId,
          offer: data,
          senderId: socketRef.current.id,
        });
      } else if (data.type === "candidate") {
        socketRef.current.emit("ice-candidate", {
          sessionId,
          candidate: data,
          senderId: socketRef.current.id,
        });
      }
    });

    peer.on("stream", (stream) => {
      setRemoteStreams((prev) => ({
        ...prev,
        [peerId]: stream,
      }));

      // Update video ref when stream is available
      setTimeout(() => {
        if (remoteVideoRefs.current[peerId]) {
          remoteVideoRefs.current[peerId]!.srcObject = stream;
        }
      }, 100);
    });

    peer.on("close", () => {
      setRemoteStreams((prev) => {
        const newState = { ...prev };
        delete newState[peerId];
        return newState;
      });
      delete peerConnections.current[peerId];
    });

    peer.on("error", (err) => {
      console.error("Peer connection error:", err);
    });

    peerConnections.current[peerId] = peer;
    return peer;
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);

        // Notify other participants
        socketRef.current.emit("audio-toggle", {
          sessionId,
          userId: socketRef.current.id,
          muted: !audioTrack.enabled,
        });
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);

        // Notify other participants
        socketRef.current.emit("video-toggle", {
          sessionId,
          userId: socketRef.current.id,
          videoEnabled: videoTrack.enabled,
        });
      }
    }
  };

  // Toggle screen sharing
  const toggleScreenShare = async () => {
    if (screenSharing) {
      // Stop screen sharing and return to camera
      if (localStream) {
        localVideoRef.current!.srcObject = localStream;
      }
      setIsScreenShared(false);
      setScreenSharing(false);

      // Notify other participants
      socketRef.current.emit("screen-share-toggle", {
        sessionId,
        userId: socketRef.current.id,
        sharing: false,
      });
    } else {
      // Start screen sharing
      try {
        // @ts-ignore
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

        if (localStream) {
          // Replace video track in existing stream
          const videoTrack = screenStream.getVideoTracks()[0];
          const oldTrack = localStream.getVideoTracks()[0];

          if (oldTrack) {
            oldTrack.stop();
          }

          localStream.removeTrack(oldTrack);
          localStream.addTrack(videoTrack);

          localVideoRef.current!.srcObject = localStream;
        }

        setIsScreenShared(true);
        setScreenSharing(true);

        // Notify other participants
        socketRef.current.emit("screen-share-toggle", {
          sessionId,
          userId: socketRef.current.id,
          sharing: true,
        });
      } catch (err) {
        console.error("Error sharing screen:", err);
      }
    }
  };

  // Handle sending a message
  const handleSendMessage = () => {
    if (chatMessage.trim() !== "") {
      socketRef.current.emit("new-message", {
        sessionId,
        message: chatMessage,
        sender: user,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "me",
          text: chatMessage,
          timestamp: new Date(),
        },
      ]);

      setChatMessage(""); // Clear the input after sending
    }
  };

  // Copy join link to clipboard
  const copyJoinLink = () => {
    const joinLink = `${window.location.origin}/video-call/${sessionId}`;
    navigator.clipboard.writeText(joinLink);
  };

  // Handle ending the call
  const handleEndCall = () => {
    // Disconnect from socket
    if (socketRef.current) {
      socketRef.current.emit("leave-video-call", {
        sessionId,
        userId: socketRef.current.id,
      });
      socketRef.current.disconnect();
    }

    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    // Navigate away
    navigate("/profile");
  };

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
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0"
              >
                Live Session
              </Badge>
              <span className="text-slate-500 text-xs font-medium">
                • 10:00 AM - 10:45 AM
              </span>
            </div>
            <h1 className="text-white font-semibold tracking-tight">
              {therapist}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">
              Participants ({participants.length})
            </span>
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
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Clinical Chat</span>
          </Button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative bg-slate-950 flex overflow-hidden">
        {/* Main Video (Doctor) */}
        <div
          className={`flex-1 relative flex items-center justify-center transition-all duration-500 ${
            showParticipants || showChat ? "md:mr-0" : ""
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-slate-950/50 pointer-events-none" />

          {/* Remote video stream will be displayed here */}
          <div className="w-full h-full flex items-center justify-center">
            {Object.keys(remoteStreams).length > 0 ? (
              Object.entries(remoteStreams).map(([id, stream]) => (
                <video
                  key={id}
                  ref={(el) => (remoteVideoRefs.current[id] = el)}
                  autoPlay
                  playsInline
                  muted={false}
                  className="w-full h-full object-contain"
                />
              ))
            ) : (
              <div className="text-center">
                <div className="w-40 h-40 bg-slate-900 rounded-[2.5rem] mx-auto mb-6 flex items-center justify-center border border-slate-800 shadow-2xl relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face"
                    alt={therapist}
                    className="w-full h-full object-cover opacity-60"
                  />
                </div>
                <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">
                  {therapist}
                </h2>
                <p className="text-slate-500 font-medium">
                  Clinical Physiotherapist • Spinal Recovery
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Side Panels */}
        {showParticipants && (
          <div className="md:w-80 w-full bg-slate-900 md:border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300 md:relative absolute inset-0 md:inset-auto md:right-0 z-50">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-white font-semibold">Participants</h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white"
                onClick={() => setShowParticipants(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-sm">
                  {therapist.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-medium text-sm">
                      {therapist}
                    </p>
                    <Badge className="bg-slate-800 text-slate-400 border-none text-[8px] h-4">
                      Host
                    </Badge>
                  </div>
                  <p className="text-slate-500 text-xs">Active</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-sm">
                  {user.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{user}</p>
                  <p className="text-slate-500 text-xs">You</p>
                </div>
              </div>

              {/* Add join link for inviting others */}
              <div className="mt-6 p-4 bg-slate-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Join Link</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 hover:text-white"
                    onClick={copyJoinLink}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-slate-300 text-xs truncate">{`${window.location.origin}/video-call/${sessionId}`}</p>
              </div>
            </div>
          </div>
        )}

        {showChat && (
          <div className="md:w-80 w-full bg-slate-900 md:border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300 md:relative absolute inset-0 md:inset-auto md:right-0 z-50">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-white font-semibold">Clinical Chat</h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white"
                onClick={() => setShowChat(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg max-w-[80%] ${
                      msg.sender === "me"
                        ? "bg-blue-600 text-white self-end ml-auto"
                        : "bg-slate-800 text-slate-200 self-start"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-slate-700">
                    <MessageSquare className="h-5 w-5 text-slate-500" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">
                    Chat is secure and encrypted
                  </p>
                  <p className="text-slate-600 text-[10px] mt-2 px-6">
                    All clinical notes shared here will be saved to your
                    recovery record.
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Clinical note..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-slate-500 placeholder:text-slate-600"
                />
                <Button
                  size="icon"
                  className="bg-slate-100 hover:bg-white text-slate-900 rounded-xl"
                  onClick={handleSendMessage}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Self Video (Patient) */}
        <div
          className={`absolute md:bottom-8 md:right-8 bottom-4 right-4 md:w-64 md:h-44 w-44 h-36 rounded-[2rem] overflow-hidden border-4 border-slate-900 shadow-2xl transition-all duration-500 ${
            showParticipants || showChat ? "md:translate-x-[-320px]" : ""
          }`}
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!isVideoOn && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
              <VideoOff className="h-6 w-6 text-slate-400" />
            </div>
          )}
          <div className="absolute bottom-2 right-2">
            <Badge
              variant="secondary"
              className="bg-slate-900/80 text-slate-300 text-[8px]"
            >
              You
            </Badge>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-900 px-4 py-4 md:px-8 md:py-8 border-t border-slate-800 md:relative fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="w-32 hidden md:flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-slate-700 text-slate-500"
            >
              {isConnected ? "Connected" : "Connecting..."}
            </Badge>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isAudioOn ? "secondary" : "destructive"}
              size="icon"
              className="rounded-2xl md:w-14 md:h-14 w-12 h-12 bg-slate-800 hover:bg-slate-700 border-slate-700"
              onClick={toggleAudio}
            >
              {isAudioOn ? (
                <Mic className="h-5 w-5" />
              ) : (
                <MicOff className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant={isVideoOn ? "secondary" : "destructive"}
              size="icon"
              className="rounded-2xl md:w-14 md:h-14 w-12 h-12 bg-slate-800 hover:bg-slate-700 border-slate-700"
              onClick={toggleVideo}
            >
              {isVideoOn ? (
                <Video className="h-5 w-5" />
              ) : (
                <VideoOff className="h-5 w-5" />
              )}
            </Button>

            <Button
              variant={isScreenShared ? "default" : "secondary"}
              size="icon"
              className={`rounded-2xl md:w-14 md:h-14 w-12 h-12 border-slate-700 ${
                isScreenShared
                  ? "bg-white text-slate-900"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
              onClick={toggleScreenShare}
            >
              <Share className="h-5 w-5" />
            </Button>

            <Button
              variant="secondary"
              size="icon"
              className="rounded-2xl md:w-14 md:h-14 w-12 h-12 bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>

            <Button
              variant="destructive"
              size="icon"
              className="rounded-2xl md:w-16 md:h-14 w-14 h-12 bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/20 ml-4"
              onClick={handleEndCall}
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>

          <div className="w-32 flex justify-end">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {isConnected ? "Connected" : "Connecting"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50">
          <div className="bg-gray-900 rounded-t-lg md:rounded-lg p-4 md:p-6 w-11/12 md:w-96 max-w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Settings</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm font-medium">
                  Video Quality
                </label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 mt-1 text-white">
                  <option>Auto</option>
                  <option>720p</option>
                  <option>1080p</option>
                  <option>4K</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm font-medium">
                  Audio Input
                </label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 mt-1 text-white">
                  <option>Default Microphone</option>
                  <option>Headset Microphone</option>
                  <option>External Microphone</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-sm font-medium">
                  Audio Output
                </label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 mt-1 text-white">
                  <option>Default Speaker</option>
                  <option>Headphones</option>
                  <option>External Speaker</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
