// Constants — Application-wide constants, query keys, routes, and config maps

import { UserRole, ReportStatus } from "@/types/common";
import type { ReportFilters } from "@/types";

// TanStack Query Keys
// Centralized query key factory. Using `as const` ensures type safety
// and enables precise cache invalidation.

export const QUERY_KEYS = {
  // Auth
  currentUser: ["auth", "me"] as const,

  // Reports
  myReports: (page: number) => ["reports", "my", page] as const,
  report: (id: string) => ["reports", id] as const,
  teamReports: (filters: ReportFilters) =>
    ["reports", "team", filters] as const,

  // Projects
  projects: ["projects"] as const,

  // Dashboard
  metrics: (weekStart: string) => ["dashboard", "metrics", weekStart] as const,
  submissionStatus: (weekStart: string) =>
    ["dashboard", "submission-status", weekStart] as const,
  tasksTrend: (weeks: number, userId?: string) =>
    ["dashboard", "tasks-trend", weeks, userId] as const,
  workloadDistribution: (weekStart: string) =>
    ["dashboard", "workload", weekStart] as const,
  recentActivity: ["dashboard", "recent-activity"] as const,

  // Users
  users: (page: number) => ["users", page] as const,

  // AI
  aiChat: ["ai", "chat"] as const,
  weeklySummary: (weekStart: string) => ["ai", "summary", weekStart] as const,
} as const;

// Route Paths
// Centralized route definitions prevent hardcoded strings and enable
// type-safe navigation.

export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  REPORTS: "/reports",
  NEW_REPORT: "/reports/new",
  REPORT_DETAIL: (id: string) => `/reports/${id}`,
  REPORT_EDIT: (id: string) => `/reports/${id}/edit`,
  DASHBOARD: "/dashboard",
  TEAM_REPORTS: "/team-reports",
  PROJECTS: "/projects",
  USERS: "/users",
  AI_ASSISTANT: "/ai-assistant",
} as const;

// Navigation Items
// Role-aware navigation configuration consumed by the sidebar component.
// `icon` maps to Lucide icon component names.

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: readonly UserRole[];
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    label: "My Reports",
    href: ROUTES.REPORTS,
    icon: "FileText",
    roles: [UserRole.TEAM_MEMBER, UserRole.MANAGER],
  },
  {
    label: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: "LayoutDashboard",
    roles: [UserRole.MANAGER],
  },
  {
    label: "Team Reports",
    href: ROUTES.TEAM_REPORTS,
    icon: "Users",
    roles: [UserRole.MANAGER],
  },
  {
    label: "Projects",
    href: ROUTES.PROJECTS,
    icon: "FolderKanban",
    roles: [UserRole.MANAGER],
  },
  {
    label: "User Management",
    href: ROUTES.USERS,
    icon: "Shield",
    roles: [UserRole.MANAGER],
  },
  {
    label: "AI Assistant",
    href: ROUTES.AI_ASSISTANT,
    icon: "Bot",
    roles: [UserRole.MANAGER],
  },
] as const;

// Report Status Display Configuration
// Maps each ReportStatus to its label and Tailwind color classes for the
// status badge component.

export interface StatusConfig {
  label: string;
  color: string;
  dotColor: string;
}

export const STATUS_CONFIG: Record<ReportStatus, StatusConfig> = {
  [ReportStatus.DRAFT]: {
    label: "Draft",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    dotColor: "bg-yellow-500",
  },
  [ReportStatus.SUBMITTED]: {
    label: "Submitted",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    dotColor: "bg-green-500",
  },
  [ReportStatus.LATE]: {
    label: "Late",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    dotColor: "bg-red-500",
  },
};

// Pagination Defaults

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// API Endpoints
// Centralized API endpoint strings for use with the API client.

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  ME: "/auth/me",

  // Reports
  REPORTS: "/reports",
  MY_REPORTS: "/reports/my",
  REPORT: (id: string) => `/reports/${id}`,
  SUBMIT_REPORT: (id: string) => `/reports/${id}/submit`,
  TEAM_REPORTS: "/reports/team",

  // Projects
  PROJECTS: "/projects",
  PROJECT: (id: string) => `/projects/${id}`,

  // Dashboard
  DASHBOARD_METRICS: "/dashboard/metrics",
  DASHBOARD_SUBMISSION_STATUS: "/dashboard/submission-status",
  DASHBOARD_TASKS_TREND: "/dashboard/tasks-trend",
  DASHBOARD_WORKLOAD: "/dashboard/workload-distribution",
  DASHBOARD_RECENT_ACTIVITY: "/dashboard/recent-activity",

  // Users
  USERS: "/users",
  USER_ROLE: (id: string) => `/users/${id}/role`,

  // AI
  AI_CHAT: "/ai/chat",
  AI_WEEKLY_SUMMARY: "/ai/weekly-summary",
} as const;
