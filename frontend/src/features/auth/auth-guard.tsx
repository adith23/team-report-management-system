// AuthGuard — Component to protect views and enforce authentication/roles

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useCurrentUser } from "@/hooks/use-auth";
import { UserRole } from "@/types/common";
import { Spinner } from "@/components/ui/spinner";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Optional role requirement (e.g. UserRole.MANAGER) */
  requiredRole?: UserRole;
}

/**
 * Route protection wrapper component.
 * Validates session status client-side by checking the Zustand auth store
 * and triggering `/auth/me` on mount.
 */
export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Fetch/revalidate current user status on mount (sends JWT cookie via same-origin)
  const { isLoading: isQueryLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && !isQueryLoading) {
      if (!isAuthenticated || isError) {
        router.replace("/login");
        return;
      }
      if (requiredRole && user?.role !== requiredRole) {
        router.replace("/reports"); // Redirect non-managers to their reports dashboard
      }
    }
  }, [
    isLoading,
    isQueryLoading,
    isAuthenticated,
    isError,
    user,
    requiredRole,
    router,
  ]);

  if (isLoading || isQueryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[hsl(var(--background))]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (requiredRole && user?.role !== requiredRole) return null;

  return <>{children}</>;
}
