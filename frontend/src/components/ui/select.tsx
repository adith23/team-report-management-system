// ──────────────────────────────────────────────────────────────────────────────
// Select — Dropdown select with label, error, and placeholder
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  /** Label text displayed above the select */
  label?: string;
  /** Error message displayed below the select */
  error?: string;
  /** Options array */
  options: SelectOption[];
  /** Placeholder text shown when no value is selected */
  placeholder?: string;
  /** Wrapper className */
  wrapperClassName?: string;
}

/**
 * Select dropdown with label, error state, and placeholder support.
 *
 * @example
 * <Select label="Project" options={projectOptions} error={errors.project_id?.message} {...register("project_id")} />
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      options,
      placeholder,
      wrapperClassName,
      id,
      ...props
    },
    ref,
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("space-y-1.5", wrapperClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-[hsl(var(--foreground))]"
          >
            {label}
          </label>
        )}

        {/* Select */}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            // Base
            "flex h-10 w-full appearance-none rounded-lg border bg-transparent px-3 py-2 text-sm",
            "transition-colors duration-200",
            // Dropdown arrow (custom)
            "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat pr-8",
            // Focus
            "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1",
            // States
            error
              ? "border-[hsl(var(--destructive))] focus:ring-[hsl(var(--destructive))]"
              : "border-[hsl(var(--input))]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Error message */}
        {error && (
          <p
            id={`${selectId}-error`}
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

Select.displayName = "Select";

export { Select };
