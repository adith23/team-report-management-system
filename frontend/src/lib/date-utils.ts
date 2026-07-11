// Date Utilities — Week normalization and date range helpers

import {
  startOfWeek,
  endOfWeek,
  format,
  subWeeks,
  addWeeks,
  isAfter,
  isBefore,
  isSameDay,
} from "date-fns";

/** Week configuration: weeks start on Monday (ISO standard) */
const WEEK_OPTIONS = { weekStartsOn: 1 as const };

/**
 * Normalize any date to the Monday of its ISO week.
 *
 * @example getWeekStart(new Date("2025-07-03")) → "2025-06-30"
 */
export function getWeekStart(date: Date = new Date()): string {
  return format(startOfWeek(date, WEEK_OPTIONS), "yyyy-MM-dd");
}

/**
 * Get the Sunday of the ISO week for the given date.
 *
 * @example getWeekEnd(new Date("2025-07-03")) → "2025-07-06"
 */
export function getWeekEnd(date: Date = new Date()): string {
  return format(endOfWeek(date, WEEK_OPTIONS), "yyyy-MM-dd");
}

/**
 * Format a week range for display: "Jun 30 – Jul 6, 2025"
 *
 * @param weekStart — ISO date string for the Monday of the week
 */
export function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart);
  const end = endOfWeek(start, WEEK_OPTIONS);

  // If same month, abbreviate: "Jun 30 – Jul 6, 2025"
  return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
}

/**
 * Navigate to the previous or next week.
 *
 * @param weekStart — current week's Monday as ISO date string
 * @param direction — "prev" or "next"
 * @returns the Monday of the target week as ISO date string
 */
export function navigateWeek(
  weekStart: string,
  direction: "prev" | "next",
): string {
  const date = new Date(weekStart);
  const newDate = direction === "prev" ? subWeeks(date, 1) : addWeeks(date, 1);
  return format(newDate, "yyyy-MM-dd");
}

/**
 * Get the current week start (Monday) as an ISO date string.
 */
export function getCurrentWeekStart(): string {
  return getWeekStart(new Date());
}

/**
 * Check if a given week_start date is the current week.
 */
export function isCurrentWeek(weekStart: string): boolean {
  return weekStart === getCurrentWeekStart();
}

/**
 * Check if a given week_start is in the future.
 */
export function isFutureWeek(weekStart: string): boolean {
  return isAfter(new Date(weekStart), new Date(getCurrentWeekStart()));
}

/**
 * Check if a given week_start is in the past.
 */
export function isPastWeek(weekStart: string): boolean {
  return isBefore(new Date(weekStart), new Date(getCurrentWeekStart()));
}

/**
 * Get an array of week_start dates for the last N weeks (including current).
 * Useful for chart x-axis ticks.
 *
 * @param count — number of weeks to include
 * @returns array of ISO date strings, oldest first
 */
export function getRecentWeeks(count: number): string[] {
  const weeks: string[] = [];
  const currentStart = new Date(getCurrentWeekStart());

  for (let i = count - 1; i >= 0; i--) {
    weeks.push(format(subWeeks(currentStart, i), "yyyy-MM-dd"));
  }

  return weeks;
}

/**
 * Check if two date strings represent the same day.
 */
export function isSameDate(dateA: string, dateB: string): boolean {
  return isSameDay(new Date(dateA), new Date(dateB));
}

/**
 * Format an ISO date string to a human-readable date.
 * @param dateString - ISO date string
 * @param formatStr - optional format string, defaults to "MMM d, yyyy"
 */
export function formatDate(dateString: string, formatStr: string = "MMM d, yyyy"): string {
  if (!dateString) return "";
  try {
    return format(new Date(dateString), formatStr);
  } catch (e) {
    return dateString;
  }
}
