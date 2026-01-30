import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({
    baseURL: `${API_BASE_URL}/api/chat`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle specific session not active error globally
        if (error?.response?.data?.message?.includes('Session is not active at this time')) {
            error.response.data.message = '⏰ Session Not Active\n\nThis session is not currently active. Please check your scheduled appointment time and try again later.';
        }
        return Promise.reject(error);
    }
);

// Chat API Service
export const chatApi = {
    // Join a chat room
    joinRoom: async () => {
        const response = await apiClient.post('/join');
        return response.data;
    },

    // Leave a chat room
    leaveRoom: async () => {
        const response = await apiClient.post('/leave');
        return response.data;
    },

    // Send a chat message
    sendMessage: async (sessionId, message) => {
        const response = await apiClient.post(`/send/${sessionId}`, {
            message,
        });
        return response.data;
    },

    // Get chat messages for a session
    getMessages: async (sessionId) => {
        const response = await apiClient.get(`/${sessionId}`);
        return response.data;
    },

    // Send typing indicator
    sendTyping: async () => {
        const response = await apiClient.post('/typing');
        return response.data;
    },

    // Send stop typing indicator
    sendStopTyping: async () => {
        const response = await apiClient.post('/stop-typing');
        return response.data;
    },
};

export default chatApi;