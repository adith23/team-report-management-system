// ──────────────────────────────────────────────────────────────────────────────
// TanStack Query Client — Centralized QueryClient configuration
// ──────────────────────────────────────────────────────────────────────────────

import { QueryClient } from "@tanstack/react-query";

/**
 * Shared QueryClient instance used by the `<QueryClientProvider>`.
 *
 * Configuration rationale:
 * - `staleTime: 5 min` — data is considered fresh for 5 minutes, reducing
 *   unnecessary refetches for dashboard metrics and report lists.
 * - `gcTime: 10 min` — unused cache entries are garbage collected after 10 min.
 * - `retry: 1` — retry once on transient failures (network hiccup).
 * - `refetchOnWindowFocus: false` — avoids jarring refetches when user
 *   switches tabs; data refresh is handled by explicit invalidation.
 * - `mutations.retry: 0` — mutations should not auto-retry (risk of duplicate
 *   writes).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      gcTime: 10 * 60 * 1000,      // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
