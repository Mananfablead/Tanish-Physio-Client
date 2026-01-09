import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../lib/api';
import { User } from '../types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

// Async thunk for login
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

// Async thunk for register
export const register = createAsyncThunk(
  'auth/register',
  async (
    { name, email, password, phone }: { name: string; email: string; password: string; phone?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/auth/register', { name, email, password, phone });
      const { token, user } = response.data.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      );
    }
  }
);

// Async thunk for logout
export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear localStorage and state
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
});

// Async thunk for fetching user profile
export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/profile');
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch profile'
    );
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logoutSync: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      // Fetch profile cases
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isAuthenticated = false;
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      });
  },
});

export const { clearError, setCredentials, logoutSync } = authSlice.actions;
export default authSlice.reducer;