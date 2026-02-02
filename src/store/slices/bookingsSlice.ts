import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  createBooking, 
  getAllBookings, 
  getBookingById, 
  updateBooking, 
  updateGuestBooking,
  deleteBooking,
  createPaymentOrder,
  verifyPayment,
  createSubscriptionPaymentOrder,
  verifySubscriptionPayment,
  createGuestBooking,
  createGuestPaymentOrder,
  verifyGuestPayment,
  createGuestSubscriptionPaymentOrder,
  verifyGuestSubscriptionPayment
} from '../../lib/api';

interface Booking {
  _id: string;
  serviceId: {
    _id: string;
    name: string;
    price: number;
    duration: string;
    validity: number;
  };
  serviceName: string;
  therapistId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  therapistName: string;
  userId: string;
  clientName: string;
  date: string;
  time: string;
  status: string;
  notes: string;
  paymentStatus: string;
  amount: number;
  purchaseDate: string;
  serviceExpiryDate: string;
  serviceValidityDays: number;
  isServiceExpired: boolean;
  createdAt: string;
  updatedAt: string;
  clientEmail: string;
}

interface PaymentOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id: string | null;
  status: string;
  attempts: number;
  notes: Record<string, any>;
  created_at: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

interface BookingsState {
  bookings: Booking[];
  currentBooking: Booking | null;
  loading: boolean;
  error: string | null;
  paymentOrder: PaymentOrder | null;
  paymentLoading: boolean;
}

const initialState: BookingsState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,
  paymentOrder: null,
  paymentLoading: false,
};

// Async thunks for bookings
export const createBookingAsync = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData: any, { rejectWithValue }) => {
    try {
      const response = await createBooking(bookingData);
      const apiResponse = response.data as ApiResponse<Booking>;
      return apiResponse.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create booking'
      );
    }
  }
);

interface GetAllBookingsResponse {
  bookings: Booking[];
}

export const getAllBookingsAsync = createAsyncThunk(
  'bookings/getAllBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllBookings();
      const apiResponse = response.data as ApiResponse<GetAllBookingsResponse | Booking[]>;
      return apiResponse.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch bookings'
      );
    }
  }
);

export const getBookingByIdAsync = createAsyncThunk(
  'bookings/getBookingById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await getBookingById(id);
      const apiResponse = response.data as ApiResponse<Booking>;
      return apiResponse.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch booking'
      );
    }
  }
);

export const updateBookingAsync = createAsyncThunk(
  'bookings/updateBooking',
  async ({ id, bookingData }: { id: string; bookingData: any }, { rejectWithValue }) => {
    try {
      const response = await updateBooking(id, bookingData);
      const apiResponse = response.data as ApiResponse<Booking>;
      console.log('Updated Booking:', apiResponse.data);
      return apiResponse.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update booking'
      );
    }
  }
);

export const updateGuestBookingAsync = createAsyncThunk(
  'bookings/updateGuestBooking',
  async ({ id, bookingData, clientEmail }: { id: string; bookingData: any; clientEmail: string }, { rejectWithValue }) => {
    try {
      console.log('updateGuestBookingAsync called with:', { id, bookingData, clientEmail });
      const response = await updateGuestBooking(id, bookingData, clientEmail);
      const apiResponse = response.data as ApiResponse<Booking>;
      return apiResponse.data;
    } catch (error: any) {
      console.error('updateGuestBookingAsync error:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update guest booking'
      );
    }
  }
);

export const deleteBookingAsync = createAsyncThunk(
  'bookings/deleteBooking',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await deleteBooking(id);
      const apiResponse = response.data as ApiResponse<null>;
      return { id, message: apiResponse.message };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete booking'
      );
    }
  }
);

// Async thunks for payments
export const createPaymentOrderAsync = createAsyncThunk(
  'bookings/createPaymentOrder',
  async (paymentData: any, { rejectWithValue }) => {
    try {
      const response = await createPaymentOrder(paymentData);
      const apiResponse = response.data as ApiResponse<any>;
      return apiResponse.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create payment order'
      );
    }
  }
);

export const verifyPaymentAsync = createAsyncThunk(
  'bookings/verifyPayment',
  async (paymentData: any, { rejectWithValue }) => {
    try {
      const response = await verifyPayment(paymentData);
      const apiResponse = response.data as ApiResponse<any>;
      return apiResponse.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to verify payment'
      );
    }
  }
);

export const createSubscriptionPaymentOrderAsync = createAsyncThunk(
  'bookings/createSubscriptionPaymentOrder',
  async (paymentData: any, { rejectWithValue }) => {
    try {
      const response = await createSubscriptionPaymentOrder(paymentData);
      const apiResponse = response.data as ApiResponse<any>;
      return apiResponse.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create subscription payment order'
      );
    }
  }
);

export const verifySubscriptionPaymentAsync = createAsyncThunk(
  'bookings/verifySubscriptionPayment',
  async (paymentData: any, { rejectWithValue }) => {
    try {
      const response = await verifySubscriptionPayment(paymentData);
      const apiResponse = response.data as ApiResponse<any>;
      return apiResponse.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to verify subscription payment'
      );
    }
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearPaymentOrder: (state) => {
      state.paymentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create booking cases
      .addCase(createBookingAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBookingAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(createBookingAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get all bookings cases
      .addCase(getAllBookingsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllBookingsAsync.fulfilled, (state, action) => {
        state.loading = false;
        // API returns { bookings: Booking[] }, so we need to extract the bookings array
        const payload = action.payload;
        const rawBookings = Array.isArray(payload) ? payload : (payload as any).bookings || [];
        
        // Transform the booking data to match the ServiceWithExpiration interface expected by UI
        state.bookings = rawBookings.map(booking => ({
          ...booking,
          // Map backend field names to UI expected field names
          isExpired: booking.isServiceExpired,
          expiryDate: booking.serviceExpiryDate,
        }));
      })
      .addCase(getAllBookingsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get booking by ID cases
      .addCase(getBookingByIdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(getBookingByIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update booking cases
      .addCase(updateBookingAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bookings.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        state.currentBooking = action.payload;
      })
      .addCase(updateBookingAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete booking cases
      .addCase(deleteBookingAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = state.bookings.filter(b => b._id !== action.payload.id);
        if (state.currentBooking?._id === action.payload.id) {
          state.currentBooking = null;
        }
      })
      .addCase(deleteBookingAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create payment order cases
      .addCase(createPaymentOrderAsync.pending, (state) => {
        state.paymentLoading = true;
        state.error = null;
      })
      .addCase(createPaymentOrderAsync.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.paymentOrder = action.payload.order;
      })
      .addCase(createPaymentOrderAsync.rejected, (state, action) => {
        state.paymentLoading = false;
        state.error = action.payload as string;
      })
      // Verify payment cases
      .addCase(verifyPaymentAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Update booking payment status if successful
        if (state.currentBooking) {
          state.currentBooking.paymentStatus = 'completed';
        }
      })
      .addCase(verifyPaymentAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Guest booking async thunks
export const createGuestBookingAsync = createAsyncThunk(
  'bookings/createGuestBooking',
  async (bookingData: any, { rejectWithValue }) => {
    try {
      const response = await createGuestBooking(bookingData);
      const apiResponse = response.data as ApiResponse<Booking>;
      return apiResponse.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create guest booking'
      );
    }
  }
);

export const createGuestPaymentOrderAsync = createAsyncThunk(
  'bookings/createGuestPaymentOrder',
  async (paymentData: any, { rejectWithValue }) => {
    try {
      const response = await createGuestPaymentOrder(paymentData);
      const apiResponse = response.data as ApiResponse<any>;
      return apiResponse.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create guest payment order'
      );
    }
  }
);

export const verifyGuestPaymentAsync = createAsyncThunk(
  'bookings/verifyGuestPayment',
  async (paymentData: any, { rejectWithValue }) => {
    try {
      const response = await verifyGuestPayment(paymentData);
      const apiResponse = response.data as ApiResponse<any>;
      return apiResponse.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to verify guest payment'
      );
    }
  }
);

export const createGuestSubscriptionPaymentOrderAsync = createAsyncThunk(
  'bookings/createGuestSubscriptionPaymentOrder',
  async (paymentData: any, { rejectWithValue }) => {
    try {
      const response = await createGuestSubscriptionPaymentOrder(paymentData);
      const apiResponse = response.data as ApiResponse<any>;
      return apiResponse.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create guest subscription payment order'
      );
    }
  }
);

export const verifyGuestSubscriptionPaymentAsync = createAsyncThunk(
  'bookings/verifyGuestSubscriptionPayment',
  async (paymentData: any, { rejectWithValue }) => {
    try {
      const response = await verifyGuestSubscriptionPayment(paymentData);
      const apiResponse = response.data as ApiResponse<any>;
      return apiResponse.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to verify guest subscription payment'
      );
    }
  }
);

export const { 
  clearCurrentBooking, 
  clearError, 
  clearPaymentOrder 
} = bookingsSlice.actions;

// Selectors
export const selectBookings = (state: { bookings: BookingsState }) => state.bookings.bookings;
export const selectCurrentBooking = (state: { bookings: BookingsState }) => state.bookings.currentBooking;
export const selectBookingsLoading = (state: { bookings: BookingsState }) => state.bookings.loading;
export const selectBookingsError = (state: { bookings: BookingsState }) => state.bookings.error;
export const selectPaymentOrder = (state: { bookings: BookingsState }) => state.bookings.paymentOrder;
export const selectPaymentLoading = (state: { bookings: BookingsState }) => state.bookings.paymentLoading;

export default bookingsSlice.reducer;