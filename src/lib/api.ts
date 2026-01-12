import axios from 'axios';

// Create an axios instance
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect on login attempts, just reject the promise
      const isLoginAttempt = error.config.url?.includes('/auth/login');
      if (!isLoginAttempt) {
        // Clear auth data if token is invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login'; // Redirect to login
      }
    }
    return Promise.reject(error);
  }
);

// Availability API functions
export const getAvailability = () => {
  return api.get('/availability');
};

export const getAvailabilityByTherapist = (therapistId: string) => {
  return api.get(`/availability/therapist/${therapistId}`);
};

export const confirmSession = (sessionData: any) => {
  return api.post('/sessions/confirm', sessionData);
};

export default api;