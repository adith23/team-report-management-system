// ──────────────────────────────────────────────────────────────────────────────
// AI Assistant Page Route — Entry point for manager AI chat panel
// ──────────────────────────────────────────────────────────────────────────────

import { AIChatPage } from "@/features/ai/chat-page";

export const metadata = {
  title: "AI Assistant",
  description: "AI-powered conversational Q&A and weekly summaries.",
};

export default function Page() {
  return <AIChatPage />;
}
