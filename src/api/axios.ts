import axios, { AxiosError, AxiosRequestConfig } from "axios";
import authApi from "./auth.Api";
import { getAccessToken, setAccessToken } from "./token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // WAJIB untuk refresh token cookie
});


// =======================
// REQUEST INTERCEPTOR
// =======================
api.interceptors.request.use((config) => {
  config.headers["X-Client"] = "web";

  const accessToken = getAccessToken();
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// =======================
// RESPONSE INTERCEPTOR
// =======================
let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/auth/login") &&
      !originalRequest.url?.includes("/api/auth/refresh")
    ) {
      originalRequest._retry = true;

      // Jika refresh sedang berlangsung → antrikan request
      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await authApi.post("/api/auth/refresh");
        const newToken = (res.data as any).accessToken;

        setAccessToken(newToken);

        // Jalankan request yang ngantri
        queue.forEach((cb) => cb(newToken));
        queue = [];

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh gagal → session habis
        setAccessToken(null);
        queue = [];

        // window.location.href = "/signin"; // Redirect ke halaman login
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
