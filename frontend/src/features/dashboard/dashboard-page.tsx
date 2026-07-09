// ──────────────────────────────────────────────────────────────────────────────
// DashboardPage — Central workspace combining all manager analytics reports
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { WeekPicker } from "@/components/forms/week-picker";
import { MetricsGrid } from "./metrics-grid";
import { TasksTrendChart } from "./tasks-trend-chart";
import { WorkloadChart } from "./workload-chart";
import { SubmissionStatusTable } from "./submission-status-table";
import { ActivityFeed } from "./activity-feed";
import { getCurrentWeekStart } from "@/lib/date-utils";

export function DashboardPage() {
  const [weekStart, setWeekStart] = useState<string>(getCurrentWeekStart());

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Top Banner and Navigation */}
      <PageHeader
        title="Team Analytics Dashboard"
        subtitle="Gain insights into task completion, project workload distribution, and submission compliance."
        action={
          <WeekPicker
            value={weekStart}
            onChange={setWeekStart}
            allowFuture
          />
        }
      />

      {/* KPI Cards Grid */}
      <MetricsGrid weekStart={weekStart} />

      {/* Charts Section: Line & Pie charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TasksTrendChart />
        <WorkloadChart weekStart={weekStart} />
      </div>

      {/* Timelines and Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubmissionStatusTable weekStart={weekStart} />
        <ActivityFeed />
      </div>
    </div>
  );
}
