// ──────────────────────────────────────────────────────────────────────────────
// Button — Multi-variant button with loading state
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

const variantClasses = {
  primary:
    "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)] focus-visible:ring-[hsl(var(--ring))]",
  secondary:
    "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary)/0.8)] border border-[hsl(var(--border))]",
  destructive:
    "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive)/0.9)]",
  ghost:
    "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]",
  outline:
    "border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]",
  link: "text-[hsl(var(--primary))] underline-offset-4 hover:underline",
} as const;

const sizeClasses = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
  icon: "h-10 w-10 p-0",
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
  loading?: boolean;
}

/**
 * Button component with multiple visual variants and a loading state.
 *
 * @example
 * <Button variant="primary" loading={isSubmitting}>Submit</Button>
 * <Button variant="ghost" size="icon"><Icon /></Button>
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium",
          "transition-all duration-200 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          // Variant + size
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading && <Spinner size="sm" className="shrink-0" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
