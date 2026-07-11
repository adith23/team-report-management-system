// API Client — Axios instance with cookie credentials and error interceptors

import axios, { type AxiosError } from "axios";

/**
 * Base URL for API requests.
 * In development, Next.js rewrites `/api/v1/*` to `http://localhost:8000/api/v1/*`
 * via `next.config.ts`, so we default to the rewritten path for same-origin requests.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

/**
 * Pre-configured Axios instance.
 * `withCredentials: true` ensures the browser sends the HttpOnly JWT cookie
 * on every request — essential for cookie-based authentication.
 */
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000, // 30s timeout
});

// Response Interceptor
// Extracts `response.data` so consumers receive data directly,
// and transforms errors into a consistent `Error` shape.
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ detail: string }>) => {
    // On 401 (token expired/invalid), redirect to login
    if (error.response?.status === 401) {
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/register")
      ) {
        window.location.href = "/login";
      }
    }

    // Extract the error message from the backend's standard error shape
    const message =
      error.response?.data?.detail || error.message || "An unexpected error occurred";

    return Promise.reject(new Error(message));
  },
);

// Typed API Client
// Thin wrapper providing typed generic methods over the axios instance.
// Usage: `apiClient.get<User>("/auth/me")` → `Promise<User>`
export const apiClient = {
  get: <T>(url: string, params?: Record<string, unknown>): Promise<T> =>
    axiosInstance.get(url, { params }),

  post: <T>(url: string, data?: unknown): Promise<T> =>
    axiosInstance.post(url, data),

  put: <T>(url: string, data?: unknown): Promise<T> =>
    axiosInstance.put(url, data),

  patch: <T>(url: string, data?: unknown): Promise<T> =>
    axiosInstance.patch(url, data),

  delete: <T>(url: string): Promise<T> =>
    axiosInstance.delete(url),
};
