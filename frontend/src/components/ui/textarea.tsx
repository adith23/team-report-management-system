// Textarea — Multi-line text input with label, error, and character count

"use client";

import {
  forwardRef,
  type TextareaHTMLAttributes,
  useState,
  useCallback,
} from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label text displayed above the textarea */
  label?: string;
  /** Error message displayed below the textarea */
  error?: string;
  /** Maximum character count (enables the counter display) */
  maxCharacters?: number;
  /** Wrapper className */
  wrapperClassName?: string;
}

/**
 * Textarea with label, error state, and optional character counter.
 *
 * @example
 * <Textarea label="Notes" maxCharacters={500} error={errors.notes?.message} {...register("notes")} />
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      maxCharacters,
      wrapperClassName,
      id,
      rows = 4,
      onChange,
      ...props
    },
    ref,
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const [charCount, setCharCount] = useState(0);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCharCount(e.target.value.length);
        onChange?.(e);
      },
      [onChange],
    );

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

        {/* Textarea */}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={cn(
            // Base
            "flex w-full rounded-lg border bg-transparent px-3 py-2 text-sm",
            "resize-y transition-colors duration-200",
            "placeholder:text-[hsl(var(--muted-foreground))]",
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
          aria-describedby={error ? `${inputId}-error` : undefined}
          onChange={handleChange}
          maxLength={maxCharacters}
          {...props}
        />

        {/* Footer: error + character count */}
        <div className="flex items-center justify-between">
          {error ? (
            <p
              id={`${inputId}-error`}
              className="text-sm text-[hsl(var(--destructive))]"
              role="alert"
            >
              {error}
            </p>
          ) : (
            <span />
          )}

          {maxCharacters && (
            <span
              className={cn(
                "text-xs",
                charCount > maxCharacters * 0.9
                  ? "text-[hsl(var(--destructive))]"
                  : "text-[hsl(var(--muted-foreground))]",
              )}
            >
              {charCount}/{maxCharacters}
            </span>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
