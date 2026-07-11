// Spinner — Loading indicator with size variants

import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-3",
} as const;

interface SpinnerProps {
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "animate-spin rounded-full border-solid border-[hsl(var(--muted-foreground)/0.3)] border-t-[hsl(var(--primary))]",
        sizeClasses[size],
        className,
      )}
    >
      <span className="sr-only">Loading…</span>
    </div>
  );
}
