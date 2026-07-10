// ──────────────────────────────────────────────────────────────────────────────
// Mobile Nav — Navigation drawer for mobile viewports
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  Users,
  FolderKanban,
  Shield,
  Bot,
  X,
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

// ── Icon Map ─────────────────────────────────────────────────────────────────

const iconMap: Record<string, React.ElementType> = {
  FileText,
  LayoutDashboard,
  Users,
  FolderKanban,
  Shield,
  Bot,
};

/**
 * Mobile navigation drawer.
 *
 * - Slides in from the left as an overlay
 * - Closes on route change, click outside, or Escape key
 * - Shows all role-filtered nav items + user info + logout
 */
export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { mobileNavOpen, setMobileNavOpen } = useUIStore();
  const logout = useLogout();

  // Close on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname, setMobileNavOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileNavOpen(false);
    }
    if (mobileNavOpen) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen, setMobileNavOpen]);

  const visibleItems = NAV_ITEMS.filter((item) =>
    user ? item.roles.includes(user.role as UserRole) : false,
  );

  if (!mobileNavOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={() => setMobileNavOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <nav
        className={cn(
          "fixed inset-y-0 left-0 w-72 flex flex-col",
          "bg-[hsl(var(--card))] border-r border-[hsl(var(--border))]",
          "shadow-xl",
          "animate-slide-in-from-left",
        )}
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-[hsl(var(--border))] px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
              <Layers className="h-5 w-5 text-[hsl(var(--primary-foreground))]" />
            </div>
            <span className="text-lg font-bold">TaskFlow</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
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
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                      "transition-all duration-200",
                      isActive
                        ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                        : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]",
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* User section */}
        <div className="border-t border-[hsl(var(--border))] p-3">
          {user && (
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar name={user.full_name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.full_name}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => logout.mutate()}
            className={cn(
              "mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm",
              "text-[hsl(var(--muted-foreground))]",
              "hover:bg-[hsl(var(--destructive)/0.1)] hover:text-[hsl(var(--destructive))]",
              "transition-colors",
            )}
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
