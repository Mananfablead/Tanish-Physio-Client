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
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchActiveQuestionnaire, selectActiveQuestionnaire, selectQuestionnaireLoading, selectQuestionnaireError, QuestionType } from "@/store/slices/questionnaireSlice";
import { updateProfile } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface QuestionnaireData {
  [key: string]: any; // Dynamic keys for question responses
}

const initialData: QuestionnaireData = {};

export default function QuestionnairePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const pendingPlan = (location.state as any)?.planToActivate || null;
  const serviceToBook = (location.state as any)?.serviceToBook || null;
  const locationGuestUser = (location.state as any)?.guestUser || null;
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
        return parsed;
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

  useEffect(() => {
    // Fetch active questionnaire from API
    dispatch(fetchActiveQuestionnaire() as any);

    // On mount, check for stored intake
    const stored = loadStoredQuestionnaire();
    if (stored) {
      setData(stored.data);
      setStoredIntakeFound(true);
      setStoredIntakeUpdatedAt(stored.updatedAt || now());
    }

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
  }, []);

  const updateAnswer = (questionId: string, value: any) => {
    setData((prev) => {
      const next = { ...prev, [questionId]: value };
      // persist
      saveStoredQuestionnaire(next);

      // Clear validation error when user starts answering
      if (validationErrors[questionId]) {
        const newErrors = {...validationErrors};
        delete newErrors[questionId];
        setValidationErrors(newErrors);
      }

      // Auto advance to next question if there is one and it's not a text field
      const question = activeQuestionnaire?.questions.find((q: any) => q._id === questionId);
      // Only auto-advance if the question is not required OR has been answered with a non-empty value
      if (question && question.type !== 'text' && (!question.required || (value && value.toString().trim() !== ''))) {
        const currentQuestionIndex = activeQuestionnaire?.questions.findIndex((q: any) => q._id === questionId) ?? -1;
        if (currentQuestionIndex >= 0 && currentQuestionIndex < (activeQuestionnaire?.questions.length || 0) - 1) {
          setActiveQuestionIndex(currentQuestionIndex + 1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (currentQuestionIndex === (activeQuestionnaire?.questions.length || 0) - 1) {
          // If this is the last question, go to review
          setIsReviewing(true);
        }
      }

      return next;
    });
  };

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const handleNext = () => {
    // Check if current question is required and hasn't been answered
    const currentQuestion = activeQuestionnaire?.questions[activeQuestionIndex];
    if (currentQuestion?.required && (!data[currentQuestion._id] || data[currentQuestion._id].toString().trim() === '')) {
      setValidationErrors({
        ...validationErrors,
        [currentQuestion._id]: `${currentQuestion.question} is required`
      });
      return;
    }

    // Clear validation error for current question if it exists
    if (validationErrors[currentQuestion?._id]) {
      const newErrors = {...validationErrors};
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
      const unansweredRequired = requiredQuestions.filter((q: any) => !data[q._id] || data[q._id].toString().trim() === '');
      
      if (unansweredRequired.length > 0) {
        // Set validation errors for all unanswered required questions
        const newErrors: {[key: string]: string} = {};
        unansweredRequired.forEach((q: any) => {
          newErrors[q._id] = `${q.question} is required`;
        });
        setValidationErrors(newErrors);
        
        // Navigate to the first unanswered required question
        const firstUnansweredIndex = activeQuestionnaire?.questions.findIndex((q: any) => q._id === unansweredRequired[0]._id) || 0;
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

  // Transform questionnaire data to healthProfile structure
  const transformQuestionnaireToHealthProfile = (questionnaireData: any, questions: any[]) => {
    const healthProfile: any = {};

    // Map questionnaire responses to healthProfile fields
    Object.entries(questionnaireData).forEach(([questionId, answer]) => {
      const question = questions.find(q => q._id === questionId);
      if (!question) return;

      // Map based on question content or type
      const questionText = question.question.toLowerCase();

      if (questionText.includes('name') || questionText.includes('full name')) {
        // Don't map name to healthProfile
        return;
      } else if (questionText.includes('concern') || questionText.includes('problem') || questionText.includes('issue')) {
        healthProfile.primaryConcern = answer;
      } else if (questionText.includes('pain') && question.type === 'slider') {
        healthProfile.painIntensity = parseInt(answer as string) || 0;
      } else if (questionText.includes('duration') || questionText.includes('how long')) {
        healthProfile.priorTreatments = answer;
      } else if (questionText.includes('treatment') || questionText.includes('therapy')) {
        healthProfile.priorTreatments = healthProfile.priorTreatments
          ? `${healthProfile.priorTreatments}, ${answer}`
          : answer;
      } else if (questionText.includes('medical') || questionText.includes('history')) {
        healthProfile.medicalHistory = answer;
      } else if (questionText.includes('allerg')) {
        healthProfile.allergies = answer;
      } else if (questionText.includes('medication')) {
        healthProfile.medications = answer;
      } else if (questionText.includes('emergency') || questionText.includes('contact')) {
        healthProfile.emergencyContact = answer;
      } else {
        // For other questions, add to additional notes
        if (!healthProfile.additionalNotes) {
          healthProfile.additionalNotes = '';
        }
        healthProfile.additionalNotes += `${question.question}: ${answer}\n`;
      }
    });

    return healthProfile;
  };

  const handleSubmit = async () => {
    // Validate all required questions before submitting
    const requiredQuestions = activeQuestionnaire?.questions.filter((q: any) => q.required) || [];
    const unansweredRequired = requiredQuestions.filter((q: any) => !data[q._id] || data[q._id].toString().trim() === '');
    
    if (unansweredRequired.length > 0) {
      // Set validation errors for all unanswered required questions
      const newErrors: {[key: string]: string} = {};
      unansweredRequired.forEach((q: any) => {
        newErrors[q._id] = `${q.question} is required`;
      });
      setValidationErrors(newErrors);
      
      // Navigate to the first unanswered required question
      const firstUnansweredIndex = activeQuestionnaire?.questions.findIndex((q: any) => q._id === unansweredRequired[0]._id) || 0;
      setActiveQuestionIndex(firstUnansweredIndex);
      return;
    }

    // persist intake
    saveStoredQuestionnaire(data);

    try {
      // Transform questionnaire data to healthProfile structure
      const healthProfileData = transformQuestionnaireToHealthProfile(
        data,
        activeQuestionnaire?.questions || []
      );

      // Update user profile with health data from questionnaire (only for authenticated users)
      const profileData = {
        healthProfile: healthProfileData
      };
      // Only update profile for authenticated users
      if (isAuthenticated) {
        await updateProfile(profileData);
      }

      // If we were navigated here to activate a plan, complete activation and send user to booking
      const pending = pendingPlan || (() => {
        try {
          const raw = sessionStorage.getItem("qw_pending_plan");
          return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
      })();

      const assigned = assignTherapist(data);

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
        
        // navigate to booking-confirmation page with plan data for session booking
        navigate("/booking-confirmation", { state: { 
          fromSubscription: true,
          subscriptionId: subscriptionId,
          plan: pending, 
          questionnaireData: data, 
          therapist: assigned,
          guestUser: guestUser
        } });
        return;
      }

      if (serviceToBook) {
        // For service bookings, navigate to booking-confirmation page with service data
        navigate("/booking-confirmation", { state: { 
          fromServices: true,
          service: serviceToBook, 
          questionnaireData: data, 
          therapist: assigned,
          guestUser: guestUser
        } });
        return;
      }

      // Default behavior: continue to therapist discovery with intake data
      // navigate("/profile", { state: { questionnaireData: data, assigned, guestUser: guestUser } });
    } catch (error) {
      console.error("Error updating profile with questionnaire data:", error);
      // Continue with navigation even if profile update fails

      // If we were navigated here to activate a plan, complete activation and send user to booking
      const pending = pendingPlan || (() => {
        try {
          const raw = sessionStorage.getItem("qw_pending_plan");
          return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
      })();

      const assigned = assignTherapist(data);

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
        
        // navigate to booking-confirmation page with plan data for session booking
        navigate("/booking-confirmation", { state: { 
          fromSubscription: true,
          subscriptionId: subscriptionId,
          plan: pending, 
          questionnaireData: data, 
          therapist: assigned,
          guestUser: guestUser
        } });
        return;
      }

      if (serviceToBook) {
        // For service bookings, navigate to booking-confirmation page with service data
        navigate("/booking-confirmation", { state: { 
          fromServices: true,
          service: serviceToBook, 
          questionnaireData: data, 
          therapist: assigned,
          guestUser: guestUser
        } });
        return;
      }

      // Default behavior: continue to therapist discovery with intake data
      // navigate("/profile", { state: { questionnaireData: data, assigned, guestUser: guestUser } });
    }
    navigate("/");
  };

  // Define body areas for skeleton type
  const bodyAreas = [
    { id: "neck", label: "Neck", position: "top-[15%] left-[50%] -translate-x-1/2" },
    { id: "shoulder-left", label: "Left Shoulder", position: "top-[22%] left-[35%]" },
    { id: "shoulder-right", label: "Right Shoulder", position: "top-[22%] right-[35%]" },
    { id: "upper-back", label: "Upper Back", position: "top-[28%] left-[50%] -translate-x-1/2" },
    { id: "lower-back", label: "Lower Back", position: "top-[40%] left-[50%] -translate-x-1/2" },
    { id: "hip", label: "Hip", position: "top-[48%] left-[50%] -translate-x-1/2" },
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
    const currentValue = data[question._id] || '';
    const isRequired = question.required;
    const isAnswered = !!currentValue && currentValue.toString().trim() !== '';
    const hasError = validationErrors[question._id];

    switch (question.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <Input
              value={currentValue}
              onChange={(e) => {
                // Clear validation error when user starts typing
                if (validationErrors[question._id]) {
                  const newErrors = {...validationErrors};
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

      case 'mcq':
        return (
          <RadioGroup
            value={currentValue}
            onValueChange={(value) => {
              // Clear validation error when user selects an option
              if (validationErrors[question._id]) {
                const newErrors = {...validationErrors};
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

      case 'slider':
        const sliderValue = parseInt(currentValue) || 0;
        return (
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
                    const newErrors = {...validationErrors};
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

      case 'skeleton':
        return (
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
                      const newErrors = {...validationErrors};
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
                      const newErrors = {...validationErrors};
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

      case 'skalaeton':
        return (
          <SkalaetonQuestion
            question={question}
            currentValue={currentValue}
            updateAnswer={updateAnswer}
          />
        );

      default:
        return (
          <div className="space-y-4">
            <Input
              value={currentValue}
              onChange={(e) => {
                // Clear validation error when user starts typing
                if (validationErrors[question._id]) {
                  const newErrors = {...validationErrors};
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
    <Layout showFooter={false}>
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
                <Badge variant="secondary" className="hidden sm:flex bg-accent/10 text-accent border border-accent/20 font-black px-3 py-1 rounded-lg">
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
              <div className="rounded-2xl
                  bg-gradient-to-br from-slate-50 to-slate-100
                  border border-slate-200
                  p-6
                  shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-slate-500 tracking-wide">Personalized Care Intake</p>
                    <h2 className="text-lg font-black text-slate-900">Guided clinical intake</h2>
                    <p className="text-sm text-slate-500 mt-1">This intake helps clinicians prioritize your needs — ~3 minutes</p>
                  </div>
                </div>

                <div className="mt-4">
                  <ol className="space-y-2.5 max-h-[400px] overflow-y-auto pr-2">
                    {activeQuestionnaire?.questions.map((question: any, index: number) => {
                      const answered = data.hasOwnProperty(question._id);
                      const current = activeQuestionIndex === index;
                      return (
                        <li 
                          key={question._id} 
                          className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${current ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100'} ${answered ? '!text-emerald-700' : ''}`} 
                          aria-current={current ? 'step' : undefined}
                        >
                          <div className={`
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
                            {answered ? <CheckCircle className="h-3.5 w-3.5" /> : index + 1}
                          </div>
                          <div className="text-sm font-medium truncate flex-1">{question.question}</div>
                        </li>
                      );
                    })}
                  </ol>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-success" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Secure</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Verified</span>
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
                          <div className="text-sm font-black">Saved intake found</div>
                          <div className="text-xs text-slate-500">Last updated: {storedIntakeUpdatedAt ? new Date(storedIntakeUpdatedAt).toLocaleDateString() : 'Unknown'}. You can review or continue with this intake.</div>
                        </div>
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
                          <Button variant="outline" className="w-full lg:w-auto" onClick={() => { setIsReviewing(true); }}>Review</Button>
                          <Button className="w-full lg:w-auto" onClick={async () => {
                            
                            const stored = loadStoredQuestionnaire();
                            if (stored) {
                              try {
                               
                                const healthProfileData = transformQuestionnaireToHealthProfile(
                                  stored.data,
                                  activeQuestionnaire?.questions || []
                                );

                                // Update user profile with health data from stored questionnaire (only for authenticated users)
                                const profileData = {
                                  healthProfile: healthProfileData
                                };
                                // Only update profile for authenticated users
                                if (isAuthenticated) {
                                  await updateProfile(profileData);
                                }
                              } catch (error) {
                                console.error("Error updating profile with stored questionnaire data:", error);
                              }

                              const assigned = assignTherapist(stored.data);
                              const pending = pendingPlan || (() => {
                                try { const raw = sessionStorage.getItem("qw_pending_plan"); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
                              })();
                              if (pending) {
                                savePlanToStorage(pending);
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
                                
                                navigate('/booking-confirmation', { state: { 
                                  fromSubscription: true,
                                  subscriptionId: subscriptionId,
                                  plan: pending, 
                                  questionnaireData: stored.data, 
                                  therapist: assigned,
                                  guestUser: guestUser
                                } });
                                return;
                              }
                              // navigate('/profile', { state: { questionnaireData: stored.data, assigned, guestUser: guestUser } });
                            }
                          }}>Use & Continue</Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {!isReviewing && currentQuestion ? (
                    <motion.div key={`question-${currentQuestion._id}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.45, ease: 'easeOut' }} >
                      <div role="region" aria-labelledby={`question-${currentQuestion._id}-title`} className="min-h-[50vh] flex lg:items-center  items-start justify-center pt-6 lg:pt-0">
                        <Card className="w-full border rounded-2xl border-slate-500 shadow-sm ">
                          <CardContent className="p-2 lg:p-8">
                            <div className="flex items-center gap-4 mb-6">
                              <div className="h-10 w-10 rounded-lg flex items-center justify-center font-black text-lg bg-primary/10 text-primary">
                                {activeQuestionIndex + 1}
                              </div>
                              <div>
                                <h3 id={`question-${currentQuestion._id}-title`} className="font-black text-2xl text-slate-900 tracking-tight">
                                  {currentQuestion.question}
                                  {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Answer this question to continue</p>
                              </div>
                            </div>

                            <div className="py-4 md:py-6 space-y-6">
                              {renderQuestion(currentQuestion)}
                            </div>

                            <div className="mt-4">
                              <p className="text-sm text-slate-500 italic">* Indicates required field</p>
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-4">
                              {activeQuestionIndex > 0 ? (
                                <Button variant="outline" onClick={handlePrevious} className="h-12 px-4 md:px-6 rounded-xl font-black text-primary border-primary/30 hover:bg-primary transition-all">Back</Button>
                              ) : (
                                <div />
                              )}

                              <Button onClick={handleNext} className="hidden lg:inline-flex h-12 px-6 md:px-8 rounded-xl font-black text-lg bg-primary hover:from-primary/90 hover:to-accent/90 shadow-md shadow-primary/20 group">
                                {activeQuestionIndex < (activeQuestionnaire?.questions.length || 0) - 1 ? 'Continue' : 'Finish & Review'}
                                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.45, ease: 'easeOut' }}>
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
                                    <h3 className="text-xl font-black text-slate-900">Clinical Intake Summary</h3>
                                    <p className="text-sm text-slate-500 mt-1">Confirm the clinical details we'll use to match you with the right specialists.</p>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  {activeQuestionnaire?.questions.map((question: any, index: number) => (
                                    <div key={question._id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 shadow-sm flex items-center justify-center text-primary flex-shrink-0 mt-1">
                                        <Edit2 className="h-4 w-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs uppercase font-black tracking-[0.15em] text-slate-400 mb-1.5">{question.question}</p>
                                        <p className="text-base font-medium text-slate-800 break-words">{data[question._id] || 'Not answered'}</p>
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
                                  ))}
                                </div>
                              </div>

                              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="p-2 rounded-lg bg-success/10 text-success">
                                    <ArrowRight className="h-5 w-5" />
                                  </div>
                                  <h4 className="text-base font-black text-slate-900">Next Steps</h4>
                                </div>
                                <p className="text-sm text-slate-600 mb-6">We'll use these details to surface clinicians who best match your needs. You will be able to review profiles and choose a specialist.</p>

                                <div className="space-y-4">
                                  <Button
                                    onClick={handleSubmit}
                                    className="w-full h-14 rounded-xl font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                                  >
                                    Continue to Specialist Matches <ArrowRight className="ml-2 h-4 w-4" />
                                  </Button>
                                  <p className="text-xs text-slate-500 text-center pt-2">
                                    Your responses are encrypted and shared only with HIPAA-compliant providers
                                  </p>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-200">
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                      <Shield className="h-4 w-4 text-success" />
                                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Secure</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Lock className="h-4 w-4 text-primary" />
                                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Encrypted</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-success" />
                                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Verified</span>
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
          <div className="lg:hidden fixed inset-x-0 bottom-0 p-4 bg-white border-t shadow z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 1rem)' }}>
            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-500 text-center italic">* Indicates required field</p>
              <div className="flex gap-3">
                {activeQuestionIndex > 0 && (
                  <Button variant="outline" onClick={handlePrevious} className="flex-1 h-12 min-h-[48px] rounded-xl font-black">
                    Back
                  </Button>
                )}
                <button
                  onClick={handleNext}
                  className="flex-1 h-12 min-h-[48px] rounded-xl font-black bg-primary text-white"
                >
                  {activeQuestionIndex < (activeQuestionnaire?.questions.length || 0) - 1 ? 'Continue' : 'Finish & Review'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}