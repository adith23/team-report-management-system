// Auth Store — Client-side authentication state (Zustand)

import { create } from "zustand";
import type { User } from "@/types/auth";
import { UserRole } from "@/types/common";

interface AuthState {
  /** Currently authenticated user, or null if not logged in */
  user: User | null;

  /** Whether the user is authenticated (has a valid user object) */
  isAuthenticated: boolean;

  /**
   * Loading flag — true while the initial `/auth/me` request is in-flight.
   * Used by AuthGuard to show a spinner before auth state is determined.
   */
  isLoading: boolean;

  // Actions

  /** Set the authenticated user (called after successful login or /auth/me) */
  setUser: (user: User) => void;

  /** Clear the user state (called on logout or auth failure) */
  clearUser: () => void;

  /** Update the loading state */
  setLoading: (loading: boolean) => void;

  // Derived Accessors

  /** Check if the current user has the MANAGER role */
  isManager: () => boolean;

  /** Check if the current user has a specific role */
  hasRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading — resolved by useCurrentUser hook

  setUser: (user) =>
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    }),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  isManager: () => get().user?.role === UserRole.MANAGER,

  hasRole: (role) => get().user?.role === role,
}));
