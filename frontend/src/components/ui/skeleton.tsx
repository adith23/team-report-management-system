// Skeleton — Loading placeholder with shimmer animation

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  /** Shape variant */
  variant?: "rectangle" | "circle" | "text";
  /** Width (accepts Tailwind class or CSS value) */
  width?: string;
  /** Height (accepts Tailwind class or CSS value) */
  height?: string;
}

/**
 * Skeleton loading placeholder with shimmer animation.
 *
 * @example
 * <Skeleton variant="text" width="w-48" />
 * <Skeleton variant="circle" width="w-10" height="h-10" />
 * <Skeleton variant="rectangle" className="h-32 w-full" />
 */
export function Skeleton({
  className,
  variant = "rectangle",
  width,
  height,
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-shimmer",
        variant === "circle" && "rounded-full",
        variant === "text" && "rounded h-4",
        variant === "rectangle" && "rounded-lg",
        width,
        height,
        className,
      )}
    />
  );
}

/**
 * Pre-built skeleton for text lines (e.g., paragraph placeholder).
 */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn(
            // Last line is shorter for visual realism
            i === lines - 1 ? "w-3/4" : "w-full",
          )}
        />
      ))}
    </div>
  );
}

/**
 * Pre-built skeleton for a card layout.
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[hsl(var(--border))] p-6 space-y-4",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" className="h-10 w-10" />
        <div className="space-y-1.5 flex-1">
          <Skeleton variant="text" className="w-1/3" />
          <Skeleton variant="text" className="w-1/2 h-3" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}
