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
    const token = localStorage.getItem('token')||"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTVmODJjOWNkMjU2MzJmNDQ3MjY3OGUiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3Njg0NjI1MzAsImV4cCI6MTc2ODU0ODkzMH0.B7SrQOJ2iVnw5nu1owpVals6El6g5XVMTdczabtjpI8"
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

// Subscription API functions
export const getSubscriptionPlans = () => {
  return api.get('/subscriptions');
};

// Questionnaire API functions
export const getActiveQuestionnaire = () => {
  return api.get('/questionnaires/active');
};

export const submitQuestionnaireResponse = (data: { questionnaireId: string; responses: { questionId: string; answer: any }[] }) => {
  return api.post('/questionnaires/submit', data);
// Booking API functions
export const createBooking = (bookingData: any) => {
  return api.post('/bookings', bookingData);
};

export const getAllBookings = () => {
  return api.get('/bookings');
};

export const getBookingById = (id: string) => {
  return api.get(`/bookings/${id}`);
};

export const updateBooking = (id: string, bookingData: any) => {
  return api.put(`/bookings/${id}`, bookingData);
};

export const deleteBooking = (id: string) => {
  return api.delete(`/bookings/${id}`);
};

// Payment API functions
export const createPaymentOrder = (paymentData: any) => {
  return api.post('/payments/create-order', paymentData);
};

export const verifyPayment = (paymentData: any) => {
  return api.post('/payments/verify', paymentData);
};

export const createSubscriptionPaymentOrder = (paymentData: any) => {
  return api.post('/payments/create-subscription-order', paymentData);
};

export const verifySubscriptionPayment = (paymentData: any) => {
  return api.post('/payments/verify-subscription', paymentData);
};

// Additional booking and payment related functions
export const getBookingsByStatus = (status: string) => {
  return api.get(`/bookings/status/${status}`);
};

export const filterBookings = (filters: any) => {
  return api.get(`/bookings/filter`, { params: filters });
};

export const updateBookingStatus = (id: string, status: string) => {
  return api.put(`/bookings/${id}/status`, { status });
};

export const processPaymentWebhook = (webhookData: any) => {
  return api.post('/payments/webhook', webhookData);
};

// Session API functions
export const getAllSessions = () => {
  return api.get('/sessions');
};

export const getUpcomingSessions = () => {
  return api.get('/sessions/upcoming');
};

export const getSessionById = (id: string) => {
  return api.get(`/sessions/${id}`);
};

export const createSession = (sessionData: any) => {
  return api.post('/sessions', sessionData);
};

export const updateSession = (id: string, sessionData: any) => {
  return api.put(`/sessions/${id}`, sessionData);
};

export const deleteSession = (id: string) => {
  return api.delete(`/sessions/${id}`);
};

// Additional session related functions
export const getSessionsByUserId = (userId: string) => {
  return api.get(`/sessions/user/${userId}`);
};

export const getSessionsByTherapistId = (therapistId: string) => {
  return api.get(`/sessions/therapist/${therapistId}`);
};

export const getCompletedSessions = () => {
  return api.get('/sessions/completed');
};

export const getScheduledSessions = () => {
  return api.get('/sessions/scheduled');
};

export const cancelSession = (id: string) => {
  return api.patch(`/sessions/${id}/cancel`);
};

export const rescheduleSession = (id: string, newDateTime: any) => {
  return api.patch(`/sessions/${id}/reschedule`, newDateTime);
};

export const getSessionNotes = (id: string) => {
  return api.get(`/sessions/${id}/notes`);
};

export const addSessionNotes = (id: string, notes: any) => {
  return api.post(`/sessions/${id}/notes`, notes);
};

export const getPastSessions = () => {
  return api.get('/sessions/past');
};

export const getTodaySessions = () => {
  return api.get('/sessions/today');
};

export default api;