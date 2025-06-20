// src/instance/axios.ts
import { basePath } from "@/utils/globalConstants";
import axios from "axios";

// ✅ Create Axios instance
const api = axios.create({
  baseURL: basePath, // 🔁 Replace with your actual API base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or from context
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized! You can redirect to login here.");
      // Optional: clear token, redirect, etc.
    }
    return Promise.reject(error);
  }
);

 export default api;
