// ──────────────────────────────────────────────────────────────────────────────
// Report Hooks — TanStack Query hooks for report CRUD operations
// ──────────────────────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, API_ENDPOINTS, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type {
  Report,
  ReportCreate,
  ReportUpdate,
  ReportFilters,
  PaginatedResponse,
} from "@/types";

/**
 * Fetch the current user's reports with pagination.
 */
export function useMyReports(page: number = 1, pageSize: number = DEFAULT_PAGE_SIZE) {
  return useQuery<PaginatedResponse<Report>>({
    queryKey: QUERY_KEYS.myReports(page),
    queryFn: () =>
      apiClient.get<PaginatedResponse<Report>>(API_ENDPOINTS.MY_REPORTS, {
        page,
        page_size: pageSize,
      }),
  });
}

/**
 * Fetch a single report by ID.
 * Only enabled when `id` is truthy (prevents fetching with empty string).
 */
export function useReport(id: string) {
  return useQuery<Report>({
    queryKey: QUERY_KEYS.report(id),
    queryFn: () => apiClient.get<Report>(API_ENDPOINTS.REPORT(id)),
    enabled: !!id,
  });
}

/**
 * Create a new report.
 * Invalidates the report list cache on success.
 */
export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation<Report, Error, ReportCreate>({
    mutationFn: (data) => apiClient.post<Report>(API_ENDPOINTS.REPORTS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

/**
 * Update an existing report.
 * Invalidates both the specific report and the report list caches.
 */
export function useUpdateReport(id: string) {
  const queryClient = useQueryClient();

  return useMutation<Report, Error, ReportUpdate>({
    mutationFn: (data) => apiClient.put<Report>(API_ENDPOINTS.REPORT(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.report(id) });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

/**
 * Submit a draft report for review.
 * Changes status from DRAFT to SUBMITTED (or LATE if past deadline).
 */
export function useSubmitReport() {
  const queryClient = useQueryClient();

  return useMutation<Report, Error, string>({
    mutationFn: (id) => apiClient.post<Report>(API_ENDPOINTS.SUBMIT_REPORT(id)),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.report(id) });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      // Also invalidate dashboard data since submission affects metrics
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * Fetch team reports with filters (manager only).
 */
export function useTeamReports(filters: ReportFilters) {
  return useQuery<PaginatedResponse<Report>>({
    queryKey: QUERY_KEYS.teamReports(filters),
    queryFn: () =>
      apiClient.get<PaginatedResponse<Report>>(
        API_ENDPOINTS.TEAM_REPORTS,
        filters as Record<string, unknown>,
      ),
  });
}
