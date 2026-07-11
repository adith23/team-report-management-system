// Sidebar — Main navigation sidebar with role-based filtering

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  Users,
  FolderKanban,
  Shield,
  Bot,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { useLogout } from "@/hooks/use-auth";
import { NAV_ITEMS } from "@/lib/constants";
import { Avatar } from "@/components/ui/avatar";
import type { UserRole } from "@/types/common";

// Icon Map
// Maps icon name strings from NAV_ITEMS to Lucide React components.

const iconMap: Record<string, React.ElementType> = {
  FileText,
  LayoutDashboard,
  Users,
  FolderKanban,
  Shield,
  Bot,
};

/**
 * Main sidebar navigation.
 *
 * - Filters nav items by user role
 * - Highlights active route via `usePathname()`
 * - Supports collapsed (icon-only) mode on desktop
 * - Hidden on mobile (replaced by MobileNav drawer)
 */
export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const logout = useLogout();

  // Filter navigation items based on user role
  const visibleItems = NAV_ITEMS.filter((item) =>
    user ? item.roles.includes(user.role as UserRole) : false,
  );

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col",
        "border-r border-[hsl(var(--border))]",
        "bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]",
        "transition-all duration-300 ease-out",
        // Hidden on mobile
        "hidden lg:flex",
        sidebarCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* ── Logo / App Name ──────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-[hsl(var(--border))]",
          sidebarCollapsed ? "justify-center px-2" : "gap-3 px-6",
        )}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
          <Layers className="h-5 w-5 text-[hsl(var(--primary-foreground))]" />
        </div>
        {!sidebarCollapsed && (
          <span className="text-lg font-bold tracking-tight truncate">
            TaskFlow
          </span>
        )}
      </div>

      {/* ── Navigation Items ─────────────────────────────────────────────── */}
      <nav
        className="flex-1 overflow-y-auto px-3 py-4"
        aria-label="Main navigation"
      >
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = iconMap[item.icon] || FileText;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                    "transition-all duration-200",
                    isActive
                      ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                      : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]",
                    sidebarCollapsed && "justify-center px-2",
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isActive
                        ? "text-[hsl(var(--primary))]"
                        : "text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]",
                    )}
                  />
                  {!sidebarCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── User Section + Collapse Toggle ───────────────────────────────── */}
      <div className="border-t border-[hsl(var(--border))] p-3">
        {/* User info */}
        {user && (
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2",
              sidebarCollapsed && "justify-center px-0",
            )}
          >
            <Avatar name={user.full_name} size="sm" />
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.full_name}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions: Logout + Collapse Toggle */}
        <div
          className={cn(
            "mt-2 flex gap-1",
            sidebarCollapsed ? "flex-col items-center" : "items-center",
          )}
        >
          <button
            type="button"
            onClick={() => logout.mutate()}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
              "text-[hsl(var(--muted-foreground))] transition-colors",
              "hover:bg-[hsl(var(--destructive)/0.1)] hover:text-[hsl(var(--destructive))]",
              sidebarCollapsed ? "justify-center w-full" : "flex-1",
            )}
            title="Logout"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>

          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              "rounded-lg p-2 text-[hsl(var(--muted-foreground))]",
              "transition-colors hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]",
            )}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            title={sidebarCollapsed ? "Expand" : "Collapse"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
