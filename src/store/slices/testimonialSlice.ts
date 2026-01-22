import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { getFeaturedTestimonials as getFeaturedTestimonialsApi } from '@/lib/api';

// Define the Testimonial type
export interface Testimonial {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  content: string;
  problem: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

// Async thunk to fetch featured testimonials
export const fetchFeaturedTestimonials = createAsyncThunk(
  'testimonials/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getFeaturedTestimonialsApi();
      
      // Validate response according to project specification
      if (response.data.success !== true) {
        return rejectWithValue(response.data.message || 'Failed to fetch testimonials');
      }
      
      // Return only the data part as per project specification
      return response.data.data as Testimonial[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch testimonials');
    }
  }
);

// Initial state
interface TestimonialState {
  featured: Testimonial[];
  loading: boolean;
  error: string | null;
}

const initialState: TestimonialState = {
  featured: [],
  loading: false,
  error: null,
};

const testimonialSlice = createSlice({
  name: 'testimonials',
  initialState,
  reducers: {
    clearTestimonialError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch featured testimonials
      .addCase(fetchFeaturedTestimonials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedTestimonials.fulfilled, (state, action) => {
        state.loading = false;
        
        // According to project specification, ensure state.featured is always an array
        state.featured = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchFeaturedTestimonials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTestimonialError } = testimonialSlice.actions;

// Selectors
export const selectFeaturedTestimonials = (state: RootState) => state.testimonials.featured;
export const selectTestimonialsLoading = (state: RootState) => state.testimonials.loading;
export const selectTestimonialsError = (state: RootState) => state.testimonials.error;

export default testimonialSlice.reducer;