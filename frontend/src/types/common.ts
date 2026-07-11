// Common Types — Mirrors backend app/core/enums.py and shared response schemas

/** User roles — mirrors backend UserRole enum exactly */
export enum UserRole {
  TEAM_MEMBER = "TEAM_MEMBER",
  MANAGER = "MANAGER",
}

/** Report lifecycle states — mirrors backend ReportStatus enum */
export enum ReportStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  LATE = "LATE",
}

/** Task classification — mirrors backend TaskType enum */
export enum TaskType {
  COMPLETED = "COMPLETED",
  PLANNED = "PLANNED",
}

/**
 * Generic paginated response wrapper.
 * Mirrors backend `PaginatedResponse[T]` schema.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/** Simple message response from API */
export interface MessageResponse {
  message: string;
}

/** Standardized API error shape */
export interface ApiError {
  detail: string;
  status_code: number;
}
