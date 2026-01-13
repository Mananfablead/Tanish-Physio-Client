import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getSubscriptionPlans } from '../../lib/api';

// Define TypeScript interfaces
export interface SubscriptionPlan {
  _id?: string;
  id?: string;
  planId: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  duration: string;
  status?: string;
  originalPrice?: number;
  sessions?: number | string;
  services?: string[];
  popular?: boolean;
}

interface SubscriptionState {
  plans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
}

// Async thunk to fetch subscription plans
export const fetchSubscriptionPlans = createAsyncThunk(
  'subscriptions/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await getSubscriptionPlans();
      return response.data.data.plans;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscription plans');
    }
  }
);

const initialState: SubscriptionState = {
  plans: [],
  loading: false,
  error: null,
};

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch subscription plans
      .addCase(fetchSubscriptionPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionPlans.fulfilled, (state, action) => {
        state.loading = false;
        // Transform the data to match the expected format for the UI
        state.plans = action.payload.map((plan: any) => ({
          ...plan,
          id: plan._id,
          sessions: plan.duration === 'monthly' ? 'Unlimited' : 1,
          services: [
            'Orthopedic Physiotherapy',
            'Neuro Physiotherapy', 
            'Sports Physiotherapy',
            plan.duration === 'monthly' 
              ? 'All physiotherapy services' 
              : 'Basic physiotherapy service',
            plan.duration === 'monthly' 
              ? 'Personalized treatment plans' 
              : 'Basic exercise plan',
            plan.duration === 'monthly' 
              ? 'Unlimited exercise plans' 
              : 'Exercise plan access',
          ],
          popular: plan.planId === 'monthly',
        }));
      })
      .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;