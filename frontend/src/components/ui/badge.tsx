// ──────────────────────────────────────────────────────────────────────────────
// Badge — Status/label badge with variants
// ──────────────────────────────────────────────────────────────────────────────

import { cn } from "@/lib/utils";

const variantClasses = {
  default:
    "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]",
  secondary:
    "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]",
  success:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  warning:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  destructive:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  outline:
    "border border-[hsl(var(--border))] text-[hsl(var(--foreground))]",
} as const;

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
} as const;

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
  className?: string;
  /** Optional dot indicator before text */
  dot?: boolean;
  /** Color of the dot (Tailwind bg class) */
  dotColor?: string;
}

/**
 * Badge component for status labels, tags, and indicators.
 *
 * @example
 * <Badge variant="success">Submitted</Badge>
 * <Badge variant="warning" dot dotColor="bg-yellow-500">Draft</Badge>
 */
export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
  dot = false,
  dotColor = "bg-current",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColor)}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
