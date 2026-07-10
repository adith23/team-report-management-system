// ──────────────────────────────────────────────────────────────────────────────
// API Types — Generic response wrappers for the API client layer
// ──────────────────────────────────────────────────────────────────────────────

/** Structured API error returned by the backend */
export interface ApiErrorResponse {
  detail: string;
  status_code?: number;
}

/**
 * Generic API response wrapper.
 * Used when the backend wraps data in a standardized envelope.
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}
