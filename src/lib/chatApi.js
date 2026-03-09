import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({
    baseURL: `${API_BASE_URL}/chat`,
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
    sendMessage: async (sessionId, messageData) => {
        // Handle both formats: string message or object with content
        const message = typeof messageData === 'string' ? messageData : messageData.content || messageData.message;

        // For default live chat, use special endpoint
        if (sessionId === 'default-live-chat') {
            const response = await apiClient.post('/send/default-live-chat', {
                message,
            });
            return response.data;
        } else {
            // For regular sessions
            const response = await apiClient.post(`/send/${sessionId}`, {
                message,
            });
            return response.data;
        }
    },

    // Get chat messages for a session
    getMessages: async (sessionId) => {
        // For default live chat, use the new dedicated endpoint
            if (sessionId === 'default-live-chat') {
            try {
                const response = await apiClient.get('/default/messages');
                return response.data;
            } catch (error) {
                console.error('Error fetching default chat messages:', error);
                // Return empty response structure
                return { success: false, data: { messages: [] } };
            }
            } else if (typeof sessionId === 'string' && sessionId.startsWith('support-')) {
                try {
                    const response = await apiClient.get(`/support/${encodeURIComponent(sessionId)}`);
                    return response.data;
                } catch (error) {
                    console.error('Error fetching support chat messages:', error);
                    return { success: false, data: { messages: [] } };
                }
            } else {
        // For regular sessions
            const response = await apiClient.get(`/${sessionId}`);
            return response.data;
        }
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

    // Upload file
    uploadFile: async (file, token) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await apiClient.post('/upload-file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            // Authorization header is added by interceptor
        });
        
        return response.data;
    },
};

// Export apiClient for direct access if needed
export { apiClient };

export default chatApi;