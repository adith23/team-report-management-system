// ──────────────────────────────────────────────────────────────────────────────
// FormField — Label + input + error wrapper for react-hook-form integration
// ──────────────────────────────────────────────────────────────────────────────

import { cn } from "@/lib/utils";

interface FormFieldProps {
  /** Label text */
  label: string;
  /** Error message from form validation */
  error?: string;
  /** Whether this field is required */
  required?: boolean;
  /** Hint text displayed below the input */
  hint?: string;
  /** The input/select/textarea element */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Wrapper component that provides consistent label, error, and hint styling
 * around any form input. Use this when you need to wrap custom inputs
 * that don't have built-in label/error support.
 *
 * @example
 * <FormField label="Week" error={errors.week_start?.message} required>
 *   <WeekPicker value={weekStart} onChange={setWeekStart} />
 * </FormField>
 */
export function FormField({
  label,
  error,
  required = false,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Label */}
      <label className="block text-sm font-medium text-[hsl(var(--foreground))]">
        {label}
        {required && (
          <span className="ml-0.5 text-[hsl(var(--destructive))]" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {/* Input slot */}
      {children}

      {/* Hint text */}
      {hint && !error && (
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{hint}</p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-[hsl(var(--destructive))]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
