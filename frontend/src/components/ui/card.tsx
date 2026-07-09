// ──────────────────────────────────────────────────────────────────────────────
// Card — Container component with optional hover effect
// ──────────────────────────────────────────────────────────────────────────────

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Padding variant */
  padding?: "none" | "sm" | "md" | "lg";
  /** Enable hover lift + shadow effect */
  hover?: boolean;
  /** Click handler (makes the card clickable) */
  onClick?: () => void;
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

/**
 * Card container with rounded corners, border, and optional hover animation.
 *
 * @example
 * <Card padding="md" hover onClick={() => router.push(url)}>
 *   <h3>Title</h3>
 *   <p>Content</p>
 * </Card>
 */
export function Card({
  children,
  className,
  padding = "md",
  hover = false,
  onClick,
}: CardProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      className={cn(
        "rounded-xl border border-[hsl(var(--border))]",
        "bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]",
        paddingClasses[padding],
        hover && [
          "transition-all duration-200 ease-out",
          "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[hsl(var(--primary)/0.05)]",
          "hover:border-[hsl(var(--primary)/0.2)]",
        ],
        onClick && "cursor-pointer text-left w-full",
        className,
      )}
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      {children}
    </Component>
  );
}

// ── Sub-components for structured card layouts ────────────────────────────────

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-lg font-semibold leading-tight", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-sm text-[hsl(var(--muted-foreground))]",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mt-4", className)}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-4 flex items-center justify-end gap-2 border-t border-[hsl(var(--border))] pt-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
