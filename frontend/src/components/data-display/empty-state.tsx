// ──────────────────────────────────────────────────────────────────────────────
// Empty State — Placeholder when no data is available
// ──────────────────────────────────────────────────────────────────────────────

import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Optional icon component (defaults to Inbox) */
  icon?: React.ElementType;
  /** Optional action element (e.g., a CTA button) */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Full-width empty state with illustration, title, description,
 * and optional call-to-action button.
 *
 * @example
 * <EmptyState
 *   title="No reports yet"
 *   description="Create your first weekly report to get started."
 *   action={<Button>Create Report</Button>}
 * />
 */
export function EmptyState({
  title = "No data found",
  description = "There are no items to display.",
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        "animate-fade-in-up",
        className,
      )}
    >
      {/* Icon */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
        <Icon className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
      </div>

      {/* Text */}
      <h3 className="mt-4 text-lg font-semibold text-[hsl(var(--foreground))]">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">
        {description}
      </p>

      {/* Action */}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
