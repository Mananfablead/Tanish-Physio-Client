import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, setNotifications, markAsRead, markAsUnread, removeNotification } from "@/store/slices/notificationSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Video,
  Link as LinkIcon,
  Info,
  Check,
  Trash2,
  RefreshCw,
  Bell,
} from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import {
  deleteNotification as deleteNotificationAPI,
  toggleNotificationReadStatusAPI,
  markAllNotificationsAsReadAPI,
} from "@/lib/notificationApi";

interface Notification {
  id?: string;
  _id?: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  timestamp: string;
  sessionId?: string;
  bookingId?: string;
  googleMeetLink?: string;
  googleMeetCode?: string;
}

export function NotificationsSection() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const notificationsState = useSelector((state: any) => state.notifications);
  const { list: notifications, unreadCount, pagination, loading } = notificationsState;
  const authState = useSelector((state: any) => state.auth);
  const user = authState?.user;
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");

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

  // Fetch notifications
  const fetchNotificationsData = async () => {
    if (!token || !user) return;

    try {
      setIsLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/notifications?page=1&limit=50`,
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

    //   toast({
    //     title: "Notifications Updated",
    //     description: `${data.notifications?.length || 0} notifications loaded`,
    //   });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    //   toast({
    //     title: "Error",
    //     description: "Failed to load notifications",
    //     variant: "destructive",
    //   });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationsData();
  }, []);

  // Get icon based on notification type
  const getTypeIcon = (type: string) => {
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
  const getTypeColor = (type: string) => {
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

  // Format timestamp
  const formatTime = (timestamp: string) => {
    try {
      if (!timestamp) return "Just now";

      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "Invalid date";

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 0) return "Just now";
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;

      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;

      return date.toLocaleDateString();
    } catch (error) {
      return "Invalid date";
    }
  };

  // Handle toggle read/unread
  const handleToggleReadStatus = async (id: string, currentReadStatus: boolean) => {
    try {
      const response = await toggleNotificationReadStatusAPI(id);
      const newReadStatus = response.data?.read ?? !currentReadStatus;

      if (!newReadStatus) {
        dispatch(markAsUnread(id));
      } else {
        dispatch(markAsRead(id));
      }

      toast({
        title: "Status Updated",
        description: `Notification marked as ${newReadStatus ? 'read' : 'unread'}`,
      });
    } catch (error) {
      console.error("Failed to toggle read status:", error);
      toast({
        title: "Error",
        description: "Failed to update notification status",
        variant: "destructive",
      });
    }
  };

  // Handle delete
  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotificationAPI(id);
      dispatch(removeNotification(id));

      toast({
        title: "Deleted",
        description: "Notification deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsReadAPI();
      dispatch({ type: 'notifications/markAllAsRead' });

      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((n: Notification) => {
    if (filter === "read") return n.read;
    if (filter === "unread") return !n.read;
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              All Notifications
            </CardTitle>
            <CardDescription>
              View and manage all your notifications
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={unreadCount > 0 ? "default" : "secondary"}>
              {unreadCount} Unread
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchNotificationsData}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                Mark All Read
              </Button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Unread ({unreadCount})
          </Button>
          <Button
            variant={filter === "read" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("read")}
          >
            Read ({notifications.length - unreadCount})
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {loading || isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Loading notifications...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredNotifications.map((notification: Notification) => (
              <div
                key={notification.id || notification._id}
                className={`p-4 rounded-lg border transition-colors ${
                  notification.read
                    ? "bg-background hover:bg-muted/50"
                    : "bg-primary/5 border-primary/20"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Type Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeColor(
                      notification.type
                    )}`}
                  >
                    {getTypeIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-base">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <Badge variant="default" className="ml-2 text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {/* Toggle Read/Unread */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleToggleReadStatus(
                              notification.id || notification._id,
                              notification.read
                            )
                          }
                          className="h-7 w-7 p-0"
                          title={
                            notification.read ? "Mark as unread" : "Mark as read"
                          }
                        >
                          {notification.read ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Info className="w-4 h-4" />
                          )}
                        </Button>
                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDeleteNotification(
                              notification.id || notification._id
                            )
                          }
                          className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>

                    {/* Show Google Meet link if available */}
                    {notification.googleMeetLink && (
                      <div className="mt-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-xs font-medium text-primary mb-1">
                          Google Meet Link:
                        </p>
                        <a
                          href={notification.googleMeetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:text-primary/80 underline break-all"
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

                    <p className="text-xs text-muted-foreground mt-2">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <p className="font-medium text-lg mb-1">
              No {filter !== "all" ? filter : ""} notifications
            </p>
            <p className="text-sm text-muted-foreground">
              {filter === "all"
                ? "You don't have any notifications yet"
                : `No ${filter} notifications found`}
            </p>
          </div>
        )}

        {/* Footer Stats */}
        {notifications.length > 0 && (
          <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm text-muted-foreground">
            <span>
              Total: {pagination.total || notifications.length} notifications
            </span>
            <span>
              Page {pagination.page || 1} of {pagination.pages || 1}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
