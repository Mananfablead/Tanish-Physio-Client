import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { Question } from '@/store/slices/questionnaireSlice';
import { useToast } from '@/hooks/use-toast';
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle, 
  Edit2, 
  ShieldCheck, 
  Activity,
  ArrowRight,
  Clock,
  User,
  Stethoscope
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchActiveQuestionnaire,
  submitQuestionnaireResponse,
  selectActiveQuestionnaire,
  selectQuestionnaireLoading,
  selectQuestionnaireError,
} from '@/store/slices/questionnaireSlice';

interface QuestionnaireData {
  [key: string]: any; // Dynamic response for any question
}

const initialData: QuestionnaireData = {};

// This will be populated from the backend questionnaire
const bodyAreas = [];

// This will be populated from the backend questionnaire
const timeSlots = [];

const stepTitles: { [key: number]: string } = {
  1: "Patient Profile",
  2: "Area of Concern",
  3: "Condition History",
  4: "Pain Severity",
  5: "Injury Context",
  6: "Session Format",
  7: "Availability",
};

const getStepHelper = (step: number, data: QuestionnaireData) => {
  return "Answer the question to continue";
};

interface StepWrapperProps {
  stepNum: number;
  title: string;
  description: string;
  children: React.ReactNode;
  activeStep: number;
  totalSteps: number;
  onBack?: () => void;
  onNext?: () => void;
  isNextDisabled?: boolean;
  nextLabel?: string;
  showNext?: boolean;
}

interface DynamicQuestionComponentProps {
  question: Question & { type?: string; question?: string };
  value: any;
  onChange: (value: any) => void;
}

const DynamicQuestionComponent: React.FC<DynamicQuestionComponentProps> = ({ question, value, onChange }: DynamicQuestionComponentProps) => {
  const renderQuestionField = () => {
    // Use the type field from API response (might be 'type' or 'questionType')
    const questionType = question.type || question.questionType;
    const questionOptions = question.options || [];
    
    switch (questionType) {
      case 'text':
        return (
          <Input
            type="text"
            placeholder="Enter your answer"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            placeholder="Enter a number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        );
      case 'radio':
        return (
          <RadioGroup
            value={value}
            onValueChange={onChange}
            className="grid grid-cols-1 gap-3"
          >
            {questionOptions?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {questionOptions?.map((option) => {
              const isChecked = Array.isArray(value) ? value.includes(option) : false;
              return (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={option}
                    checked={isChecked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        if (Array.isArray(value)) {
                          onChange([...value, option]);
                        } else {
                          onChange([option]);
                        }
                      } else {
                        if (Array.isArray(value)) {
                          onChange(value.filter((item: string) => item !== option));
                        } else {
                          onChange([]);
                        }
                      }
                    }}
                    className="h-4 w-4"
                  />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              );
            })}
          </div>
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            <option value="">Select an option</option>
            {questionOptions?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'slider':
        return (
          <div className="space-y-4">
            <Slider
              value={[parseInt(value) || 5]}
              onValueChange={([newValue]) => onChange(newValue)}
              min={questionOptions && questionOptions.length > 0 ? parseInt(questionOptions[0]) || 0 : 0}
              max={questionOptions && questionOptions.length > 1 ? parseInt(questionOptions[1]) || 10 : 10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{questionOptions?.[0] || '0'}</span>
              <span className="font-bold">{value || 5}</span>
              <span>{questionOptions?.[1] || '10'}</span>
            </div>
          </div>
        );
      default:
        return (
          <Input
            type="text"
            placeholder="Enter your answer"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      {renderQuestionField()}
    </div>
  );
};

const StepWrapper = ({ 
  stepNum, 
  title, 
  description, 
  children, 
  activeStep, 
  totalSteps,
  onBack,
  onNext,
  isNextDisabled,
  nextLabel = "Continue",
  showNext = true
}: StepWrapperProps) => {
  if (stepNum !== activeStep) return null;

  return (
    <div role="region" aria-labelledby={`step-${stepNum}-title`} className="min-h-[50vh] lg:min-h-[65vh] flex lg:items-center items-start justify-center pt-6 lg:pt-0">
      <Card className="w-full border rounded-2xl border-slate-500 shadow-sm ">
        <CardContent className="p-4 lg:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center font-black text-lg bg-primary/10 text-primary">
              {stepNum}
            </div>
            <div>
              <h3 id={`step-${stepNum}-title`} className="font-black text-2xl text-slate-900 tracking-tight">{title}</h3>
              <p className="text-sm text-slate-500 mt-1">{description}</p>
            </div>
          </div>

          <div className="py-4 md:py-6 space-y-6">
            {children}
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            {stepNum > 1 ? (
              <Button variant="outline" onClick={onBack} className="h-12 px-4 md:px-6 rounded-xl font-black text-primary border-primary/30 hover:bg-primary transition-all">Back</Button>
            ) : (
              <div />
            )}

            {showNext && (
              <Button onClick={onNext} disabled={isNextDisabled} className="hidden lg:inline-flex h-12 px-6 md:px-8 rounded-xl font-black text-lg bg-primary hover:from-primary/90 hover:to-accent/90 shadow-md shadow-primary/20 group">
                {nextLabel}
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function QuestionnairePage() {
  const dispatch: any = useDispatch(); // Temporary fix for async dispatch issue
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const pendingPlan = (location.state as any)?.planToActivate || null;

  const { activeQuestionnaire, loading, error } = useSelector((state: any) => ({
    activeQuestionnaire: selectActiveQuestionnaire(state),
    loading: selectQuestionnaireLoading(state),
    error: selectQuestionnaireError(state),
  }));

  const [data, setData] = useState<QuestionnaireData>(initialData);
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [storedIntakeFound, setStoredIntakeFound] = useState(false);
  const [storedIntakeUpdatedAt, setStoredIntakeUpdatedAt] = useState<number | null>(null);
  const [progressExpanded, setProgressExpanded] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const totalSteps = activeQuestionnaire?.questions?.length || 1; // Use actual number of questions from backend

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
      if (parsed && parsed.data) return parsed;
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
    // On mount, check for stored intake
    const stored = loadStoredQuestionnaire();
    if (stored) {
      setData(stored.data);
      setStoredIntakeFound(true);
      setStoredIntakeUpdatedAt(stored.updatedAt || now());
    }

    // If navigated here with a plan to activate, and we have stored intake and it's recent, set review mode
    if (pendingPlan) {
      if (stored && isRecent(stored.updatedAt)) {
        setIsReviewing(true);
      } else {
        // older intake or none: force full intake (start from step 1)
        setActiveStep(1);
        setIsReviewing(false);
      }
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

  useEffect(() => {
    // Fetch active questionnaire from backend
    dispatch(fetchActiveQuestionnaire());
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);


  const updateData = (field: keyof QuestionnaireData, value: any) => {
    setData((prev) => {
      const next = { ...prev, [field]: value } as QuestionnaireData;
      // persist
      saveStoredQuestionnaire(next);

      return next;
    });
  };

  const toggleTimeSlot = (slot: string) => {
    setData((prev) => ({
      ...prev,
      preferredTimes: prev.preferredTimes.includes(slot)
        ? prev.preferredTimes.filter((t) => t !== slot)
        : [...prev.preferredTimes, slot],
    }));
  };

  const handleNext = () => {
    setActiveStep(prev => {
      if (prev < totalSteps) {
        if (!completedSteps.includes(prev)) {
          setCompletedSteps(old => [...old, prev]);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        return prev + 1;
      }
      return prev;
    });
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep(prev => prev - 1);
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

  const handleSubmit = () => {
    // persist intake
    saveStoredQuestionnaire(data);

    // If we have an active questionnaire, submit responses to backend
    if (activeQuestionnaire) {
      const responses = Object.keys(data).reduce((acc, key) => {
        acc[key] = data[key];
        return acc;
      }, {} as Record<string, any>);

      dispatch(submitQuestionnaireResponse({
        questionnaireId: activeQuestionnaire._id || activeQuestionnaire.id,
        responses
      }));
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
      try { sessionStorage.removeItem("qw_pending_plan"); } catch (e) {}

      // navigate to booking flow with plan and questionnaire
      navigate("/schedule", { state: { plan: pending, questionnaireData: data, therapist: assigned } });
      return;
    }

    // Default behavior: continue to therapist discovery with intake data
    navigate("/plans", { state: { questionnaireData: data, assigned } });
  };


  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-primary/5 pb-20">
        {/* Progress Header */}
        {!isReviewing && (
          <div className="sticky top-14 md:top-16 z-40 bg-white/80 backdrop-blur-xl border-b border-primary/20 py-4 md:py-5 shadow-sm">
            <div className="container max-w-5xl px-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Step {activeStep} of {totalSteps}
                  </span>
                </div>
                <Badge variant="secondary" className="hidden sm:flex bg-accent/10 text-accent border border-accent/20 font-black px-3 py-1 rounded-lg">
                  {Math.floor(((activeStep - 1) / totalSteps) * 100)}% Complete
                </Badge>
              </div>
              <div className="h-1 w-full lg:h-1.5 bg-primary/20 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${((activeStep - 1) / totalSteps) * 100}%` }}
                  transition={{ duration: 0.8, ease: "circOut" }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="container max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="hidden lg:block lg:w-2/5">
              <div className="rounded-2xl
                  bg-gradient-to-b from-primary/20 via-secondary/30 to-accent/10
                  border border-primary/20
                  p-8
                  shadow-lg shadow-primary/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center shadow-sm">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-primary tracking-wide">Personalized Care Intake</p>
                    <h2 className="text-lg font-black text-slate-800">Guided clinical intake</h2>
                    <p className="text-sm text-slate-600 mt-1">This intake helps clinicians prioritize your needs — ~3 minutes</p>
                  </div>
                </div>

                <div className="mt-4">
                  <ol className="space-y-3">
                    {Object.keys(stepTitles).map((k) => {
                      const stepNum = Number(k);
                      const title = stepTitles[stepNum];
                      const completed = completedSteps.includes(stepNum);
                      const current = activeStep === stepNum;
                      return (
                        <li key={k} className={`flex items-center gap-3 ${current ? 'text-primary' : 'text-slate-400'}`} aria-current={current ? 'step' : undefined}>
                          <div className={`
                            h-9 w-9 rounded-full flex items-center justify-center
                            text-sm font-black transition-all
                            ${current
                              ? "bg-primary text-white shadow-md shadow-primary/20"
                              : completed
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-400"
                            }
                          `}
                          >
                            {completed ? <CheckCircle className="h-4 w-4" /> : stepNum}
                          </div>
                          <div className="text-sm font-black">{title}</div>
                        </li>
                      );
                    })}
                  </ol>
                </div>

                <div className="mt-6 text-sm text-slate-500">
                  <div className="font-black">Trust & privacy</div>
                  <div className="mt-2">• Clinician-reviewed • ~3 minutes</div>
                </div>
              </div>
            </aside>

            <main className="lg:w-3/5 w-full ">
              <div className="pt-8 ">

                {/* Show loading state while fetching questionnaire */}
                {loading && (
                  <div className="mb-6">
                    <Card className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-black">Loading questionnaire...</div>
                          <div className="text-xs text-slate-500">Please wait while we prepare your personalized questions.</div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Stored intake banner */}
                {storedIntakeFound && !isReviewing && !loading && activeQuestionnaire && (
                  <div className="mb-6">
                    <Card className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-black">Saved intake found</div>
                          <div className="text-xs text-slate-500">Last updated: {storedIntakeUpdatedAt ? new Date(storedIntakeUpdatedAt).toLocaleDateString() : 'Unknown'}. You can review or continue with this intake.</div>
                        </div>
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
                          <Button variant="outline" className="w-full lg:w-auto" onClick={() => { setIsReviewing(true); }}>Review</Button>
                          <Button className="w-full lg:w-auto" onClick={() => {
                            // Use stored intake as-is; this will activate any pending plan or continue
                            const stored = loadStoredQuestionnaire();
                            if (stored) {
                              const assigned = assignTherapist(stored.data);
                              const pending = pendingPlan || (() => {
                                try { const raw = sessionStorage.getItem("qw_pending_plan"); return raw ? JSON.parse(raw) : null; } catch(e){ return null; }
                              })();
                              if (pending) {
                                savePlanToStorage(pending);
                                try { sessionStorage.removeItem("qw_pending_plan"); } catch(e){}
                                navigate('/booking', { state: { plan: pending, questionnaireData: stored.data, therapist: assigned } });
                                return;
                              }
                              navigate('/plans', { state: { questionnaireData: stored.data, assigned } });
                            }
                          }}>Use & Continue</Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                <AnimatePresence mode="wait">
            {!isReviewing ? (
              <motion.div key={`step-${activeStep}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.45, ease: 'easeOut' }} >
                {loading && (
                  <div className="flex justify-center items-center h-64">
                    <p>Loading questionnaire...</p>
                  </div>
                )}
                {!loading && activeQuestionnaire && activeQuestionnaire.questions && (
                  <div>
                    {activeQuestionnaire.questions.map((question, index) => {
                      const stepNumber = index + 1;
                      if (stepNumber !== activeStep) return null;
          
                      return (
                        <StepWrapper 
                          key={question._id || question.id}
                          stepNum={stepNumber} 
                          title={question.question || question.questionText || `Question ${stepNumber}`} 
                          description="Please answer the question below"
                          activeStep={activeStep}
                          totalSteps={totalSteps}
                          onNext={handleNext}
                          onBack={handleBack}
                          isNextDisabled={question.required && !data[question._id || question.id]}
                        >
                          <DynamicQuestionComponent 
                            question={question} 
                            value={data[question._id || question.id] || ''} 
                            onChange={(value) => updateData(question._id || question.id, value)} 
                          />
                        </StepWrapper>
                      );
                    })}
                  </div>
                )}
                {!loading && !activeQuestionnaire && (
                  <div className="flex justify-center items-center h-64">
                    <p>No questionnaire available</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.45, ease: 'easeOut' }}>
                <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <CardContent className="p-6 lg:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                      <div>
                        <h3 className="text-lg font-black text-slate-900">Clinical Intake Summary</h3>
                        <p className="text-sm text-slate-500 mt-2">Confirm the clinical details we’ll use to match you with the right specialists.</p>
          
                        <div className="mt-6 space-y-4">
                          {activeQuestionnaire?.questions?.map((question, index) => (
                            <div key={question.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-100 border border-slate-100">
                              <div className="h-12 w-12 rounded-md bg-gradient-to-br from-primary/10 to-accent/10 shadow-sm flex items-center justify-center text-primary">
                                <Edit2 className="h-6 w-6" />
                              </div>
                              <div className="flex-1">
                                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-1">{question.question || question.questionText}</p>
                                <p className="text-sm font-black text-slate-900">{data[question._id || question.id] || 'No response'}</p>
                              </div>
                              <button onClick={() => { setIsReviewing(false); setActiveStep(index + 1); }} className="text-slate-400 hover:text-primary">Edit</button>
                            </div>
                          ))}
                        </div>
                      </div>
          
                      <div>
                        <h4 className="text-sm font-black text-slate-900">Next Steps</h4>
                        <p className="text-sm text-slate-500 mt-2">We’ll use these details to surface clinicians who best match your needs. You will be able to review profiles and choose a specialist.</p>
          
                        <div className="mt-6">
                          <Button onClick={handleSubmit} className="w-full h-16 rounded-xl font-black bg-primary">Continue to Specialist Matches <ArrowRight className="ml-3 h-5 w-5" /></Button>
                          <p className="text-[12px] text-slate-500 mt-3">Your responses are encrypted and shared only with Clinician-compliant providers.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
              </div>
            </main>
          </div>
        </div>

        {/* Sticky CTA for mobile & tablet (<lg) */}
        {!isReviewing && activeStep <= totalSteps && !keyboardVisible && (
          <div className="lg:hidden fixed inset-x-0 bottom-0 p-4 bg-white border-t shadow z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 1rem)' }}>
            <button
              onClick={() => {
                if (activeStep === 7) return setIsReviewing(true);
                return handleNext();
              }}
              disabled={(function(){
                switch(activeStep){
                  case 1: return !data.age || !data.gender;
                  case 2: return !data.painArea;
                  case 3: return !data.painDuration;
                  case 5: return !data.injuryType;
                  case 6: return !data.sessionType;
                  case 7: return data.preferredTimes.length === 0;
                  default: return false;
                }
              })()}
              className="w-full h-12 min-h-[48px] rounded-xl font-black bg-primary text-white disabled:opacity-50"
            >
              {activeStep === 7 ? 'View Assessment Summary' : 'Continue'}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
