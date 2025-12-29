import { useState } from "react";
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
import { ArrowLeft, ArrowRight, CheckCircle, Edit2 } from "lucide-react";
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
        <motion.div {...stepVariants} className="space-y-6">
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Review Your Answers</h2>
            <p className="text-muted-foreground">Please verify your information before finding therapists</p>
          </div>

          <div className="space-y-4">
            {[
              { label: "Age & Gender", value: `${data.age} years, ${data.gender}`, step: 1 },
              { label: "Pain Area", value: bodyAreas.find(a => a.id === data.painArea)?.label || data.painArea, step: 2 },
              { label: "Pain Duration", value: data.painDuration, step: 3 },
              { label: "Pain Level", value: `${data.painLevel}/10`, step: 4 },
              { label: "Injury Type", value: data.injuryType, step: 5 },
              { label: "Session Type", value: data.sessionType, step: 6 },
              { label: "Preferred Times", value: data.preferredTimes.join(", "), step: 7 },
            ].map((item) => (
              <div key={item.step} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => editStep(item.step)}>
                  <Edit2 className="h-4 w-4" />
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
          <motion.div {...stepVariants} className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
              <p className="text-muted-foreground">Tell us about yourself</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={data.age}
                  onChange={(e) => updateData("age", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Gender</Label>
                <RadioGroup
                  value={data.gender}
                  onValueChange={(value) => updateData("gender", value)}
                  className="grid grid-cols-3 gap-4 mt-2"
                >
                  {["Male", "Female", "Other"].map((gender) => (
                    <div key={gender}>
                      <RadioGroupItem value={gender} id={gender} className="peer sr-only" />
                      <Label
                        htmlFor={gender}
                        className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
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
          <motion.div {...stepVariants} className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Where does it hurt?</h2>
              <p className="text-muted-foreground">Select the area of pain</p>
            </div>

            <div className="relative mx-auto w-48 h-80 bg-muted/30 rounded-lg">
              {/* Body outline SVG */}
              <svg viewBox="0 0 100 200" className="w-full h-full opacity-20">
                <ellipse cx="50" cy="18" rx="12" ry="15" fill="currentColor" />
                <rect x="35" y="35" width="30" height="50" rx="5" fill="currentColor" />
                <rect x="20" y="35" width="12" height="45" rx="4" fill="currentColor" />
                <rect x="68" y="35" width="12" height="45" rx="4" fill="currentColor" />
                <rect x="35" y="88" width="13" height="55" rx="4" fill="currentColor" />
                <rect x="52" y="88" width="13" height="55" rx="4" fill="currentColor" />
              </svg>

              {/* Pain area buttons */}
              {bodyAreas.map((area) => (
                <button
                  key={area.id}
                  className={`absolute ${area.position} w-4 h-4 rounded-full transition-all ${
                    data.painArea === area.id
                      ? "bg-accent scale-150 shadow-lg"
                      : "bg-primary/60 hover:bg-primary hover:scale-125"
                  }`}
                  onClick={() => updateData("painArea", area.id)}
                  title={area.label}
                />
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Or select from list:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {bodyAreas.map((area) => (
                  <Badge
                    key={area.id}
                    variant={data.painArea === area.id ? "default" : "outline"}
                    className="cursor-pointer"
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
          <motion.div {...stepVariants} className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Pain Duration</h2>
              <p className="text-muted-foreground">How long have you been experiencing this pain?</p>
            </div>

            <RadioGroup
              value={data.painDuration}
              onValueChange={(value) => updateData("painDuration", value)}
              className="space-y-3"
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
                    className="flex items-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                  >
                    {duration}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </motion.div>
        );

      case 4:
        return (
          <motion.div {...stepVariants} className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Pain Level</h2>
              <p className="text-muted-foreground">Rate your pain on a scale of 1-10</p>
            </div>

            <div className="space-y-8 px-4">
              <div className="text-center">
                <span className="text-6xl font-bold text-primary">{data.painLevel}</span>
                <span className="text-2xl text-muted-foreground">/10</span>
              </div>

              <Slider
                value={[data.painLevel]}
                onValueChange={([value]) => updateData("painLevel", value)}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div {...stepVariants} className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Injury Type</h2>
              <p className="text-muted-foreground">What caused your pain?</p>
            </div>

            <RadioGroup
              value={data.injuryType}
              onValueChange={(value) => updateData("injuryType", value)}
              className="space-y-3"
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
                    className="flex items-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
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
          <motion.div {...stepVariants} className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Session Preference</h2>
              <p className="text-muted-foreground">How would you like to attend sessions?</p>
            </div>

            <RadioGroup
              value={data.sessionType}
              onValueChange={(value) => updateData("sessionType", value)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {[
                { value: "1-on-1", title: "1-on-1 Sessions", desc: "Private consultations with your therapist" },
                { value: "Group", title: "Group Sessions", desc: "Interactive sessions with other patients" },
              ].map((option) => (
                <div key={option.value}>
                  <RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
                  <Label
                    htmlFor={option.value}
                    className="flex flex-col rounded-lg border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer h-full"
                  >
                    <span className="font-semibold text-lg mb-2">{option.title}</span>
                    <span className="text-sm text-muted-foreground">{option.desc}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </motion.div>
        );

      case 7:
        return (
          <motion.div {...stepVariants} className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Preferred Times</h2>
              <p className="text-muted-foreground">When are you usually available? (Select all that apply)</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => toggleTimeSlot(slot)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    data.preferredTimes.includes(slot)
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <span className="font-medium">{slot}</span>
                </button>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 px-4">
        <Card variant="elevated" className="w-full max-w-2xl">
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Step {isReviewing ? "Review" : `${step} of ${totalSteps}`}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={isReviewing ? 100 : progress} className="h-2" />
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>

            <div className="flex justify-between mt-8">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={step === 1 && !isReviewing}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {isReviewing ? (
                <Button variant="hero" onClick={handleSubmit}>
                  Find My Therapist
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="hero"
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  {step === totalSteps ? "Review Answers" : "Continue"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
