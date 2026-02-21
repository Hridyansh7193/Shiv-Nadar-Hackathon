import { motion } from "framer-motion";
import {
  Shield,
  ArrowLeft,
  Check,
  X,
  Zap,
  Crown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Get started with basic dependency scanning",
    color: "#00d4ff",
    icon: Zap,
    popular: false,
    features: [
      { text: "5 scans per day", included: true },
      { text: "Basic vulnerability detection", included: true },
      { text: "Top-level dependency analysis", included: true },
      { text: "Risk score & badges", included: true },
      { text: "Community support", included: true },
      { text: "AI-powered explanations", included: false },
      { text: "Transitive dependency scanning", included: false },
      { text: "CI/CD pipeline integration", included: false },
      { text: "Priority threat alerts", included: false },
      { text: "Export PDF reports", included: false },
    ],
  },
  {
    name: "Pro",
    price: "₹1,500",
    period: "/ month",
    description: "Full power for professional developers & teams",
    color: "#00ff88",
    icon: Crown,
    popular: true,
    features: [
      { text: "Unlimited scans", included: true },
      { text: "Advanced vulnerability detection", included: true },
      { text: "Full dependency tree analysis", included: true },
      { text: "Risk score & badges", included: true },
      { text: "Priority support (24hr)", included: true },
      { text: "AI-powered explanations", included: true },
      { text: "Transitive dependency scanning", included: true },
      { text: "CI/CD pipeline integration", included: true },
      { text: "Priority threat alerts", included: true },
      { text: "Export PDF reports", included: true },
    ],
  },
];

export default function PricingPage({ onBack, onSelectPlan }) {
  return (
    <div className="min-h-screen bg-grid">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-cyber-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-cyber-green/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Back button */}
        {onBack && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground gap-2"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="w-8 h-8 text-cyber-blue" />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-green bg-clip-text text-transparent">
              Sentinel Source
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-cyber-blue to-cyber-green bg-clip-text text-transparent">
              Shield
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Start free or go Pro for unlimited scanning and AI-powered threat
            intelligence.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
              >
                <Card
                  className={`relative border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden h-full transition-all duration-300 hover:shadow-xl ${
                    plan.popular
                      ? "border-cyber-green/40 glow-green"
                      : "hover:border-border/70"
                  }`}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-cyber-green/10 text-cyber-green border-cyber-green/30 gap-1">
                        <Sparkles className="w-3 h-3" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-8">
                    {/* Plan header */}
                    <div className="mb-8">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                        style={{ backgroundColor: `${plan.color}12` }}
                      >
                        <Icon
                          className="w-6 h-6"
                          style={{ color: plan.color }}
                        />
                      </div>
                      <h2 className="text-xl font-bold mb-1">{plan.name}</h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        {plan.description}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span
                          className="text-4xl font-bold"
                          style={{ color: plan.color }}
                        >
                          {plan.price}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {plan.period}
                        </span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    {plan.popular ? (
                      <Button
                        className="w-full bg-gradient-to-r from-cyber-blue to-cyber-green text-black font-semibold hover:opacity-90 h-11 mb-8"
                        onClick={() => onSelectPlan?.(plan.name)}
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade to Pro
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full border-border/50 hover:bg-muted/50 h-11 mb-8"
                        onClick={() => onSelectPlan?.(plan.name)}
                      >
                        Get Started Free
                      </Button>
                    )}

                    {/* Features list */}
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        What's included
                      </p>
                      {plan.features.map((feat) => (
                        <div
                          key={feat.text}
                          className="flex items-center gap-3"
                        >
                          {feat.included ? (
                            <div className="w-5 h-5 rounded-full bg-cyber-green/10 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-cyber-green" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-muted/30 flex items-center justify-center flex-shrink-0">
                              <X className="w-3 h-3 text-muted-foreground/40" />
                            </div>
                          )}
                          <span
                            className={`text-sm ${
                              feat.included
                                ? "text-foreground"
                                : "text-muted-foreground/40"
                            }`}
                          >
                            {feat.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ / trust note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <Card className="border-border/30 bg-card/40 backdrop-blur-sm max-w-2xl mx-auto">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">
                  No credit card required for Free plan.
                </span>{" "}
                Pro plan comes with a 7-day free trial. Cancel anytime — no
                questions asked. All payments are securely processed.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center text-xs text-muted-foreground/50"
        >
          Sentinel Source — AI-Powered Dependency Security
        </motion.p>
      </div>
    </div>
  );
}
