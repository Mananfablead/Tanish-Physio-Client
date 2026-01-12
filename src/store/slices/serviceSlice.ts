import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';

// Import the service type from the shared types
import { Service } from '../../types/service';

// Helper function to transform API service data to expected format
const transformServiceFromAPI = (apiService: any): Service => {
  return {
    id: apiService._id || apiService.id || Math.random().toString(36).substr(2, 9),
    icon: apiService.icon || 'default-icon',
    title: apiService.name || apiService.title || 'Service Title',
    description: apiService.description || 'Service Description',
    category: apiService.category || 'General',
    benefits: Array.isArray(apiService.benefits) ? apiService.benefits : [],
    details: {
      title: apiService.name || apiService.title || 'Service Title',
      description: apiService.description || 'Service Description',
      benefits: Array.isArray(apiService.benefits) ? apiService.benefits : [],
      detailedDescription: apiService.detailedDescription || apiService.description || 'Detailed description',
      conditionsTreated: Array.isArray(apiService.conditionsTreated) ? apiService.conditionsTreated : [],
      sessionDuration: apiService.duration || apiService.sessionDuration || '30 min',
      price: `₹${apiService.price || 0}`,
      priceRange: `₹${apiService.price || 0}`,
      prerequisites: apiService.prerequisites || '',
      whatToExpect: Array.isArray(apiService.whatToExpect) ? apiService.whatToExpect : [],
      resultsTimeline: apiService.resultsTimeline || '2-4 weeks',
    },
    media: {
      heroImage: apiService.heroImage || apiService.image,
      aboutImage: apiService.aboutImage,
      videoUrl: apiService.videoUrl,
    }
  };
};

// Async thunks for service operations
export const fetchAllServices = createAsyncThunk(
  'services/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/services');
      // Transform the API response to match the expected format
      const responseData: any = response.data;
      const apiServices = responseData.data?.services || responseData;
      const transformedServices = apiServices.map(transformServiceFromAPI);
      return transformedServices;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchServiceById = createAsyncThunk(
  'services/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/services/${id}`);
      // Transform the API response to match the expected format
      const responseData: any = response.data;
      const apiService = responseData.data?.service || responseData;
      return transformServiceFromAPI(apiService);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state
interface ServiceState {
  services: Service[];
  selectedService: Service | null;
  loading: boolean;
  error: string | null;
}

const initialState: ServiceState = {
  services: [],
  selectedService: null,
  loading: false,
  error: null,
};

// Service slice
const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearSelectedService: (state) => {
      state.selectedService = null;
    },
    resetServices: (state) => {
      state.services = [];
      state.selectedService = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload as any[];
      })
      .addCase(fetchAllServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchServiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedService = action.payload as any;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedService, resetServices } = serviceSlice.actions;

export default serviceSlice.reducer;