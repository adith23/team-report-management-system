// ──────────────────────────────────────────────────────────────────────────────
// Create Report Route Page — Renders the weekly report creation form
// ──────────────────────────────────────────────────────────────────────────────

import { Metadata } from "next";
import { ReportForm } from "@/features/reports";

export const metadata: Metadata = {
  title: "New Report | Team Reports",
  description: "Fill out and submit your weekly report updates.",
};

export default function NewReportPage() {
  return <ReportForm mode="create" />;
}
