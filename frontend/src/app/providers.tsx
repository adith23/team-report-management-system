// ──────────────────────────────────────────────────────────────────────────────
// Providers — Client-side context providers wrapping the application
// ──────────────────────────────────────────────────────────────────────────────
//
// This file must be a client component since TanStack Query and toast providers
// require React context and hooks. It is imported by the root layout (server
// component) to wrap the entire application.
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastProvider } from "@/components/feedback/toast-provider";
import { ErrorBoundary } from "@/components/feedback/error-boundary";

/**
 * Application-wide providers.
 *
 * Creates a stable QueryClient instance per React tree (using useState
 * ensures the same client survives re-renders but a new one is created
 * per SSR request, avoiding shared state between requests).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>{children}</ErrorBoundary>
      <ToastProvider />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
