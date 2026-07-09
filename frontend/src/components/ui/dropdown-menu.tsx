// ──────────────────────────────────────────────────────────────────────────────
// Dropdown Menu — Click-triggered dropdown with keyboard navigation
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  /** Trigger element (button) */
  trigger: React.ReactNode;
  /** Menu items */
  children: React.ReactNode;
  /** Alignment relative to trigger */
  align?: "left" | "right";
  /** Additional className for the menu container */
  className?: string;
}

/**
 * Dropdown menu with click-to-toggle, click-outside-to-close,
 * and Escape key support.
 *
 * @example
 * <DropdownMenu trigger={<Button variant="ghost"><Avatar name="Alice" /></Button>}>
 *   <DropdownMenuItem onClick={handleProfile}>Profile</DropdownMenuItem>
 *   <DropdownMenuDivider />
 *   <DropdownMenuItem onClick={handleLogout} destructive>Logout</DropdownMenuItem>
 * </DropdownMenu>
 */
export function DropdownMenu({
  trigger,
  children,
  align = "right",
  className,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    },
    [],
  );

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      {/* Trigger */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-haspopup="menu"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((prev) => !prev);
          }
        }}
      >
        {trigger}
      </div>

      {/* Menu */}
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute z-50 mt-2 min-w-[12rem]",
            "rounded-lg border border-[hsl(var(--border))]",
            "bg-[hsl(var(--card))] py-1 shadow-lg",
            "animate-scale-in origin-top",
            align === "right" ? "right-0" : "left-0",
            className,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ── Menu Item ────────────────────────────────────────────────────────────────

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  /** Icon element displayed before the label */
  icon?: React.ReactNode;
  /** Destructive/danger styling */
  destructive?: boolean;
  disabled?: boolean;
  className?: string;
}

export function DropdownMenuItem({
  children,
  onClick,
  icon,
  destructive = false,
  disabled = false,
  className,
}: DropdownMenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-sm",
        "transition-colors duration-150",
        destructive
          ? "text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.1)]"
          : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      {icon && <span className="shrink-0 h-4 w-4">{icon}</span>}
      {children}
    </button>
  );
}

// ── Divider ──────────────────────────────────────────────────────────────────

export function DropdownMenuDivider() {
  return (
    <div
      className="my-1 border-t border-[hsl(var(--border))]"
      role="separator"
    />
  );
}

// ── Label ────────────────────────────────────────────────────────────────────

export function DropdownMenuLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "px-3 py-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]",
        className,
      )}
    >
      {children}
    </div>
  );
}
