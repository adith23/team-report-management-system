// ──────────────────────────────────────────────────────────────────────────────
// UI Store — Client-side UI preferences (Zustand + localStorage persistence)
// ──────────────────────────────────────────────────────────────────────────────

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  /** Whether the sidebar is collapsed to icon-only mode */
  sidebarCollapsed: boolean;

  /** Whether the mobile navigation drawer is open */
  mobileNavOpen: boolean;

  // ── Actions ──────────────────────────────────────────────────────────────

  /** Toggle sidebar between expanded and collapsed */
  toggleSidebar: () => void;

  /** Set sidebar collapsed state explicitly */
  setSidebarCollapsed: (collapsed: boolean) => void;

  /** Toggle mobile navigation drawer */
  toggleMobileNav: () => void;

  /** Set mobile nav open state explicitly */
  setMobileNavOpen: (open: boolean) => void;
}

/**
 * UI preferences store.
 * Persisted to localStorage under key `"ui-preferences"` so sidebar
 * state and theme survive page refreshes.
 */
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      toggleMobileNav: () =>
        set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),

      setMobileNavOpen: (open) =>
        set({ mobileNavOpen: open }),
    }),
    {
      name: "ui-preferences",
      // Only persist user-preference fields, not transient UI state
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);
