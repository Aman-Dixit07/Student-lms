import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // to send the jwt cookie on every request
});

// Intercept requests to dynamically inject the Bearer token as a fallback
// This entirely bypasses modern browsers' aggressive blocking of cross-site cookies
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const storage = localStorage.getItem("auth-storage");
      if (storage) {
        const parsed = JSON.parse(storage);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      // Ignore parse errors
    }
  }
  return config;
});

export default axiosInstance;
