import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({
    baseURL: `${API_BASE_URL}/api/video-call`,
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

// Video Call API Service
export const videoCallApi = {
    // Generate secure JWT token for joining call
    generateJoinLink: async (sessionId, userId, role) => {
        const response = await apiClient.post('/generate-join-link', {
            sessionId,
            userId,
            role,
        });
        return response.data;
    },

    // Verify call token
    verifyJoinLink: async (token) => {
        const response = await apiClient.post('/verify-join-link', { token });
        return response.data;
    },

    // Get call details for a session
    getCallDetails: async (sessionId) => {
        const response = await apiClient.get(`/info/${sessionId}`);
        return response.data;
    },

    // Get participants for a session
    getSessionParticipants: async (sessionId) => {
        const response = await apiClient.get(`/session/${sessionId}/participants`);
        return response.data;
    },

    // Group session specific APIs
    getGroupSessionDetails: async (groupSessionId) => {
        const response = await apiClient.get(`/group-sessions/${groupSessionId}`);
        return response.data;
    },

    getGroupSessionParticipants: async (groupSessionId) => {
        const response = await apiClient.get(`/group-sessions/${groupSessionId}/participants-status`);
        return response.data;
    },

    generateGroupJoinLink: async (groupSessionId, userId, role) => {
        const response = await apiClient.post('/generate-join-link', {
            groupSessionId,
            userId,
            role,
        });
        return response.data;
    },

    // Get user's call history
    getCallHistory: async (params = {}) => {
        const response = await apiClient.get('/history', { params });
        return response.data;
    },

    // Report call issue
    reportCallIssue: async (sessionId, issue, description) => {
        const response = await apiClient.post('/report-issue', {
            sessionId,
            issue,
            description,
        });
        return response.data;
    },

    // Create call log
    createCallLog: async (sessionId, groupSessionId, type, participants) => {
        const response = await apiClient.post('/logs', {
            sessionId,
            groupSessionId,
            type,
            participants
        });
        return response.data;
    },
};

// Admin Video Call API Service
export const adminVideoCallApi = {
    // Get all call logs with filters
    getCallLogs: async (params = {}) => {
        const response = await apiClient.get('/logs', { params });
        return response.data;
    },

    // Get call quality metrics for a session
    getCallQualityMetrics: async (sessionId) => {
        const response = await apiClient.get(`/logs/${sessionId}/metrics`);
        return response.data;
    },

    // Get currently active calls
    getActiveCalls: async () => {
        const response = await apiClient.get('/active');
        return response.data;
    },

    // Force end a call
    forceEndCall: async (sessionId, reason) => {
        const response = await apiClient.post('/force-end', {
            sessionId,
            reason,
        });
        return response.data;
    },

    // Mute a participant
    muteParticipant: async (sessionId, userId) => {
        const response = await apiClient.post('/mute-participant', {
            sessionId,
            userId,
        });
        return response.data;
    },

    // Get participants for a session
    getSessionParticipants: async (sessionId) => {
        const response = await apiClient.get(`/session/${sessionId}/participants`);
        return response.data;
    },
};

export default videoCallApi;