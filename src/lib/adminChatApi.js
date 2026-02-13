import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const adminChatApiClient = axios.create({
    baseURL: `${API_BASE_URL}/admin-chat`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
adminChatApiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Admin Chat API Service
export const adminChatApi = {
    // Get all chat messages for admin view
    getChatMessages: async (params = {}) => {
        const response = await adminChatApiClient.get('/', { params });
        return response.data;
    },

    // Get chat messages for a specific user
    getUserChatMessages: async (userId, params = {}) => {
        const response = await adminChatApiClient.get(`/user/${userId}`, { params });
        return response.data;
    },

    // Get unread messages count
    getUnreadMessagesCount: async () => {
        const response = await adminChatApiClient.get('/unread-count');
        return response.data;
    },

    // Mark messages as read
    markMessagesAsRead: async (messageIds) => {
        const response = await adminChatApiClient.put('/mark-read', { messageIds });
        return response.data;
    },

    // Send admin reply
    sendAdminReply: async (data) => {
        const response = await adminChatApiClient.post('/reply', data);
        return response.data;
    },

    // Get active chats (chats with unread messages)
    getActiveChats: async () => {
        const response = await adminChatApiClient.get('/active-chats');
        return response.data;
    },

    // Get chat statistics
    getChatStats: async () => {
        const response = await adminChatApiClient.get('/stats');
        return response.data;
    },
};

export default adminChatApiClient;