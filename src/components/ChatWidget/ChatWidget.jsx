import React, { useState, useEffect, useRef } from "react";
import { useSocketContext } from "../../context/SocketContext";
import { useAuthRedux } from "../../hooks/useAuthRedux";
import { useLocation } from "react-router-dom";
import { chatApi } from "../../lib/chatApi";
import { useIsMobile } from "../../hooks/use-mobile";
import { renderTextWithLinks } from "../../utils/linkUtils";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [adminOnline, setAdminOnline] = useState(false);
  const [adminStatus, setAdminStatus] = useState("Checking...");
  const [loadError, setLoadError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { socket, connected, emit, on } = useSocketContext();
  const { user, isAuthenticated } = useAuthRedux();
  const location = useLocation();
  const isMobile = useIsMobile();
  const messagesEndRef = useRef(null);
  const wrapperRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Check if we're on a video call related page
  const isVideoCallPage = location.pathname.includes('/video-call') || 
                         location.pathname.includes('/group-video-call') || 
                         location.pathname.includes('/waiting-room');

  // Fetch initial messages when component mounts
  useEffect(() => {
    console.log("ChatWidget useEffect triggered:", {
      isOpen,
      user,
      socket,
      connected,
    });
    if (isOpen && user && socket && connected) {
      console.log("Loading initial messages...");
      loadInitialMessages();

      // Request admin online status
      emit("admin-status-request", {});
    } else {
      console.log("Chat not ready to load:", {
        isOpen,
        user: !!user,
        socket: !!socket,
        connected,
      });
    }
  }, [isOpen, user, socket, connected, emit]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    // Only scroll if the user is near the bottom (within 100px)
    // This prevents scrolling when user is reading older messages
    const messagesContainer = messagesEndRef.current?.parentElement;
    if (messagesContainer) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

      if (isNearBottom) {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          scrollToBottom();
        }, 10);
      }
    }
  }, [messages]);

  // Also scroll to bottom when chat widget opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [isOpen]);

  // Set up socket listeners
  useEffect(() => {
    if (!socket || !connected) {
      console.log("Socket not ready:", { socket: !!socket, connected });
      return;
    }

    console.log("Setting up socket listeners");

    // Listen for new messages from other users (single source of truth)
    const cleanupNewMessage = on("message-received", (data) => {
      
      console.log("Received message:", data);

  // 👇 USER MESSAGE CONSOLE
  if (data.senderType === "user") {
    console.log("User Message:", data.content);
  }


      setMessages((prev) => {
        // Primary deduplication by messageId
        if (data.messageId && prev.some(m => m.messageId === data.messageId)) {
          console.log("Duplicate message ignored by messageId:", data.messageId);
          return prev;
        }
        
        // Secondary deduplication by _id (for backward compatibility)
        if (data._id && prev.some(m => m._id === data._id)) {
          console.log("Duplicate message ignored by _id:", data._id);
          return prev;
        }
        
        // Tertiary deduplication by content + timestamp (fallback)
        const isContentDuplicate = prev.some(m => 
          m.content === data.content && 
          new Date(m.timestamp).getTime() === new Date(data.timestamp).getTime()
        );
        
        if (isContentDuplicate) {
          console.log("Duplicate message ignored by content+timestamp");
          return prev;
        }
        
        // Add new message
        return [
          ...prev,
          {
            _id: data._id || Date.now(),
            messageId: data.messageId,
            content: data.content,
            senderId: data.senderId,
            senderName: data.senderName,
            timestamp: data.timestamp || new Date(),
            senderType: data.senderType || "user",
            attachments: data.attachments || []
          },
        ];
      });
      
      // Auto-scroll to bottom for new messages
      setTimeout(() => {
        scrollToBottom();
      }, 10);
    });

    // Listen for admin replies specifically
    const cleanupAdminReply = on("admin-reply-received", (data) => {
      console.log("Received admin reply:", data);
      setMessages((prev) => {
        // Check for duplicate by messageId or _id
        const messageData = data.message || data;
        if (messageData.messageId && prev.some(m => m.messageId === messageData.messageId)) {
          console.log("Duplicate admin message ignored:", messageData.messageId);
          return prev;
        }
        if (messageData._id && prev.some(m => m._id === messageData._id)) {
          console.log("Duplicate admin message ignored by _id:", messageData._id);
          return prev;
        }
        return [
          ...prev,
          {
            _id: messageData._id || Date.now(),
            messageId: messageData.messageId,
            content: messageData.message,
            senderId: messageData.senderId,
            senderName: messageData.senderId?.name || "Admin",
            timestamp: messageData.createdAt,
            senderType: "admin",
            attachments: messageData.attachments || []
          },
        ];
      });
    });

    // Listen for admin replies in default chat
    const cleanupAdminNewMessage = on("admin-new-message", (data) => {
      console.log("Received admin message:", data);
      // Only show admin messages in the chat: if chatRoom is set, it must match our sessionId
      if (data.chatRoom && data.chatRoom !== sessionId) {
        console.log('Admin message for other room ignored:', data.chatRoom);
        return;
      }

      // Only show admin messages in the chat
      if (data.senderType === "admin" || data.senderType === "therapist") {
        setMessages((prev) => {
          // Check for duplicate by messageId or _id
          if (data.messageId && prev.some(m => m.messageId === data.messageId)) {
            console.log("Duplicate admin new message ignored:", data.messageId);
            return prev;
          }
          if (data._id && prev.some(m => m._id === data._id)) {
            console.log("Duplicate admin new message ignored by _id:", data._id);
            return prev;
          }
          return [
            ...prev,
            {
              _id: data._id || Date.now(),
              messageId: data.messageId,
              content: data.content || data.message?.message || "",
              senderId: data.senderId || "admin",
              senderName: data.senderName || data.userName || "Support Team",
              timestamp: data.timestamp || data.message?.createdAt || new Date(),
              senderType: "admin",
              attachments: data.attachments || data.message?.attachments || []
            },
          ];
        });
      }
    });

    // Listen for typing indicators
    const cleanupTyping = on("typing", (data) => {
      setIsTyping(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
    });

    // Listen for admin status updates
    const cleanupAdminStatus = on("admin-status-update", (data) => {
      console.log("Admin status update:", data);
      setAdminOnline(data.online);
      setAdminStatus(data.online ? "Online" : "Offline");
    });

    // Listen for admin presence
    const cleanupAdminPresence = on("admin-presence", (data) => {
      console.log("Admin presence:", data);
      setAdminOnline(data.presence === "online");
      setAdminStatus(data.presence === "online" ? "Online" : "Away");
    });

    // Join default live chat room on connection
    if (sessionId === "default-live-chat") {
      emit("join-room", { sessionId: "default-live-chat" });
    }

    // Clean up listeners on unmount
    return () => {
      console.log("Cleaning up socket listeners");
      if (cleanupNewMessage) cleanupNewMessage();
      if (cleanupAdminReply) cleanupAdminReply();
      if (cleanupAdminNewMessage) cleanupAdminNewMessage();
      if (cleanupTyping) cleanupTyping();
      if (cleanupAdminStatus) cleanupAdminStatus();
      if (cleanupAdminPresence) cleanupAdminPresence();
    };
  }, [socket, connected, on, emit, sessionId]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  const loadInitialMessages = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      console.log("Starting to load initial messages");

      // For live support, use a per-user support room so chats are private
      const userId = user?._id || user?.userId || user?.id;
      const defaultSessionId = userId ? `support-${userId}` : 'default-live-chat';
      setSessionId(defaultSessionId);

      // Join the support room
      if (socket && connected && defaultSessionId) {
        console.log("Joining chat room:", defaultSessionId);
        emit("join-room", { sessionId: defaultSessionId });
      }

      // Load previous chat messages from API
      try {
        console.log("Calling chat API to get messages");
        const response = await chatApi.getMessages(defaultSessionId);
        console.log("API Response:", response);

        if (response?.success && response?.data?.messages) {
          const formattedMessages = response.data.messages.map((msg) => ({
            _id: msg._id,
            content: msg.message,
            senderId: msg.senderId._id || msg.senderId,
            senderName: msg.senderId?.name || msg.senderId?.email || "User",
            timestamp: msg.createdAt || msg.timestamp,
            senderType: msg.senderType,
            attachments: msg.attachments || []
          }));
          setMessages(formattedMessages);
          console.log("Loaded messages:", formattedMessages.length);
          // Scroll to bottom after loading messages
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        } else {
          console.log("No messages in API response, using fallback");
          // Fallback to mock messages if API fails
          const mockMessages = [
            {
              _id: 1,
              content: "Hello! How can I help you today?",
              senderId: "admin123",
              senderName: "Support Team",
              timestamp: new Date(Date.now() - 3600000),
              senderType: "admin",
            },
          ];
          setMessages(mockMessages);
        }
      } catch (error) {
        console.error("Error loading chat messages:", error);
        setLoadError(error.message);
        // Fallback to mock messages
        const mockMessages = [
          {
            _id: 1,
            content: "Hello! How can I help you today?",
            senderId: "admin123",
            senderName: "Support Team",
            timestamp: new Date(Date.now() - 3600000),
            senderType: "admin",
          },
        ];
        setMessages(mockMessages);
      }
    } catch (error) {
      console.error("Error in loadInitialMessages:", error);
      setLoadError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !sessionId) return;

    try {
      // Generate UUID for message deduplication
      const messageId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });

      const originalMessage = newMessage;
      setNewMessage("");

      // Send via socket only (no REST API call, no optimistic update)
      socket.emit("send-message", {
        roomId: sessionId,
        roomType: sessionId.includes('group') ? 'group' : 'individual',
        message: {
          content: originalMessage,
          messageId: messageId
        }
      });

      // Emit typing stopped event
      emit("stop-typing", { sessionId });
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Show user-friendly error message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send message";
      console.error("Chat error details:", {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = () => {
    if (newMessage.length > 0) {
      emit("typing", { sessionId });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emit("stop-typing", { sessionId });
      }, 1000);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    
    if (validFiles.length !== files.length) {
      alert('Only image and video files are allowed!');
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  // Remove selected file
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload files to server
  const uploadFiles = async (files) => {
    const uploadedAttachments = [];
    
    for (const file of files) {
      try {
        console.log('Uploading single file:', file.name, file.type);
        // Use chatApi uploadFile method for proper authorization handling
        const response = await chatApi.uploadFile(file);
        console.log('Upload response:', response);
        
        if (response.success) {
          console.log('File uploaded successfully:', response.data.file);
          uploadedAttachments.push(response.data.file);
        } else {
          console.error('Upload failed:', response);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        console.error('Upload error details:', error.response?.data);
      }
    }
    
    return uploadedAttachments;
  };

  // Handle send message with files
  const handleSendMessageWithFiles = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !sessionId) return;

    try {
      setUploading(true);
      
      // Upload files first
      let attachments = [];
      if (selectedFiles.length > 0) {
        attachments = await uploadFiles(selectedFiles);
      }
      
      // Generate UUID for message deduplication
      const messageId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });

      const originalMessage = newMessage;
      setNewMessage("");
      setSelectedFiles([]);

      // Send via socket with attachments
      socket.emit("send-message", {
        roomId: sessionId,
        roomType: sessionId.includes('group') ? 'group' : 'individual',
        message: {
          content: originalMessage,
          messageId: messageId,
          attachments: attachments
        }
      });

      // Emit typing stopped event
      emit("stop-typing", { sessionId });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setUploading(false);
    }
  };

  // Clean up socket listeners and leave room on unmount
  useEffect(() => {
    return () => {
      if (socket && sessionId) {
        socket.emit("leave-default-chat");
        emit("leave-room", { sessionId });
      }
    };
  }, [socket, sessionId, emit]);

  // Close chat when clicking outside or pressing Escape
  useEffect(() => {
    const handlePointerDown = (e) => {
      if (!isOpen) return;
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Only render the chat widget if user is authenticated and not on video call pages
  if (!isAuthenticated || !user || isVideoCallPage) {
    return null;
  }

  return (
    <div
      ref={wrapperRef}
      className={`${
        isMobile ? "bottom-16 right-4" : "bottom-6 right-6"
      } fixed z-50`}
    >
      {!isOpen ? (
        // Floating chat button
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-2xl hover:shadow-blue-500/30 transform hover:scale-110 transition-all duration-300 group"
          aria-label="Open chat"
        >
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 group-hover:animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {isTyping && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white animate-ping"></span>
            )}
          </div>
        </button>
      ) : (
        // Chat window
        <div
          className={`${
            isMobile ? "w-full h-[80vh] max-w-[95vw] mx-2" : "w-80 h-96"
          } bg-white rounded-lg shadow-xl flex flex-col border border-gray-200`}
        >
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">Live Support</span>
              <span
                className={`h-2 w-2 rounded-full ${
                  connected ? "bg-green-400" : "bg-red-400"
                }`}
              ></span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Status bar */}
          {/* <div className="bg-gray-50 px-3 py-2 text-xs text-gray-500 border-b flex justify-between items-center">
            <div>
              {connected ? "Connected" : "Connecting..."} • {onlineUsers} online
            </div>
            <div className="flex items-center space-x-1">
              <span
                className={`h-2 w-2 rounded-full ${
                  adminOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              ></span>
              <span
                className={adminOnline ? "text-green-600" : "text-gray-500"}
              >
                {adminStatus}
              </span>
            </div>
          </div> */}

          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p>No messages yet</p>
                <p className="text-sm mt-1">Start a conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    msg.senderType === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs ${
                      isMobile ? "max-w-[85%]" : "lg:max-w-md"
                    } px-3 py-2 rounded-lg ${
                      msg.senderType === "user"
                        ? "bg-blue-500 text-white"
                        : msg.senderType === "admin"
                        ? "bg-green-100 text-gray-800"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {msg.content && (
                      <p className="text-sm">{renderTextWithLinks(msg.content)}</p>
                    )}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {msg.attachments.map((attachment, index) => (
                          <div key={index} className="relative ">
                            {attachment.type === 'image' ? (
                              <img 
                                src={attachment.url} 
                                alt={attachment.originalName}
                                className="w-40  object-cover rounded-lg cursor-pointer hover:opacity-75"
                                // className="max-w-full h-auto rounded-lg cursor-pointer"
                                onClick={() => window.open(attachment.url, '_blank')}
                              />
                            ) : (
                              <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <div>
                                  <p className="text-sm font-medium text-gray-800">{attachment.originalName}</p>
                                  <p className="text-xs text-gray-500">
                                    {(attachment.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                                <button 
                                  onClick={() => window.open(attachment.url, '_blank')}
                                  className="ml-auto text-blue-500 hover:text-blue-700"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <p
                      className={`text-xs mt-1 ${
                        msg.senderType === "user"
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg">
                  <p className="text-sm italic">Admin is typing...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className={`border-t p-2 bg-white ${isMobile ? "p-3" : ""}`}>
            {/* Selected files preview */}
            {selectedFiles.length > 0 && (
              <div className="mb-2 p-2 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Selected files:</span>
                  <button 
                    onClick={() => setSelectedFiles([])}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center bg-white px-2 py-1 rounded border text-xs">
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <button 
                        onClick={() => removeFile(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                multiple
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
                title="Upload files"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <textarea
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className={`flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isMobile ? "text-base py-3" : ""
                }`}
                rows="1"
                style={{ minHeight: "40px", maxHeight: "80px" }}
                autoFocus={isMobile}
              />
              <button
                onClick={handleSendMessageWithFiles}
                disabled={(!newMessage.trim() && selectedFiles.length === 0) || uploading}
                className={`p-2 rounded-lg ${isMobile ? "p-3" : ""} ${
                  (newMessage.trim() || selectedFiles.length > 0) && !uploading
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${isMobile ? "h-6 w-6" : ""}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
