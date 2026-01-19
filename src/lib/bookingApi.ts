import api from "./api";

const bookingApi = {
  // Get all bookings for the authenticated user
  getAll: () => api.get("/bookings"),

  // Get a specific booking by ID
  getById: (id: string) => api.get(`/bookings/${id}`),

  // Create a new booking (therapistId will be auto-assigned)
  create: (bookingData: {
    serviceId: string;
    date: string;
    time: string;
    notes?: string;
    clientName?: string;
  }) => api.post("/bookings", bookingData),

  // Update a booking
  update: (
    id: string,
    bookingData: {
      date?: string;
      time?: string;
      notes?: string;
    }
  ) => api.put(`/bookings/${id}`, bookingData),

  // Cancel a booking
  cancel: (id: string) => api.delete(`/bookings/${id}`),
};

export default bookingApi;
