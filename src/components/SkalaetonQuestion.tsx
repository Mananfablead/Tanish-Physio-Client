import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface SkalaetonQuestionProps {
  question: any;
  currentValue: string[];
  updateAnswer: (questionId: string, value: string[]) => void;
}

export const SkalaetonQuestion: React.FC<SkalaetonQuestionProps> = ({
  question,
  currentValue,
  updateAnswer
}) => {
  // Define body areas for skalaeton type
  const bodyAreas = [
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
  ];

  // Function to toggle selection
  const toggleSelection = (areaId: string) => {
    const newSelection = currentValue.includes(areaId)
      ? currentValue.filter(id => id !== areaId) // Remove if already selected
      : [...currentValue, areaId]; // Add if not selected
    updateAnswer(question._id, newSelection);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-black text-slate-900 mb-2">Areas of Concern</h3>
        <p className="text-base text-slate-600">Select all areas that apply to you (multiple selection allowed)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Human body illustration */}
        <div className="relative w-full aspect-[3/4] max-w-[260px] md:max-w-[300px] mx-auto bg-slate-50 rounded-3xl p-6 md:p-8 shadow-inner border border-slate-100 flex items-center justify-center">
          <svg viewBox="0 0 100 200" className="w-full h-full opacity-10 text-slate-900">
            <ellipse cx="50" cy="18" rx="12" ry="15" fill="currentColor" />
            <rect x="35" y="35" width="30" height="50" rx="5" fill="currentColor" />
            <rect x="20" y="35" width="12" height="45" rx="4" fill="currentColor" />
            <rect x="68" y="35" width="12" height="45" rx="4" fill="currentColor" />
            <rect x="35" y="88" width="13" height="55" rx="4" fill="currentColor" />
            <rect x="52" y="88" width="13" height="55" rx="4" fill="currentColor" />
          </svg>

          {/* Body area buttons positioned over the SVG */}
          <div 
            className={`absolute top-[15%] left-[50%] -translate-x-1/2 w-8 h-8 md:w-6 md:h-6 rounded-full transition-all duration-500 cursor-pointer ${
              currentValue.includes("neck")
                ? "bg-primary scale-150 shadow-xl shadow-primary/40 ring-4 ring-primary/20"
                : "bg-slate-300 hover:bg-primary/40"
            }`}
            onClick={() => toggleSelection("neck")}
          />

          <div 
            className={`absolute top-[22%] left-[35%] w-8 h-8 md:w-6 md:h-6 rounded-full transition-all duration-500 cursor-pointer ${
              currentValue.includes("left-shoulder")
                ? "bg-primary scale-150 shadow-xl shadow-primary/40 ring-4 ring-primary/20"
                : "bg-slate-300 hover:bg-primary/40"
            }`}
            onClick={() => toggleSelection("left-shoulder")}
          />

          <div 
            className={`absolute top-[22%] right-[35%] w-8 h-8 md:w-6 md:h-6 rounded-full transition-all duration-500 cursor-pointer ${
              currentValue.includes("right-shoulder")
                ? "bg-primary scale-150 shadow-xl shadow-primary/40 ring-4 ring-primary/20"
                : "bg-slate-300 hover:bg-primary/40"
            }`}
            onClick={() => toggleSelection("right-shoulder")}
          />

          <div 
            className={`absolute top-[28%] left-[50%] -translate-x-1/2 w-8 h-8 md:w-6 md:h-6 rounded-full transition-all duration-500 cursor-pointer ${
              currentValue.includes("upper-back")
                ? "bg-primary scale-150 shadow-xl shadow-primary/40 ring-4 ring-primary/20"
                : "bg-slate-300 hover:bg-primary/40"
            }`}
            onClick={() => toggleSelection("upper-back")}
          />

          <div 
            className={`absolute top-[40%] left-[50%] -translate-x-1/2 w-8 h-8 md:w-6 md:h-6 rounded-full transition-all duration-500 cursor-pointer ${
              currentValue.includes("lower-back")
                ? "bg-primary scale-150 shadow-xl shadow-primary/40 ring-4 ring-primary/20"
                : "bg-slate-300 hover:bg-primary/40"
            }`}
            onClick={() => toggleSelection("lower-back")}
          />

          <div 
            className={`absolute top-[48%] left-[55%] -translate-x-1/2 w-8 h-8 md:w-6 md:h-6 rounded-full transition-all duration-500 cursor-pointer ${
              currentValue.includes("hip-right")
                ? "bg-primary scale-150 shadow-xl shadow-primary/40 ring-4 ring-primary/20"
                : "bg-slate-300 hover:bg-primary/40"
            }`}
            onClick={() => toggleSelection("hip-right")}
          />
          <div 
            className={`absolute top-[48%] right-[55%] -translate-x-1/2 w-8 h-8 md:w-6 md:h-6 rounded-full transition-all duration-500 cursor-pointer ${
              currentValue.includes("hip-left")
                ? "bg-primary scale-150 shadow-xl shadow-primary/40 ring-4 ring-primary/20"
                : "bg-slate-300 hover:bg-primary/40"
            }`}
            onClick={() => toggleSelection("hip-left")}
          />
          <div 
            className={`absolute top-[5%] left-[50%] -translate-x-1/2 w-8 h-8 md:w-6 md:h-6 rounded-full transition-all duration-500 cursor-pointer ${
              currentValue.includes("headache")
                ? "bg-primary scale-150 shadow-xl shadow-primary/40 ring-4 ring-primary/20"
                : "bg-slate-300 hover:bg-primary/40"
            }`}
            onClick={() => toggleSelection("headache")}
          />

          <div 
            className={`absolute top-[65%] left-[42%] w-8 h-8 md:w-6 md:h-6 rounded-full transition-all duration-500 cursor-pointer ${
              currentValue.includes("left-knee")
                ? "bg-primary scale-150 shadow-xl shadow-primary/40 ring-4 ring-primary/20"
                : "bg-slate-300 hover:bg-primary/40"
            }`}
            onClick={() => toggleSelection("left-knee")}
          />

          <div 
            className={`absolute top-[65%] right-[42%] w-8 h-8 md:w-6 md:h-6 rounded-full transition-all duration-500 cursor-pointer ${
              currentValue.includes("right-knee")
                ? "bg-primary scale-150 shadow-xl shadow-primary/40 ring-4 ring-primary/20"
                : "bg-slate-300 hover:bg-primary/40"
            }`}
            onClick={() => toggleSelection("right-knee")}
          />

          <div 
            className={`absolute top-[85%] left-[42%] w-8 h-8 md:w-6 md:h-6 rounded-full transition-all duration-500 cursor-pointer ${
              currentValue.includes("left-ankle")
                ? "bg-primary scale-150 shadow-xl shadow-primary/40 ring-4 ring-primary/20"
                : "bg-slate-300 hover:bg-primary/40"
            }`}
            onClick={() => toggleSelection("left-ankle")}
          />

          <div 
            className={`absolute top-[85%] right-[42%] w-8 h-8 md:w-6 md:h-6 rounded-full transition-all duration-500 cursor-pointer ${
              currentValue.includes("right-ankle")
                ? "bg-primary scale-150 shadow-xl shadow-primary/40 ring-4 ring-primary/20"
                : "bg-slate-300 hover:bg-primary/40"
            }`}
            onClick={() => toggleSelection("right-ankle")}
          />

          <div 
            className={`absolute top-[35%] left-[28%] w-8 h-8 md:w-6 md:h-6 rounded-full transition-all duration-500 cursor-pointer ${
              currentValue.includes("left-elbow")
                ? "bg-primary scale-150 shadow-xl shadow-primary/40 ring-4 ring-primary/20"
                : "bg-slate-300 hover:bg-primary/40"
            }`}
            onClick={() => toggleSelection("left-elbow")}
          />

          <div 
            className={`absolute top-[35%] right-[28%] w-8 h-8 md:w-6 md:h-6 rounded-full transition-all duration-500 cursor-pointer ${
              currentValue.includes("right-elbow")
                ? "bg-primary scale-150 shadow-xl shadow-primary/40 ring-4 ring-primary/20"
                : "bg-slate-300 hover:bg-primary/40"
            }`}
            onClick={() => toggleSelection("right-elbow")}
          />

          <div 
            className={`absolute top-[48%] left-[22%] w-8 h-8 md:w-6 md:h-6 rounded-full transition-all duration-500 cursor-pointer ${
              currentValue.includes("left-wrist")
                ? "bg-primary scale-150 shadow-xl shadow-primary/40 ring-4 ring-primary/20"
                : "bg-slate-300 hover:bg-primary/40"
            }`}
            onClick={() => toggleSelection("left-wrist")}
          />

          <div 
            className={`absolute top-[48%] right-[22%] w-8 h-8 md:w-6 md:h-6 rounded-full transition-all duration-500 cursor-pointer ${
              currentValue.includes("right-wrist")
                ? "bg-primary scale-150 shadow-xl shadow-primary/40 ring-4 ring-primary/20"
                : "bg-slate-300 hover:bg-primary/40"
            }`}
            onClick={() => toggleSelection("right-wrist")}
          />
        </div>

        {/* Body area buttons as badges */}
        <div className="flex flex-wrap justify-start gap-3">
          {bodyAreas.map((area) => (
            <motion.div
              key={area.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge
                variant={currentValue.includes(area.id) ? "default" : "secondary"}
                className={`cursor-pointer transition-all px-6 py-4 text-xs font-black rounded-2xl ${
                  currentValue.includes(area.id) 
                    ? "shadow-2xl scale-110 bg-primary text-primary-foreground" 
                    : "bg-white hover:bg-slate-50 border-slate-100 text-slate-700"
                }`}
                onClick={() => toggleSelection(area.id)}
              >
                {area.label}
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};