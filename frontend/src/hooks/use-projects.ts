// ──────────────────────────────────────────────────────────────────────────────
// Project Hooks — TanStack Query hooks for project CRUD operations
// ──────────────────────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, API_ENDPOINTS } from "@/lib/constants";
import type { Project, ProjectCreate, ProjectUpdate, ProjectAssignmentRequest, MessageResponse } from "@/types";

/**
 * Fetch all active projects.
 * Used in the report form (project dropdown) and the projects management page.
 */
export function useProjects() {
  return useQuery<Project[]>({
    queryKey: QUERY_KEYS.projects,
    queryFn: () => apiClient.get<Project[]>(API_ENDPOINTS.PROJECTS),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes since projects change infrequently
  });
}

/**
 * Create a new project (manager only).
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, ProjectCreate>({
    mutationFn: (data) => apiClient.post<Project>(API_ENDPOINTS.PROJECTS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects });
    },
  });
}

/**
 * Update an existing project (manager only).
 */
export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, ProjectUpdate>({
    mutationFn: (data) =>
      apiClient.put<Project>(API_ENDPOINTS.PROJECT(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects });
    },
  });
}

/**
 * Delete (soft-delete) a project (manager only).
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation<MessageResponse, Error, string>({
    mutationFn: (id) => apiClient.delete<MessageResponse>(API_ENDPOINTS.PROJECT(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects });
    },
  });
}

/**
 * Assign team members to a project (manager only).
 */
export function useAssignProjectMembers(id: string) {
  const queryClient = useQueryClient();

  return useMutation<Project, Error, ProjectAssignmentRequest>({
    mutationFn: (data) =>
      apiClient.post<Project>(`${API_ENDPOINTS.PROJECT(id)}/assign`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.projects });
    },
  });
}
