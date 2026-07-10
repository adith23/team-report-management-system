// ──────────────────────────────────────────────────────────────────────────────
// AI Hooks — TanStack Query hooks for AI chat assistant (Good to Have)
// ──────────────────────────────────────────────────────────────────────────────

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { QUERY_KEYS, API_ENDPOINTS } from "@/lib/constants";

/** Chat message shape */
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Chat request payload */
interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

/** Chat response from the API */
interface ChatResponse {
  response: string;
}

/** Weekly AI summary response */
interface WeeklySummaryResponse {
  summary: string;
  week_start: string;
}

/**
 * Send a chat message to the AI assistant (manager only).
 */
export function useAIChat() {
  return useMutation<ChatResponse, Error, ChatRequest>({
    mutationFn: (data) =>
      apiClient.post<ChatResponse>(API_ENDPOINTS.AI_CHAT, data),
  });
}

/**
 * Fetch the AI-generated weekly summary for a given week (manager only).
 */
export function useWeeklySummary(weekStart: string) {
  return useQuery<WeeklySummaryResponse>({
    queryKey: QUERY_KEYS.weeklySummary(weekStart),
    queryFn: () =>
      apiClient.get<WeeklySummaryResponse>(API_ENDPOINTS.AI_WEEKLY_SUMMARY, {
        week_start: weekStart,
      }),
    enabled: !!weekStart,
    staleTime: 30 * 60 * 1000, // 30 minutes — summaries don't change often
  });
}
