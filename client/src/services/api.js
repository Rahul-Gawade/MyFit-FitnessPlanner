import axios from "axios";

const API = "http://localhost:5000";

export const generatePlan = (data) =>
  axios.post(`${API}/generate-plan`, data);

export const askAI = (message) =>
  axios.post(`${API}/ai-coach`, { message });