import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getAllSessions, 
  getUpcomingSessions, 
  getPastSessions, 
  getCompletedSessions, 
  getScheduledSessions, 
  getTodaySessions,
  getSessionsByUserId,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  cancelSession,
  rescheduleSession,
  getSessionNotes,
  addSessionNotes
} from '../../lib/api';

// Define Session interface
export interface Session {
  id: string;
  userId: string;
  therapistId: string;
  therapistName: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  notes: string;
  relatedTo: string;
  location: string;
  bookingId?: string;
  createdAt: string;
  updatedAt: string;
}

// Define state interface
interface SessionState {
  sessions: Session[];
  upcomingSessions: Session[];
  pastSessions: Session[];
  completedSessions: Session[];
  scheduledSessions: Session[];
  todaySessions: Session[];
  loading: boolean;
  error: string | null;
  currentSession: Session | null;
}

// Initial state
const initialState: SessionState = {
  sessions: [],
  upcomingSessions: [],
  pastSessions: [],
  completedSessions: [],
  scheduledSessions: [],
  todaySessions: [],
  loading: false,
  error: null,
  currentSession: null,
};

// Async thunks for session operations
export const fetchAllSessions = createAsyncThunk(
  'session/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await getAllSessions();
      return response.data.data.sessions;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sessions');
    }
  }
);

export const fetchUpcomingSessions = createAsyncThunk(
  'session/fetchUpcoming',
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await getUpcomingSessions();
      return response.data.data.sessions;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch upcoming sessions');
    }
  }
);

export const fetchPastSessions = createAsyncThunk(
  'session/fetchPast',
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await getPastSessions();
      return response.data.data.sessions;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch past sessions');
    }
  }
);

export const fetchCompletedSessions = createAsyncThunk(
  'session/fetchCompleted',
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await getCompletedSessions();
      return response.data.data.sessions;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch completed sessions');
    }
  }
);

export const fetchScheduledSessions = createAsyncThunk(
  'session/fetchScheduled',
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await getScheduledSessions();
      return response.data.data.sessions;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch scheduled sessions');
    }
  }
);

export const fetchTodaySessions = createAsyncThunk(
  'session/fetchToday',
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await getTodaySessions();
      return response.data.data.sessions;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch today\'s sessions');
    }
  }
);

export const fetchSessionById = createAsyncThunk(
  'session/fetchById',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response: any = await getSessionById(sessionId);
      return response.data.data.session;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch session');
    }
  }
);

export const fetchSessionsByUserId = createAsyncThunk(
  'session/fetchByUserId',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response: any = await getSessionsByUserId(userId);
      return response.data.data.sessions;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sessions for user');
    }
  }
);

export const createNewSession = createAsyncThunk(
  'session/create',
  async (sessionData: any, { rejectWithValue }) => {
    try {
      const response: any = await createSession(sessionData);
      return response.data.data.session;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create session');
    }
  }
);

export const updateExistingSession = createAsyncThunk(
  'session/update',
  async ({ id, sessionData }: { id: string; sessionData: any }, { rejectWithValue }) => {
    try {
      const response: any = await updateSession(id, sessionData);
      return response.data.data.session;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update session');
    }
  }
);

export const deleteExistingSession = createAsyncThunk(
  'session/delete',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      await deleteSession(sessionId);
      return sessionId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete session');
    }
  }
);

export const cancelSessionById = createAsyncThunk(
  'session/cancel',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response: any = await cancelSession(sessionId);
      return response.data.data.session;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel session');
    }
  }
);

export const rescheduleSessionById = createAsyncThunk(
  'session/reschedule',
  async ({ id, newDateTime }: { id: string; newDateTime: any }, { rejectWithValue }) => {
    try {
      const response: any = await rescheduleSession(id, newDateTime);
      return response.data.data.session;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reschedule session');
    }
  }
);

export const fetchSessionNotes = createAsyncThunk(
  'session/notes/fetch',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response: any = await getSessionNotes(sessionId);
      return response.data.data.notes;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch session notes');
    }
  }
);

export const addSessionNote = createAsyncThunk(
  'session/notes/add',
  async ({ id, notes }: { id: string; notes: any }, { rejectWithValue }) => {
    try {
      const response: any = await addSessionNotes(id, notes);
      return response.data.data.note;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add session note');
    }
  }
);

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentSession: (state, action: PayloadAction<Session | null>) => {
      state.currentSession = action.payload;
    },
    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
    resetSessions: (state) => {
      state.sessions = [];
      state.upcomingSessions = [];
      state.pastSessions = [];
      state.completedSessions = [];
      state.scheduledSessions = [];
      state.todaySessions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAllSessions
      .addCase(fetchAllSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload;
      })
      .addCase(fetchAllSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchUpcomingSessions
      .addCase(fetchUpcomingSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingSessions = action.payload;
      })
      .addCase(fetchUpcomingSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchPastSessions
      .addCase(fetchPastSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPastSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.pastSessions = action.payload;
      })
      .addCase(fetchPastSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchCompletedSessions
      .addCase(fetchCompletedSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompletedSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.completedSessions = action.payload;
      })
      .addCase(fetchCompletedSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchScheduledSessions
      .addCase(fetchScheduledSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScheduledSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.scheduledSessions = action.payload;
      })
      .addCase(fetchScheduledSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchTodaySessions
      .addCase(fetchTodaySessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodaySessions.fulfilled, (state, action) => {
        state.loading = false;
        state.todaySessions = action.payload;
      })
      .addCase(fetchTodaySessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // fetchSessionById
      .addCase(fetchSessionById.fulfilled, (state, action) => {
        state.currentSession = action.payload;
      })
      // createNewSession
      .addCase(createNewSession.fulfilled, (state, action) => {
        state.sessions.push(action.payload);
        state.scheduledSessions.push(action.payload);
      })
      // updateExistingSession
      .addCase(updateExistingSession.fulfilled, (state, action) => {
        const index = state.sessions.findIndex(session => session.id === action.payload.id);
        if (index !== -1) {
          state.sessions[index] = action.payload;
        }
        
        const scheduledIndex = state.scheduledSessions.findIndex(session => session.id === action.payload.id);
        if (scheduledIndex !== -1) {
          state.scheduledSessions[scheduledIndex] = action.payload;
        }
      })
      // deleteExistingSession
      .addCase(deleteExistingSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter(session => session.id !== action.payload);
        state.scheduledSessions = state.scheduledSessions.filter(session => session.id !== action.payload);
        state.pastSessions = state.pastSessions.filter(session => session.id !== action.payload);
        state.completedSessions = state.completedSessions.filter(session => session.id !== action.payload);
        state.upcomingSessions = state.upcomingSessions.filter(session => session.id !== action.payload);
        state.todaySessions = state.todaySessions.filter(session => session.id !== action.payload);
      })
      // cancelSessionById
      .addCase(cancelSessionById.fulfilled, (state, action) => {
        const index = state.scheduledSessions.findIndex(session => session.id === action.payload.id);
        if (index !== -1) {
          state.scheduledSessions[index] = action.payload;
        }
        
        const allIndex = state.sessions.findIndex(session => session.id === action.payload.id);
        if (allIndex !== -1) {
          state.sessions[allIndex] = action.payload;
        }
      })
      // rescheduleSessionById
      .addCase(rescheduleSessionById.fulfilled, (state, action) => {
        const index = state.scheduledSessions.findIndex(session => session.id === action.payload.id);
        if (index !== -1) {
          state.scheduledSessions[index] = action.payload;
        }
        
        const allIndex = state.sessions.findIndex(session => session.id === action.payload.id);
        if (allIndex !== -1) {
          state.sessions[allIndex] = action.payload;
        }
      });
  },
});

export const { 
  clearError, 
  setCurrentSession, 
  clearCurrentSession, 
  resetSessions 
} = sessionSlice.actions;

export default sessionSlice.reducer;