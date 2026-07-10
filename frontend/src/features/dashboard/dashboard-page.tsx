// ──────────────────────────────────────────────────────────────────────────────
// DashboardPage — Central workspace combining all manager analytics reports
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { startOfWeek, endOfWeek, format, subWeeks } from "date-fns";
import dynamic from "next/dynamic";
import { useUsers } from "@/hooks/use-users";
import { useProjects } from "@/hooks/use-projects";
import { useTeamReports } from "@/hooks/use-reports";
import { MetricsGrid } from "./metrics-grid";
import { SubmissionStatusTable } from "./submission-status-table";
import { ActivityFeed } from "./activity-feed";
import { getCurrentWeekStart } from "@/lib/date-utils";

// Dynamically import heavy chart components to reduce initial JS bundle size (lazy loading)
const TasksTrendChart = dynamic(
  () => import("./tasks-trend-chart").then((mod) => mod.TasksTrendChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[350px] bg-[#15161e] rounded-xl flex items-center justify-center border border-[#21222d] animate-pulse">
        <span className="text-slate-500 text-sm font-medium">
          Loading chart...
        </span>
      </div>
    ),
  },
);

const WorkloadChart = dynamic(
  () => import("./workload-chart").then((mod) => mod.WorkloadChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[350px] bg-[#15161e] rounded-xl flex items-center justify-center border border-[#21222d] animate-pulse">
        <span className="text-slate-500 text-sm font-medium">
          Loading chart...
        </span>
      </div>
    ),
  },
);

export function DashboardPage() {
  const [weekStart, setWeekStart] = useState<string>(getCurrentWeekStart());
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Fetch users & projects & reports
  const { data: usersData, isLoading: loadingUsers } = useUsers(1, 100);
  const { data: projectsData, isLoading: loadingProjects } = useProjects();
  const { data: reportsData, isLoading: loadingReports } = useTeamReports({
    week_start: weekStart,
    limit: 100,
  });

  const activeUsers = useMemo(() => usersData?.items || [], [usersData]);
  const projects = useMemo(() => projectsData || [], [projectsData]);
  const reports = useMemo(() => reportsData?.items || [], [reportsData]);

  // Generate week choices for the active filters dropdown memoized to prevent recalculations
  const weekOptions = useMemo(() => {
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
  }, []);

  const handleClearFilters = () => {
    setWeekStart(getCurrentWeekStart());
    setSelectedUserId("");
    setSelectedProjectId("");
  };

  // Memoize filtered reports to avoid expensive array iterations on every re-render
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesUser = !selectedUserId || r.user_id === selectedUserId;
      const matchesProject =
        !selectedProjectId || r.project_id === selectedProjectId;
      return matchesUser && matchesProject;
    });
  }, [reports, selectedUserId, selectedProjectId]);

  return (
    <div className="min-h-screen bg-[#0d0e12] text-slate-100 p-6 space-y-6">
      {/* Top Header / Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <span>Member Workspace</span>
            <span>/</span>
            <span className="text-slate-300">Dashboard</span>
          </nav>
        </div>
        <Link
          href="/reports/new"
          className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-md"
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
            onChange={(e) => setWeekStart(e.target.value)}
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
            onChange={(e) => setSelectedUserId(e.target.value)}
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
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-[#1c1d26] border border-[#2c2d3c] text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer min-w-[140px]"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleClearFilters}
          className="text-xs text-slate-400 hover:text-white font-medium transition-colors cursor-pointer"
        >
          Clear Filters
        </button>
      </div>

      {/* KPI Cards Grid */}
      <MetricsGrid
        reports={filteredReports}
        activeUsers={activeUsers}
        selectedUserId={selectedUserId}
        selectedProjectId={selectedProjectId}
        loading={loadingUsers || loadingReports}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksTrendChart selectedUserId={selectedUserId} />
        <WorkloadChart
          reports={filteredReports}
          projects={projects}
          loading={loadingReports || loadingProjects}
        />
      </div>

      {/* Submission compliance table (Full width) */}
      <div className="w-full">
        <SubmissionStatusTable
          reports={filteredReports}
          activeUsers={activeUsers}
          projects={projects}
          selectedUserId={selectedUserId}
          selectedProjectId={selectedProjectId}
          loading={loadingUsers || loadingReports || loadingProjects}
        />
      </div>

      {/* Recent Activity feed (Full width) */}
      <div className="w-full">
        <ActivityFeed reports={reports} />
      </div>
    </div>
  );
}
