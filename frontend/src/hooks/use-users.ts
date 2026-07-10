// ──────────────────────────────────────────────────────────────────────────────
// User Hooks — TanStack Query hooks for user management (admin/manager)
// ──────────────────────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, API_ENDPOINTS, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { User, PaginatedResponse } from "@/types";
import { UserRole } from "@/types/common";

/**
 * Fetch paginated list of users (manager only).
 */
export function useUsers(page: number = 1, pageSize: number = DEFAULT_PAGE_SIZE) {
  return useQuery<PaginatedResponse<User>>({
    queryKey: QUERY_KEYS.users(page),
    queryFn: () =>
      apiClient.get<PaginatedResponse<User>>(API_ENDPOINTS.USERS, {
        page,
        page_size: pageSize,
      }),
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes to prevent duplicate list requests
  });
}

/** Payload for updating a user's role */
interface UpdateUserRolePayload {
  userId: string;
  role: UserRole;
}

/**
 * Update a user's role (manager only).
 * Invalidates the user list cache on success.
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UpdateUserRolePayload>({
    mutationFn: ({ userId, role }) =>
      apiClient.patch<User>(API_ENDPOINTS.USER_ROLE(userId), { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
