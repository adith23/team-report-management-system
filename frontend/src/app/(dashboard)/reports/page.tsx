// ──────────────────────────────────────────────────────────────────────────────
// My Reports Route Page — Lists reports created by the current user
// ──────────────────────────────────────────────────────────────────────────────

import { Metadata } from "next";
import { ReportListPage } from "@/features/reports";

export const metadata: Metadata = {
  title: "My Reports | Team Reports",
  description: "View and manage your weekly reports.",
};

export default function ReportsPage() {
  return <ReportListPage />;
}
