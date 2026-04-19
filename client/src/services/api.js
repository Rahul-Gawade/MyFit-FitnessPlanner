import axios from "axios";

export const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const generatePlan = (data) =>
  axios.post(`${API}/generate-plan`, data);

export const askAI = (message) =>
  axios.post(`${API}/ai-coach`, { message });