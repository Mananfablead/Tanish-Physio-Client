import axios from "axios";

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

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem("token");
};

// Get auth headers
const getAuthHeaders = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Delete a single notification
export const deleteNotification = async (notificationId: string) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/notifications/${notificationId}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    throw new Error(
      error.response?.data?.message || "Failed to delete notification"
    );
  }
};

// Mark notification as read (API call)
export const markNotificationAsReadAPI = async (notificationId: string) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/notifications/${notificationId}/read`,
      {},
      getAuthHeaders()
    );
    return response.data;
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    throw new Error(
      error.response?.data?.message || "Failed to mark notification as read"
    );
  }
};

// Toggle notification read/unread status (API call)
export const toggleNotificationReadStatusAPI = async (notificationId: string) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/notifications/${notificationId}/read`,
      {},
      getAuthHeaders()
    );
    return response.data;
  } catch (error: any) {
    console.error("Error toggling notification read status:", error);
    throw new Error(
      error.response?.data?.message || "Failed to toggle notification read status"
    );
  }
};

// Mark all notifications as read (API call)
export const markAllNotificationsAsReadAPI = async () => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/notifications/read-all`,
      {},
      getAuthHeaders()
    );
    return response.data;
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error);
    throw new Error(
      error.response?.data?.message || "Failed to mark all notifications as read"
    );
  }
};

// Clear all notifications (API call - admin only for now, but can be extended)
export const clearAllNotificationsAPI = async () => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/notifications`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error: any) {
    console.error("Error clearing all notifications:", error);
    throw new Error(
      error.response?.data?.message || "Failed to clear all notifications"
    );
  }
};
