// ──────────────────────────────────────────────────────────────────────────────
// Dashboard Layout — Wraps all protected views with Sidebar and Header
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { AuthGuard } from "@/features/auth/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed } = useUIStore();

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        {/* Sidebar (Desktop only) */}
        <Sidebar />

        {/* Mobile Navigation Drawer */}
        <MobileNav />

        {/* Main content layout */}
        <div
          className={cn(
            "flex flex-1 flex-col overflow-hidden transition-all duration-300",
            sidebarCollapsed ? "lg:pl-20" : "lg:pl-64",
          )}
        >
          {/* Sticky Header */}
          <Header />

          {/* Page body content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[hsl(var(--background))] animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
