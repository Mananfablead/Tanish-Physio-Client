// Notification state interface
export interface NotificationState {
  list: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

// Notification item interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "booking" | "session" | "google_meet_ready" | "system";
  read: boolean;
  timestamp: string;
  sessionId?: string;
  bookingId?: string;
  googleMeetLink?: string;
  googleMeetCode?: string;
  unread?: boolean;
}
