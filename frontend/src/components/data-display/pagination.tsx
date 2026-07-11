// Pagination — Page navigation controls

"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  /** Current page (1-indexed) */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Called when the page changes */
  onPageChange: (page: number) => void;
  /** Additional className */
  className?: string;
}

/**
 * Pagination controls with previous/next buttons and page numbers.
 * Shows a window of page numbers around the current page with ellipsis.
 *
 * @example
 * <Pagination page={currentPage} totalPages={10} onPageChange={setPage} />
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    const delta = 1; // pages around current

    // Always show first page
    pages.push(1);

    const start = Math.max(2, page - delta);
    const end = Math.min(totalPages - 1, page + delta);

    // Left ellipsis
    if (start > 2) {
      pages.push("ellipsis");
    }

    // Middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Right ellipsis
    if (end < totalPages - 1) {
      pages.push("ellipsis");
    }

    // Always show last page (if > 1)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1", className)}
    >
      {/* Previous */}
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={cn(
          "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium",
          "transition-colors duration-200",
          "text-[hsl(var(--muted-foreground))]",
          page <= 1
            ? "pointer-events-none opacity-50"
            : "hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]",
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((p, i) => {
          if (p === "ellipsis") {
            return (
              <span
                key={`ellipsis-${i}`}
                className="px-2 text-[hsl(var(--muted-foreground))]"
                aria-hidden="true"
              >
                …
              </span>
            );
          }

          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium",
                "transition-colors duration-200",
                p === page
                  ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]",
              )}
              aria-current={p === page ? "page" : undefined}
              aria-label={`Page ${p}`}
            >
              {p}
            </button>
          );
        })}
      </div>

      {/* Next */}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={cn(
          "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium",
          "transition-colors duration-200",
          "text-[hsl(var(--muted-foreground))]",
          page >= totalPages
            ? "pointer-events-none opacity-50"
            : "hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]",
        )}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
