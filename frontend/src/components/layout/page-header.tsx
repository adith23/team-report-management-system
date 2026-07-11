// Page Header — Reusable page-level header with title, subtitle, and actions

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Optional action element (e.g., a button) aligned to the right */
  action?: React.ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Reusable page-level header with consistent spacing.
 *
 * @example
 * <PageHeader
 *   title="My Reports"
 *   subtitle="View and manage your weekly reports"
 *   action={<Button onClick={...}>New Report</Button>}
 * />
 */
export function PageHeader({
  title,
  subtitle,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
        "mb-6",
        className,
      )}
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="mt-3 sm:mt-0 shrink-0">{action}</div>}
    </div>
  );
}
