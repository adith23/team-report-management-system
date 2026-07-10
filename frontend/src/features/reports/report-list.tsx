// ──────────────────────────────────────────────────────────────────────────────
// ReportListPage — List view of all weekly reports submitted by user
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { useMyReports } from "@/hooks/use-reports";
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

  return (
    <div className="space-y-6">
      {/* Top Header / Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <span>Member Workspace</span>
            <span>/</span>
            <span className="text-slate-300">Weekly Reports</span>
          </nav>
        </div>
        <Link
          href={ROUTES.NEW_REPORT}
          className="inline-flex items-center gap-1 bg-[#5c59f0] hover:bg-[#4b48d9] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-md h-8"
        >
          <Plus className="h-3.5 w-3.5" />
          New Report
        </Link>
      </div>

      {/* Page Title Section Divider */}
      <div className="flex items-center justify-between border-b border-[#21222d] pb-4">
        <h2 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
          My Weekly Reports
        </h2>
      </div>

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
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
              className="bg-transparent border border-[#2c2d3c] text-slate-300 text-xs px-3 py-1.5 h-8 rounded-lg cursor-pointer hover:bg-slate-800 hover:text-white"
            >
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
            <Link
              href={ROUTES.NEW_REPORT}
              className="inline-flex items-center gap-1 bg-[#5c59f0] hover:bg-[#4b48d9] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-md"
            >
              Create Report
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
            <div className="flex justify-center border-t border-[#21222d] pt-6 mt-6">
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
