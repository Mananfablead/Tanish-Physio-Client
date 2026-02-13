import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Define the Offer type
interface Offer {
  _id: string;
  code: string;
  discount: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  isActive: boolean;
  minimumAmount: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  appliesToUsers: string[];
  appliesToNewUsersOnly: boolean;
  allowedBookingTypes: string[];
  createdAt: string;
  updatedAt: string;
}

// Define the state interface
interface OffersState {
  offers: Offer[];
  loading: boolean;
  error: string | null;
  validatingCoupon: boolean;
  couponValidation: {
    isValid: boolean | null;
    discount: number;
    error: string | null;
  };
}

// Async thunk to fetch all active offers
export const fetchOffers = createAsyncThunk(
  'offers/fetchOffers',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/offers?isActive=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message || 'Failed to fetch offers');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch offers');
    }
  }
);

// Async thunk to validate a coupon code
export const validateCoupon = createAsyncThunk(
  'offers/validateCoupon',
  async ({ code, amount, bookingType, userId }: { code: string; amount: number; bookingType: string; userId?: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/offers/validate`, {
        code,
        amount,
        bookingType,
        userId
      }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Invalid coupon code');
    }
  }
);

// Initial state
const initialState: OffersState = {
  offers: [],
  loading: false,
  error: null,
  validatingCoupon: false,
  couponValidation: {
    isValid: null,
    discount: 0,
    error: null,
  },
};

// Create the slice
const offersSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {
    resetCouponValidation: (state) => {
      state.couponValidation = {
        isValid: null,
        discount: 0,
        error: null,
      };
    },
    clearOffersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch offers
      .addCase(fetchOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.offers = action.payload;
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Validate coupon
      .addCase(validateCoupon.pending, (state) => {
        state.validatingCoupon = true;
        state.couponValidation.error = null;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.validatingCoupon = false;
        state.couponValidation.isValid = true;
        
        // Calculate discount based on offer type
        const offer = action.payload;
        let calculatedDiscount = 0;
        
        if (offer.type === "percentage") {
          calculatedDiscount = Math.round(offer.value * 100); // Converting decimal to percentage
          // Apply max discount limit if set
          if (offer.maxDiscountAmount && calculatedDiscount > offer.maxDiscountAmount) {
            calculatedDiscount = offer.maxDiscountAmount;
          }
        } else {
          calculatedDiscount = offer.value;
        }
        
        state.couponValidation.discount = calculatedDiscount;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.validatingCoupon = false;
        state.couponValidation.isValid = false;
        state.couponValidation.error = action.payload as string;
        state.couponValidation.discount = 0;
      });
  },
});

// Export actions and reducer
export const { resetCouponValidation, clearOffersError } = offersSlice.actions;
export default offersSlice.reducer;