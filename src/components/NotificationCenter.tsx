import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  Trash2,
  Calendar,
  Video,
  Link as LinkIcon,
  Info,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  addNotification,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
  fetchNotifications,
  setNotifications,
  removeNotification,
  markAsUnread,
} from "@/store/slices/notificationSlice";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { io } from "socket.io-client";
import axios from "axios";
import { 
  deleteNotification as deleteNotificationAPI, 
  markNotificationAsReadAPI,
  markAllNotificationsAsReadAPI,
  toggleNotificationReadStatusAPI
} from "@/lib/notificationApi";

export default function NotificationCenter() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notificationsState = useSelector((state: any) => state.notifications);
  const { list: notifications, unreadCount, pagination } = notificationsState;
  const [socketConnected, setSocketConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const authState = useSelector((state: any) => state.auth);
  const user = authState?.user;
  const token = localStorage.getItem("token");

  // Determine API base URL
  const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }

    if (window.location.hostname === "localhost") {
      return "http://localhost:5000/api";
    }

    return "https://apitanishvideo.fableadtech.in/api";
  };

  const API_BASE_URL = getApiBaseUrl();

  // Fetch initial notifications from API
  useEffect(() => {
    if (!token || !user) return;

    const fetchInitialNotifications = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          `${API_BASE_URL}/notifications?page=1&limit=20`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = res.data.data;
        dispatch(
          setNotifications({
            notifications: data.notifications || [],
            unreadCount: data.unreadCount || 0,
            pagination: data.pagination,
          })
        );
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialNotifications();
  }, [token, user, dispatch]);

  // Setup socket connection for real-time notifications
  useEffect(() => {
    if (!token || !user) return;

    // Determine WebSocket server URL based on environment
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

    const socket = io(serverUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Client notification socket connected");
      setSocketConnected(true);
      // Join user's personal notification room
      socket.emit("join-notifications", {});
    });

    socket.on("notifications-joined", (data) => {
      console.log("Joined personal notifications room:", data.room);
    });

    // Listen for real-time notifications
    socket.on("client-notification", (data) => {
      console.log("Received client notification:", data);

      const newNotification = {
        id: data.id || Date.now().toString(),
        title: data.title || "New Notification",
        message: data.message || "You have a new notification",
        type: data.type || "system",
        read: false,
        timestamp: data.timestamp || new Date().toISOString(),
        sessionId: data.sessionId,
        bookingId: data.bookingId,
        googleMeetLink: data.googleMeetLink,
        googleMeetCode: data.googleMeetCode,
      };

      dispatch(addNotification(newNotification));

      // Show browser notification if supported
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(data.title, {
          body: data.message,
          icon: "/favicon.png",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client notification socket disconnected");
      setSocketConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Client notification socket connection error:", error);
    });

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      socket.disconnect();
    };
  }, [token, user, dispatch]);

  // Get icon based on notification type
  const getTypeIcon = (type) => {
    switch (type) {
      case "booking":
        return <Calendar className="w-4 h-4" />;
      case "session":
        return <Video className="w-4 h-4" />;
      case "google_meet_ready":
        return <LinkIcon className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  // Get color based on notification type
  const getTypeColor = (type) => {
    switch (type) {
      case "booking":
        return "bg-blue-100 text-blue-700";
      case "session":
        return "bg-green-100 text-green-700";
      case "google_meet_ready":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Format timestamp with error handling
  const formatTime = (timestamp: string) => {
    try {
      if (!timestamp) {
        return "Just now";
      }

      const date = new Date(timestamp);

      // Check if date is valid
      if (isNaN(date.getTime()) || !isFinite(date.getTime())) {
        console.warn("Invalid timestamp received:", timestamp);
        return "Invalid date";
      }

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();

      // Debug: Log timestamp details
      console.log("Timestamp debug:", {
        original: timestamp,
        parsed: date.toISOString(),
        now: now.toISOString(),
        diffMs: diffMs,
        diffMins: Math.floor(diffMs / 60000),
      });

      const diffMins = Math.floor(diffMs / 60000);

      // Handle negative time differences (future dates or clock skew)
      if (diffMins < 0) {
        console.log('Future date detected, showing "Just now"');
        return "Just now";
      }
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;

      return date.toLocaleDateString();
    } catch (error) {
      console.error(
        "Error formatting timestamp:",
        error,
        "Timestamp:",
        timestamp
      );
      return "Invalid date";
    }
  };

  // Handle navigation based on notification type
  const handleNotificationClick = (notification) => {
    // Mark as read first
    if (!notification.read) {
      dispatch(markAsRead(notification.id || notification._id));
    }

    // Navigate based on notification type
    switch (notification.type) {
      case "booking":
        // Navigate to profile page for booking-related notifications
        navigate("/profile");
        break;
      case "session":
        // Navigate to profile page for session-related notifications
        navigate("/profile");
        break;
      case "google_meet_ready":
        // Navigate to profile page for Google Meet notifications
        navigate("/profile");
        break;
      default:
        // Default: navigate to profile page
        navigate("/profile");
        break;
    }
  };

  const handleMarkAsRead = async (id, readStatus?: boolean) => {
    try {
      // If readStatus is provided, use toggle API; otherwise use the old behavior
      if (readStatus !== undefined) {
        // Toggle to opposite state
        await toggleNotificationReadStatusAPI(id);
      } else {
        // Mark as read (old behavior for backward compatibility)
        await markNotificationAsReadAPI(id);
      }
      
      // Update Redux state after successful API call
      dispatch(markAsRead(id));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // Optionally show error toast here
    }
  };

  // Toggle read/unread status
  const handleToggleReadStatus = async (id, currentReadStatus: boolean) => {
    try {
      // Call API to toggle read status
      const response = await toggleNotificationReadStatusAPI(id);
      
      // Update Redux state based on new read status from API response
      const newReadStatus = response.data?.read ?? !currentReadStatus;
      
      // If marking as unread, we need to increment the count
      if (!newReadStatus) {
        dispatch(markAsUnread(id));
      } else {
        dispatch(markAsRead(id));
      }
    } catch (error) {
      console.error("Failed to toggle notification read status:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Call API to mark all notifications as read
      await markAllNotificationsAsReadAPI();
      
      // Update Redux state after successful API call
      dispatch(markAllAsRead());
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      // Optionally show error toast here
    }
  };

  const handleClearAll = () => {
    dispatch(clearAllNotifications());
  };

  const handleDeleteNotification = async (id) => {
    try {
      // Call API to delete notification from backend
      await deleteNotificationAPI(id);
      
      // Remove from Redux state after successful API call
      dispatch(removeNotification(id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
      // Optionally show error toast here
    }
  };

  // Handle navigation to profile notifications tab
  const handleSeeAllNotifications = () => {
    navigate("/profile", { state: { section: "notifications" } });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-8 w-8 p-0"
                  title="Mark all as read"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-8 w-8 p-0"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Notifications List - Show only unread notifications */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <p>Loading notifications...</p>
            </div>
          ) : notifications.filter(n => !n.read).length > 0 ? (
            notifications.filter(n => !n.read).map((notification) => (
              <DropdownMenuItem
                key={notification.id || notification._id}
                className={`flex flex-col items-start p-4 cursor-pointer duration-200 focus:bg-primary/5 focus:text-primary bg-primary/5`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNotificationClick(notification);
                }}
              >
                <div className="flex items-start gap-3 w-full mb-2">
                  {/* Type Icon */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(
                      notification.type
                    )}`}
                  >
                    {getTypeIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm truncate">
                        {notification.title}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                        {/* Toggle Read/Unread Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggleReadStatus(
                              notification.id || notification._id,
                              notification.read
                            );
                          }}
                          className={`h-6 w-6 p-0 hover:bg-green-100 hover:text-green-600`}
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteNotification(notification.id || notification._id);
                          }}
                          className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                          title="Delete notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs  text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>

                    {/* Show Google Meet link if available */}
                    {notification.googleMeetLink && (
                      <div className="mt-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-xs font-medium text-primary mb-1">
                          Google Meet Link:
                        </p>
                        <a
                          href={notification.googleMeetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:text-primary/80 underline break-all"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {notification.googleMeetLink}
                        </a>
                        {notification.googleMeetCode && (
                          <p className="text-xs text-primary mt-1">
                            Code:{" "}
                            <span className="font-mono font-bold">
                              {notification.googleMeetCode}
                            </span>
                          </p>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-gray-400 mt-2">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-medium mb-1">No unread notifications</p>
              <p className="text-xs">
                You're all caught up!
              </p>
            </div>
          )}
        </div>

        {/* Footer - Show unread count with See All button */}
        <div className="border-t p-3 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeeAllNotifications}
            className="text-xs h-7 px-3"
          >
            See All
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
