// ──────────────────────────────────────────────────────────────────────────────
// Dashboard Hooks — TanStack Query hooks for analytics data (manager only)
// ──────────────────────────────────────────────────────────────────────────────

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, API_ENDPOINTS } from "@/lib/constants";
import type {
  DashboardMetrics,
  SubmissionStatusItem,
  TaskTrendPoint,
  WorkloadDistribution,
  RecentActivity,
} from "@/types";

/**
 * Fetch top-level KPI metrics for a given week.
 * Returns: total reports, compliance rate, open blockers, team member count.
 */
export function useMetrics(weekStart: string) {
  return useQuery<DashboardMetrics>({
    queryKey: QUERY_KEYS.metrics(weekStart),
    queryFn: () =>
      apiClient.get<DashboardMetrics>(API_ENDPOINTS.DASHBOARD_METRICS, {
        week_start: weekStart,
      }),
    enabled: !!weekStart,
    staleTime: 60 * 1000, // Cache metrics for 1 minute
  });
}

/**
 * Fetch per-member submission status for a given week.
 * Shows who has submitted, who is pending, and who is late.
 */
export function useSubmissionStatus(weekStart: string) {
  return useQuery<SubmissionStatusItem[]>({
    queryKey: QUERY_KEYS.submissionStatus(weekStart),
    queryFn: () =>
      apiClient.get<SubmissionStatusItem[]>(
        API_ENDPOINTS.DASHBOARD_SUBMISSION_STATUS,
        { week_start: weekStart },
      ),
    enabled: !!weekStart,
    staleTime: 60 * 1000, // Cache compliance list for 1 minute
  });
}

/**
 * Fetch tasks-completed trend data over N weeks.
 * Optional `userId` filter for per-member drill-down.
 */
export function useTasksTrend(weeks: number = 12, userId?: string) {
  return useQuery<TaskTrendPoint[]>({
    queryKey: QUERY_KEYS.tasksTrend(weeks, userId),
    queryFn: () =>
      apiClient.get<TaskTrendPoint[]>(API_ENDPOINTS.DASHBOARD_TASKS_TREND, {
        weeks,
        ...(userId && { user_id: userId }),
      }),
    staleTime: 60 * 1000, // Cache task trend metrics for 1 minute
  });
}

/**
 * Fetch workload distribution by project for a given week.
 * Used for the pie/bar chart showing task distribution across projects.
 */
export function useWorkloadDistribution(weekStart: string) {
  return useQuery<WorkloadDistribution[]>({
    queryKey: QUERY_KEYS.workloadDistribution(weekStart),
    queryFn: () =>
      apiClient.get<WorkloadDistribution[]>(
        API_ENDPOINTS.DASHBOARD_WORKLOAD,
        { week_start: weekStart },
      ),
    enabled: !!weekStart,
    staleTime: 60 * 1000, // Cache workload distribution details for 1 minute
  });
}

/**
 * Fetch recent activity feed across the team.
 * Shows the latest report submissions, updates, and creations.
 */
export function useRecentActivity() {
  return useQuery<RecentActivity[]>({
    queryKey: QUERY_KEYS.recentActivity,
    queryFn: () =>
      apiClient.get<RecentActivity[]>(API_ENDPOINTS.DASHBOARD_RECENT_ACTIVITY),
    staleTime: 60 * 1000, // Cache activity feed logs for 1 minute
  });
}
