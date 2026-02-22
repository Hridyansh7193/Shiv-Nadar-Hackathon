import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function getScoreColor(score) {
  if (score >= 75) return { color: "#00ff88", label: "Secure", glow: "glow-green" };
  if (score >= 40) return { color: "#ffaa00", label: "Caution", glow: "glow-yellow" };
  return { color: "#ff3366", label: "Critical", glow: "glow-red" };
}

export default function ScoreMeter({ score = 0 }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const { color, label, glow } = getScoreColor(score);

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${glow} rounded-full p-2`}>
        <svg width="220" height="220" viewBox="0 0 220 220" className="transform -rotate-90">
          {/* Background ring */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            stroke="hsl(217 33% 17%)"
            strokeWidth="12"
            fill="none"
          />
          {/* Animated score ring */}
          <motion.circle
            cx="110"
            cy="110"
            r={radius}
            stroke={color}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-5xl font-bold tabular-nums"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {Number(animatedScore).toFixed(2)}
          </motion.span>
          <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
            / 100
          </span>
        </div>
      </div>

      {/* Label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-4 text-center"
      >
        <p className="text-lg font-semibold" style={{ color }}>
          {label}
        </p>
        <p className="text-sm text-muted-foreground">Overall Security Score</p>
      </motion.div>
    </div>
  );
}
