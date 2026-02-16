import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';

// Define types
export type QuestionType = 'text' | 'mcq' | 'slider' | 'skalaeton' | 'upload';

export interface Question {
  _id: string;
  question: string;
  type: QuestionType;
  required: boolean;
  active: boolean;
  order: number;
  options: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Questionnaire {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionnaireState {
  activeQuestionnaire: Questionnaire | null;
  loading: boolean;
  error: string | null;
  submitted: boolean;
}

// Async thunk to fetch active questionnaire
interface ApiResponse {
  success: boolean;
  message: string;
  data: Questionnaire;
  statusCode: number;
}

export const fetchActiveQuestionnaire = createAsyncThunk<
  Questionnaire,
  void,
  { rejectValue: string }
>(
  'questionnaire/fetchActiveQuestionnaire',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/questionnaires/active');
      const apiResponse = response.data as ApiResponse;
      
      // Validate response according to backend spec
      if (!apiResponse.success || apiResponse.statusCode !== 200) {
        return rejectWithValue(apiResponse.message || 'Failed to fetch questionnaire');
      }
      
      return apiResponse.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch questionnaire');
    }
  }
);

// Async thunk to submit questionnaire response
interface SubmitApiResponse {
  success: boolean;
  message: string;
  data?: any;
  statusCode: number;
}

export const submitQuestionnaireResponse = createAsyncThunk<
  any,
  { questionnaireId: string; responses: { questionId: string; answer: any }[] },
  { rejectValue: string }
>(
  'questionnaire/submitQuestionnaireResponse',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/questionnaires/submit', data);
      const apiResponse = response.data as SubmitApiResponse;
      
      // Validate response according to backend spec
      if (!apiResponse.success || apiResponse.statusCode !== 200) {
        return rejectWithValue(apiResponse.message || 'Failed to submit questionnaire');
      }
      
      return apiResponse;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit questionnaire');
    }
  }
);

const initialState: QuestionnaireState = {
  activeQuestionnaire: null,
  loading: false,
  error: null,
  submitted: false,
};

const questionnaireSlice = createSlice({
  name: 'questionnaire',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetQuestionnaire: (state) => {
      state.activeQuestionnaire = null;
      state.loading = false;
      state.error = null;
      state.submitted = false;
    },
    setQuestionnaireResponse: (state, action: PayloadAction<{ questionId: string; value: any }>) => {
      if (state.activeQuestionnaire) {
        // Update response in the questionnaire if needed
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch active questionnaire
      .addCase(fetchActiveQuestionnaire.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveQuestionnaire.fulfilled, (state, action) => {
        state.loading = false;
        state.activeQuestionnaire = action.payload;
        state.error = null;
      })
      .addCase(fetchActiveQuestionnaire.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Submit questionnaire response
      .addCase(submitQuestionnaireResponse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitQuestionnaireResponse.fulfilled, (state) => {
        state.loading = false;
        state.submitted = true;
        state.error = null;
      })
      .addCase(submitQuestionnaireResponse.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetQuestionnaire, setQuestionnaireResponse } = questionnaireSlice.actions;

// Selectors
export const selectActiveQuestionnaire = (state: { questionnaires: QuestionnaireState }) => state.questionnaires.activeQuestionnaire;
export const selectQuestionnaireLoading = (state: { questionnaires: QuestionnaireState }) => state.questionnaires.loading;
export const selectQuestionnaireError = (state: { questionnaires: QuestionnaireState }) => state.questionnaires.error;
export const selectQuestionnaireSubmitted = (state: { questionnaires: QuestionnaireState }) => state.questionnaires.submitted;

export default questionnaireSlice.reducer;