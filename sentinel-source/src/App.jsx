import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FileUpload from "@/components/FileUpload";
import SecurityDashboard from "@/components/SecurityDashboard";
import { analyzeDependencies } from "@/services/api";

// Set to true to preview the dashboard with fake data (no backend needed)
const DEMO_MODE = true;

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
  const [view, setView] = useState("upload"); // "upload" | "dashboard"
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

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
      }
      setAnalysisData({
        ...data,
        file_name: file.name,
        analyzed_at: data.analyzed_at || new Date().toISOString(),
      });
      setView("dashboard");
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Failed to analyze dependencies. Please try again.";
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
      {view === "upload" ? (
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
      ) : (
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
