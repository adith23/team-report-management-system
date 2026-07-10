  // ──────────────────────────────────────────────────────────────────────────────
// Header — Top header bar with mobile toggle, page title, and user menu
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { usePathname } from "next/navigation";
import { Menu, LogOut, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { useLogout } from "@/hooks/use-auth";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuDivider,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { formatRole } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

/**
 * Derive a page title from the current pathname.
 */
function getPageTitle(pathname: string): string {
  const titleMap: Record<string, string> = {
    [ROUTES.REPORTS]: "My Reports",
    [ROUTES.NEW_REPORT]: "New Report",
    [ROUTES.DASHBOARD]: "Dashboard",
    [ROUTES.TEAM_REPORTS]: "Team Reports",
    [ROUTES.PROJECTS]: "Projects",
    [ROUTES.USERS]: "User Management",
    [ROUTES.AI_ASSISTANT]: "AI Assistant",
  };

  // Exact match
  if (titleMap[pathname]) return titleMap[pathname];

  // Dynamic routes
  if (pathname.includes("/reports/") && pathname.endsWith("/edit")) {
    return "Edit Report";
  }
  if (pathname.includes("/reports/")) {
    return "Report Detail";
  }

  return "Team Reports";
}

/**
 * Top header bar.
 *
 * - Mobile: hamburger menu toggle
 * - Center/left: dynamic page title
 * - Right: user avatar dropdown with profile info and logout
 */
export function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { toggleMobileNav } = useUIStore();
  const logout = useLogout();

  const pageTitle = getPageTitle(pathname);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between",
        "border-b border-[hsl(var(--border))]",
        "bg-[hsl(var(--card)/0.8)] backdrop-blur-sm",
        "px-4 lg:px-6",
      )}
    >
      {/* Left: Mobile hamburger + Page title */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger — hidden on desktop (sidebar is visible there) */}
        <button
          type="button"
          onClick={toggleMobileNav}
          className={cn(
            "rounded-lg p-2 text-[hsl(var(--muted-foreground))]",
            "transition-colors hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]",
            "lg:hidden",
          )}
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-lg font-semibold text-[hsl(var(--foreground))] truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Right: User menu */}
      {user && (
        <DropdownMenu
          align="right"
          trigger={
            <button
              type="button"
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5",
                "transition-colors hover:bg-[hsl(var(--accent))]",
              )}
            >
              <Avatar name={user.full_name} size="sm" />
              <span className="hidden md:block text-sm font-medium text-[hsl(var(--foreground))] max-w-[120px] truncate">
                {user.full_name}
              </span>
            </button>
          }
        >
          <DropdownMenuLabel>
            <div>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                {user.full_name}
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {user.email}
              </p>
              <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                {formatRole(user.role)}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuDivider />
          <DropdownMenuItem
            icon={<UserIcon className="h-4 w-4" />}
            onClick={() => {}}
          >
            Profile
          </DropdownMenuItem>
          <DropdownMenuDivider />
          <DropdownMenuItem
            icon={<LogOut className="h-4 w-4" />}
            onClick={() => logout.mutate()}
            destructive
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenu>
      )}
    </header>
  );
}
