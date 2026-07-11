// DataTable — Generic table with sorting, loading skeleton, and empty state

"use client";

import { useState, useMemo, useCallback } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/data-display/empty-state";

// Column Definition

export interface Column<T> {
  /** Unique key matching a property on the data object */
  key: string;
  /** Display header text */
  header: string;
  /** Enable client-side sorting for this column */
  sortable?: boolean;
  /** Custom render function for cell content */
  render?: (item: T, index: number) => React.ReactNode;
  /** Column header className */
  headerClassName?: string;
  /** Cell className */
  cellClassName?: string;
}

// Props

interface DataTableProps<T> {
  /** Column definitions */
  columns: Column<T>[];
  /** Data array */
  data: T[];
  /** Unique key extractor for each row */
  keyExtractor: (item: T) => string;
  /** Loading state — shows skeleton rows */
  loading?: boolean;
  /** Number of skeleton rows to display while loading */
  skeletonRows?: number;
  /** Empty state configuration */
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  /** Optional click handler for rows */
  onRowClick?: (item: T) => void;
  /** Additional className for the table container */
  className?: string;
}

type SortDirection = "asc" | "desc" | null;

/**
 * Generic data table with client-side sorting, loading skeletons,
 * and configurable empty state.
 *
 * @example
 * <DataTable
 *   columns={[
 *     { key: "name", header: "Name", sortable: true },
 *     { key: "email", header: "Email" },
 *     { key: "role", header: "Role", render: (u) => <Badge>{u.role}</Badge> },
 *   ]}
 *   data={users}
 *   keyExtractor={(u) => u.id}
 *   loading={isLoading}
 * />
 */
export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  loading = false,
  skeletonRows = 5,
  emptyTitle = "No data found",
  emptyDescription = "There are no items to display.",
  emptyAction,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Sort handler

  const handleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        // Cycle: asc → desc → null
        if (sortDirection === "asc") {
          setSortDirection("desc");
        } else if (sortDirection === "desc") {
          setSortKey(null);
          setSortDirection(null);
        }
      } else {
        setSortKey(key);
        setSortDirection("asc");
      }
    },
    [sortKey, sortDirection],
  );

  // Sorted data

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let comparison = 0;
      if (typeof aVal === "string" && typeof bVal === "string") {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [data, sortKey, sortDirection]);

  // Sort icon

  function SortIcon({ columnKey }: { columnKey: string }) {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="h-3.5 w-3.5" />;
    }
    return <ArrowDown className="h-3.5 w-3.5" />;
  }

  // Loading skeleton

  if (loading) {
    return (
      <div
        className={cn(
          "overflow-x-auto rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]",
          className,
        )}
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <tr
                key={i}
                className="border-b border-[hsl(var(--border))] last:border-0"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <Skeleton variant="text" className="h-4 w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty state

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  // Table

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]",
        className,
      )}
    >
      <table className="w-full">
        <thead>
          <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]",
                  col.sortable &&
                    "cursor-pointer select-none hover:text-[hsl(var(--foreground))]",
                  col.headerClassName,
                )}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && <SortIcon columnKey={col.key} />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr
              key={keyExtractor(item)}
              className={cn(
                "border-b border-[hsl(var(--border))] last:border-0",
                "transition-colors hover:bg-[hsl(var(--muted)/0.3)]",
                onRowClick && "cursor-pointer",
              )}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-sm text-[hsl(var(--foreground))]",
                    col.cellClassName,
                  )}
                >
                  {col.render
                    ? col.render(item, index)
                    : ((item[col.key] as React.ReactNode) ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
