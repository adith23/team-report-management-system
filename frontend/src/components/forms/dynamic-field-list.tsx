// ──────────────────────────────────────────────────────────────────────────────
// Dynamic Field List — Add/remove text fields for tasks and blockers
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useCallback } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ── Field item shape ─────────────────────────────────────────────────────────

export interface DynamicFieldItem {
  /** Text content */
  value: string;
  /** Optional metadata (e.g., is_resolved for blockers) */
  meta?: Record<string, unknown>;
}

// ── Props ────────────────────────────────────────────────────────────────────

interface DynamicFieldListProps {
  /** Current field values */
  items: DynamicFieldItem[];
  /** Called when items change */
  onChange: (items: DynamicFieldItem[]) => void;
  /** Placeholder text for new inputs */
  placeholder?: string;
  /** Label for the "Add" button */
  addLabel?: string;
  /** Maximum number of items allowed */
  maxItems?: number;
  /** Minimum number of items (prevents removing below this) */
  minItems?: number;
  /** Whether to show a checkbox for each item (e.g., "Resolved" for blockers) */
  showCheckbox?: boolean;
  /** Checkbox label */
  checkboxLabel?: string;
  /** Checkbox meta key */
  checkboxMetaKey?: string;
  /** Disable all interactions */
  disabled?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Dynamic list of text inputs with "Add Item" and per-item "Remove" buttons.
 * Used for tasks completed, tasks planned, and blockers in the report form.
 * Preserves item order (sort_order derived from array index).
 *
 * @example
 * // Tasks completed
 * <DynamicFieldList
 *   items={tasksCompleted}
 *   onChange={setTasksCompleted}
 *   placeholder="What did you complete this week?"
 *   addLabel="Add Task"
 * />
 *
 * // Blockers with resolved checkbox
 * <DynamicFieldList
 *   items={blockers}
 *   onChange={setBlockers}
 *   placeholder="Describe the blocker..."
 *   addLabel="Add Blocker"
 *   showCheckbox
 *   checkboxLabel="Resolved"
 *   checkboxMetaKey="is_resolved"
 * />
 */
export function DynamicFieldList({
  items,
  onChange,
  placeholder = "Enter item…",
  addLabel = "Add Item",
  maxItems = 20,
  minItems = 0,
  showCheckbox = false,
  checkboxLabel = "Resolved",
  checkboxMetaKey = "is_resolved",
  disabled = false,
  className,
}: DynamicFieldListProps) {
  // ── Add item ─────────────────────────────────────────────────────────────

  const addItem = useCallback(() => {
    if (items.length >= maxItems) return;
    const newItem: DynamicFieldItem = {
      value: "",
      ...(showCheckbox && { meta: { [checkboxMetaKey]: false } }),
    };
    onChange([...items, newItem]);
  }, [items, maxItems, onChange, showCheckbox, checkboxMetaKey]);

  // ── Remove item ──────────────────────────────────────────────────────────

  const removeItem = useCallback(
    (index: number) => {
      if (items.length <= minItems) return;
      onChange(items.filter((_, i) => i !== index));
    },
    [items, minItems, onChange],
  );

  // ── Update item text ─────────────────────────────────────────────────────

  const updateValue = useCallback(
    (index: number, value: string) => {
      const updated = [...items];
      updated[index] = { ...updated[index], value };
      onChange(updated);
    },
    [items, onChange],
  );

  // ── Update checkbox ──────────────────────────────────────────────────────

  const updateCheckbox = useCallback(
    (index: number, checked: boolean) => {
      const updated = [...items];
      updated[index] = {
        ...updated[index],
        meta: { ...updated[index].meta, [checkboxMetaKey]: checked },
      };
      onChange(updated);
    },
    [items, onChange, checkboxMetaKey],
  );

  return (
    <div className={cn("space-y-2", className)}>
      {/* Item list */}
      {items.map((item, index) => (
        <div
          key={index}
          className="group flex items-start gap-2 animate-fade-in"
        >
          {/* Index number */}
          <span className="mt-2.5 text-xs font-medium text-[hsl(var(--muted-foreground))] w-5 text-right shrink-0">
            {index + 1}.
          </span>

          {/* Text input */}
          <input
            type="text"
            value={item.value}
            onChange={(e) => updateValue(index, e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "flex-1 h-10 rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm",
              "transition-colors duration-200",
              "placeholder:text-[hsl(var(--muted-foreground))]",
              "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          />

          {/* Checkbox (for blockers "resolved" state) */}
          {showCheckbox && (
            <label className="flex items-center gap-1.5 mt-2.5 shrink-0 cursor-pointer">
              <input
                type="checkbox"
                checked={!!item.meta?.[checkboxMetaKey]}
                onChange={(e) => updateCheckbox(index, e.target.checked)}
                disabled={disabled}
                className="h-4 w-4 rounded border-[hsl(var(--input))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--ring))]"
              />
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                {checkboxLabel}
              </span>
            </label>
          )}

          {/* Remove button */}
          <button
            type="button"
            onClick={() => removeItem(index)}
            disabled={disabled || items.length <= minItems}
            className={cn(
              "mt-2 rounded p-1 text-[hsl(var(--muted-foreground))]",
              "transition-all duration-200",
              "opacity-0 group-hover:opacity-100 focus:opacity-100",
              "hover:bg-[hsl(var(--destructive)/0.1)] hover:text-[hsl(var(--destructive))]",
              "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]",
              "disabled:pointer-events-none",
            )}
            aria-label={`Remove item ${index + 1}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}

      {/* Add button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={addItem}
        disabled={disabled || items.length >= maxItems}
        className="mt-1"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </Button>
    </div>
  );
}
