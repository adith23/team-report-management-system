// Metric Card — Dashboard KPI card with icon, value, label, and trend

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  /** Lucide icon component */
  icon: React.ElementType;
  /** Icon background color class */
  iconColor?: string;
  /** Large metric value */
  value: string | number;
  /** Metric label */
  label: string;
  /** Optional trend percentage (e.g., 20 for +20%) */
  trend?: number;
  /** Optional trend label text */
  trendLabel?: string;
  /** Loading state */
  loading?: boolean;
  className?: string;
}

/**
 * Dashboard metric card displaying a KPI with an icon, large value,
 * label, and optional trend indicator.
 *
 * @example
 * <MetricCard
 *   icon={FileText}
 *   iconColor="bg-blue-500"
 *   value={12}
 *   label="Reports This Week"
 *   trend={20}
 *   trendLabel="vs last week"
 * />
 */
export function MetricCard({
  icon: Icon,
  iconColor = "bg-[hsl(var(--primary))]",
  value,
  label,
  trend,
  trendLabel,
  loading = false,
  className,
}: MetricCardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6",
          className,
        )}
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg animate-shimmer" />
          <div className="space-y-2 flex-1">
            <div className="h-7 w-16 animate-shimmer rounded" />
            <div className="h-4 w-24 animate-shimmer rounded" />
          </div>
        </div>
      </div>
    );
  }

  const TrendIcon =
    trend === undefined || trend === 0
      ? Minus
      : trend > 0
        ? TrendingUp
        : TrendingDown;

  const trendColor =
    trend === undefined || trend === 0
      ? "text-[hsl(var(--muted-foreground))]"
      : trend > 0
        ? "text-green-600 dark:text-green-400"
        : "text-red-600 dark:text-red-400";

  return (
    <div
      className={cn(
        "rounded-xl border border-[hsl(var(--border))]",
        "bg-[hsl(var(--card))] p-6",
        "transition-all duration-200 hover:shadow-md hover:shadow-[hsl(var(--primary)/0.05)]",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
            iconColor,
          )}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>

        {/* Value + Label */}
        <div className="min-w-0">
          <p className="text-2xl font-bold text-[hsl(var(--foreground))] tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          <p className="text-sm text-[hsl(var(--muted-foreground))] truncate">
            {label}
          </p>
        </div>
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div className={cn("mt-3 flex items-center gap-1 text-xs", trendColor)}>
          <TrendIcon className="h-3.5 w-3.5" />
          <span className="font-medium">
            {trend > 0 ? "+" : ""}
            {trend.toFixed(1)}%
          </span>
          {trendLabel && (
            <span className="text-[hsl(var(--muted-foreground))]">
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
