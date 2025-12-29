import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Edit2, 
  ShieldCheck, 
  Info,
  AlertCircle,
  Stethoscope,
  Activity,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

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

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<QuestionnaireData>(initialData);
  const [isReviewing, setIsReviewing] = useState(false);
  const totalSteps = 7;

  const progress = (step / totalSteps) * 100;

  const updateData = (field: keyof QuestionnaireData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTimeSlot = (slot: string) => {
    setData((prev) => ({
      ...prev,
      preferredTimes: prev.preferredTimes.includes(slot)
        ? prev.preferredTimes.filter((t) => t !== slot)
        : [...prev.preferredTimes, slot],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return data.age && data.gender;
      case 2: return data.painArea;
      case 3: return data.painDuration;
      case 4: return true;
      case 5: return data.injuryType;
      case 6: return data.sessionType;
      case 7: return data.preferredTimes.length > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setIsReviewing(true);
    }
  };

  const handleBack = () => {
    if (isReviewing) {
      setIsReviewing(false);
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    navigate("/therapists", { state: { questionnaireData: data } });
  };

  const editStep = (stepNumber: number) => {
    setStep(stepNumber);
    setIsReviewing(false);
  };

  const renderStep = () => {
    const stepVariants = {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    };

    if (isReviewing) {
      return (
        <motion.div {...stepVariants} className="space-y-4">
          <div className="text-center mb-4">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-2" />
            <h2 className="text-xl font-bold">Review Your Answers</h2>
            <p className="text-sm text-muted-foreground">Please verify your information before finding therapists</p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {[
              { label: "Age & Gender", value: `${data.age} years, ${data.gender}`, step: 1 },
              { label: "Pain Area", value: bodyAreas.find(a => a.id === data.painArea)?.label || data.painArea, step: 2 },
              { label: "Pain Duration", value: data.painDuration, step: 3 },
              { label: "Pain Level", value: `${data.painLevel}/10`, step: 4 },
              { label: "Injury Type", value: data.injuryType, step: 5 },
              { label: "Session Type", value: data.sessionType, step: 6 },
              { label: "Preferred Times", value: data.preferredTimes.join(", "), step: 7 },
            ].map((item) => (
              <div key={item.step} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-semibold">{item.value}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editStep(item.step)}>
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      );
    }

    switch (step) {
      case 1:
        return (
          <motion.div {...stepVariants} className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">Basic Information</h2>
              <p className="text-sm text-muted-foreground">Tell us about yourself</p>
            </div>

            <div className="space-y-4 bg-muted/30 p-5 rounded-2xl border border-border/50">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-xs font-bold uppercase tracking-wide">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={data.age}
                  onChange={(e) => updateData("age", e.target.value)}
                  className="bg-background h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wide">Gender</Label>
                <RadioGroup
                  value={data.gender}
                  onValueChange={(value) => updateData("gender", value)}
                  className="grid grid-cols-3 gap-3"
                >
                  {["Male", "Female", "Other"].map((gender) => (
                    <div key={gender}>
                      <RadioGroupItem value={gender} id={gender} className="peer sr-only" />
                      <Label
                        htmlFor={gender}
                        className="flex flex-col items-center justify-center rounded-xl border-2 border-transparent bg-background p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all text-sm font-medium"
                      >
                        {gender}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div {...stepVariants} className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">Where does it hurt?</h2>
              <p className="text-sm text-muted-foreground">Select the area of pain</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center bg-muted/30 p-4 rounded-2xl border border-border/50">
              <div className="relative w-32 h-56 shrink-0 bg-background/50 rounded-xl p-2">
                <svg viewBox="0 0 100 200" className="w-full h-full opacity-10">
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
                    className={`absolute ${area.position} w-3 h-3 rounded-full transition-all ${
                      data.painArea === area.id
                        ? "bg-accent scale-150 shadow-lg ring-4 ring-accent/20"
                        : "bg-primary/40 hover:bg-primary/60"
                    }`}
                    onClick={() => updateData("painArea", area.id)}
                  />
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-1.5">
                {bodyAreas.map((area) => (
                  <Badge
                    key={area.id}
                    variant={data.painArea === area.id ? "default" : "secondary"}
                    className={`cursor-pointer transition-all px-3 py-1 text-[11px] ${
                      data.painArea === area.id ? "shadow-md scale-105" : "bg-background/80 hover:bg-background"
                    }`}
                    onClick={() => updateData("painArea", area.id)}
                  >
                    {area.label}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div {...stepVariants} className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">Pain Duration</h2>
              <p className="text-sm text-muted-foreground">How long have you been experiencing this pain?</p>
            </div>

            <RadioGroup
              value={data.painDuration}
              onValueChange={(value) => updateData("painDuration", value)}
              className="grid grid-cols-1 gap-2"
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
                    className="flex items-center rounded-xl border-2 border-transparent bg-muted/30 p-3.5 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all text-sm font-medium"
                  >
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${
                      data.painDuration === duration ? "border-primary" : "border-muted-foreground/30"
                    }`}>
                      {data.painDuration === duration && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    {duration}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </motion.div>
        );

      case 4:
        return (
          <motion.div {...stepVariants} className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">Pain Level</h2>
              <p className="text-sm text-muted-foreground">Rate your pain on a scale of 1-10</p>
            </div>

            <div className="bg-muted/30 p-6 rounded-2xl border border-border/50 space-y-6">
              <div className="text-center">
                <span className="text-5xl font-black text-primary tracking-tighter">{data.painLevel}</span>
                <span className="text-xl font-bold text-muted-foreground/50">/10</span>
                <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mt-1">
                  {data.painLevel <= 3 ? "Mild" : data.painLevel <= 7 ? "Moderate" : "Severe"}
                </p>
              </div>

              <div className="px-2">
                <Slider
                  value={[data.painLevel]}
                  onValueChange={([value]) => updateData("painLevel", value)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full py-4"
                />

                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground pt-2">
                  <span>Mild</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div {...stepVariants} className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">Injury Type</h2>
              <p className="text-sm text-muted-foreground">What caused your pain?</p>
            </div>

            <RadioGroup
              value={data.injuryType}
              onValueChange={(value) => updateData("injuryType", value)}
              className="grid grid-cols-2 gap-2"
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
                    className="flex flex-col items-center justify-center text-center rounded-xl border-2 border-transparent bg-muted/30 p-3 h-24 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all text-xs font-semibold leading-tight"
                  >
                    {type}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </motion.div>
        );

      case 6:
        return (
          <motion.div {...stepVariants} className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">Session Preference</h2>
              <p className="text-sm text-muted-foreground">How would you like to attend sessions?</p>
            </div>

            <RadioGroup
              value={data.sessionType}
              onValueChange={(value) => updateData("sessionType", value)}
              className="grid grid-cols-1 gap-3"
            >
              {[
                { value: "1-on-1", title: "1-on-1 Sessions", desc: "Private consultations with your therapist" },
                { value: "Group", title: "Group Sessions", desc: "Interactive sessions with other patients" },
              ].map((option) => (
                <div key={option.value}>
                  <RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
                  <Label
                    htmlFor={option.value}
                    className="flex flex-col rounded-xl border-2 border-transparent bg-muted/30 p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                  >
                    <span className="font-bold text-sm mb-1">{option.title}</span>
                    <span className="text-xs text-muted-foreground leading-relaxed">{option.desc}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </motion.div>
        );

      case 7:
        return (
          <motion.div {...stepVariants} className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">Preferred Times</h2>
              <p className="text-sm text-muted-foreground">When are you usually available?</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 bg-muted/30 p-4 rounded-2xl border border-border/50">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => toggleTimeSlot(slot)}
                  className={`p-3 rounded-xl border-2 transition-all text-xs font-bold leading-tight ${
                    data.preferredTimes.includes(slot)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-transparent bg-background/60 hover:bg-background"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const getNextStepLabel = () => {
    if (isReviewing) return "Find My Therapist";
    if (step === totalSteps) return "Review Answers";
    
    const labels = [
      "",
      "Next: Pain Location",
      "Next: Pain Duration",
      "Next: Pain Intensity",
      "Next: Injury Cause",
      "Next: Session Mode",
      "Next: Final Step",
    ];
    return labels[step] || "Continue";
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-6 px-4 bg-muted/20">
        <Card className="w-full max-w-7xl overflow-hidden border-none shadow-xl bg-card/50 backdrop-blur-sm rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
            {/* Left Column: Reassurance (Desktop only) */}
            <div className="hidden md:flex md:col-span-4 bg-primary/5 p-8 flex-col justify-between border-r border-border/50">
              <div className="space-y-6">
                <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center text-primary">
                  <Stethoscope className="h-6 w-6" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight">Clinical Assessment</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This brief assessment helps us match you with the most qualified therapists for your specific condition.
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  {[
                    // { icon: ShieldCheck, text: "HIPAA Compliant" },
                    { icon: Lock, text: "Secure Data Encryption" },
                    { icon: Activity, text: "Personalized Protocol" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-medium text-foreground/80">
                      <div className="bg-background w-8 h-8 rounded-lg flex items-center justify-center shadow-sm">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-background/50 p-4 rounded-xl border border-border/50">
                <p className="text-xs text-muted-foreground italic">
                  "Your path to recovery starts with understanding your pain. We're here to guide you through every step."
                </p>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="md:col-span-8 flex flex-col">
              <CardHeader className="pb-4 pt-6 px-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {isReviewing ? "Final Review" : `Step ${step} of ${totalSteps}`}
                    </span>
                    <span>{Math.round(progress)}% Complete</span>
                  </div>
                  <Progress value={isReviewing ? 100 : progress} className="h-1.5" />
                </div>
              </CardHeader>

              <CardContent className="flex-grow px-6 py-2 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {renderStep()}
                </AnimatePresence>
              </CardContent>

              <div className="p-6 border-t border-border/50 bg-muted/10">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Lock className="h-3 w-3" />
                    Your information is private and secure
                  </p>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      onClick={handleBack}
                      disabled={step === 1 && !isReviewing}
                      className="flex-1 sm:flex-none h-11"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>

                    <Button
                      variant="hero"
                      onClick={isReviewing ? handleSubmit : handleNext}
                      disabled={!isReviewing && !canProceed()}
                      className="flex-1 sm:flex-none h-11 px-8 shadow-lg shadow-primary/20"
                    >
                      {getNextStepLabel()}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
