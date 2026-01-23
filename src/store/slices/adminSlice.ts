import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getPublicAdmins } from '../../lib/api';

// Define types for admin data
interface DoctorProfile {
  name: string;
  experience: string;
  specialization: string;
  bio: string;
  education: string;
  languages: string[];
  certifications: string[];
}

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
  doctorProfile?: DoctorProfile;
  joinDate: string;
}

interface AdminState {
  admins: Admin[];
  loading: boolean;
  error: string | null;
}

// Async thunk to fetch public admin data
export const fetchPublicAdmins = createAsyncThunk(
  'admin/fetchPublicAdmins',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPublicAdmins();
      
      // Validate response structure
      if (!response.data.success || !response.data.data) {
        return rejectWithValue('Invalid response structure');
      }

      // Ensure statusCode validation as per project specification
      if (response.data.statusCode !== 200 && response.data.statusCode !== undefined) {
        return rejectWithValue(`API Error: ${response.data.message}`);
      }

      // According to the API response, the data is in response.data.data
      // Extract the required fields from the API response
      const adminsData = response.data.data.map((admin: any) => ({
        id: admin.id || admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        profilePicture: admin.profilePicture,
        doctorProfile: admin.doctorProfile,
        joinDate: admin.joinDate
      }));

      return adminsData;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch admin data');
    }
  }
);

// Initial state
const initialState: AdminState = {
  admins: [],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    setAdmins: (state, action: PayloadAction<Admin[]>) => {
      state.admins = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetch public admins
      .addCase(fetchPublicAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicAdmins.fulfilled, (state, action: PayloadAction<Admin[]>) => {
        state.loading = false;
        state.admins = action.payload;
      })
      .addCase(fetchPublicAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAdminError, setAdmins } = adminSlice.actions;

export default adminSlice.reducer;