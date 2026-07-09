// ──────────────────────────────────────────────────────────────────────────────
// Project Select — Dropdown populated from the projects API
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/use-projects";
import { Spinner } from "@/components/ui/spinner";

export interface ProjectSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Wrapper className */
  wrapperClassName?: string;
}

/**
 * Project dropdown that auto-fetches active projects via `useProjects()`.
 * Displays project name with a color indicator.
 *
 * @example
 * <ProjectSelect
 *   label="Project / Category"
 *   error={errors.project_id?.message}
 *   {...register("project_id")}
 * />
 */
const ProjectSelect = forwardRef<HTMLSelectElement, ProjectSelectProps>(
  ({ className, label, error, wrapperClassName, id, ...props }, ref) => {
    const { data: projects, isLoading } = useProjects();
    const selectId = id || "project-select";

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

        {/* Select or Loading */}
        <div className="relative">
          {isLoading ? (
            <div className="flex h-10 items-center gap-2 rounded-lg border border-[hsl(var(--input))] px-3">
              <Spinner size="sm" />
              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                Loading projects…
              </span>
            </div>
          ) : (
            <select
              ref={ref}
              id={selectId}
              className={cn(
                "flex h-10 w-full appearance-none rounded-lg border bg-transparent px-3 py-2 text-sm",
                "transition-colors duration-200",
                "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat pr-8",
                "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1",
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
              <option value="" disabled>
                Select a project…
              </option>
              {projects?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Error */}
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

ProjectSelect.displayName = "ProjectSelect";

export { ProjectSelect };
