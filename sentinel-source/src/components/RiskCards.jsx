import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const riskConfig = {
  safe: {
    icon: ShieldCheck,
    label: "Safe",
    color: "#00ff88",
    bg: "bg-cyber-green/5",
    border: "border-cyber-green/20",
    glow: "glow-green",
  },
  suspicious: {
    icon: ShieldAlert,
    label: "Suspicious",
    color: "#ffaa00",
    bg: "bg-cyber-yellow/5",
    border: "border-cyber-yellow/20",
    glow: "glow-yellow",
  },
  critical: {
    icon: ShieldX,
    label: "High Risk",
    color: "#ff3366",
    bg: "bg-cyber-red/5",
    border: "border-cyber-red/20",
    glow: "glow-red",
  },
};

function RiskCard({ type, count, total, delay = 0 }) {
  const config = riskConfig[type];
  const Icon = config.icon;
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card
        className={`${config.bg} ${config.border} border ${config.glow} transition-all duration-300 hover:scale-[1.02]`}
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${config.color}15` }}
              >
                <Icon className="w-6 h-6" style={{ color: config.color }} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{config.label}</p>
                <p className="text-2xl font-bold" style={{ color: config.color }}>
                  {count}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className="text-lg font-mono font-semibold"
                style={{ color: config.color }}
              >
                {percentage}%
              </p>
              <p className="text-xs text-muted-foreground">of total</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: config.color }}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ delay: delay + 0.3, duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function RiskCards({ dependencies = [] }) {
  const total = dependencies.length;

  const safe = dependencies.filter((d) => {
    const l = d.risk_level?.toLowerCase();
    return l === "low" || l === "safe";
  }).length;

  const suspicious = dependencies.filter((d) => {
    const l = d.risk_level?.toLowerCase();
    return l === "medium" || l === "suspicious";
  }).length;

  const critical = dependencies.filter((d) => {
    const l = d.risk_level?.toLowerCase();
    return l === "high" || l === "critical";
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <RiskCard type="safe" count={safe} total={total} delay={0} />
      <RiskCard type="suspicious" count={suspicious} total={total} delay={0.1} />
      <RiskCard type="critical" count={critical} total={total} delay={0.2} />
    </div>
  );
}
