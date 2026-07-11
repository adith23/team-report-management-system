// Utility Functions — General-purpose helpers used across the application

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with intelligent conflict resolution.
 * Combines `clsx` (conditional classes) with `tailwind-merge` (deduplication).
 *
 * @example
 * cn("px-4 py-2", isActive && "bg-brand-500", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format an ISO date string into a human-readable short format.
 *
 * @example formatDate("2025-07-01T10:30:00Z") → "Jul 1, 2025"
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format an ISO datetime string into a human-readable date + time.
 *
 * @example formatDateTime("2025-07-01T10:30:00Z") → "Jul 1, 2025, 10:30 AM"
 */
export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Format a relative time string (e.g., "2 hours ago").
 * Uses a simple interval-based approach without external dependencies.
 *
 * @example formatRelativeTime("2025-07-01T08:00:00Z") → "3 hours ago"
 */
export function formatRelativeTime(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000,
  );

  // Handle future dates
  if (seconds < 0) return "just now";

  const intervals: Array<{ label: string; seconds: number }> = [
    { label: "year", seconds: 31_536_000 },
    { label: "month", seconds: 2_592_000 },
    { label: "week", seconds: 604_800 },
    { label: "day", seconds: 86_400 },
    { label: "hour", seconds: 3_600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}

/**
 * Generate initials from a full name string.
 * Takes the first letter of the first and last name.
 *
 * @example getInitials("Alice Smith") → "AS"
 * @example getInitials("Bob") → "B"
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Capitalize the first letter of a string.
 *
 * @example capitalize("team_member") → "Team_member"
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a role enum value into a human-readable label.
 *
 * @example formatRole("TEAM_MEMBER") → "Team Member"
 */
export function formatRole(role: string): string {
  return role
    .split("_")
    .map((word) => capitalize(word.toLowerCase()))
    .join(" ");
}

/**
 * Clamp a number between a minimum and maximum.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
