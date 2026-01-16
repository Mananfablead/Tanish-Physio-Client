import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  createPaymentOrder,
  verifyPayment,
  processPaymentWebhook,
  createSubscriptionPaymentOrder,
  verifySubscriptionPayment,
  getUserPayments
} from '../../lib/api';

// Define Payment interface
export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  orderId: string;
  paymentId: string;
  status: string;
  type: string;
  bookingId?: string;
  subscriptionId?: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  createdAt: string;
  updatedAt: string;
}

// Define state interface
interface PaymentState {
  payment: Payment | null;
  userPayments: Payment[];
  loading: boolean;
  error: string | null;
  orderDetails: any;
}

// Initial state
const initialState: PaymentState = {
  payment: null,
  userPayments: [],
  loading: false,
  error: null,
  orderDetails: null,
};

// Async thunks for payment operations
export const createNewPaymentOrder = createAsyncThunk(
  'payment/createOrder',
  async (orderData: any, { rejectWithValue }) => {
    try {
      const response: any = await createPaymentOrder(orderData);
      return response.data.data.order;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment order');
    }
  }
);

export const verifyPaymentTransaction = createAsyncThunk(
  'payment/verify',
  async (verificationData: any, { rejectWithValue }) => {
    try {
      const response: any = await verifyPayment(verificationData);
      return response.data.data.payment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify payment');
    }
  }
);

export const processPaymentWebhookAction = createAsyncThunk(
  'payment/webhook',
  async (webhookData: any, { rejectWithValue }) => {
    try {
      const response: any = await processPaymentWebhook(webhookData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process payment webhook');
    }
  }
);

export const createNewSubscriptionPaymentOrder = createAsyncThunk(
  'payment/createSubscriptionOrder',
  async (orderData: any, { rejectWithValue }) => {
    try {
      const response: any = await createSubscriptionPaymentOrder(orderData);
      return response.data.data.order;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create subscription payment order');
    }
  }
);

export const verifySubscriptionPaymentTransaction = createAsyncThunk(
  'payment/verifySubscription',
  async (verificationData: any, { rejectWithValue }) => {
    try {
      const response: any = await verifySubscriptionPayment(verificationData);
      return response.data.data.payment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify subscription payment');
    }
  }
);

// Async thunk to fetch user payments
export const fetchUserPayments = createAsyncThunk(
  'payment/fetchUserPayments',
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await getUserPayments();
      return response.data.data.payments;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user payments'
      );
    }
  }
);


const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setPayment: (state, action: PayloadAction<Payment | null>) => {
      state.payment = action.payload;
    },
    clearPayment: (state) => {
      state.payment = null;
    },
    setOrderDetails: (state, action: PayloadAction<any>) => {
      state.orderDetails = action.payload;
    },
    resetPaymentState: (state) => {
      state.payment = null;
      state.loading = false;
      state.error = null;
      state.orderDetails = null;
    },
    setUserPayments: (state, action: PayloadAction<Payment[]>) => {
      state.userPayments = action.payload;
    },
    clearUserPayments: (state) => {
      state.userPayments = [];
    },
    addUserPayment: (state, action: PayloadAction<Payment>) => {
      state.userPayments.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // createNewPaymentOrder
      .addCase(createNewPaymentOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewPaymentOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetails = action.payload;
      })
      .addCase(createNewPaymentOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // verifyPaymentTransaction
      .addCase(verifyPaymentTransaction.fulfilled, (state, action) => {
        state.payment = action.payload;
      })
      // createNewSubscriptionPaymentOrder
      .addCase(createNewSubscriptionPaymentOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewSubscriptionPaymentOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetails = action.payload;
      })
      .addCase(createNewSubscriptionPaymentOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // verifySubscriptionPaymentTransaction
      .addCase(verifySubscriptionPaymentTransaction.fulfilled, (state, action) => {
        state.payment = action.payload;
      })
      // fetchUserPayments
      .addCase(fetchUserPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.userPayments = action.payload;
      })
      .addCase(fetchUserPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  setPayment, 
  clearPayment, 
  setOrderDetails,
  resetPaymentState
} = paymentSlice.actions;

export default paymentSlice.reducer;