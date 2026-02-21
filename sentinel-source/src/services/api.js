import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

/**
 * Upload a package.json file for dependency analysis.
 * @param {File} file - The package.json file to analyze
 * @returns {Promise} - The analysis result
 */
export async function analyzeDependencies(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/analyze", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export default apiClient;
