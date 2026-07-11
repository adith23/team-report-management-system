// Input — Text input with label, error message, and optional leading icon

"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Optional leading icon element */
  icon?: ReactNode;
  /** Wrapper className for the outer container */
  wrapperClassName?: string;
}

/**
 * Text input with label, error state, and optional leading icon.
 * Uses `forwardRef` for compatibility with `react-hook-form`.
 *
 * @example
 * <Input label="Email" error={errors.email?.message} icon={<Mail />} {...register("email")} />
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, wrapperClassName, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("space-y-1.5", wrapperClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[hsl(var(--foreground))]"
          >
            {label}
          </label>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Leading icon */}
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[hsl(var(--muted-foreground))]">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              // Base
              "flex h-10 w-full rounded-lg border bg-transparent px-3 py-2 text-sm",
              "transition-colors duration-200",
              "placeholder:text-[hsl(var(--muted-foreground))]",
              // Focus
              "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1",
              // States
              error
                ? "border-[hsl(var(--destructive))] focus:ring-[hsl(var(--destructive))]"
                : "border-[hsl(var(--input))]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              // Icon padding
              icon && "pl-10",
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
        </div>

        {/* Error message */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-[hsl(var(--destructive))]"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
