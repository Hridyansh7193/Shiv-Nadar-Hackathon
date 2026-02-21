import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

/**
 * 🔥 UPDATED FUNCTION (PUT YOUR CODE HERE)
 */
export async function analyzeDependencies(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/analyze", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    
  });

  const data = response.data;

  const dependencies = data.results.map((item) => ({
    name: item.dependency,
    version: item.current_version,
    risk_level: item.risk_level.toLowerCase(),
    risk_score: item.risk_score,
    explanation: item.reason,
    indicators: item.indicators || [],
  }));

  const avgRisk =
    dependencies.reduce((sum, d) => sum + d.risk_score, 0) /
    dependencies.length;

  const score = Math.max(0, 100 - avgRisk);

  return {
    dependencies,
    score,
    analyzed_at: new Date().toISOString(),
    highRiskCount: data.high_risk_count,
  };
}

/**
 * keep these as they are
 */
export async function signIn(credentials) {
  return { success: true, user: { email: credentials.email } };
}

export async function signUp(credentials) {
  return { success: true, user: { email: credentials.email } };
}

export default apiClient;