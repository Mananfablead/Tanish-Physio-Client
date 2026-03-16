import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../../lib/api";
import { User } from "../../types/user";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterResponse {
  token: string;
  user: User;
}

interface ProfileResponse {
  _id: string;
  id: string;
  name: string;
  email: string;
  role?: string;
  phone?: string;
  image?: string;
  profilePicture?: string; // Add profilePicture field from backend
  healthProfile?: any;
  createdAt: string;
  updatedAt: string;
  subscriptionData?: any;
  purchasedServices?: any[];
  
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,
  error: null,
};

// Async thunk for login
export const login = createAsyncThunk<
  { token: string; user: User },
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
      appType: "client",
    });
    const apiResponse = response.data as ApiResponse<LoginResponse>;
    const { token, user } = apiResponse.data;

    // Save token to localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    return { token, user };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Login failed");
  }
});

// Async thunk for register
export const register = createAsyncThunk<
  { token: string; user: User },
  { name: string; email: string; password: string; phone?: string },
  { rejectValue: string }
>(
  "auth/register",
  async ({ name, email, password, phone }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        phone,
      });
      const apiResponse = response.data as ApiResponse<RegisterResponse>;
      const { token, user } = apiResponse.data;

      // Save token to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { token, user };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

// Async thunk for logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      await api.post("/auth/logout");
      // Dispatch logoutSync to update the state
      dispatch(logoutSync());
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }
);

// Async thunk for fetching user profile
export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/profile");
      const apiResponse = response.data as ApiResponse<ProfileResponse>;
      return apiResponse.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  }
);

// Async thunk for forgot password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }: { email: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      const apiResponse = response.data as ApiResponse<any>;
      return apiResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Password reset request failed"
      );
    }
  }
);

// Async thunk for reset password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    { token, password }: { token: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, {
        password,
      });
      const apiResponse = response.data as ApiResponse<any>;
      return apiResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Password reset failed"
      );
    }
  }
);

// Async thunk for updating user profile
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData: Partial<User> | FormData, { rejectWithValue }) => {
    try {
      let response;
      if (profileData instanceof FormData) {
        // Handle multipart form data (for image uploads)
        response = await api.put("/auth/profile", profileData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Handle regular profile updates (JSON data)
        response = await api.put("/auth/profile", profileData);
      }

      const apiResponse = response.data as ApiResponse<any>; // Use any to handle flexible response
      // Update user in localStorage
      localStorage.setItem("user", JSON.stringify(apiResponse.data));
      return apiResponse.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

// Async thunk for handling guest user transition after successful payment
export const handleGuestUserTransition = createAsyncThunk(
  "auth/handleGuestUserTransition",
  async (
    credentials: { email: string; password: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      // Attempt to login with the provided credentials
      const response = await api.post("/auth/login", {
        ...credentials,
        appType: "client",
      });
      const apiResponse = response.data as ApiResponse<LoginResponse>;
      const { token, user } = apiResponse.data;

      // Save token and user to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Dispatch setCredentials to update the state
      dispatch(setCredentials({ user, token }));

      return { token, user };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to transition guest user to logged-in user"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      // Save token and user to localStorage
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    logoutSync: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    decrementSubscriptionSessions: (state) => {
      if (state.user?.subscriptionData) {
        // Initialize sessions if not present (from totalService)
        if (state.user.subscriptionData.sessions == null && state.user.subscriptionData.totalService != null) {
          state.user.subscriptionData.sessions = state.user.subscriptionData.totalService;
        }
        
        // Decrement sessions (remaining count)
        if (state.user.subscriptionData.sessions > 0) {
          state.user.subscriptionData.sessions -= 1;
        }
        // Update localStorage
        localStorage.setItem("user", JSON.stringify(state.user));
      }
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
        // Map ProfileResponse to User interface
        state.user = {
          id: action.payload._id,
          name: action.payload.name,
          email: action.payload.email,
          role: action.payload.role,
          phone: action.payload.phone,
          location: action.payload.location,
          subscriptionData: action.payload.subscriptionData,
          profilePicture: action.payload.profilePicture,
          healthProfile: action.payload.healthProfile,
          purchasedServices: action.payload.purchasedServices || [] as any[],
        };
        state.isAuthenticated = true;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        const errorMessage = action.payload as string;
        state.error = errorMessage;

        // Check if the error is due to inactive account
        if (
          errorMessage &&
          (errorMessage.includes("Account is not active") ||
            errorMessage.includes("not active"))
        ) {
          // Clear auth data for inactive accounts
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } else {
          state.isAuthenticated = false;
          // Clear invalid token
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      })
      // Forgot password cases
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update profile cases
      .addCase(updateProfile.fulfilled, (state, action) => {
        // Map profilePicture from backend to image in frontend
        const userData = action.payload;
        state.user = {
          ...userData,
          image: userData.profilePicture || userData.image,
        };
        state.isAuthenticated = true;
        // IMPORTANT: Update localStorage to stay in sync
        localStorage.setItem("user", JSON.stringify(state.user));
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCredentials, logoutSync, decrementSubscriptionSessions } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) =>
  state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.loading;

export default authSlice.reducer;
