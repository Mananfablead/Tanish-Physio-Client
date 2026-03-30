import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getSubscriptionPlans, getUserSubscriptions } from '../../lib/api';
import { detectUserCountry, getCountryInfoSync } from '../../utils/countryDetection';

// Define TypeScript interfaces
export interface SubscriptionPlan {
  _id?: string;
  id?: string;
  planId: string;
  name: string;
  price: number;
  price_inr?: number;
  price_usd?: number;
  priceINR?: number;
  priceUSD?: number;
  description: string;
  features: string[];
  duration: string;
  status?: string;
  originalPrice?: number;
  sessions?: number | string;
  services?: string[];
  popular?: boolean;
  subscriberCount?: number;
  session_type?: 'individual' | 'group'; // New field
  currency?: '₹' | '$'; // New field for currency display
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
  async (params: { sessionType?: 'individual' | 'group' } | undefined, thunkAPI) => {
    try {
      let countryInfo;
      try {
        // Detect user's country for price filtering
        countryInfo = await detectUserCountry();
      } catch (countryError) {
        console.warn('Failed to detect country, using fallback:', countryError);
        // Use synchronous fallback if async detection fails
        countryInfo = getCountryInfoSync();
      }
      
      // Fetch plans with country and session type parameters
      const queryParams: any = { country: countryInfo.country };
      if (params?.sessionType) {
        queryParams.session_type = params.sessionType;
      }

      const response: any = await getSubscriptionPlans({
        params: queryParams
      });
      
      return {
        plans: response.data.data.plans,
        country: countryInfo.country,
      };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch subscription plans');
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
        const { plans, country } = action.payload as { plans: any[]; country?: string };
        
        // Backend has already calculated the correct price based on country
        // Trust the backend's calculation instead of re-calculating
        state.plans = plans.map((plan: any) => ({
          ...plan,
          id: plan._id || plan.id,
          sessions: plan.sessions,
          // Use the price already calculated by backend (it has proper conversion logic)
          price: Number(plan.price) || 0,
          // Ensure currency from backend is preserved
          currency: plan.currency || '₹',
          popular: plan.popular || plan.planId,
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