import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from "react-redux";

const SocketContext = createContext();

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  // Get auth state from Redux store directly instead of using the hook that depends on Router
  const { token } = useSelector((state) => state.auth);
  const socketRef = useRef(null);

  // Initialize persistent socket connection
  useEffect(() => {
    if (!token || socketRef.current) return;

    try {
      const socketOptions = {
        transports: ["websocket", "polling"],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        forceNew: false, // Reuse existing connection when possible
      };

      socketOptions.auth = { token };

      // Determine WebSocket server URL
      let serverUrl;
      if (
        import.meta.env.VITE_API_BASE_URL &&
        import.meta.env.VITE_API_BASE_URL.includes("localhost")
      ) {
        serverUrl = "http://localhost:5000";
      } else if (import.meta.env.VITE_API_BASE_URL) {
        serverUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, "");
      } else {
        serverUrl = "https://apitanishvideo.fableadtech.in";
      }

      const newSocket = io(serverUrl, socketOptions);
      socketRef.current = newSocket;
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("🔄 Persistent socket connected");
        setConnected(true);
        setError(null);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("🔄 Persistent socket disconnected:", reason);
        setConnected(false);
      });

      newSocket.on("connect_error", (err) => {
        console.error("❌ Persistent socket connection error:", err);
        setError(err.message);
      });

      // Cleanup on unmount
      return () => {
        if (newSocket) {
          newSocket.removeAllListeners();
          newSocket.close();
          socketRef.current = null;
        }
      };
    } catch (err) {
      setError(err.message);
      console.error("Error initializing persistent socket:", err);
    }
  }, [token]);

  const emit = (event, data) => {
    if (socket && connected) {
      try {
        socket.emit(event, data);
      } catch (err) {
        console.error("Error emitting socket event:", err);
      }
    }
  };

  const on = (event, callback) => {
    if (socket && connected) {
      try {
        socket.on(event, callback);
        return () => {
          try {
            if (socket) {
              socket.off(event, callback);
            }
          } catch (err) {
            console.error("Error removing socket listener:", err);
          }
        };
      } catch (err) {
        console.error("Error adding socket listener:", err);
      }
    }
  };

  const joinRoom = (roomData) => {
    if (socket && connected) {
      try {
        socket.emit("join-room", roomData);
      } catch (err) {
        console.error("Error joining room:", err);
      }
    }
  };

  const leaveRoom = (roomData) => {
    if (socket && connected) {
      try {
        socket.emit("leave-room", roomData);
      } catch (err) {
        console.error("Error leaving room:", err);
      }
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        error,
        emit,
        on,
        joinRoom,
        leaveRoom,
        setSocket,
        setConnected,
        setError,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};