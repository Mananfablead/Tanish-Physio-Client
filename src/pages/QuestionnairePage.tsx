import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="py-8 min-h-[60vh] flex flex-col justify-center"
    >
      <Card className="border-2 transition-all duration-700 overflow-hidden rounded-2xl border-primary shadow-[0_32px_80px_-20px_rgba(var(--primary-rgb),0.1)]">
        <CardContent className="p-0">
          <div className="p-8 border-b border-slate-50 flex items-center gap-6 bg-primary/[0.03]">
            <div className="h-14 w-14 rounded-xl flex items-center justify-center font-black text-xl bg-primary text-white shadow-lg shadow-primary/20">
              {stepNum}
            </div>
            <div>
              <h3 className="font-black text-2xl text-slate-900 tracking-tight">{title}</h3>
              <p className="text-sm text-slate-500 font-bold mt-1 opacity-70">{description}</p>
            </div>
          </div>
          <div className="p-10">
            {children}
            
            <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between gap-4">
              {stepNum > 1 ? (
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="h-14 px-8 rounded-xl font-black text-slate-500 border-slate-200 hover:bg-slate-50 transition-all"
                >
                  Back
                </Button>
              ) : (
                <div />
              )}
              
              {showNext && (
                <Button
                  onClick={onNext}
                  disabled={isNextDisabled}
                  className="h-14 px-10 rounded-xl font-black text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 group"
                >
                  {nextLabel}
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const [data, setData] = useState<QuestionnaireData>(initialData);
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);

  const totalSteps = 7;

  const updateData = (field: keyof QuestionnaireData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
    
    // Auto-advance logic for specific single-choice steps
    if (field === "painArea" || field === "painDuration" || field === "injuryType" || field === "sessionType" || (field === "gender" && data.age)) {
      setTimeout(() => {
        handleNext();
      }, 400);
    }
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

  const handleSubmit = () => {
    navigate("/therapists", { state: { questionnaireData: data } });
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-[#fafbfc] pb-20">
        {/* Progress Header */}
        {!isReviewing && (
          <div className="sticky top-16 z-40 bg-white/70 backdrop-blur-2xl border-b border-slate-100/50 py-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
            <div className="container max-w-5xl px-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Step {activeStep} of {totalSteps}
                  </span>
                </div>
                <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-black px-3 py-1 rounded-lg">
                  {Math.floor(((activeStep - 1) / totalSteps) * 100)}% Complete
                </Badge>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
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

        <div className="container max-w-5xl pt-8 px-6">
          <AnimatePresence mode="wait">
            {!isReviewing ? (
              <div key="steps">
                {/* Step 1 */}
                <StepWrapper 
                  stepNum={1} 
                  title="Basic Information" 
                  description="Personalize your recovery experience"
                  activeStep={activeStep}
                  totalSteps={totalSteps}
                  onNext={handleNext}
                  onBack={handleBack}
                  isNextDisabled={!data.age || !data.gender}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <Label htmlFor="age" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Current Age</Label>
                      <Input
                        id="age"
                        type="number"
                        inputMode="numeric"
                        placeholder="e.g. 28"
                        value={data.age}
                        onChange={(e) => updateData("age", e.target.value)}
                        className="h-20 text-3xl font-black rounded-2xl border-slate-200 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all px-8 shadow-sm"
                      />
                      <p className="text-[10px] font-bold text-slate-400 ml-1">Age helps us determine therapy intensity</p>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Gender Identity</Label>
                      <RadioGroup
                        value={data.gender}
                        onValueChange={(value) => updateData("gender", value)}
                        className="grid grid-cols-3 gap-4"
                      >
                        {["Male", "Female", "Other"].map((gender) => (
                          <div key={gender}>
                            <RadioGroupItem value={gender} id={gender} className="peer sr-only" />
                            <Label
                              htmlFor={gender}
                              className="flex flex-col items-center justify-center rounded-2xl border-2 border-slate-100 bg-white p-8 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/[0.03] cursor-pointer transition-all text-sm font-black shadow-sm h-full"
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
                  title="Pain Location" 
                  description="Select the primary area of discomfort"
                  activeStep={activeStep}
                  totalSteps={totalSteps}
                  onNext={handleNext}
                  onBack={handleBack}
                  isNextDisabled={!data.painArea}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="relative w-full aspect-[3/4] max-w-[300px] mx-auto bg-slate-50 rounded-3xl p-8 shadow-inner border border-slate-100 flex items-center justify-center">
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
                          className={`absolute ${area.position} w-6 h-6 rounded-full transition-all duration-500 ${
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
                  title="Pain Duration" 
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
                  title="Pain Intensity" 
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
                        className="w-full py-6"
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
                  title="Session Type" 
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
                      { value: "home", title: "Digital Home-Care", desc: "Self-paced guided programs", icon: Stethoscope },
                    ].map((type) => (
                      <div key={type.value}>
                        <RadioGroupItem value={type.value} id={type.value} className="peer sr-only" />
                        <Label
                          htmlFor={type.value}
                          className="flex items-center rounded-2xl border-2 border-slate-100 bg-white p-6 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all shadow-sm group"
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
                  title="Preferred Times" 
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
                          className={`flex items-center p-6 rounded-2xl border-2 transition-all text-sm font-black shadow-sm ${
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
              </div>
            ) : (
              /* Review Section */
              <motion.div
                key="review"
                initial={{ opacity: 0, scale: 0.95, y: 100 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 100 }}
                transition={{ type: "spring", damping: 25, stiffness: 120 }}
                className="py-12"
              >
                <div className="relative p-1 bg-gradient-to-br from-primary via-emerald-400 to-accent rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(var(--primary-rgb),0.2)]">
                  <Card className="rounded-[2.9rem] border-none overflow-hidden bg-white">
                    <div className="bg-slate-900 p-12 text-white text-center relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path d="M0 0 L100 100 M100 0 L0 100" stroke="currentColor" strokeWidth="0.1" />
                        </svg>
                      </div>
                      <div className="h-20 w-20 bg-success/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md relative z-10">
                        <CheckCircle className="h-12 w-12 text-success" />
                      </div>
                      <h2 className="text-4xl font-black tracking-tight relative z-10">Assessment Complete</h2>
                      <p className="text-slate-400 font-bold mt-2 uppercase tracking-[0.3em] text-[10px] relative z-10">Verify your clinical details</p>
                    </div>
                    
                    <CardContent className="p-10 space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { label: "Patient Profile", value: `${data.age} yrs, ${data.gender}`, icon: User, step: 1 },
                          { label: "Focus Area", value: bodyAreas.find(a => a.id === data.painArea)?.label || data.painArea, icon: Activity, step: 2 },
                          { label: "Condition Duration", value: data.painDuration, icon: Clock, step: 3 },
                          { label: "Intensity Level", value: `${data.painLevel}/10`, icon: Activity, step: 4 },
                          { label: "Context", value: data.injuryType, icon: Stethoscope, step: 5 },
                          { label: "Session Style", value: data.sessionType, icon: Edit2, step: 6 },
                          { label: "Availability", value: data.preferredTimes.join(", "), icon: Clock, full: true, step: 7 },
                        ].map((item, i) => (
                          <div key={i} className={`flex items-center gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100/50 group hover:bg-white hover:border-primary/30 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 ${item.full ? "md:col-span-2" : ""}`}>
                            <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:rotate-[360deg]">
                              <item.icon className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                              <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 leading-none mb-2">{item.label}</p>
                              <p className="text-base font-black text-slate-900 tracking-tight">{item.value}</p>
                            </div>
                            <button 
                              onClick={() => {
                                setIsReviewing(false);
                                setActiveStep(item.step);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-all p-3 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="pt-6">
                        <Button 
                          className="w-full h-20 rounded-2xl text-2xl font-black shadow-xl group bg-primary hover:bg-primary/90"
                          onClick={handleSubmit}
                        >
                          Find My Specialist
                          <ArrowRight className="h-8 w-8 ml-4 group-hover:translate-x-2 transition-transform" />
                        </Button>
                        
                        <div className="flex items-center justify-center gap-3 mt-8 text-slate-400">
                          <ShieldCheck className="h-5 w-5 text-success/80" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Secure HIPAA-Compliant Intake</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
