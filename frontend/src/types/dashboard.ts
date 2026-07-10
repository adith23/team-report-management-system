// ──────────────────────────────────────────────────────────────────────────────
// Dashboard Types — Analytics metrics and chart data shapes
// ──────────────────────────────────────────────────────────────────────────────

/** Top-level dashboard KPI metrics */
export interface DashboardMetrics {
  total_reports_this_week: number;
  submission_compliance_rate: number; // 0.0 to 100.0
  open_blockers_count: number;
  total_team_members: number;
}

/** Per-member submission status for a given week */
export interface SubmissionStatusItem {
  user_id: string;
  user_full_name: string;
  status: "submitted" | "pending" | "late";
  submitted_at: string | null;
}

/** Single data point for tasks-completed trend chart */
export interface TaskTrendPoint {
  week_start: string;
  tasks_completed_count: number;
}

/** Workload distribution entry per project */
export interface WorkloadDistribution {
  project_name: string;
  project_color: string;
  task_count: number;
}

/** Recent activity feed entry */
export interface RecentActivity {
  report_id: string;
  user_full_name: string;
  project_name: string;
  action: "submitted" | "updated" | "created";
  timestamp: string;
}
