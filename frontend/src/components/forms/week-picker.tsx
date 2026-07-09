// ──────────────────────────────────────────────────────────────────────────────
// Week Picker — Week selector with ← → navigation
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatWeekRange,
  navigateWeek,
  isFutureWeek,
} from "@/lib/date-utils";

interface WeekPickerProps {
  /** Current week start date as ISO string (YYYY-MM-DD, always a Monday) */
  value: string;
  /** Called when the week changes */
  onChange: (weekStart: string) => void;
  /** Whether future weeks can be selected */
  allowFuture?: boolean;
  /** Disable navigation */
  disabled?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Week selector showing the current week range (e.g., "Jun 30 – Jul 6, 2025")
 * with ← → navigation buttons. Outputs `week_start` (Monday) as ISO date string.
 *
 * @example
 * <WeekPicker value={weekStart} onChange={setWeekStart} />
 */
export function WeekPicker({
  value,
  onChange,
  allowFuture = false,
  disabled = false,
  className,
}: WeekPickerProps) {
  const handlePrev = () => {
    onChange(navigateWeek(value, "prev"));
  };

  const handleNext = () => {
    const nextWeek = navigateWeek(value, "next");
    if (!allowFuture && isFutureWeek(nextWeek)) return;
    onChange(nextWeek);
  };

  const isNextDisabled = !allowFuture && isFutureWeek(navigateWeek(value, "next"));

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--input))]",
        "bg-transparent px-3 py-2",
        disabled && "opacity-50 pointer-events-none",
        className,
      )}
    >
      {/* Previous week */}
      <button
        type="button"
        onClick={handlePrev}
        disabled={disabled}
        className={cn(
          "rounded p-1 text-[hsl(var(--muted-foreground))]",
          "transition-colors hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]",
          "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]",
        )}
        aria-label="Previous week"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Week range display */}
      <div className="flex items-center gap-2 min-w-[180px] justify-center">
        <Calendar className="h-4 w-4 text-[hsl(var(--muted-foreground))] shrink-0" />
        <span className="text-sm font-medium text-[hsl(var(--foreground))] whitespace-nowrap">
          {formatWeekRange(value)}
        </span>
      </div>

      {/* Next week */}
      <button
        type="button"
        onClick={handleNext}
        disabled={disabled || isNextDisabled}
        className={cn(
          "rounded p-1 text-[hsl(var(--muted-foreground))]",
          "transition-colors hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]",
          "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]",
          isNextDisabled && "opacity-50 pointer-events-none",
        )}
        aria-label="Next week"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
