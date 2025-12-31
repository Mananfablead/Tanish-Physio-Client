import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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

interface QuestionnaireData {
  age: string;
  gender: string;
  painArea: string;
  painDuration: string;
  painLevel: number;
  injuryType: string;
  sessionType: string;
  preferredTimes: string[];
}

const initialData: QuestionnaireData = {
  age: "",
  gender: "",
  painArea: "",
  painDuration: "",
  painLevel: 5,
  injuryType: "",
  sessionType: "",
  preferredTimes: [],
};

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

const timeSlots = [
  "Morning (6AM-12PM)",
  "Afternoon (12PM-5PM)",
  "Evening (5PM-9PM)",
  "Night (9PM-12AM)",
];

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
  switch (step) {
    case 1:
      return "Confidential details to personalize your care.";
    case 2:
      return data.painArea ? `Selected: ${bodyAreas.find(a => a.id === data.painArea)?.label}` : "Select the area that best matches your discomfort.";
    case 3:
      if (!data.painDuration) return "How long have you been experiencing this?";
      if (data.painDuration.includes("More than") || data.painDuration.includes("3-6")) return "Chronic pain can affect daily life — we’ll ensure a prioritized assessment.";
      return "Early-stage pain often responds well to targeted treatment — we’ll take a focused approach.";
    case 4:
      return data.painLevel >= 8 ? "Severe pain noted — we can prioritize urgent care options." : "Rate the intensity so we can match the right care plan.";
    case 5:
      return "Tell us what led to your condition — it helps clinicians diagnose and plan treatment.";
    case 6:
      return "Choose the session format that fits your schedule and comfort.";
    case 7:
      return "Select general times you are available so we can match clinicians accordingly.";
    default:
      return "";
  }
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
              <Button variant="outline" onClick={onBack} className="h-12 px-4 md:px-6 rounded-xl font-black text-slate-500 border-slate-200 hover:bg-slate-50 transition-all">Back</Button>
            ) : (
              <div />
            )}

            {showNext && (
              <Button onClick={onNext} disabled={isNextDisabled} className="hidden lg:inline-flex h-12 px-6 md:px-8 rounded-xl font-black text-lg bg-primary hover:bg-primary/90 shadow group">
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
  const navigate = useNavigate();
  const location = useLocation();
  const pendingPlan = (location.state as any)?.planToActivate || null;

  const [data, setData] = useState<QuestionnaireData>(initialData);
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [storedIntakeFound, setStoredIntakeFound] = useState(false);
  const [storedIntakeUpdatedAt, setStoredIntakeUpdatedAt] = useState<number | null>(null);
  const [progressExpanded, setProgressExpanded] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const totalSteps = 7;

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


  const updateData = (field: keyof QuestionnaireData, value: any) => {
    setData((prev) => {
      const next = { ...prev, [field]: value } as QuestionnaireData;
      // persist
      saveStoredQuestionnaire(next);

      // robust auto-advance: derive from next values (avoid stale 'data')
      const shouldAutoAdvance =
        field === "painArea" ||
        field === "painDuration" ||
        field === "injuryType" ||
        field === "sessionType" ||
        (field === "gender" && !!next.age);

      if (shouldAutoAdvance) {
        setTimeout(() => {
          handleNext();
        }, 400);
      }

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
      navigate("/booking", { state: { plan: pending, questionnaireData: data, therapist: assigned } });
      return;
    }

    // Default behavior: continue to therapist discovery with intake data
    navigate("/therapists", { state: { questionnaireData: data, assigned } });
  };


  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-[#fafbfc] pb-20">
        {/* Progress Header */}
        {!isReviewing && (
          <div className="sticky top-14 md:top-16 z-40 bg-white/70 backdrop-blur-2xl border-b border-slate-100/50 py-4 md:py-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
            <div className="container max-w-5xl px-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Step {activeStep} of {totalSteps}
                  </span>
                </div>
                <Badge variant="secondary" className="hidden sm:flex bg-primary/5 text-primary border-none font-black px-3 py-1 rounded-lg">
                  {Math.floor(((activeStep - 1) / totalSteps) * 100)}% Complete
                </Badge>
              </div>
              <div className="h-1 w-full lg:h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
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
  bg-gradient-to-b from-primary/50 via-slate-100 to-primary/30
  border border-slate-200/60
  p-8
  shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-slate-900 tracking-wide">Personalized Care Intake</p>
                    <h2 className="text-lg font-black text-slate-900">Guided clinical intake</h2>
                    <p className="text-sm text-slate-500 mt-1">This intake helps clinicians prioritize your needs — ~3 minutes</p>
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
                              navigate('/therapists', { state: { questionnaireData: stored.data, assigned } });
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
                {/* Step 1 */}
                <StepWrapper 
                  stepNum={1} 
                  title="Patient Profile" 
                  description="Confidential details to personalize your care"
                  activeStep={activeStep}
                  totalSteps={totalSteps}
                  onNext={handleNext}
                  onBack={handleBack}
                  isNextDisabled={!data.age || !data.gender}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 ">
                    <div className="space-y-4">
                      <Label htmlFor="age" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Current Age</Label>
                      <Input
                        id="age"
                        type="number"
                        inputMode="numeric"
                        placeholder="e.g. 28"
                        value={data.age}
                        onChange={(e) => updateData("age", e.target.value)}
                        className="min-h-[48px] h-12 lg:h-16 text-3xl font-black rounded-2xl border-slate-200 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all px-4 lg:px-8 shadow-sm"
                      />
                      <p className="text-[10px] font-bold text-slate-400 ml-1">Age helps us determine therapy intensity</p>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Gender Identity</Label>
                      <RadioGroup
                        value={data.gender}
                        onValueChange={(value) => updateData("gender", value)}
                        className="grid grid-cols-2 md:grid-cols-3 gap-4"
                      >
                        {["Male", "Female", "Other"].map((gender) => (
                          <div key={gender}>
                            <RadioGroupItem value={gender} id={gender} className="peer sr-only" />
                            <Label
                              htmlFor={gender}
                              className="flex flex-col items-center justify-center rounded-2xl border-2 border-slate-100 bg-white p-4 lg:p-8 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/[0.03] cursor-pointer transition-all text-sm font-black shadow-sm min-h-[48px]"
                            >
                              {gender}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </div>
                </StepWrapper>

                {/* Step 2 */}
                <StepWrapper 
                  stepNum={2} 
                  title="Area of Concern" 
                  description="Select the primary area of discomfort"
                  activeStep={activeStep}
                  totalSteps={totalSteps}
                  onNext={handleNext}
                  onBack={handleBack}
                  isNextDisabled={!data.painArea}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="relative w-full aspect-[3/4] max-w-[260px] md:max-w-[300px] mx-auto bg-slate-50 rounded-3xl p-6 md:p-8 shadow-inner border border-slate-100 flex items-center justify-center">
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
                          className={`absolute ${area.position} w-8 h-8 md:w-6 md:h-6 rounded-full transition-all duration-500 ${
                            data.painArea === area.id
                              ? "bg-primary scale-150 shadow-xl shadow-primary/40 ring-4 ring-primary/20"
                              : "bg-slate-300 hover:bg-primary/40"
                          }`}
                          onClick={() => updateData("painArea", area.id)}
                        />
                      ))}
                    </div>

                    <div className="flex flex-wrap justify-start gap-3">
                      {bodyAreas.map((area) => (
                        <Badge
                          key={area.id}
                          variant={data.painArea === area.id ? "default" : "secondary"}
                          className={`cursor-pointer transition-all px-6 py-4 text-xs font-black rounded-2xl ${
                            data.painArea === area.id ? "shadow-2xl scale-110" : "bg-white hover:bg-slate-50 border-slate-100"
                          }`}
                          onClick={() => updateData("painArea", area.id)}
                        >
                          {area.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </StepWrapper>

                {/* Step 3 */}
                <StepWrapper 
                  stepNum={3} 
                  title="Condition History" 
                  description="How long have you been experiencing this?"
                  activeStep={activeStep}
                  totalSteps={totalSteps}
                  onNext={handleNext}
                  onBack={handleBack}
                  isNextDisabled={!data.painDuration}
                >
                  <RadioGroup
                    value={data.painDuration}
                    onValueChange={(value) => updateData("painDuration", value)}
                    className="grid grid-cols-1 gap-4"
                  >
                    {[
                      "Less than 1 week",
                      "1-4 weeks",
                      "1-3 months",
                      "3-6 months",
                      "More than 6 months",
                    ].map((duration) => (
                      <div key={duration}>
                        <RadioGroupItem value={duration} id={duration} className="peer sr-only" />
                        <Label
                          htmlFor={duration}
                          className="flex items-center rounded-2xl border-2 border-slate-100 bg-white p-6 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all text-sm font-bold shadow-sm group"
                        >
                          <div className={`w-6 h-6 rounded-full border-2 mr-5 flex items-center justify-center transition-all ${
                            data.painDuration === duration ? "border-primary bg-primary" : "border-slate-200 group-hover:border-primary/40"
                          }`}>
                            {data.painDuration === duration && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                          </div>
                          {duration}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </StepWrapper>

                {/* Step 4 */}
                <StepWrapper 
                  stepNum={4} 
                  title="Pain Severity" 
                  description="Rate your discomfort on a scale of 1-10"
                  activeStep={activeStep}
                  totalSteps={totalSteps}
                  onNext={handleNext}
                  onBack={handleBack}
                >
                  <div className="bg-slate-50/50 p-10 rounded-3xl border border-slate-100 space-y-12">
                    <div className="text-center relative">
                      <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                      <span className="text-8xl font-black text-primary tracking-tighter relative tabular-nums">{data.painLevel}</span>
                      <span className="text-3xl font-bold text-slate-300 relative">/10</span>
                      <p className="text-sm font-black uppercase tracking-[0.3em] text-primary/60 mt-4 relative">
                        {data.painLevel <= 3 ? "Mild" : data.painLevel <= 7 ? "Moderate" : "Severe"}
                      </p>
                    </div>

                    <div className="px-4">
                      <Slider
                        value={[data.painLevel]}
                        onValueChange={([value]) => {
                          updateData("painLevel", value);
                        }}
                        min={1}
                        max={10}
                        step={1}
                        className="w-full py-4 md:py-6"
                      />
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400 pt-6">
                        <span>Mild</span>
                        <span>Moderate</span>
                        <span>Severe</span>
                      </div>
                    </div>
                  </div>
                </StepWrapper>

                {/* Step 5 */}
                <StepWrapper 
                  stepNum={5} 
                  title="Injury Context" 
                  description="What caused your pain or discomfort?"
                  activeStep={activeStep}
                  totalSteps={totalSteps}
                  onNext={handleNext}
                  onBack={handleBack}
                  isNextDisabled={!data.injuryType}
                >
                  <RadioGroup
                    value={data.injuryType}
                    onValueChange={(value) => updateData("injuryType", value)}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4"
                  >
                    {[
                      "Sports Injury",
                      "Work-related",
                      "Accident/Trauma",
                      "Post-surgery",
                      "Chronic/Age-related",
                      "Unknown/Gradual onset",
                    ].map((type) => (
                      <div key={type}>
                        <RadioGroupItem value={type} id={type} className="peer sr-only" />
                        <Label
                          htmlFor={type}
                          className="flex flex-col items-center justify-center text-center rounded-2xl border-2 border-slate-100 bg-white p-8 h-40 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/[0.03] cursor-pointer transition-all text-sm font-black leading-tight shadow-sm"
                        >
                          {type}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </StepWrapper>

                {/* Step 6 */}
                <StepWrapper 
                  stepNum={6} 
                  title="Session Format" 
                  description="How do you prefer to attend therapy?"
                  activeStep={activeStep}
                  totalSteps={totalSteps}
                  onNext={handleNext}
                  onBack={handleBack}
                  isNextDisabled={!data.sessionType}
                >
                  <RadioGroup
                    value={data.sessionType}
                    onValueChange={(value) => updateData("sessionType", value)}
                    className="grid grid-cols-1 gap-4"
                  >
                    {[
                      { value: "1-on-1", title: "Personal 1-on-1", desc: "Private sessions with clinical focus", icon: User },
                      { value: "group", title: "Group Recovery", desc: "Collaborative sessions with peers", icon: Activity },
                      // { value: "home", title: "Digital Home-Care", desc: "Self-paced guided programs", icon: Stethoscope },
                    ].map((type) => (
                      <div key={type.value}>
                        <RadioGroupItem value={type.value} id={type.value} className="peer sr-only" />
                        <Label
                          htmlFor={type.value}
                          className="flex items-center rounded-2xl border-2 border-slate-100 bg-white p-3 lg:p-6 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all shadow-sm group min-h-[48px]"
                        >
                          <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors mr-6">
                            <type.icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-slate-900">{type.title}</p>
                            <p className="text-xs text-slate-500 font-medium mt-1">{type.desc}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            data.sessionType === type.value ? "border-primary bg-primary" : "border-slate-200"
                          }`}>
                            {data.sessionType === type.value && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </StepWrapper>

                {/* Step 7 */}
                <StepWrapper 
                  stepNum={7} 
                  title="Availability" 
                  description="Select your general availability"
                  activeStep={activeStep}
                  totalSteps={totalSteps}
                  onNext={() => setIsReviewing(true)}
                  onBack={handleBack}
                  isNextDisabled={data.preferredTimes.length === 0}
                  nextLabel="View Assessment Summary"
                >
                  <div className="grid grid-cols-1 gap-3 mb-8">
                    {timeSlots.map((slot) => {
                      const isSelected = data.preferredTimes.includes(slot);
                      return (
                        <button
                          key={slot}
                          onClick={() => toggleTimeSlot(slot)}
                          className={`flex items-center p-4 lg:p-6 rounded-2xl border-2 transition-all text-sm font-black shadow-sm min-h-[48px] ${
                            isSelected 
                              ? "border-primary bg-primary/[0.03] text-primary" 
                              : "border-slate-50 bg-white hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg border-2 mr-5 flex items-center justify-center transition-all ${
                            isSelected ? "bg-primary border-primary shadow-lg shadow-primary/20" : "border-slate-200"
                          }`}>
                            {isSelected && <CheckCircle className="h-4 w-4 text-white" />}
                          </div>
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </StepWrapper>
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
                          {[
                            { label: "Patient Profile", value: `${data.age} yrs, ${data.gender}`, icon: User, step: 1 },
                            { label: "Focus Area", value: bodyAreas.find(a => a.id === data.painArea)?.label || data.painArea, icon: Activity, step: 2 },
                            { label: "Condition Duration", value: data.painDuration, icon: Clock, step: 3 },
                            { label: "Intensity Level", value: `${data.painLevel}/10`, icon: Activity, step: 4 },
                            { label: "Context", value: data.injuryType, icon: Stethoscope, step: 5 },
                            { label: "Session Style", value: data.sessionType, icon: Edit2, step: 6 },
                            { label: "Availability", value: data.preferredTimes.join(", "), icon: Clock, step: 7 },
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                              <div className="h-12 w-12 rounded-md bg-white shadow-sm flex items-center justify-center text-primary">
                                <item.icon className="h-6 w-6" />
                              </div>
                              <div className="flex-1">
                                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-1">{item.label}</p>
                                <p className="text-sm font-black text-slate-900">{item.value}</p>
                              </div>
                              <button onClick={() => { setIsReviewing(false); setActiveStep(item.step); }} className="text-slate-400 hover:text-primary">Edit</button>
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

                        {/* <div className="mt-6 text-[12px] text-slate-500">
                          <div className="font-black">Trust</div>
                          <div className="mt-2">HIPAA-compliant • Clinician-reviewed</div>
                        </div> */}
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
