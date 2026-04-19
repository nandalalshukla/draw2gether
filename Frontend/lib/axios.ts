import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { env } from "@/lib/env";

/**
 * Extend AxiosRequestConfig to support custom retry flag
 */
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

/**
 * Main API client
 */
const api: AxiosInstance = axios.create({
  baseURL: env.backendUrl,
  withCredentials: true, // required for httpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds is reasonable for frontend
});

/**
 * Dedicated refresh client (no interceptors attached)
 */
const refreshClient: AxiosInstance = axios.create({
  baseURL: env.backendUrl,
  withCredentials: true,
  timeout: 15000,
});

let refreshPromise: Promise<unknown> | null = null;
let hasRedirectedToLogin = false;

// Add Authorization header to every request
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isUnauthorized = error.response?.status === 401;
    const isRefreshRequest = originalRequest.url?.includes(
      "/auth/refresh-token",
    );

    // Only attempt refresh if:
    // - 401 error
    // - Not already retried
    // - Not the refresh endpoint itself
    if (isUnauthorized && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshClient
            .post("/auth/refresh-token")
            .finally(() => {
              refreshPromise = null;
            });
        }

        const refreshResponse = await refreshPromise;

        // Save the new access token so subsequent requests use it
        const newAccessToken = (
          refreshResponse as { data: { data: { accessToken: string } } }
        ).data?.data?.accessToken;
        if (newAccessToken) {
          useAuthStore.getState().setToken(newAccessToken);
        }

        // Retry original request (interceptor will pick up the new token)
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed → clear auth & redirect to login
        useAuthStore.getState().clearAuth();
        if (typeof window !== "undefined" && !hasRedirectedToLogin) {
          hasRedirectedToLogin = true;
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
