// ──────────────────────────────────────────────────────────────────────────────
// Edit Report Route Page — Secure view for modifying a report
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { use } from "react";
import { ReportForm } from "@/features/reports";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditReportPage({ params }: PageProps) {
  const resolvedParams = use(params);

  return <ReportForm mode="edit" reportId={resolvedParams.id} />;
}
