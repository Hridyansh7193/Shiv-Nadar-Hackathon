import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FileUpload from "@/components/FileUpload";
import SecurityDashboard from "@/components/SecurityDashboard";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import PricingPage from "@/pages/PricingPage";
import { analyzeDependencies } from "@/services/api";

const DEMO_MODE = false;

const MOCK_DATA = {
  score: 64,
  analyzed_at: new Date().toISOString(),
  dependencies: [
    {
      name: "express",
      version: "^4.18.2",
      risk_level: "low",
      risk_score: 8,
      explanation:
        "Well-maintained package by a trusted team with no known vulnerabilities. Widely adopted with regular security patches.",
    },
    {
      name: "lodash",
      version: "^4.17.21",
      risk_level: "low",
      risk_score: 12,
      explanation:
        "Popular utility library. Older prototype pollution issues have been patched in this version.",
    },
    {
      name: "axios",
      version: "^1.6.0",
      risk_level: "low",
      risk_score: 5,
      explanation:
        "Actively maintained HTTP client with a strong security track record.",
    },
    {
      name: "jsonwebtoken",
      version: "^8.5.1",
      risk_level: "medium",
      risk_score: 45,
      explanation:
        "Outdated version with known algorithm confusion vulnerability (CVE-2022-23529). Upgrade to v9+ recommended.",
    },
    {
      name: "minimist",
      version: "^1.2.5",
      risk_level: "medium",
      risk_score: 52,
      explanation:
        "Prototype pollution vulnerability in versions before 1.2.6. Update to latest patch version.",
    },
    {
      name: "event-stream",
      version: "^3.3.4",
      risk_level: "high",
      risk_score: 95,
      explanation:
        "CRITICAL: This package was compromised in a supply-chain attack targeting cryptocurrency wallets. The malicious flatmap-stream dependency was injected. Remove immediately.",
    },
    {
      name: "ua-parser-js",
      version: "^0.7.28",
      risk_level: "high",
      risk_score: 88,
      explanation:
        "Versions 0.7.29, 0.8.0, and 1.0.0 were hijacked to include cryptomining and password-stealing malware. Verify your installed version carefully.",
    },
    {
      name: "cors",
      version: "^2.8.5",
      risk_level: "low",
      risk_score: 10,
      explanation:
        "Simple CORS middleware with no known vulnerabilities. Stable and widely used.",
    },
  ],
};

export default function App() {
  const [view, setView] = useState("landing");
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  console.log("FINAL DATA:", analysisData);

  const handleFileUpload = useCallback(async (file) => {
    setIsLoading(true);
    setError(null);

    try {
      let data;
      if (DEMO_MODE) {
        // Simulate network delay then return mock data
        await new Promise((r) => setTimeout(r, 2000));
        data = MOCK_DATA;
      } else {
        data = await analyzeDependencies(file);
      }setAnalysisData({
        dependencies: data.dependencies,
        score: data.score,
        highRiskCount: data.highRiskCount,
        analyzed_at: data.analyzed_at || new Date().toISOString(),
        file_name: file.name,
      });
      setView("dashboard");
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Failed to analyze dependencies. Please try again.";
        console.error("UPLOAD ERROR:", err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setView("upload");
    setAnalysisData(null);
    setError(null);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {view === "landing" && (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LandingPage
            onGetStarted={() => setView("auth")}
            onSignIn={() => setView("auth")}
            onViewPricing={() => setView("pricing")}
          />
        </motion.div>
      )}

      {view === "auth" && (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AuthPage
            onBack={() => setView("landing")}
            onAuthSuccess={() => setView("upload")}
          />
        </motion.div>
      )}

      {view === "pricing" && (
        <motion.div
          key="pricing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PricingPage
            onBack={() => setView("landing")}
            onSelectPlan={() => setView("auth")}
          />
        </motion.div>
      )}

      {view === "upload" && (
        <motion.div
          key="upload"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FileUpload
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
            error={error}
          />
        </motion.div>
      )}

      {view === "dashboard" && (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SecurityDashboard data={analysisData} onReset={handleReset} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}