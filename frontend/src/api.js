import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://todoapp-backend-nrxj.onrender.com",
  timeout: 20000,
});

export function errorMessage(error, fallback) {
  return error.response?.status < 500 && error.response.data?.error?.trim() || fallback;
}
