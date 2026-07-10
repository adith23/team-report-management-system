// ──────────────────────────────────────────────────────────────────────────────
// Auth Hooks — TanStack Query hooks for authentication operations
// ──────────────────────────────────────────────────────────────────────────────
//
// These hooks wrap the auth API endpoints and synchronize server state
// (TanStack Query cache) with client state (Zustand auth store).
// ──────────────────────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { QUERY_KEYS, ROUTES, API_ENDPOINTS } from "@/lib/constants";
import type { User, LoginRequest, RegisterRequest } from "@/types";

/**
 * Fetch the current authenticated user.
 *
 * Called on app mount to validate the JWT cookie via `GET /auth/me`.
 * On success, syncs the user data into the Zustand auth store.
 * On failure (401), clears the auth store.
 *
 * Configuration:
 * - `retry: false` — don't retry on 401 (expected for unauthenticated users)
 * - `staleTime: Infinity` — user data doesn't change frequently;
 *   refetched only on explicit invalidation (login/logout)
 */
export function useCurrentUser() {
  const { setUser, clearUser } = useAuthStore();

  const query = useQuery<User>({
    queryKey: QUERY_KEYS.currentUser,
    queryFn: () => apiClient.get<User>(API_ENDPOINTS.ME),
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Sync TanStack Query state → Zustand store
  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
    if (query.isError) {
      clearUser();
    }
  }, [query.data, query.isError, setUser, clearUser]);

  return query;
}

/**
 * Login mutation.
 *
 * Sends credentials to `POST /auth/login`, which sets the HttpOnly JWT cookie.
 * On success:
 * 1. Updates the Zustand auth store with the returned user
 * 2. Injects the user into the TanStack Query cache (avoids a /auth/me round-trip)
 * 3. Navigates to the reports page (or callback URL)
 */
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation<User, Error, LoginRequest>({
    mutationFn: (data) => apiClient.post<User>(API_ENDPOINTS.LOGIN, data),
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(QUERY_KEYS.currentUser, user);
      router.push(ROUTES.REPORTS);
    },
  });
}

/**
 * Registration mutation.
 *
 * Creates a new user account via `POST /auth/register`.
 * On success, redirects to the login page. Does not auto-login.
 */
export function useRegister() {
  const router = useRouter();

  return useMutation<User, Error, RegisterRequest>({
    mutationFn: (data) => apiClient.post<User>(API_ENDPOINTS.REGISTER, data),
    onSuccess: () => {
      router.push(ROUTES.LOGIN);
    },
  });
}

/**
 * Logout mutation.
 *
 * Calls `POST /auth/logout` to clear the HttpOnly JWT cookie on the server.
 * On success:
 * 1. Clears the Zustand auth store
 * 2. Clears the entire TanStack Query cache (removes all cached user data)
 * 3. Navigates to the login page
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { clearUser } = useAuthStore();

  return useMutation<void, Error, void>({
    mutationFn: () => apiClient.post(API_ENDPOINTS.LOGOUT),
    onSuccess: () => {
      clearUser();
      queryClient.clear();
      router.push(ROUTES.LOGIN);
    },
    // Even if the logout API call fails, clear client state
    onError: () => {
      clearUser();
      queryClient.clear();
      router.push(ROUTES.LOGIN);
    },
  });
}
