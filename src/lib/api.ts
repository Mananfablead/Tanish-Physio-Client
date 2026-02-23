import axios from "axios";
 

// Create an axios instance
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

console.log("API_BASE_URL", API_BASE_URL)

// Export API_BASE_URL for use in other files
export { API_BASE_URL };

// Fallback URL if environment variable is not set
const baseURL = API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
      const isLoginAttempt = error.config.url?.includes("/auth/login");
      if (!isLoginAttempt) {
        // Clear auth data if token is invalid
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login"; // Redirect to login
      }
    }

    // Handle specific session not active error globally
    if (
      error?.response?.data?.message?.includes(
        "Session is not active at this time"
      )
    ) {
      error.response.data.message =
        "⏰ Session Not Active\n\nThis session is not currently active. Please check your scheduled appointment time and try again later.";
    }

    return Promise.reject(error);
  }
);

// Availability API functions
export const getAvailability = () => {
  return api.get("/availability");
};

export const getAvailabilityByTherapist = (therapistId: string) => {
  return api.get(`/availability/therapist/${therapistId}`);
};

export const confirmSession = (sessionData: any) => {
  return api.post("/sessions/confirm", sessionData);
};

// Subscription API functions
export const getSubscriptionPlans = (config?: any) => {
  return api.get("/subscriptions", config);
};

// Subscription booking API functions
export const checkSubscriptionEligibility = () => {
  return api.get("/subscriptions/eligibility");
};

export const getSubscriptionServices = () => {
  return api.get("/subscriptions/services");
};

export const createFreeSessionWithSubscription = (sessionData: any) => {
  return api.post("/subscriptions/free-session", sessionData);
};

// Create booking with subscription (no payment required)
export const createBookingWithSubscription = (bookingData: any) => {
  return api.post("/bookings/subscription", bookingData);
};

export const getActiveQuestionnaire = () => {
  return api.get("/questionnaires/active");
};

export const submitQuestionnaireResponse = (data: {
  questionnaireId: string;
  responses: { questionId: string; answer: any }[];
}) => {
  return api.post("/questionnaires/submit", data);
};

// Update user profile with health data
export const updateProfileQuestion = (profileData: any) => {
  return api.put("/auth/profile", profileData);
};

// Booking API functions
export const createBooking = (bookingData: any) => {
  return api.post("/bookings", bookingData);
};

export const getAllBookings = () => {
  return api.get("/bookings");
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
  return api.post("/payments/create-order", paymentData);
};

export const verifyPayment = (paymentData: any) => {
  return api.post("/payments/verify", paymentData);
};

export const createSubscriptionPaymentOrder = (paymentData: any) => {
  return api.post("/payments/create-subscription-order", paymentData);
};

export const verifySubscriptionPayment = (paymentData: any) => {
  return api.post("/payments/verify-subscription", paymentData);
};

// Guest API functions
export const createGuestBooking = (bookingData: {
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
}) => {
  return api.post("/bookings/guest", bookingData);
};

export const createGuestPaymentOrder = (paymentData: {
  bookingId: string;
  amount: number;
  currency: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
}) => {
  return api.post("/payments/create-guest-order", paymentData);
};

export const createGuestSubscriptionPaymentOrder = (paymentData: {
  planId: string;
  amount: number;
  currency: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
}) => {
  return api.post("/payments/create-guest-subscription-order", paymentData);
};

export const verifyGuestPayment = (paymentData: {
  paymentId: string;
  orderId: string;
  signature: string;
}) => {
  return api.post("/payments/verify-guest", paymentData);
};

export const verifyGuestSubscriptionPayment = (paymentData: {
  paymentId: string;
  orderId: string;
  signature: string;
}) => {
  return api.post("/payments/verify-guest-subscription", paymentData);
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

// Guest booking specific functions
export const getBookingByIdGuest = (id: string, clientEmail: string) => {
  return api.get(`/bookings/${id}`, { params: { clientEmail } });
};

export const updateGuestBookingStatus = (
  id: string,
  status: string,
  clientEmail: string
) => {
  return api.put(`/bookings/guest-status/${id}`, { status, clientEmail });
};

export const updateGuestBooking = (
  id: string,
  bookingData: any,
  clientEmail: string
) => {
  console.log("updateGuestBooking called with:", {
    id,
    bookingData,
    clientEmail,
  });
  const payload = {
    status: bookingData.status,
    clientEmail: clientEmail,
  };
  console.log("Sending payload:", payload);
  return api.put(`/bookings/guest-status/${id}`, payload);
};

export const processPaymentWebhook = (webhookData: any) => {
  return api.post("/payments/webhook", webhookData);
};

// Testimonial API functions
export const getFeaturedTestimonials = () => {
  return api.get("/testimonials/public/featured");
};

// Get testimonials by current user
export const getUserTestimonials = () => {
  return api.get("/testimonials/user");
};

export const createTestimonial = (testimonialData: any) => {
  return api.post("/testimonials/create", testimonialData);
};

// Create testimonial with video upload capability
export const createTestimonialWithVideo = (testimonialData: any) => {
  const formData = new FormData();
  
  // Add all fields to formData
  Object.keys(testimonialData).forEach(key => {
    if (testimonialData[key] !== null && testimonialData[key] !== undefined) {
      formData.append(key, testimonialData[key]);
    }
  });
  
  return api.post("/testimonials/create", formData); // Browser automatically sets correct content-type with boundary
};

// Session API functions
export const getAllSessions = () => {
  return api.get("/sessions");
};

export const getUpcomingSessions = () => {
  return api.get("/sessions/upcoming");
};

export const getSessionById = (id: string) => {
  return api.get(`/sessions/${id}`);
};

export const createSession = (sessionData: any) => {
  return api.post("/sessions", sessionData);
};

export const updateSession = (id: string, sessionData: any) => {
  return api.put(`/sessions/${id}`, sessionData);
};

export const deleteSession = (id: string) => {
  return api.delete(`/sessions/${id}`);
};

// User payment and subscription related functions
export const getUserPayments = () => {
  return api.get("/payments/user");
};

export const getUserSubscriptions = () => {
  return api.get("/subscriptions/user");
};

// Additional session related functions
export const getSessionsByUserId = (userId: string) => {
  return api.get(`/sessions/user/${userId}`);
};

export const getSessionsByTherapistId = (therapistId: string) => {
  return api.get(`/sessions/therapist/${therapistId}`);
};

export const getCompletedSessions = () => {
  return api.get("/sessions/completed");
};

export const getScheduledSessions = () => {
  return api.get("/sessions/scheduled");
};

export const cancelSession = (id: string) => {
  return api.patch(`/sessions/${id}/cancel`);
};

export const rescheduleSession = (id: string, newDateTime: any) => {
  return api.put(`/sessions/${id}/reschedule`, newDateTime);
};

export const getSessionNotes = (id: string) => {
  return api.get(`/sessions/${id}/notes`);
};

export const addSessionNotes = (id: string, notes: any) => {
  return api.post(`/sessions/${id}/notes`, notes);
};

export const getPastSessions = () => {
  return api.get("/sessions/past");
};

export const getTodaySessions = () => {
  return api.get("/sessions/today");
};

// Profile API functions
export const updateProfile = (profileData: any) => {
  // Check if we're uploading an image (which requires multipart/form-data)
  if (profileData.image instanceof File) {
    const formData = new FormData();
    formData.append("image", profileData.image);

    // If there are other fields, add them to formData
    Object.keys(profileData).forEach((key) => {
      if (key !== "image" && profileData[key] !== undefined) {
        formData.append(key, profileData[key]);
      }
    });

    return api.put("/auth/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // For regular profile updates (JSON data)
  return api.put("/auth/profile", profileData);
};

// Profile image upload function
export const uploadProfileImage = (imageFile: File) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  return api.put("/auth/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// CMS API functions
export const getHeroPublic = () => {
  return api.get("/cms/public/hero");
};

export const getStepsPublic = () => {
  return api.get("/cms/public/steps");
};

export const getWhyUsPublic = () => {
  return api.get("/cms/public/whyUs");
};

export const getFaqsPublic = () => {
  return api.get("/cms/public/faqs");
};

export const getConditionsPublic = () => {
  return api.get("/cms/public/conditions");
};

export const getTermsPublic = () => {
  return api.get("/cms/public/terms");
};

export const getContactPublic = () => {
  return api.get("/cms/public/contact");
};

export const getAboutPublic = () => {
  return api.get("/cms/public/about");
};

// Admin API functions
export const getPublicAdmins = () => {
  return api.get("/auth/admins/public");
};

// User check API function
export const checkUserExists = (email: string) => {
  return api.post("/users/check-exists", { email });
};

// Booking details API function
export const getBookingDetails = (id: string, clientEmail: string) => {
  return api.post(`/bookings/details/${id}`, { clientEmail });
};

// Slot availability API functions
export const checkSlotAvailability = (slotData: {
  therapistId: string;
  date: string;
  timeSlot: {
    start: string;
    end: string;
  };
}) => {
  return api.post(`/bookings/check-slot-availability`, slotData);
};

export const updateBookingSchedule = (id: string, scheduleData: any) => {
  return api.put(`/bookings/${id}/schedule`, scheduleData);
};

// Video Call API functions
export const videoCallAPI = {
  // Generate secure JWT token for joining call
  generateJoinLink: (sessionId, userId, role) =>
    api.post("video-call/generate-join-link", { sessionId, userId, role }),

  // Verify call token
  verifyJoinLink: (token) => api.post("video-call/verify-join-link", { token }),

  // Get call details for a session
  getCallDetails: (sessionId) => api.get(`video-call/info/${sessionId}`),

  // Get user's call history
  getCallHistory: (params = {}) => api.get("video-call/history", { params }),

  // Report call issue
  reportCallIssue: (sessionId, issue, description) =>
    api.post("video-call/report-issue", { sessionId, issue, description }),
};

// Service API functions
export const getAllServices = () => {
  return api.get("/services");
};

export const getFeaturedServices = () => {
  return api.get("/services/featured");
};

export const getServiceById = (id: string) => {
  return api.get(`/services/${id}`);
};

export const getServiceBySlug = (slug: string) => {
  return api.get(`/services/slug/${slug}`);
};

export const createService = (serviceData: any) => {
  return api.post("/services", serviceData);
};

export const updateService = (id: string, serviceData: any) => {
  return api.put(`/services/${id}`, serviceData);
};

export const deleteService = (id: string) => {
  return api.delete(`/services/${id}`);
};

// Chat API functions
export const chatAPI = {
  // Join a chat room
  joinRoom: () => api.post("/chat/join"),

  // Leave a chat room
  leaveRoom: () => api.post("/chat/leave"),

  // Send a chat message
  sendMessage: (sessionId, message) =>
    api.post("/chat/send", { sessionId, message }),

  // Get chat messages for a session
  getMessages: (sessionId) => api.get(`/chat/${sessionId}`),

  // Send typing indicator
  sendTyping: () => api.post("/chat/typing"),

  // Send stop typing indicator
  sendStopTyping: () => api.post("/chat/stop-typing"),

  // Offers API
  getOffers: (params) => api.get('/offers', { params }),
  getOfferById: (id) => api.get(`/offers/${id}`),
  createOffer: (data) => api.post('/offers', data),
  updateOffer: (id, data) => api.put(`/offers/${id}`, data),
  deleteOffer: (id) => api.delete(`/offers/${id}`),
  validateOffer: (data) => api.post('/offers/validate', data),
  incrementOfferUsage: (id) => api.post(`/offers/${id}/increment-usage`),
};

export default api;
