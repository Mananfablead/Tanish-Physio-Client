import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
      <div className="relative">
        {/* Decorative pulse rings */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/10"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0.5,
            ease: "easeOut",
          }}
        />
        
        {/* Main Icon Container */}
        <motion.div
          className="relative h-20 w-20 rounded-2xl bg-primary flex items-center justify-center shadow-xl"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Activity className="h-10 w-10 text-white" />
        </motion.div>
      </div>

      <motion.div
        className="mt-8 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Tanish Physio</h2>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-slate-500">Preparing your wellness path</span>
          <motion.div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-primary"
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
