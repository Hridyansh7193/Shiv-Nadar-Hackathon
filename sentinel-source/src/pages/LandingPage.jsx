import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Lock,
  Eye,
  Bot,
  Package,
  ArrowRight,
  ChevronRight,
  Github,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Analysis",
    description:
      "Deep learning models scan every dependency for known exploits, typosquatting, and supply-chain threats.",
    color: "#00d4ff",
  },
  {
    icon: Eye,
    title: "Real-Time Scanning",
    description:
      "Instant vulnerability detection the moment you upload. No waiting, no queues.",
    color: "#00ff88",
  },
  {
    icon: Lock,
    title: "Zero Trust Approach",
    description:
      "Every package is guilty until proven safe. We verify maintainers, publish history, and code signatures.",
    color: "#8b5cf6",
  },
  {
    icon: Zap,
    title: "Actionable Insights",
    description:
      "Not just alerts — get clear explanations and remediation steps for every flagged dependency.",
    color: "#ffaa00",
  },
  {
    icon: Package,
    title: "Full Dependency Tree",
    description:
      "We don't just check top-level packages. Transitive dependencies are analyzed too.",
    color: "#ff3366",
  },
  {
    icon: Terminal,
    title: "CI/CD Ready",
    description:
      "Integrate into your pipeline. Block vulnerable builds before they reach production.",
    color: "#00d4ff",
  },
];

const stats = [
  { value: "50K+", label: "Packages Scanned" },
  { value: "12K+", label: "Threats Detected" },
  { value: "99.7%", label: "Accuracy Rate" },
  { value: "<2s", label: "Avg Scan Time" },
];

export default function LandingPage({ onGetStarted, onSignIn, onViewPricing }) {
  return (
    <div className="min-h-screen bg-grid">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyber-blue/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyber-purple/5 rounded-full blur-3xl" />
        <div className="absolute top-3/4 left-1/2 w-[400px] h-[400px] bg-cyber-green/3 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 flex items-center justify-between max-w-6xl mx-auto px-6 py-5"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-cyber-blue" />
          <span className="text-xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-green bg-clip-text text-transparent">
            Sentinel Source
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            onClick={onViewPricing}
          >
            Pricing
          </Button>
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
            onClick={onSignIn}
          >
            Sign In
          </Button>
          <Button
            className="bg-gradient-to-r from-cyber-blue to-cyber-green text-black font-semibold hover:opacity-90"
            onClick={onGetStarted}
          >
            Get Started
          </Button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyber-blue/20 bg-cyber-blue/5 text-cyber-blue text-sm mb-8">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Dependency Security
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            <span className="text-foreground">Your Dependencies.</span>
            <br />
            <span className="bg-gradient-to-r from-cyber-blue via-cyber-green to-cyber-blue bg-clip-text text-transparent">
              Our Firewall.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your <span className="text-foreground font-medium">package.json</span> and
            let AI uncover hidden vulnerabilities, malicious packages, and
            supply-chain threats — before they hit production.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyber-blue to-cyber-green text-black font-semibold hover:opacity-90 px-8 text-base"
              onClick={onGetStarted}
            >
              Scan Your Project
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border/50 hover:bg-muted/50 px-8 text-base"
              onClick={onViewPricing}
            >
              View Pricing
            </Button>
          </div>
        </motion.div>

        {/* Floating terminal mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-16 max-w-2xl mx-auto"
        >
          <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
              <div className="w-3 h-3 rounded-full bg-cyber-red/60" />
              <div className="w-3 h-3 rounded-full bg-cyber-yellow/60" />
              <div className="w-3 h-3 rounded-full bg-cyber-green/60" />
              <span className="ml-2 text-xs text-muted-foreground font-mono">
                sentinel-source — scan
              </span>
            </div>
            <div className="p-5 font-mono text-sm text-left space-y-2">
              <p>
                <span className="text-cyber-green">$</span>{" "}
                <span className="text-muted-foreground">
                  sentinel scan package.json
                </span>
              </p>
              <p className="text-cyber-blue">
                ✦ Scanning 24 dependencies...
              </p>
              <p className="text-cyber-green">
                ✓ 18 packages are safe
              </p>
              <p className="text-cyber-yellow">
                ⚠ 4 packages need attention
              </p>
              <p className="text-cyber-red">
                ✗ 2 critical threats detected
              </p>
              <p className="text-muted-foreground mt-2">
                → Security Score: <span className="text-cyber-yellow font-bold">64/100</span>
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 border-y border-border/30 bg-card/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-glow-blue text-cyber-blue">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why <span className="text-cyber-blue">Sentinel Source</span>?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Built for developers who take security seriously. Every scan is
            thorough, fast, and actionable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="border-border/40 bg-card/60 backdrop-blur-sm hover:border-border/70 transition-all duration-300 h-full group hover:shadow-lg">
                  <CardContent className="p-6">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${feat.color}12` }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: feat.color }}
                      />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feat.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="border-cyber-blue/20 bg-gradient-to-br from-cyber-blue/5 to-cyber-purple/5 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-12 text-center relative">
              {/* Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyber-blue/10 blur-3xl rounded-full" />

              <Shield className="w-12 h-12 text-cyber-blue mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-3">
                Ready to Secure Your Stack?
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                Don't wait for a breach. Start scanning your dependencies today
                — it takes less than 10 seconds.
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyber-blue to-cyber-green text-black font-semibold hover:opacity-90 px-10 text-base"
                onClick={onGetStarted}
              >
                Get Started Free
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyber-blue" />
            <span className="text-sm font-semibold text-muted-foreground">
              Sentinel Source
            </span>
          </div>
          <p className="text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} Sentinel Source. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground/60 hover:text-foreground transition-colors">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
