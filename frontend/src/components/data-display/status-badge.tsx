// ──────────────────────────────────────────────────────────────────────────────
// Status Badge — Renders ReportStatus as a colored pill using STATUS_CONFIG
// ──────────────────────────────────────────────────────────────────────────────

import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "@/lib/constants";
import type { ReportStatus } from "@/types/common";

interface StatusBadgeProps {
  /** Report status to display */
  status: ReportStatus;
  /** Size variant */
  size?: "sm" | "md";
  className?: string;
}

/**
 * Report status badge that uses the centralized STATUS_CONFIG
 * for consistent color coding across the application.
 *
 * @example
 * <StatusBadge status={ReportStatus.SUBMITTED} />
 * <StatusBadge status={report.status} size="sm" />
 */
export function StatusBadge({
  status,
  size = "md",
  className,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        config.color,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-0.5 text-xs",
        // Pulse animation for LATE status to draw attention
        status === "LATE" && "animate-pulse",
        className,
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dotColor)}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}
