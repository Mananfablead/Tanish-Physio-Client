import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} title
 * @property {string} message
 * @property {string} type
 * @property {boolean} read
 * @property {string} timestamp
 * @property {string} [sessionId]
 * @property {string} [bookingId]
 * @property {string} [googleMeetLink]
 * @property {string} [googleMeetCode]
 */

// Determine API base URL
const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }

    if (window.location.hostname === 'localhost') {
        return 'http://localhost:5000/api';
    }

    return 'https://apitanishvideo.fableadtech.in/api';
};

const API_BASE_URL = getApiBaseUrl();

// Async thunk for fetching notifications from API
export const fetchNotifications = createAsyncThunk(
    "notifications/fetchAll",
    async ({ page = 1, limit = 20, unreadOnly = false } = {}, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                unreadOnly: unreadOnly.toString()
            });

            const res = await axios.get(
                `${API_BASE_URL}/notifications?${params}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            return res.data.data?.notifications || [];
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Notification fetch failed");
        }
    }
);

// Async thunk for marking all notifications as read
export const markAllAsReadAPI = createAsyncThunk(
    "notifications/markAllAsRead",
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(
                `${API_BASE_URL}/notifications/read-all`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return res.data.data?.modifiedCount || 0;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to mark all as read");
        }
    }
);

const notificationSlice = createSlice({
    name: "notifications",
    initialState: {
        list: /** @type {Notification[]} */ ([]),
        unreadCount: 0,
        loading: false,
        error: null,
        pagination: {
            page: 1,
            limit: 20,
            total: 0,
            pages: 1
        }
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        // Add real-time notification from socket
        addNotification: (state, action) => {
            state.list.unshift(action.payload);
            if (action.payload.read !== true) {
                state.unreadCount += 1;
            }
            state.pagination.total += 1;
        },
        // Mark notification as read
        markAsRead: (state, action) => {
            const index = state.list.findIndex(n => n.id === action.payload || n._id === action.payload);
            if (index !== -1 && !state.list[index].read) {
                state.list[index].read = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        // Mark notification as unread
        markAsUnread: (state, action) => {
            const index = state.list.findIndex(n => n.id === action.payload || n._id === action.payload);
            if (index !== -1 && state.list[index].read) {
                state.list[index].read = false;
                state.unreadCount += 1;
            }
        },
        // Mark all notifications as read
        markAllAsRead: (state) => {
            state.list.forEach(notification => {
                notification.read = true;
            });
            state.unreadCount = 0;
        },
        // Remove notification
        removeNotification: (state, action) => {
            const index = state.list.findIndex(n => n.id === action.payload || n._id === action.payload);
            if (index !== -1) {
                if (!state.list[index].read) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
                state.list = state.list.filter(n => n.id !== action.payload && n._id !== action.payload);
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            }
        },
        // Clear all notifications
        clearAllNotifications: (state) => {
            state.list = [];
            state.unreadCount = 0;
            state.pagination.total = 0;
        },
        // Set notifications from API
        setNotifications: (state, action) => {
            state.list = action.payload.notifications || [];
            state.unreadCount = action.payload.unreadCount || 0;
            if (action.payload.pagination) {
                state.pagination = action.payload.pagination;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch notifications
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
                state.unreadCount = action.payload.filter(n => !n.read).length;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Mark all as read
            .addCase(markAllAsReadAPI.fulfilled, (state) => {
                state.list.forEach(notification => {
                    notification.read = true;
                });
                state.unreadCount = 0;
            });
    },
});

export const {
    clearError,
    addNotification,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    setNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
