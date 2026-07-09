// ──────────────────────────────────────────────────────────────────────────────
// TeamReportsPage — Manager dashboard for searching and viewing all team reports
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import Link from "next/link";
import { Filter, RotateCcw, FileText } from "lucide-react";
import { useTeamReports } from "@/hooks/use-reports";
import { useUsers } from "@/hooks/use-users";
import { useProjects } from "@/hooks/use-projects";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { WeekPicker } from "@/components/forms/week-picker";
import { ReportCard } from "@/features/reports/report-card";
import { SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/data-display/empty-state";
import { Pagination } from "@/components/data-display/pagination";
import { getCurrentWeekStart } from "@/lib/date-utils";
import { ReportStatus } from "@/types/common";
import type { ReportFilters } from "@/types";

export function TeamReportsPage() {
  // Filters State
  const [weekStart, setWeekStart] = useState<string>(getCurrentWeekStart());
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  // Queries
  const { data: usersData } = useUsers(1, 100);
  const { data: projectsData } = useProjects();

  const filters: ReportFilters = {
    week_start: weekStart || undefined,
    user_id: selectedUserId || undefined,
    project_id: selectedProjectId || undefined,
    status: (selectedStatus as ReportStatus) || undefined,
    page,
    page_size: 10,
  };

  const { data: teamReports, isLoading, isError } = useTeamReports(filters);

  // Reset Filters
  const handleClearFilters = () => {
    setWeekStart(getCurrentWeekStart());
    setSelectedUserId("");
    setSelectedProjectId("");
    setSelectedStatus("");
    setPage(1);
  };

  // Dropdown option maps
  const userOptions =
    usersData?.items.map((u) => ({
      value: u.id,
      label: u.full_name,
    })) || [];

  const projectOptions =
    projectsData?.map((p) => ({
      value: p.id,
      label: p.name,
    })) || [];

  const statusOptions = [
    { value: ReportStatus.DRAFT, label: "Draft" },
    { value: ReportStatus.SUBMITTED, label: "Submitted" },
    { value: ReportStatus.LATE, label: "Late" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Team Reports"
        subtitle="Review, audit, and track weekly reports submitted by your team members."
      />

      {/* Filter panel */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--foreground))]">
          <Filter className="h-4 w-4 text-indigo-600" />
          <span>Search Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Week Picker Filter */}
          <div className="space-y-1.5">
            <span className="block text-sm font-medium text-[hsl(var(--foreground))]">
              Select Week
            </span>
            <WeekPicker
              value={weekStart}
              onChange={(val) => {
                setWeekStart(val);
                setPage(1);
              }}
              allowFuture
              className="w-full"
            />
          </div>

          {/* Member Dropdown */}
          <Select
            label="Team Member"
            placeholder="All Members"
            options={userOptions}
            value={selectedUserId}
            onChange={(e) => {
              setSelectedUserId(e.target.value);
              setPage(1);
            }}
          />

          {/* Project Dropdown */}
          <Select
            label="Project"
            placeholder="All Projects"
            options={projectOptions}
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setPage(1);
            }}
          />

          {/* Status Dropdown */}
          <Select
            label="Report Status"
            placeholder="All Statuses"
            options={statusOptions}
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Clear filter action */}
        <div className="flex justify-end pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearFilters}
            className="flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Grid of Results / Loading status */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <EmptyState
          title="Query Error"
          description="Failed to load team reports. Please try adjusting your filters or reloading."
        />
      )}

      {!isLoading && !isError && (!teamReports?.items || teamReports.items.length === 0) && (
        <EmptyState
          title="No reports match your filters"
          description="Try selecting a different week range or changing member and project filters."
          icon={FileText}
        />
      )}

      {!isLoading && !isError && teamReports?.items && teamReports.items.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamReports.items.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>

          {/* Pagination Controls */}
          {teamReports.total_pages > 1 && (
            <div className="flex justify-center border-t border-[hsl(var(--border))] pt-6 mt-6">
              <Pagination
                page={page}
                totalPages={teamReports.total_pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
