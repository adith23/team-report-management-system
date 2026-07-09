// ──────────────────────────────────────────────────────────────────────────────
// ReportListPage — List view of all weekly reports submitted by user
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { useMyReports } from "@/hooks/use-reports";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/data-display/empty-state";
import { Pagination } from "@/components/data-display/pagination";
import { ReportCard } from "./report-card";
import { ROUTES, DEFAULT_PAGE_SIZE } from "@/lib/constants";

export function ReportListPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useMyReports(page, DEFAULT_PAGE_SIZE);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Header actions slot
  const headerAction = (
    <Link href={ROUTES.NEW_REPORT}>
      <Button variant="primary" size="md">
        <Plus className="h-4 w-4 shrink-0" />
        New Report
      </Button>
    </Link>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Reports"
        subtitle="Manage and track your weekly updates and tasks"
        action={headerAction}
      />

      {/* Loading Skeleton state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && isError && (
        <EmptyState
          title="Failed to load reports"
          description="There was an error communicating with the server. Please try refreshing."
          action={
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          }
        />
      )}

      {/* Empty state */}
      {!isLoading && !isError && (!data?.items || data.items.length === 0) && (
        <EmptyState
          title="No reports created yet"
          description="Create your first weekly report to log tasks completed, planned tasks, and blockers."
          icon={FileText}
          action={
            <Link href={ROUTES.NEW_REPORT}>
              <Button variant="primary">Create Report</Button>
            </Link>
          }
        />
      )}

      {/* Reports Grid list */}
      {!isLoading && !isError && data?.items && data.items.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>

          {/* Pagination Controls */}
          {data.total_pages > 1 && (
            <div className="flex justify-center border-t border-[hsl(var(--border))] pt-6 mt-6">
              <Pagination
                page={page}
                totalPages={data.total_pages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
