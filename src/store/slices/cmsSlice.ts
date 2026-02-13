import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getHeroPublic, getStepsPublic, getWhyUsPublic, getFaqsPublic, getConditionsPublic, getTermsPublic, getContactPublic, getAboutPublic } from '../../lib/api';

// Define types for CMS data
interface HeroSection {
  _id?: string;
  heading: string;
  subHeading: string;
  description: string;
  ctaText: string;
  secondaryCtaText: string;
  image: string;
  isTherapistAvailable: boolean;
  trustedBy: string;
  certifiedTherapists: boolean;
  rating: string;
  features: string[];
  isPublic: boolean;
}

interface Step {
  _id?: string;
  heading?: string;
  subHeading?: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
  isPublic: boolean;
}

// Define types for Why Us data
interface StatItem {
  _id?: string;
  label: string;
  value: string;
  description: string;
}

interface WhyUsSection {
  _id?: string;
  title: string;
  description: string;
  stats: StatItem[];
  features: string[];
  isPublic: boolean;
}

// Define types for FAQ data
interface FaqItem {
  _id?: string;
  question: string;
  answer: string;
  isPublic: boolean;
}

// Define types for Conditions data
interface ConditionItem {
  _id?: string;
  name: string;
  image?: string;
}

interface ConditionsSection {
  _id?: string;
  title: string;
  description: string;
  conditions: ConditionItem[];
  image?: string;
  isPublic: boolean;
}

// Define types for About data
interface AboutSection {
  _id?: string;
  title: string;
  description: string;
  mission: string;
  vision: string;
  values: string[];
  foundingStory: string;
  teamInfo: string;
  images: string[];
  image?: string;
  isPublic: boolean;
}

// Define types for Terms of Service data
interface TermsOfServiceSection {
  _id?: string;
  title: string;
  content: string;
  lastUpdated: string;
  isPublic: boolean;
}

// Define types for Contact data
interface SocialLink {
  _id?: string;
  platform: string;
  url: string;
}

interface ContactSection {
  _id?: string;
  title: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  hours: string;
  socialLinks: SocialLink[];
  isPublic: boolean;
}

interface CmsState {
  hero: HeroSection | null;
  steps: Step[];
  whyUs: WhyUsSection | null;
  faqs: FaqItem[];
  conditions: ConditionsSection | null;
  terms: TermsOfServiceSection | null;
  contact: ContactSection | null;
  about: AboutSection | null;
  loading: boolean;
  error: string | null;
}

// Async thunk to fetch hero section data
export const fetchHeroPublic = createAsyncThunk(
  'cms/fetchHeroPublic',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getHeroPublic();
      
      // Validate response structure
      if (!response.data.success || !response.data.data) {
        return rejectWithValue('Invalid response structure');
      }

      // Ensure statusCode validation as per project specification
      if (response.data.statusCode !== 200 && response.data.statusCode !== undefined) {
        return rejectWithValue(`API Error: ${response.data.message}`);
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch hero data');
    }
  }
);

// Async thunk to fetch steps data
export const fetchStepsPublic = createAsyncThunk(
  'cms/fetchStepsPublic',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getStepsPublic();
      
      // Validate response structure
      if (!response.data.success || !response.data.data) {
        return rejectWithValue('Invalid response structure');
      }

      // Ensure statusCode validation as per project specification
      if (response.data.statusCode !== 200 && response.data.statusCode !== undefined) {
        return rejectWithValue(`API Error: ${response.data.message}`);
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch steps data');
    }
  }
);

// Async thunk to fetch why us data
export const fetchWhyUsPublic = createAsyncThunk(
  'cms/fetchWhyUsPublic',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getWhyUsPublic();
      
      // Validate response structure
      if (!response.data.success || !response.data.data) {
        return rejectWithValue('Invalid response structure');
      }

      // Ensure statusCode validation as per project specification
      if (response.data.statusCode !== 200 && response.data.statusCode !== undefined) {
        return rejectWithValue(`API Error: ${response.data.message}`);
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch why us data');
    }
  }
);

// Async thunk to fetch FAQs data
export const fetchFaqsPublic = createAsyncThunk(
  'cms/fetchFaqsPublic',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getFaqsPublic();
      
      // Validate response structure
      if (!response.data.success || !response.data.data) {
        return rejectWithValue('Invalid response structure');
      }

      // Ensure statusCode validation as per project specification
      if (response.data.statusCode !== 200 && response.data.statusCode !== undefined) {
        return rejectWithValue(`API Error: ${response.data.message}`);
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch FAQs data');
    }
  }
);

// Async thunk to fetch conditions data
export const fetchConditionsPublic = createAsyncThunk(
  'cms/fetchConditionsPublic',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getConditionsPublic();
      
      // Validate response structure
      if (!response.data.success || !response.data.data) {
        return rejectWithValue('Invalid response structure');
      }

      // Ensure statusCode validation as per project specification
      if (response.data.statusCode !== 200 && response.data.statusCode !== undefined) {
        return rejectWithValue(`API Error: ${response.data.message}`);
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch conditions data');
    }
  }
);

// Async thunk to fetch terms of service data
export const fetchTermsPublic = createAsyncThunk(
  'cms/fetchTermsPublic',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getTermsPublic();
      
      // Validate response structure
      if (!response.data.success || !response.data.data) {
        return rejectWithValue('Invalid response structure');
      }

      // Ensure statusCode validation as per project specification
      if (response.data.statusCode !== 200 && response.data.statusCode !== undefined) {
        return rejectWithValue(`API Error: ${response.data.message}`);
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch terms data');
    }
  }
);

// Async thunk to fetch contact data
export const fetchContactPublic = createAsyncThunk(
  'cms/fetchContactPublic',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getContactPublic();
      
      // Validate response structure
      if (!response.data.success || !response.data.data) {
        return rejectWithValue('Invalid response structure');
      }

      // Ensure statusCode validation as per project specification
      if (response.data.statusCode !== 200 && response.data.statusCode !== undefined) {
        return rejectWithValue(`API Error: ${response.data.message}`);
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch contact data');
    }
  }
);

// Async thunk to fetch about data
export const fetchAboutPublic = createAsyncThunk(
  'cms/fetchAboutPublic',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAboutPublic();
      
      // Validate response structure
      if (!response.data.success || !response.data.data) {
        return rejectWithValue('Invalid response structure');
      }

      // Ensure statusCode validation as per project specification
      if (response.data.statusCode !== 200 && response.data.statusCode !== undefined) {
        return rejectWithValue(`API Error: ${response.data.message}`);
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch about data');
    }
  }
);

// Initial state
const initialState: CmsState = {
  hero: null,
  steps: [],
  whyUs: null,
  faqs: [],
  conditions: null,
  terms: null,
  contact: null,
  about: null,
  loading: false,
  error: null,
};

const cmsSlice = createSlice({
  name: 'cms',
  initialState,
  reducers: {
    clearCmsError: (state) => {
      state.error = null;
    },
    setCmsHero: (state, action: PayloadAction<HeroSection>) => {
      state.hero = action.payload;
    },
    setCmsSteps: (state, action: PayloadAction<Step[]>) => {
      state.steps = action.payload;
    },
    setCmsWhyUs: (state, action: PayloadAction<WhyUsSection>) => {
      state.whyUs = action.payload;
    },
    setCmsFaqs: (state, action: PayloadAction<FaqItem[]>) => {
      state.faqs = action.payload;
    },
    setCmsConditions: (state, action: PayloadAction<ConditionsSection>) => {
      state.conditions = action.payload;
    },
    setCmsTerms: (state, action: PayloadAction<TermsOfServiceSection>) => {
      state.terms = action.payload;
    },
    setCmsContact: (state, action: PayloadAction<ContactSection>) => {
      state.contact = action.payload;
    },
    setCmsAbout: (state, action: PayloadAction<AboutSection>) => {
      state.about = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetch hero public
      .addCase(fetchHeroPublic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHeroPublic.fulfilled, (state, action: PayloadAction<HeroSection>) => {
        state.loading = false;
        state.hero = action.payload;
      })
      .addCase(fetchHeroPublic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle fetch contact public
      .addCase(fetchContactPublic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContactPublic.fulfilled, (state, action: PayloadAction<ContactSection>) => {
        state.loading = false;
        state.contact = action.payload;
      })
      .addCase(fetchContactPublic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle fetch steps public
      .addCase(fetchStepsPublic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStepsPublic.fulfilled, (state, action: PayloadAction<Step[]>) => {
        state.loading = false;
        state.steps = action.payload;
      })
      .addCase(fetchStepsPublic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle fetch why us public
      .addCase(fetchWhyUsPublic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWhyUsPublic.fulfilled, (state, action: PayloadAction<WhyUsSection>) => {
        state.loading = false;
        state.whyUs = action.payload;
      })
      .addCase(fetchWhyUsPublic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle fetch FAQs public
      .addCase(fetchFaqsPublic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFaqsPublic.fulfilled, (state, action: PayloadAction<FaqItem[]>) => {
        state.loading = false;
        state.faqs = action.payload;
      })
      .addCase(fetchFaqsPublic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle fetch conditions public
      .addCase(fetchConditionsPublic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConditionsPublic.fulfilled, (state, action: PayloadAction<ConditionsSection>) => {
        state.loading = false;
        state.conditions = action.payload;
      })
      .addCase(fetchConditionsPublic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle fetch terms public
      .addCase(fetchTermsPublic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTermsPublic.fulfilled, (state, action: PayloadAction<TermsOfServiceSection>) => {
        state.loading = false;
        state.terms = action.payload;
      })
      .addCase(fetchTermsPublic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle fetch about public
      .addCase(fetchAboutPublic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAboutPublic.fulfilled, (state, action: PayloadAction<AboutSection>) => {
        state.loading = false;
        state.about = action.payload;
      })
      .addCase(fetchAboutPublic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCmsError, setCmsHero, setCmsSteps, setCmsWhyUs, setCmsFaqs, setCmsConditions, setCmsTerms, setCmsContact, setCmsAbout } = cmsSlice.actions;

export default cmsSlice.reducer;