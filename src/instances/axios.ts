// src/instance/axios.ts
import { toast } from "@/hooks/use-toast";
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
  async (error) => {
    // const originalRequest = error.config;

    // if (error.response?.status === 403 && !originalRequest._retry) {
    //   originalRequest._retry = true; // prevent infinite retry loops
    //   const success = await handleTokenExpired();
    //   if (success) {
    //     const token = localStorage.getItem("token");
    //     if (token) {
    //       originalRequest.headers.Authorization = `Bearer ${token}`;
    //     }
    //     return api(originalRequest); // ✅ Retry the failed request
    //   }
    // }

    // return Promise.reject(error);
    console.warn("failed to send request");
  }
);

// const handleTokenExpired = async () => {
//   try {
//     const role = localStorage.getItem("role");
//     const refreshToken = localStorage.getItem("refreshToken");
//     if (!refreshToken || role === "BANK" || role === "Customer") {
//       console.warn("Unauthorized! You can redirect to login here.");
//       return false;
//     }
//     const res = await api.post<any>("/auth/refresh-token", { refreshToken: refreshToken });
//     if (res.status !== 200) {
//       throw new Error("Invalid credentials");
//     }
//     localStorage.setItem("token", res.data.data.accessToken);
//     localStorage.setItem("refreshToken", res.data.data.refreshToken);
//     localStorage.setItem("role", res.data.data.role);
//     return true;
//   }
//   catch (error: any) {
//     console.error(error)
//     toast({
//       title: "Storage Error",
//       description: "Failed to handle login",
//       variant: "destructive",
//     });
//   }
// }

export default api;
