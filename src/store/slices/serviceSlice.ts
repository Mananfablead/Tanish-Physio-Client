import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../lib/api';

// Import the service type from the shared types
import { Service } from '../../types/service';
import { RootState } from '../index';

// Helper function to transform API service data to expected format
const transformServiceFromAPI = (apiService: any): Service => {
  // Handle images array - use first image as heroImage, second as aboutImage
  const images = Array.isArray(apiService.images) ? apiService.images : [];
  const heroImage = images[0] || apiService.heroImage || apiService.image;
  const aboutImage = images[1] || apiService.aboutImage || heroImage;

  // Handle videos array - use first video
  const videos = Array.isArray(apiService.videos) ? apiService.videos : [];
  const videoUrl = videos[0] || apiService.videoUrl;

  // Combine additional images with features
  const additionalImages = images.slice(2); // All images except the first two
  const existingFeatures = Array.isArray(apiService.features)
    ? apiService.features
    : [];
  const combinedFeatures = [...existingFeatures, ...additionalImages];

  return {
    id:
      apiService._id ||
      apiService.id ||
      Math.random().toString(36).substr(2, 9),
    slug: apiService.slug || undefined, // Add slug field
    icon: apiService.icon || "default-icon",
    title: apiService.name || apiService.title || "Service Title",
    description: apiService.description || "Service Description",
    category: apiService.category || "General",
    benefits: Array.isArray(apiService.benefits) ? apiService.benefits : [],

    details: {
      title: apiService.name || apiService.title || "Service Title",
      description: apiService.description || "Service Description",
      benefits: Array.isArray(apiService.benefits) ? apiService.benefits : [],
      detailedDescription:
        apiService.about ||
        apiService.detailedDescription ||
        apiService.description ||
        "Detailed description",
      conditionsTreated: Array.isArray(apiService.contraindications)
        ? apiService.contraindications
        : [],
      features: combinedFeatures, // Include additional images in features
      sessionDuration:
        apiService.duration || apiService.sessionDuration || "30 min",
      price: `₹${apiService.priceINR || apiService.price || 0}`, // For backward compatibility
      priceINR: apiService.priceINR || apiService.price || 0,
      priceUSD: apiService.priceUSD || 0,
      priceRange: `₹${apiService.priceINR || apiService.price || 0}`,
      prerequisites: Array.isArray(apiService.prerequisites)
        ? apiService.prerequisites.join(", ")
        : apiService.prerequisites || "",
      whatToExpect: Array.isArray(apiService.features)
        ? apiService.features
        : [],
      resultsTimeline: apiService.resultsTimeline || "2-4 weeks",
      sessions: apiService.sessions || apiService.totalSessions || 0,
    },
    media: {
      heroImage: heroImage,
      aboutImage: aboutImage,
      videoUrl: videoUrl,
    },
  };
};

// Async thunks for service operations
export const fetchAllServices = createAsyncThunk(
  "services/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/services");
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

export const fetchFeaturedServices = createAsyncThunk(
  "services/fetchFeatured",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/services/featured");
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
  "services/fetchById",
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

export const fetchServiceBySlug = createAsyncThunk(
  "services/fetchBySlug",
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/services/slug/${slug}`);
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
  featuredServices: Service[];
  selectedService: Service | null;
  loading: boolean;
  error: string | null;
}

const initialState: ServiceState = {
  services: [],
  featuredServices: [],
  selectedService: null,
  loading: false,
  error: null,
};

// Service slice
const serviceSlice = createSlice({
  name: "services",
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
      .addCase(fetchFeaturedServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedServices.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredServices = action.payload as any[];
      })
      .addCase(fetchFeaturedServices.rejected, (state, action) => {
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
      })
      .addCase(fetchServiceBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedService = action.payload as any;
      })
      .addCase(fetchServiceBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedService, resetServices } = serviceSlice.actions;

// Selectors
export const selectAllServices = (state: RootState) => state.services.services;
export const selectFeaturedServices = (state: RootState) =>
  state.services.featuredServices;
export const selectServicesLoading = (state: RootState) => state.services.loading;
export const selectServicesError = (state: RootState) => state.services.error;
export const selectSelectedService = (state: RootState) => state.services.selectedService;

export default serviceSlice.reducer;