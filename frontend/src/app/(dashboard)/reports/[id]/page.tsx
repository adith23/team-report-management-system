// ──────────────────────────────────────────────────────────────────────────────
// Report Detail Route Page — Secure view for a single report details
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { use } from "react";
import { ReportDetail } from "@/features/reports";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReportDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);

  return <ReportDetail reportId={resolvedParams.id} />;
}
