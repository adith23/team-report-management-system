// TeamReportsPage — Manager dashboard for searching and viewing all team reports

"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { startOfWeek, endOfWeek, format, subWeeks } from "date-fns";
import { useTeamReports } from "@/hooks/use-reports";
import { useUsers } from "@/hooks/use-users";
import { useProjects } from "@/hooks/use-projects";
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
    page_size: 9, // Multiple of 3 looks best in a 3-column grid
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

  // Generate week choices for the active filters dropdown
  const weekOptions = (() => {
    const options = [];
    const today = new Date();
    const currentMonday = startOfWeek(today, { weekStartsOn: 1 });
    for (let i = 0; i < 8; i++) {
      const monday = subWeeks(currentMonday, i);
      const sunday = endOfWeek(monday, { weekStartsOn: 1 });
      const isoString = format(monday, "yyyy-MM-dd");
      const label = `${format(monday, "MMM d")} - ${format(sunday, "MMM d, yyyy")}`;
      options.push({ value: isoString, label });
    }
    return options;
  })();

  const activeUsers = usersData?.items || [];
  const projects = projectsData || [];

  return (
    <div className="min-h-screen bg-[#0d0e12] text-slate-100 p-6 space-y-6">
      {/* Top Header / Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <span>Member Workspace</span>
            <span>/</span>
            <span className="text-slate-300">Team Reports</span>
          </nav>
        </div>
        <Link
          href="/reports/new"
          className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-md h-8"
        >
          <Plus className="h-3.5 w-3.5" />
          Submit Report
        </Link>
      </div>

      {/* ACTIVE FILTERS Bar */}
      <div className="bg-[#15161e] border border-[#21222d] rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase shrink-0">
            Active Filters:
          </span>

          {/* Week Dropdown */}
          <select
            value={weekStart}
            onChange={(e) => {
              setWeekStart(e.target.value);
              setPage(1);
            }}
            className="bg-[#1c1d26] border border-[#2c2d3c] text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer min-w-[180px]"
          >
            {weekOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Members Dropdown */}
          <select
            value={selectedUserId}
            onChange={(e) => {
              setSelectedUserId(e.target.value);
              setPage(1);
            }}
            className="bg-[#1c1d26] border border-[#2c2d3c] text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer min-w-[140px]"
          >
            <option value="">All Members</option>
            {activeUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name}
              </option>
            ))}
          </select>

          {/* Projects Dropdown */}
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setPage(1);
            }}
            className="bg-[#1c1d26] border border-[#2c2d3c] text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer min-w-[140px]"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="bg-[#1c1d26] border border-[#2c2d3c] text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer min-w-[120px]"
          >
            <option value="">All Statuses</option>
            <option value={ReportStatus.DRAFT}>Draft</option>
            <option value={ReportStatus.SUBMITTED}>Submitted</option>
            <option value={ReportStatus.LATE}>Late</option>
          </select>
        </div>

        <button
          onClick={handleClearFilters}
          className="text-xs text-slate-400 hover:text-white font-medium transition-colors cursor-pointer"
        >
          Clear Filters
        </button>
      </div>

      {/* Section Divider */}
      <div className="flex items-center justify-between border-b border-[#21222d] pb-4">
        <h2 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
          Team Reports History
        </h2>
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
          description="Failed to load team reports. Please try refreshing."
        />
      )}

      {!isLoading &&
        !isError &&
        (!teamReports?.items || teamReports.items.length === 0) && (
          <EmptyState
            title="No reports match your filters"
            description="Try selecting a different week range or changing member and project filters."
            icon={FileText}
          />
        )}

      {!isLoading &&
        !isError &&
        teamReports?.items &&
        teamReports.items.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamReports.items.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>

            {/* Pagination Controls */}
            {teamReports.total_pages > 1 && (
              <div className="flex justify-center border-t border-[#21222d] pt-6 mt-6">
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
