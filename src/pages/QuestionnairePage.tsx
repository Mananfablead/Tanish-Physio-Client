import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SkalaetonQuestion } from "@/components/SkalaetonQuestion";
import {
  CheckCircle,
  Edit2,
  ShieldCheck,
  Activity,
  ArrowRight,
  Clock,
  User,
  Stethoscope,
  FileText,
  Edit,
  Shield,
  Lock,
  Upload,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchActiveQuestionnaire, selectActiveQuestionnaire, selectQuestionnaireLoading, selectQuestionnaireError, QuestionType } from "@/store/slices/questionnaireSlice";
import { updateProfile } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

interface QuestionnaireData {
  [key: string]: any; // Dynamic keys for question responses
}

/**
 * QuestionnairePage Component
 * 
 * Data Loading Priority:
 * 1. If user is authenticated: Fetch health profile from API (GET /api/users/{userId})
 * 2. If no API data or not authenticated: Use data from sessionStorage (fallback)
 * 3. If neither available: Show empty questionnaire form
 * 
 * This ensures that authenticated users always see their most recent health profile data
 * from the server, while guest users can continue with their session-stored data.
 */

const initialData: QuestionnaireData = {};

export default function QuestionnairePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const pendingPlan = (location.state as any)?.planToActivate || null;
  const serviceToBook = (location.state as any)?.serviceToBook || null;
  const locationGuestUser = (location.state as any)?.guestUser || null;
  const goToSchedule = (location.state as any)?.goToSchedule || false;
  const sessionGuestUser = typeof window !== 'undefined' ? JSON.parse(sessionStorage.getItem("qw_guest_user") || "null") : null;
  const guestUser = locationGuestUser || sessionGuestUser || null;

  // Redux selectors
  const activeQuestionnaire = useSelector(selectActiveQuestionnaire);
  const isLoading = useSelector(selectQuestionnaireLoading);
  const error = useSelector(selectQuestionnaireError);

  const [data, setData] = useState<QuestionnaireData>(initialData);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);
  const [storedIntakeFound, setStoredIntakeFound] = useState(false);
  const [storedIntakeUpdatedAt, setStoredIntakeUpdatedAt] = useState<number | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const STORAGE_KEY_QUESTIONNAIRE = "qw_questionnaire";
  const STORAGE_KEY_PLAN = "qw_plan";
  const RECENT_DAYS = 90; // threshold to consider intake 'recent'

  const now = () => Date.now();
  const isRecent = (ts: number | null) => {
    if (!ts) return false;
    return (now() - ts) < RECENT_DAYS * 24 * 60 * 60 * 1000;
  };

  const loadStoredQuestionnaire = () => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_QUESTIONNAIRE);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.data) {
        // Ensure skalaeton questions have array values
        const processedData = { ...parsed.data };
        Object.keys(processedData).forEach(key => {
          if (key.includes('skalaeton') || key.includes('skeleton')) {
            if (!Array.isArray(processedData[key])) {
              processedData[key] = processedData[key] ? [processedData[key]] : [];
            }
          }
        });
        return { ...parsed, data: processedData };
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  const saveStoredQuestionnaire = (payload: QuestionnaireData) => {
    try {
      sessionStorage.setItem(STORAGE_KEY_QUESTIONNAIRE, JSON.stringify({ data: payload, updatedAt: now() }));
      setStoredIntakeFound(true);
      setStoredIntakeUpdatedAt(now());
    } catch (e) {
      // ignore
    }
  };

  const savePlanToStorage = (plan: any) => {
    try {
      sessionStorage.setItem(STORAGE_KEY_PLAN, JSON.stringify({ plan, purchasedAt: now(), active: true }));
    } catch (e) {
      // ignore
    }
  };

  // Fetch user data from API
  const fetchUserHealthProfile = async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}`);
      const user = response.data?.data || response.data;
      
      if (user?.healthProfile && user.healthProfile.questionnaireResponses) {
        return user.healthProfile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user health profile:", error);
      return null;
    }
  };

  // Transform healthProfile back to questionnaire data format
  const transformHealthProfileToQuestionnaireData = (healthProfile: any): QuestionnaireData => {
    if (!healthProfile) return {};
    
    // If questionnaireResponses map exists, use it directly as it has the mapping from questionId to answer
    if (healthProfile.questionnaireResponses && typeof healthProfile.questionnaireResponses === 'object') {
      const data: QuestionnaireData = {};
      Object.entries(healthProfile.questionnaireResponses).forEach(([key, value]) => {
        // Handle JSON string format for common field data
        if (typeof value === 'string' && value.startsWith('{') && value.includes('mainAnswer')) {
          try {
            const parsed = JSON.parse(value);
            data[key] = {
              mainAnswer: parsed.mainAnswer,
              commonField: parsed.commonField || ''
            };
          } catch (e) {
            // If parsing fails, store as simple value
            data[key] = value;
          }
        }
        // For skalaeton questions, ensure array format
        else if (key.includes('skalaeton') || key.includes('skeleton')) {
          data[key] = Array.isArray(value) ? value : (value ? [value] : []);
        } else {
          data[key] = value;
        }
      });
      return data;
    }
    
    // Fallback: build from individual healthProfile fields
    const data: QuestionnaireData = {};
    
    if (healthProfile.primaryConcern) data.primaryConcern = healthProfile.primaryConcern;
    if (healthProfile.painIntensity) data.painIntensity = healthProfile.painIntensity.toString();
    if (healthProfile.priorTreatments) data.priorTreatments = healthProfile.priorTreatments;
    if (healthProfile.medicalHistory) data.medicalHistory = healthProfile.medicalHistory;
    if (healthProfile.allergies) data.allergies = healthProfile.allergies;
    if (healthProfile.medications) data.medications = healthProfile.medications;
    if (healthProfile.emergencyContact) data.emergencyContact = healthProfile.emergencyContact;
    if (healthProfile.additionalNotes) data.additionalNotes = healthProfile.additionalNotes;
    
    return data;
  };

  // Load questionnaire data (from API if authenticated, fallback to sessionStorage)
  const loadQuestionnaireData = async () => {
    // First, try to load from API if authenticated
    if (isAuthenticated) {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const userId = user.id || user._id;
          
          if (userId) {
            const healthProfile = await fetchUserHealthProfile(userId);
            if (healthProfile && Object.keys(healthProfile).length > 0) {
              const apiData = transformHealthProfileToQuestionnaireData(healthProfile);
              if (Object.keys(apiData).length > 0) {
                // Mark as loaded from API, not sessionStorage
                setStoredIntakeFound(true);
                setStoredIntakeUpdatedAt(healthProfile.questionnaireMetadata?.completedAt ? new Date(healthProfile.questionnaireMetadata.completedAt).getTime() : now());
                return apiData;
              }
            }
          }
        }
      } catch (error) {
        console.error("Error loading from API, falling back to sessionStorage:", error);
      }
    }
    
    // Fallback to sessionStorage if not authenticated or API fetch failed
    const stored = loadStoredQuestionnaire();
    if (stored) {
      setStoredIntakeFound(true);
      setStoredIntakeUpdatedAt(stored.updatedAt || now());
      return stored.data;
    }
    
    return null;
  };

  useEffect(() => {
    // Fetch active questionnaire from API
    dispatch(fetchActiveQuestionnaire() as any);

    // Load questionnaire data from API or sessionStorage
    const loadData = async () => {
      const loadedData = await loadQuestionnaireData();
      if (loadedData && Object.keys(loadedData).length > 0) {
        setData(loadedData);
      }
    };
    
    loadData();

    // Visual viewport listener to detect on-screen keyboard and hide sticky CTA when keyboard is open
    if (typeof window !== 'undefined' && (window as any).visualViewport) {
      const vv = (window as any).visualViewport;
      const onResize = () => {
        // if viewport height drops significantly, keyboard likely open
        setKeyboardVisible(vv.height < window.innerHeight - 150);
      };
      vv.addEventListener('resize', onResize);
      return () => vv.removeEventListener('resize', onResize);
    }

    return undefined;
  }, [isAuthenticated, dispatch]);

  const updateAnswer = (questionId: string, value: any, isCommonField: boolean = false) => {
    setData((prev) => {
      let next: QuestionnaireData;
      
      if (isCommonField) {
        // Update common field
        const currentData = prev[questionId] || { mainAnswer: null };
        next = {
          ...prev,
          [questionId]: {
            ...currentData,
            commonField: value || '' // Ensure empty string instead of null/undefined
          }
        };
      } else {
        // Update main answer
        const currentData = prev[questionId];
        if (currentData && typeof currentData === 'object' && currentData.commonField !== undefined) {
          // Already has common field structure
          next = {
            ...prev,
            [questionId]: {
              ...currentData,
              mainAnswer: value
            }
          };
        } else {
          // Check if this question has common field enabled
          const question = activeQuestionnaire?.questions.find(q => q._id === questionId);
          if (question?.hasCommonField) {
            // Initialize with common field structure even when only main answer is provided
            next = {
              ...prev,
              [questionId]: {
                mainAnswer: value,
                commonField: '' // Initialize with empty common field
              }
            };
          } else {
            // Simple value storage for questions without common fields
            next = { ...prev, [questionId]: value };
          }
        }
      }
      
      // persist
      saveStoredQuestionnaire(next);

      // Clear validation error when user starts answering
      if (validationErrors[questionId]) {
        const newErrors = { ...validationErrors };
        delete newErrors[questionId];
        setValidationErrors(newErrors);
      }

      return next;
    });
  };

  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const handleNext = () => {
    // Check if current question is required and hasn't been answered
    const currentQuestion = activeQuestionnaire?.questions[activeQuestionIndex];
    
    // Check if main answer is required and provided
    let isMainAnswerRequired = false;
    const answer = data[currentQuestion._id];
    
    if (currentQuestion?.required) {
      if (currentQuestion.hasCommonField) {
        // For questions with common fields, check main answer in structured data
        if (typeof answer === 'object' && answer !== null && answer.commonField !== undefined) {
          isMainAnswerRequired = !answer.mainAnswer || answer.mainAnswer.toString().trim() === '';
        } else {
          // Simple value format
          isMainAnswerRequired = !answer || answer.toString().trim() === '';
        }
      } else {
        // Regular questions
        isMainAnswerRequired = !answer || answer.toString().trim() === '';
      }
    }
    
    // Common fields are optional - don't block navigation for missing common fields
    if (isMainAnswerRequired) {
      const errorMessage = `${currentQuestion.question} is required`;
      setValidationErrors({
        ...validationErrors,
        [currentQuestion._id]: errorMessage
      });
      return;
    }

    // Clear validation error for current question if it exists
    if (validationErrors[currentQuestion?._id]) {
      const newErrors = { ...validationErrors };
      delete newErrors[currentQuestion._id];
      setValidationErrors(newErrors);
    }

    // Skip manual navigation if auto-advance is enabled
    // This function is kept for backward compatibility and edge cases
    if (activeQuestionnaire && activeQuestionIndex < activeQuestionnaire.questions.length - 1) {
      setActiveQuestionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Before going to review, validate all required questions are answered
      const requiredQuestions = activeQuestionnaire?.questions.filter((q: any) => q.required) || [];
      const unansweredRequired = requiredQuestions.filter((q: any) => {
        const answer = data[q._id];
        // For questions with common fields, check if main answer is provided
        if (q.hasCommonField) {
          // Handle both structured data and simple values
          if (typeof answer === 'object' && answer !== null && answer.commonField !== undefined) {
            // Structured format
            return !answer.mainAnswer || answer.mainAnswer.toString().trim() === '';
          } else {
            // Simple value format (user only provided main answer)
            return !answer || answer.toString().trim() === '';
          }
        }
        // For regular questions
        return !answer || answer.toString().trim() === '';
      });

      // Common fields are optional - don't validate them as required
      if (unansweredRequired.length > 0) {
        // Set validation errors for unanswered required questions
        const newErrors: { [key: string]: string } = {};
        unansweredRequired.forEach((q: any) => {
          newErrors[q._id] = `${q.question} is required`;
        });
        setValidationErrors(newErrors);

        // Navigate to the first unanswered question
        const firstUnansweredIndex = activeQuestionnaire?.questions.findIndex((q: any) => 
          q._id === unansweredRequired[0]._id
        ) || 0;
        setActiveQuestionIndex(firstUnansweredIndex);
        return;
      }

      setIsReviewing(true);
    }
  };

  const handlePrevious = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const assignTherapist = (forData: QuestionnaireData) => {
    // Simple auto-assign placeholder logic; in a real app this would be server side
    try {
      const therapist = {
        id: `th-${Math.floor(Math.random() * 10000)}`,
        name: "Assigned Clinician",
        title: "Matched Specialist",
        assignedAt: now(),
      };
      sessionStorage.setItem("qw_assigned", JSON.stringify(therapist));
      return therapist;
    } catch (e) {
      return null;
    }
  };

  // Helper function to convert file objects to serializable format
  const serializeQuestionnaireData = (questionnaireData: any) => {
    const serialized: any = {};
    
    Object.entries(questionnaireData).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        const objValue = value as { commonField?: string; mainAnswer?: any; url?: string; name?: string };
        // Handle common field structure - preserve the complete structure
        if (objValue.commonField !== undefined || objValue.mainAnswer !== undefined) {
          serialized[key] = {
            mainAnswer: objValue.mainAnswer !== undefined ? objValue.mainAnswer : null,
            commonField: objValue.commonField || '' // Always include commonField even if empty
          };
        }
        // If it's an uploaded file with URL, keep the URL
        else if (objValue.url) {
          serialized[key] = objValue.url;
        } else if (objValue.name) {
          // If it's just a filename, keep the filename
          serialized[key] = objValue.name;
        } else {
          // Otherwise keep the object as is
          serialized[key] = value;
        }
      } else {
        serialized[key] = value;
      }
    });
    
    return serialized;
  };

  // Transform questionnaire data to healthProfile structure
  const transformQuestionnaireToHealthProfile = (questionnaireData: any, questions: any[]) => {
    const healthProfile: any = {};

    // Initialize questionnaire metadata
    const questionnaireMetadata = {
      questionnaireId: activeQuestionnaire?._id,
      completedAt: new Date(),
      responses: [] as any[]
    };

    // Initialize questionnaire responses map
    const questionnaireResponses = new Map<string, string>();

    // Map questionnaire responses to healthProfile fields
    Object.entries(questionnaireData).forEach(([questionId, answer]) => {
      const question = questions.find(q => q._id === questionId);
      if (!question || !answer) return;

      // Handle common field structure
      let answerValue: any = answer;
      let mainAnswer: any = answer;
      let commonField: string = '';
      
      if (typeof answer === 'object' && answer !== null && (answer as any).commonField !== undefined) {
        mainAnswer = (answer as any).mainAnswer;
        commonField = (answer as any).commonField || '';
        // For storage, we want to preserve both values separately
        answerValue = mainAnswer;
      }

      // Convert file objects/URLs to displayable format for storage
      if (typeof answerValue === 'object' && answerValue !== null) {
        // If it's an uploaded file with URL, use the URL
        if ((answerValue as any).url) {
          answerValue = (answerValue as any).url;
        } else if ((answerValue as any).name) {
          // If it's just a filename, use the filename
          answerValue = (answerValue as any).name;
        } else {
          // For arrays and other objects, convert to string representation
          answerValue = Array.isArray(answerValue) 
            ? JSON.stringify(answerValue) 
            : JSON.stringify(answerValue);
        }
      }

      // Store in questionnaire responses map - preserve both values for proper display
      let responseValue = String(answerValue || '');
      
      // Store the structured data for better retrieval
      if (typeof answer === 'object' && answer !== null && (answer as any).commonField !== undefined) {
        // Store as JSON string to preserve structure
        responseValue = JSON.stringify({
          mainAnswer: mainAnswer,
          commonField: commonField
        });
      } else {
        // Simple value
        responseValue = String(answerValue || '');
      }
      
      questionnaireResponses.set(questionId, responseValue);

      // Store detailed response metadata
      questionnaireMetadata.responses.push({
        questionId: question._id,
        questionText: question.question,
        answer: responseValue,
        questionType: question.type,
        timestamp: new Date()
      });

      // Map based on question content or type (for backward compatibility)
      const questionText = question.question.toLowerCase();

      if (questionText.includes('name') || questionText.includes('full name')) {
        // Don't map name to healthProfile
        return;
      } else if (questionText.includes('concern') || questionText.includes('problem') || questionText.includes('issue')) {
        // Convert array to comma-separated string for primaryConcern
        healthProfile.primaryConcern = Array.isArray(mainAnswer) 
          ? mainAnswer.join(', ') 
          : mainAnswer;
      } else if (questionText.includes('pain') && question.type === 'slider') {
        const painValue = parseInt(mainAnswer as string) || 1; // Default to 1 if invalid, min is 1
        healthProfile.painIntensity = Math.max(1, Math.min(10, painValue)); // Ensure between 1-10
      } else if (questionText.includes('duration') || questionText.includes('how long')) {
        healthProfile.priorTreatments = mainAnswer;
      } else if (questionText.includes('treatment') || questionText.includes('therapy')) {
        healthProfile.priorTreatments = healthProfile.priorTreatments
          ? `${healthProfile.priorTreatments}, ${mainAnswer}`
          : mainAnswer;
      } else if (questionText.includes('medical') || questionText.includes('history')) {
        healthProfile.medicalHistory = mainAnswer;
      } else if (questionText.includes('allerg')) {
        healthProfile.allergies = mainAnswer;
      } else if (questionText.includes('medication')) {
        healthProfile.medications = mainAnswer;
      } else if (questionText.includes('emergency') || questionText.includes('contact')) {
        healthProfile.emergencyContact = mainAnswer;
      } else if (question.type === 'age') {
        // Age is not stored in healthProfile schema, but we can include it in additionalNotes
        const ageValue = parseInt(mainAnswer as string) || 0;
        if (ageValue > 0) {
          if (!healthProfile.additionalNotes) {
            healthProfile.additionalNotes = '';
          }
          healthProfile.additionalNotes += `Age: ${ageValue}\n`;
        }
      } else {
        // For other questions, add to additional notes (backward compatibility)
        if (!healthProfile.additionalNotes) {
          healthProfile.additionalNotes = '';
        }
        let noteText = `${question.question}: ${mainAnswer}`;
        if (commonField) {
          noteText += ` | Additional: ${commonField}`;
        }
        healthProfile.additionalNotes += `${noteText}\n`;
      }
    });

    // Add questionnaire data to healthProfile (convert Map to plain object)
    // Mongoose Map type expects specific format, so we send as regular object
    const responsesObject: { [key: string]: string } = {};
    questionnaireResponses.forEach((value, key) => {
      responsesObject[key] = value;
    });
    healthProfile.questionnaireResponses = responsesObject;
    healthProfile.questionnaireMetadata = questionnaireMetadata;

    return healthProfile;
  };

  const handleSubmit = async () => {
    // Validate all required questions before submitting
    const requiredQuestions = activeQuestionnaire?.questions.filter((q: any) => q.required) || [];
    const unansweredRequired = requiredQuestions.filter((q: any) => {
      const answer = data[q._id];
      // For questions with common fields, check if main answer is provided
      if (q.hasCommonField) {
        // Handle both structured data and simple values
        if (typeof answer === 'object' && answer !== null && answer.commonField !== undefined) {
          // Structured format
          return !answer.mainAnswer || answer.mainAnswer.toString().trim() === '';
        } else {
          // Simple value format (user only provided main answer)
          return !answer || answer.toString().trim() === '';
        }
      }
      // For regular questions
      return !answer || answer.toString().trim() === '';
    });

    // Common fields are optional by default - only validate if they exist and have content requirements
    // We don't enforce common fields as required unless explicitly marked (which is not in current schema)
    
    if (unansweredRequired.length > 0) {
      // Set validation errors for unanswered required questions
      const newErrors: { [key: string]: string } = {};
      unansweredRequired.forEach((q: any) => {
        newErrors[q._id] = `${q.question} is required`;
      });
      setValidationErrors(newErrors);

      // Navigate to the first unanswered question
      const firstUnansweredIndex = activeQuestionnaire?.questions.findIndex((q: any) => 
        q._id === unansweredRequired[0]._id
      ) || 0;
      setActiveQuestionIndex(firstUnansweredIndex);
      return;
    }

    // persist intake
    saveStoredQuestionnaire(data);

    // Serialize questionnaire data to handle file objects
    let serializedData;
    try {
      // Transform questionnaire data to healthProfile structure
      const healthProfileData = transformQuestionnaireToHealthProfile(
        data,
        activeQuestionnaire?.questions || []
      );

      // Update user profile with health data from questionnaire (only for authenticated users)
      const profileData = {
        healthProfile: {
          ...healthProfileData,
          // Ensure proper data types
          painIntensity: healthProfileData.painIntensity ? parseInt(healthProfileData.painIntensity) : undefined
        }
      };
      // Only update profile for authenticated users
      if (isAuthenticated) {
        console.log('Sending profile data:', JSON.stringify(profileData, null, 2));
        await updateProfile(profileData);
      }
    } catch (error) {
      console.error("Error updating profile with questionnaire data:", error);
      // Continue even if profile update fails
    }

    // Serialize questionnaire data regardless of profile update success
    serializedData = serializeQuestionnaireData(data);

    // If we were navigated here to activate a plan, complete activation and send user to schedule
    const pending = pendingPlan || (() => {
      try {
        const raw = sessionStorage.getItem("qw_pending_plan");
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    })();

    const assigned = assignTherapist(serializedData);

    if (pending) {
      // activate plan
      savePlanToStorage(pending);
      // clear pending marker
      try { sessionStorage.removeItem("qw_pending_plan"); } catch (e) { }

      // Get subscription ID from stored plan
      let subscriptionId = null;
      try {
        const storedPlan = sessionStorage.getItem("qw_plan");
        if (storedPlan) {
          const planData = JSON.parse(storedPlan);
          subscriptionId = planData.subscriptionId || null;
        }
      } catch (e) {
        console.error("Error getting subscription ID from storage:", e);
      }

      // navigate to schedule page with plan data for session booking
      navigate("/schedule", {
        state: {
          fromSubscription: true,
          subscriptionId: subscriptionId,
          plan: pending,
          questionnaireData: data,
          therapist: assigned,
          guestUser: guestUser
        }
      });
      return;
    }

    if (serviceToBook) {
      // For service bookings, navigate to schedule page with service data
      navigate("/schedule", {
        state: {
          fromServices: true,
          service: serviceToBook,
          questionnaireData: data,
          therapist: assigned,
          guestUser: guestUser
        }
      });
      return;
    }

    // Check if we came from services or subscription to pass original bookingData to booking page
    const originalBookingData = location.state || {};
    
    // Check if we should navigate to schedule page instead of booking page
    if (goToSchedule) {
      // Navigate to schedule page with questionnaire data
      navigate("/schedule", {
        state: {
          questionnaireData: data,
          guestUser: guestUser,
          fromQuestionnaire: true,
          therapist: assignTherapist(serializeQuestionnaireData(data))
        }
      });
    } else {
      // Navigate to booking page with questionnaire data and original booking data
      navigate("/booking", {
        state: {
          questionnaireData: data,
          guestUser: guestUser,
          fromQuestionnaire: true,
          // Include original booking data passed from services or subscription plans
          service: originalBookingData.service || serviceToBook,
          fromSubscription: originalBookingData.fromSubscription || false,
          plan: originalBookingData.plan || pendingPlan,
          fromServices: originalBookingData.fromServices || !!serviceToBook
        }
      });
    }
  };

  // Define body areas for skeleton type
  const bodyAreas = [
    { id: "neck", label: "Neck", position: "top-[15%] left-[50%] -translate-x-1/2" },
    { id: "shoulder-left", label: "Left Shoulder", position: "top-[22%] left-[35%]" },
    { id: "shoulder-right", label: "Right Shoulder", position: "top-[22%] right-[35%]" },
    { id: "upper-back", label: "Upper Back", position: "top-[28%] left-[50%] -translate-x-1/2" },
    { id: "lower-back", label: "Lower Back", position: "top-[40%] left-[50%] -translate-x-1/2" },
    { id: "hip-left", label: "Left Hip", position: "top-[48%] left-[50%] -translate-x-1/2" },
    { id: "hip-right", label: "Right Hip", position: "top-[48%] right-[50%] -translate-x-1/2" },
    { id: "headache", label: "Headache", position: "top-[15%] left-[50%] -translate-x-1/2" },
    { id: "knee-left", label: "Left Knee", position: "top-[65%] left-[42%]" },
    { id: "knee-right", label: "Right Knee", position: "top-[65%] right-[42%]" },
    { id: "ankle-left", label: "Left Ankle", position: "top-[85%] left-[42%]" },
    { id: "ankle-right", label: "Right Ankle", position: "top-[85%] right-[42%]" },
    { id: "elbow-left", label: "Left Elbow", position: "top-[35%] left-[28%]" },
    { id: "elbow-right", label: "Right Elbow", position: "top-[35%] right-[28%]" },
    { id: "wrist-left", label: "Left Wrist", position: "top-[48%] left-[22%]" },
    { id: "wrist-right", label: "Right Wrist", position: "top-[48%] right-[22%]" },
  ];

  // Render question based on type
  const renderQuestion = (question: any) => {
    // Extract main answer and common field values
    const questionData = data[question._id];
    let currentValue: any;
    let commonFieldValue: string = '';
    
    // Handle both structured data and simple values
    if (questionData && typeof questionData === 'object' && questionData.commonField !== undefined) {
      // Structured format with both main answer and common field
      currentValue = questionData.mainAnswer;
      commonFieldValue = questionData.commonField || '';
    } else if (question.hasCommonField) {
      // Simple value format - user only provided main answer
      currentValue = questionData;
      commonFieldValue = ''; // Common field is empty
    } else {
      // Regular question without common field
      currentValue = questionData;
    }
    
    const isRequired = question.required;
    const isAnswered = !!currentValue && currentValue.toString().trim() !== '';
    const hasError = validationErrors[question._id];

    // Render main question content
    let mainQuestionContent;
    
    switch (question.type) {
      case 'text':
        mainQuestionContent = (
          <div className="space-y-4">
            <Input
              value={currentValue}
              onChange={(e) => {
                // Clear validation error when user starts typing
                if (validationErrors[question._id]) {
                  const newErrors = { ...validationErrors };
                  delete newErrors[question._id];
                  setValidationErrors(newErrors);
                }
                updateAnswer(question._id, e.target.value);
              }}
              placeholder="Enter your response"
              className={`${hasError ? 'border-red-500 focus:ring-red-500' : isRequired && !isAnswered ? 'border-red-500 focus:ring-red-500' : 'border-slate-200'} min-h-[48px] h-12 lg:h-16 text-3xl font-black rounded-2xl focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all px-4 lg:px-8 shadow-sm`}
            />
            {hasError && (
              <p className="text-red-500 text-sm font-bold">{validationErrors[question._id]}</p>
            )}
          </div>
        );
        break;

      case 'age':
        mainQuestionContent = (
          <div className="space-y-4">
            <Input
              type="number"
              value={currentValue}
              onChange={(e) => {
                // Clear validation error when user starts typing
                if (validationErrors[question._id]) {
                  const newErrors = { ...validationErrors };
                  delete newErrors[question._id];
                  setValidationErrors(newErrors);
                }
                updateAnswer(question._id, e.target.value);
              }}
              placeholder="Enter your age"
              min="1"
              max="120"
              className={`${hasError ? 'border-red-500 focus:ring-red-500' : isRequired && !isAnswered ? 'border-red-500 focus:ring-red-500' : 'border-slate-200'} min-h-[48px] h-12 lg:h-16 text-3xl font-black rounded-2xl focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all px-4 lg:px-8 shadow-sm`}
            />
            {hasError && (
              <p className="text-red-500 text-sm font-bold">{validationErrors[question._id]}</p>
            )}
          </div>
        );
        break;

      case 'mcq':
        mainQuestionContent = (
          <RadioGroup
            value={currentValue}
            onValueChange={(value) => {
              // Clear validation error when user selects an option
              if (validationErrors[question._id]) {
                const newErrors = { ...validationErrors };
                delete newErrors[question._id];
                setValidationErrors(newErrors);
              }
              updateAnswer(question._id, value);
            }}
            className="grid grid-cols-1 gap-4"
          >
            {question.options.map((option: string) => (
              <div key={option}>
                <RadioGroupItem value={option} id={option} className="peer sr-only" />
                <Label
                  htmlFor={option}
                  className={`flex items-center rounded-2xl border-2 ${hasError ? 'border-red-500' : isRequired && !isAnswered ? 'border-red-300' : 'border-primary/20'} bg-white p-4 hover:bg-primary/5 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all text-sm font-bold shadow-sm group`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 mr-5 flex items-center justify-center transition-all ${currentValue === option ? "border-primary bg-primary" : "border-slate-200 group-hover:border-primary/40"
                    }`}>
                    {currentValue === option && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                  </div>
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
        break;

      case 'slider':
        const sliderValue = parseInt(currentValue) || 0;
        mainQuestionContent = (
          <div className={`bg-gradient-to-br from-primary/5 to-secondary/10 p-2 rounded-3xl ${hasError ? 'border border-red-500' : isRequired && !isAnswered ? 'border border-red-300' : 'border border-primary/20'} space-y-12 shadow-inner`}>
            <div className="text-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 blur-3xl rounded-full" />
              <span className="text-8xl font-black text-primary tracking-tighter relative tabular-nums">{sliderValue}</span>
              <span className="text-3xl font-bold text-primary/60 relative">/10</span>
              <p className="text-sm font-black uppercase tracking-[0.3em] text-primary mt-4 relative">
                {sliderValue <= 3 ? "Mild" : sliderValue <= 7 ? "Moderate" : "Severe"}
              </p>
            </div>

            <div className="px-4">
              <Slider
                value={[sliderValue]}
                onValueChange={([value]) => {
                  // Clear validation error when user adjusts the slider
                  if (validationErrors[question._id]) {
                    const newErrors = { ...validationErrors };
                    delete newErrors[question._id];
                    setValidationErrors(newErrors);
                  }
                  updateAnswer(question._id, value.toString());
                }}
                min={1}
                max={10}
                step={1}
                className="w-full py-2 md:py-6"
              />
              <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400 pt-6">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>
          </div>
        );
        break;

      case 'skeleton':
        mainQuestionContent = (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className={`relative w-full aspect-[3/4] max-w-[260px] md:max-w-[300px] mx-auto ${hasError ? 'bg-red-50' : isRequired && !isAnswered ? 'bg-red-50' : 'bg-slate-50'} rounded-3xl p-6 md:p-8 shadow-inner border ${hasError ? 'border-red-500' : isRequired && !isAnswered ? 'border-red-200' : 'border-slate-100'} flex items-center justify-center`}>
              <svg viewBox="0 0 100 200" className="w-full h-full opacity-10 text-slate-900">
                <ellipse cx="50" cy="18" rx="12" ry="15" fill="currentColor" />
                <rect x="35" y="35" width="30" height="50" rx="5" fill="currentColor" />
                <rect x="20" y="35" width="12" height="45" rx="4" fill="currentColor" />
                <rect x="68" y="35" width="12" height="45" rx="4" fill="currentColor" />
                <rect x="35" y="88" width="13" height="55" rx="4" fill="currentColor" />
                <rect x="52" y="88" width="13" height="55" rx="4" fill="currentColor" />
              </svg>

              {bodyAreas.map((area) => (
                <button
                  key={area.id}
                  className={`absolute ${area.position} w-8 h-8 md:w-6 md:h-6 rounded-full transition-all duration-500 ${currentValue === area.id
                    ? "bg-primary scale-150 shadow-xl shadow-primary/40 ring-4 ring-primary/20"
                    : "bg-slate-300 hover:bg-primary/40"
                    }`}
                  onClick={() => {
                    // Clear validation error when user selects an area
                    if (validationErrors[question._id]) {
                      const newErrors = { ...validationErrors };
                      delete newErrors[question._id];
                      setValidationErrors(newErrors);
                    }
                    updateAnswer(question._id, area.id);
                  }}
                />
              ))}
            </div>

            <div className="flex flex-wrap justify-start gap-3">
              {bodyAreas.map((area) => (
                <Badge
                  key={area.id}
                  variant={currentValue === area.id ? "default" : "secondary"}
                  className={`cursor-pointer transition-all px-6 py-4 text-xs font-black rounded-2xl ${currentValue === area.id ? "shadow-2xl scale-110" : "bg-white hover:bg-slate-50 border-slate-100"
                    } ${hasError ? 'border-red-500' : isRequired && !isAnswered ? 'border-red-200' : ''}`}
                  onClick={() => {
                    // Clear validation error when user selects an area
                    if (validationErrors[question._id]) {
                      const newErrors = { ...validationErrors };
                      delete newErrors[question._id];
                      setValidationErrors(newErrors);
                    }
                    updateAnswer(question._id, area.id);
                  }}
                >
                  {area.label}
                </Badge>
              ))}
            </div>
          </div>
        );
        break;

      case 'skalaeton':
        mainQuestionContent = (
          <SkalaetonQuestion
            question={question}
            currentValue={Array.isArray(currentValue) ? currentValue : []}
            updateAnswer={(questionId: string, value: string[]) => updateAnswer(questionId, value)}
          />
        );
        break;

      case 'upload':
        const isUploading = (currentValue && typeof currentValue === 'object' && currentValue.uploading) || false;
        const uploadedFileUrl = (currentValue && typeof currentValue === 'object' && currentValue.url) ? currentValue.url : null;
        const uploadedFileName = (currentValue && typeof currentValue === 'object' && currentValue.name) ? currentValue.name : null;
        
        mainQuestionContent = (
          <div className="space-y-4">
            {!uploadedFileUrl ? (
              <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                hasError ? 'border-red-500 bg-red-50' : 
                isRequired && !isAnswered ? 'border-red-300 bg-red-50' : 
                'border-primary/30 bg-primary/5 hover:border-primary/60'
              }`}>
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <p className="font-bold text-sm mb-1">
                  {isUploading ? 'Uploading...' : 'Upload File'}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Click to select or drag and drop your file (PDF, Word, Excel, Images, etc.)
                </p>
                <input
                  type="file"
                  id={`file-upload-${question._id}`}
                  className="hidden"
                  disabled={isUploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Clear validation error when user selects a file
                      if (validationErrors[question._id]) {
                        const newErrors = {...validationErrors};
                        delete newErrors[question._id];
                        setValidationErrors(newErrors);
                      }
                      
                      // Show uploading state
                      updateAnswer(question._id, {
                        uploading: true,
                        name: file.name,
                        size: file.size,
                        type: file.type
                      });

                      try {
                        // Upload file to backend
                        const formData = new FormData();
                        formData.append('file', file);

                        const response = await fetch('/questionnaires/upload-file', {
                          method: 'POST',
                          body: formData
                        });

                        if (!response.ok) {
                          throw new Error('File upload failed');
                        }

                        const result = await response.json();
                        
                        if (result.success && result.data) {
                          // Store the uploaded file URL and details
                          updateAnswer(question._id, {
                            url: result.data.url,
                            name: result.data.filename,
                            size: result.data.size,
                            type: result.data.mimetype,
                            uploading: false
                          });

                          // Clear file input
                          const fileInput = document.getElementById(`file-upload-${question._id}`) as HTMLInputElement;
                          if (fileInput) fileInput.value = '';
                        } else {
                          throw new Error(result.message || 'Upload failed');
                        }
                      } catch (error) {
                        console.error('Error uploading file:', error);
                        // Reset to error state
                        updateAnswer(question._id, {
                          error: true,
                          errorMessage: (error as Error).message,
                          uploading: false
                        });
                      }
                    }
                  }}
                />
                <Label 
                  htmlFor={`file-upload-${question._id}`}
                  className="inline-block"
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    disabled={isUploading}
                    onClick={() => {
                      const input = document.getElementById(`file-upload-${question._id}`) as HTMLInputElement;
                      input?.click();
                    }}
                  >
                    {isUploading ? 'Uploading...' : 'Select File'}
                  </Button>
                </Label>
              </div>
            ) : null}
            
            {uploadedFileUrl && (
              <div className="flex items-center justify-between bg-success/10 border border-success/30 rounded-lg p-4">
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="w-5 h-5 text-success flex-shrink-0" />
                  <div className="text-sm flex-1 min-w-0">
                    <p className="font-bold text-success truncate">{uploadedFileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {uploadedFileUrl}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <a
                    href={uploadedFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-success/20 rounded transition-colors"
                    title="View file"
                  >
                    <FileText className="w-5 h-5 text-success" />
                  </a>
                  <button
                    onClick={() => {
                      // Reset upload
                      updateAnswer(question._id, null);
                      const fileInput = document.getElementById(`file-upload-${question._id}`) as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="p-2 hover:bg-red-100 rounded transition-colors"
                    title="Remove file"
                  >
                    <X className="w-5 h-5 text-destructive" />
                  </button>
                </div>
              </div>
            )}

            {(currentValue && typeof currentValue === 'object' && currentValue.error) && (
              <p className="text-red-500 text-sm font-bold">
                Upload error: {(currentValue as any).errorMessage}
              </p>
            )}

            {hasError && (
              <p className="text-red-500 text-sm font-bold">{validationErrors[question._id]}</p>
            )}
          </div>
        );
        break;

      default:
        mainQuestionContent = (
          <div className="space-y-4">
            <Input
              value={currentValue}
              onChange={(e) => {
                // Clear validation error when user starts typing
                if (validationErrors[question._id]) {
                  const newErrors = { ...validationErrors };
                  delete newErrors[question._id];
                  setValidationErrors(newErrors);
                }
                updateAnswer(question._id, e.target.value);
              }}
              placeholder="Enter your response"
              className={`${hasError ? 'border-red-500 focus:ring-red-500' : isRequired && !isAnswered ? 'border-red-500 focus:ring-red-500' : 'border-slate-200'} min-h-[48px] h-12 lg:h-16 text-3xl font-black rounded-2xl focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all px-4 lg:px-8 shadow-sm`}
            />
            {hasError && (
              <p className="text-red-500 text-sm font-bold">{validationErrors[question._id]}</p>
            )}
          </div>
        );
    }

    // Add common field if enabled
    const commonFieldContent = question.hasCommonField ? (
      <div className="mt-6 pt-4 border-t border-slate-200">
        <Label className="text-sm font-bold text-slate-700 mb-2 block">
          {question.commonFieldLabel || "Additional Information"}
        </Label>
        <Input
          value={commonFieldValue}
          onChange={(e) => updateAnswer(question._id, e.target.value, true)}
          placeholder={question.commonFieldPlaceholder || "Enter additional details..."}
          className="border-slate-200 min-h-[40px] text-lg rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all px-4"
        />
      </div>
    ) : null;

    return (
      <div className="space-y-4">
        {mainQuestionContent}
        {commonFieldContent}
      </div>
    );
  };

  // Get current question
  const currentQuestion = activeQuestionnaire?.questions[activeQuestionIndex];

  // Calculate progress
  const totalQuestions = activeQuestionnaire?.questions.length || 0;
  const progressPercentage = totalQuestions > 0 ? Math.floor((activeQuestionIndex / totalQuestions) * 100) : 0;

  // Show loading state
  if (isLoading) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-primary/5 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">Loading questionnaire...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-primary/5 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <div className="text-red-500 mb-4">
                <Activity className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Unable to Load Questionnaire</h3>
              <p className="text-slate-600 mb-6">{error}</p>
              <Button onClick={() => dispatch(fetchActiveQuestionnaire() as any)}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout >
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-primary/5 pb-20">
        {/* Progress Header */}
        {!isReviewing && (
          <div className="sticky top-14 md:top-16 z-40 bg-white/80 backdrop-blur-xl border-b border-primary/20 py-2 md:py-3 shadow-sm">
            <div className="container max-w-6xl px-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Question {activeQuestionIndex + 1} of {totalQuestions}
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className="hidden sm:flex bg-accent/10 text-accent border border-accent/20 font-black px-3 py-1 rounded-lg"
                >
                  {progressPercentage}% Complete
                </Badge>
              </div>
              <div className="h-1 w-full lg:h-1.5 bg-primary/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.8, ease: "circOut" }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="container  mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8 mt-4">
            <aside className="hidden lg:block lg:w-2/5 sticky top-20 self-start">
              <div
                className="rounded-2xl
                  bg-gradient-to-br from-slate-50 to-slate-100
                  border border-slate-200
                  p-6
                  shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-slate-500 tracking-wide">
                      Personalized Care Intake
                    </p>
                    <h2 className="text-lg font-black text-slate-900">
                      Guided clinical intake
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      This intake helps clinicians prioritize your needs — ~3
                      minutes
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <ol className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2">
                    {activeQuestionnaire?.questions.map(
                      (question: any, index: number) => {
                        const answered = data.hasOwnProperty(question._id);
                        const current = activeQuestionIndex === index;
                        return (
                          <li
                            key={question._id}
                            className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${current
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-slate-100"
                              } ${answered ? "!text-emerald-700" : ""}`}
                            aria-current={current ? "step" : undefined}
                          >
                            <div
                              className={`
                            h-8 w-8 rounded-full flex items-center justify-center
                            text-xs font-bold transition-all
                            ${current
                                  ? "bg-primary text-white shadow-md shadow-primary/20"
                                  : answered
                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                    : "bg-slate-100 text-slate-400 border border-slate-200"
                                }
                          `}
                            >
                              {answered ? (
                                <CheckCircle className="h-3.5 w-3.5" />
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div className="text-sm font-medium truncate flex-1">
                              {question.question}
                            </div>
                          </li>
                        );
                      }
                    )}
                  </ol>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-success" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Secure
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Encrypted
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <main className="lg:w-3/5 w-full ">
              <div className="">
                {/* Stored intake banner */}
                {storedIntakeFound && !isReviewing && (
                  <div className="mb-6">
                    <Card className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-black">
                            Saved intake found
                          </div>
                          <div className="text-xs text-slate-500">
                            Last updated:{" "}
                            {storedIntakeUpdatedAt
                              ? new Date(
                                storedIntakeUpdatedAt
                              ).toLocaleDateString()
                              : "Unknown"}
                            . You can review or continue with this intake.
                          </div>
                        </div>
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
                          <Button
                            variant="outline"
                            className="w-full lg:w-auto"
                            onClick={() => {
                              setIsReviewing(true);
                            }}
                          >
                            Review
                          </Button>
                          {/* <Button
                            className="w-full lg:w-auto"
                            onClick={async () => {
                              const stored = loadStoredQuestionnaire();
                              if (stored) {
                                try {
                                  const healthProfileData =
                                    transformQuestionnaireToHealthProfile(
                                      stored.data,
                                      activeQuestionnaire?.questions || []
                                    );

                                  // Update user profile with health data from stored questionnaire (only for authenticated users)
                                  const profileData = {
                                    healthProfile: healthProfileData,
                                  };
                                  // Only update profile for authenticated users
                                  if (isAuthenticated) {
                                    await updateProfile(profileData);
                                  }
                                } catch (error) {
                                  console.error(
                                    "Error updating profile with stored questionnaire data:",
                                    error
                                  );
                                }

                                const serializedStoredData = serializeQuestionnaireData(stored.data);
                                const assigned = assignTherapist(serializedStoredData);
                                const pending =
                                  pendingPlan ||
                                  (() => {
                                    try {
                                      const raw =
                                        sessionStorage.getItem(
                                          "qw_pending_plan"
                                        );
                                      return raw ? JSON.parse(raw) : null;
                                    } catch (e) {
                                      return null;
                                    }
                                  })();
                                if (pending) {
                                  savePlanToStorage(pending);
                                  try {
                                    sessionStorage.removeItem(
                                      "qw_pending_plan"
                                    );
                                  } catch (e) { }
                                  // Get subscription ID from stored plan
                                  let subscriptionId = null;
                                  try {
                                    const storedPlan =
                                      sessionStorage.getItem("qw_plan");
                                    if (storedPlan) {
                                      const planData = JSON.parse(storedPlan);
                                      subscriptionId =
                                        planData.subscriptionId || null;
                                    }
                                  } catch (e) {
                                    console.error(
                                      "Error getting subscription ID from storage:",
                                      e
                                    );
                                  }

                                  navigate("/profile", {
                                    state: {
                                      fromSubscription: true,
                                      subscriptionId: subscriptionId,
                                      plan: pending,
                                      questionnaireData: serializedStoredData,
                                      therapist: assigned,
                                      guestUser: guestUser,
                                    },
                                  });
                                  return;
                                }
                                // navigate('/profile', { state: { questionnaireData: stored.data, assigned, guestUser: guestUser } });
                              }
                            }}
                          >
                            Use & Continue
                          </Button> */}
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {!isReviewing && currentQuestion ? (
                    <motion.div
                      key={`question-${currentQuestion._id}`}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                    >
                      <div
                        role="region"
                        aria-labelledby={`question-${currentQuestion._id}-title`}
                        className="min-h-[50vh] flex lg:items-center  items-start justify-center pt-6 lg:pt-0"
                      >
                        <Card className="w-full border rounded-2xl border-slate-500 shadow-sm ">
                          <CardContent className="p-2 lg:p-8">
                            <div className="flex items-center gap-4 mb-6">
                              <div className="h-10 w-10 rounded-lg flex items-center justify-center font-black text-lg bg-primary/10 text-primary">
                                {activeQuestionIndex + 1}
                              </div>
                              <div>
                                <h3
                                  id={`question-${currentQuestion._id}-title`}
                                  className="font-black text-2xl text-slate-900 tracking-tight"
                                >
                                  {currentQuestion.question}
                                  {currentQuestion.required && (
                                    <span className="text-red-500 ml-1">*</span>
                                  )}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                  Answer this question to continue
                                </p>
                              </div>
                            </div>

                            <div className="py-4 md:py-6 space-y-6">
                              {renderQuestion(currentQuestion)}
                            </div>

                            <div className="mt-4">
                              <p className="text-sm text-slate-500 italic">
                                * Indicates required field
                              </p>
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-4">
                              {activeQuestionIndex > 0 ? (
                                <Button
                                  variant="outline"
                                  onClick={handlePrevious}
                                  className="h-12 px-4 md:px-6 rounded-xl font-black text-primary border-primary/30 hover:bg-primary transition-all"
                                >
                                  Back
                                </Button>
                              ) : (
                                <div />
                              )}

                              <Button
                                onClick={handleNext}
                                className="hidden lg:inline-flex h-12 px-6 md:px-8 rounded-xl font-black text-lg bg-primary hover:from-primary/90 hover:to-accent/90 shadow-md shadow-primary/20 group"
                              >
                                {activeQuestionIndex <
                                  (activeQuestionnaire?.questions.length || 0) - 1
                                  ? "Continue"
                                  : "Finish & Review"}
                                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="review"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                    >
                      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-1">
                          <CardContent className="p-6 lg:p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 items-start">
                              <div>
                                <div className="flex items-center gap-3 mb-6">
                                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <FileText className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-black text-slate-900">
                                      Clinical Intake Summary
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                      Confirm the clinical details we'll use to
                                      match you with the right specialists.
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  {activeQuestionnaire?.questions.map(
                                    (question: any, index: number) => (
                                      <div
                                        key={question._id}
                                        className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
                                      >
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 shadow-sm flex items-center justify-center text-primary flex-shrink-0 mt-1">
                                          <Edit2 className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs uppercase font-black tracking-[0.15em] text-slate-400 mb-1.5">
                                            {question.question}
                                          </p>
                                          <p className="text-base font-medium text-slate-800 break-words flex items-center gap-2">
                                            {question.type === 'skalaeton' && Array.isArray(data[question._id]) && data[question._id].length > 0 ? (
                                              <span className="flex flex-wrap gap-2">
                                                {data[question._id].map((areaId: string) => {
                                                  const area = [
                                                    { id: "neck", label: "Neck" },
                                                    { id: "left-shoulder", label: "Left Shoulder" },
                                                    { id: "right-shoulder", label: "Right Shoulder" },
                                                    { id: "upper-back", label: "Upper Back" },
                                                    { id: "lower-back", label: "Lower Back" },
                                                    { id: "hip-left", label: "Left Hip" },
                                                    { id: "hip-right", label: "Right Hip" },
                                                    { id: "headache", label: "Headache" },
                                                    { id: "left-knee", label: "Left Knee" },
                                                    { id: "right-knee", label: "Right Knee" },
                                                    { id: "left-ankle", label: "Left Ankle" },
                                                    { id: "right-ankle", label: "Right Ankle" },
                                                    { id: "left-elbow", label: "Left Elbow" },
                                                    { id: "right-elbow", label: "Right Elbow" },
                                                    { id: "left-wrist", label: "Left Wrist" },
                                                    { id: "right-wrist", label: "Right Wrist" },
                                                  ].find(a => a.id === areaId);
                                                  return area ? (
                                                    <Badge key={areaId} variant="default" className="text-xs">
                                                      {area.label}
                                                    </Badge>
                                                  ) : null;
                                                })}
                                              </span>
                                            ) : question.type === 'age' ? (
                                              <span className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-primary" />
                                                {data[question._id] || "Not answered"}
                                              </span>
                                            ) : typeof data[question._id] === 'object' && data[question._id] !== null && (data[question._id] as any).commonField !== undefined ? (
                                              <div className="space-y-1">
                                                <span>
                                                  {(data[question._id] as any).mainAnswer || 
                                                   ((data[question._id] as any).mainAnswer === null ? "Not answered" : (data[question._id] as any).mainAnswer)}
                                                </span>
                                                {(data[question._id] as any).commonField && (
                                                  <div className="text-sm text-slate-500 italic mt-1">
                                                    Additional: {(data[question._id] as any).commonField}
                                                  </div>
                                                )}
                                              </div>
                                            ) : question.hasCommonField && data[question._id] !== undefined && data[question._id] !== null ? (
                                              // Handle case where user only provided main answer (simple value format)
                                              <div className="space-y-1">
                                                <span>{data[question._id].toString() || "Not answered"}</span>
                                                {/* No additional field since user didn't provide it */}
                                              </div>
                                            ) : typeof data[question._id] === 'string' && data[question._id].includes(' | Additional: ') ? (
                                              // Handle combined format from questionnaire responses (backward compatibility)
                                              <div className="space-y-1">
                                                <span>{data[question._id].split(' | Additional: ')[0] || "Not answered"}</span>
                                                {data[question._id].includes(' | Additional: ') && (
                                                  <div className="text-sm text-slate-500 italic mt-1">
                                                    Additional: {data[question._id].split(' | Additional: ')[1]}
                                                  </div>
                                                )}
                                              </div>
                                            ) : typeof data[question._id] === 'string' && data[question._id].startsWith('{') && data[question._id].includes('mainAnswer') ? (
                                              // Handle JSON string format from stored responses
                                              (() => {
                                                try {
                                                  const parsed = JSON.parse(data[question._id]);
                                                  return (
                                                    <div className="space-y-1">
                                                      <span>{parsed.mainAnswer || "Not answered"}</span>
                                                      {parsed.commonField && (
                                                        <div className="text-sm text-slate-500 italic mt-1">
                                                          Additional: {parsed.commonField}
                                                        </div>
                                                      )}
                                                    </div>
                                                  );
                                                } catch (e) {
                                                  return <span>{data[question._id] || "Not answered"}</span>;
                                                }
                                              })()
                                            ) : typeof data[question._id] === 'object' && (data[question._id] as any)?.url ? (
                                              <>
                                                <a
                                                  href={(data[question._id] as any).url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-primary hover:underline flex items-center gap-1"
                                                >
                                                  <FileText className="w-4 h-4" />
                                                  {(data[question._id] as any).name || 'View File'}
                                                </a>
                                              </>
                                            ) : typeof data[question._id] === 'object' && (data[question._id] as any)?.name ? (
                                              (data[question._id] as any).name
                                            ) : typeof data[question._id] === 'object' && (data[question._id] as any)?.error ? (
                                              <span className="text-red-500 text-sm">
                                                Upload failed: {(data[question._id] as any).errorMessage || 'Unknown error'}
                                              </span>
                                            ) : typeof data[question._id] === 'object' && (data[question._id] as any)?.uploading ? (
                                              <span className="text-blue-500 text-sm">
                                                Uploading...
                                              </span>
                                            ) : (
                                              data[question._id] ||
                                              "Not answered"
                                            )}
                                          </p>
                                        </div>
                                        <button
                                          onClick={() => {
                                            setIsReviewing(false);
                                            setActiveQuestionIndex(index);
                                          }}
                                          className="text-slate-400 hover:text-primary transition-colors self-start mt-1.5"
                                          aria-label="Edit question"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </button>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>

                              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="p-2 rounded-lg bg-success/10 text-success">
                                    <ArrowRight className="h-5 w-5" />
                                  </div>
                                  <h4 className="text-base font-black text-slate-900">
                                    Next Steps
                                  </h4>
                                </div>
                                <p className="text-sm text-slate-600 mb-6">
                                  We'll use these details to surface clinicians
                                  who best match your needs. You will be able to
                                  review profiles and choose a specialist.
                                </p>

                               <div className="space-y-4">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    
    <Button
      onClick={handleSubmit}
      className="h-14 rounded-xl font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
    >
      Submit Consultation
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>

    <Button
      onClick={handleSubmit}
      variant="outline"
      className="h-14 rounded-xl font-black border-primary text-primary hover:bg-primary/10 hover:text-black"
    >
      Free Consultation
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>

  </div>

  <p className="text-xs text-slate-500 text-center pt-2">
    Your responses are encrypted and shared only with HIPAA-compliant providers
  </p>
</div>


                                <div className="mt-6 pt-6 border-t border-slate-200">
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                      <Shield className="h-4 w-4 text-success" />
                                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                        Secure
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Lock className="h-4 w-4 text-primary" />
                                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                        Encrypted
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-success" />
                                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                        Verified
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </main>
          </div>
        </div>

        {/* Sticky CTA for mobile & tablet (<lg) */}
        {!isReviewing && currentQuestion && !keyboardVisible && (
          <div
            className="lg:hidden fixed inset-x-0 bottom-0 p-4 bg-white border-t shadow z-50"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 1rem)" }}
          >
            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-500 text-center italic">
                * Indicates required field
              </p>
              <div className="flex gap-3">
                {activeQuestionIndex > 0 && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex-1 h-12 min-h-[48px] rounded-xl font-black"
                  >
                    Back
                  </Button>
                )}
                <button
                  onClick={handleNext}
                  className="flex-1 h-12 min-h-[48px] rounded-xl font-black bg-primary text-white"
                >
                  {activeQuestionIndex <
                    (activeQuestionnaire?.questions.length || 0) - 1
                    ? "Continue"
                    : "Finish & Review"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}