import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getSubscriptionPlans, getUserSubscriptions } from '../../lib/api';

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

// Define User Subscription interface
export interface UserSubscription {
  _id?: string;
  id?: string;
  userId: string;
  planId: string;
  plan: SubscriptionPlan;
  status: string;
  purchasedAt: string;
  end: string;
  remainingSessions?: number;
  name?: string;
  description?: string;
  price?: number;
  duration?: string;
}

interface SubscriptionState {
  plans: SubscriptionPlan[];
  userSubscriptions: UserSubscription[];
  activePlan: UserSubscription | null;
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

// Async thunk to fetch user subscriptions
export const fetchUserSubscriptions = createAsyncThunk(
  'subscriptions/fetchUserSubscriptions',
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await getUserSubscriptions();
      return response.data.data.subscriptions;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user subscriptions'
      );
    }
  }
);


const initialState: SubscriptionState = {
  plans: [],
  userSubscriptions: [],
  activePlan: null,
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
    clearUserSubscriptions: (state) => {
      state.userSubscriptions = [];
      state.activePlan = null;
    },
    setActivePlan: (state, action) => {
      state.activePlan = action.payload;
    },
    updateUserSubscription: (state, action) => {
      const updatedSub = action.payload;
      const existingIndex = state.userSubscriptions.findIndex(sub => sub._id === updatedSub._id);
      if (existingIndex !== -1) {
        state.userSubscriptions[existingIndex] = updatedSub;
        if (updatedSub.status === 'active') {
          state.activePlan = updatedSub;
        } else if (state.activePlan?._id === updatedSub._id && updatedSub.status !== 'active') {
          state.activePlan = null;
        }
      }
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
      })
      // Fetch user subscriptions
      .addCase(fetchUserSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.userSubscriptions = action.payload;
        // Set the active plan if any exists
        const activeSub = action.payload.find((sub: UserSubscription) => sub.status === 'active');
        state.activePlan = activeSub || null;
      })
      .addCase(fetchUserSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;