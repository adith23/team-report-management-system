// ──────────────────────────────────────────────────────────────────────────────
// MetricsGrid — Renders top-level KPI metrics cards
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { FileText, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { MetricCard } from "@/components/data-display/metric-card";
import { useMetrics } from "@/hooks/use-dashboard";

interface MetricsGridProps {
  weekStart: string;
}

export function MetricsGrid({ weekStart }: MetricsGridProps) {
  const { data: metrics, isLoading } = useMetrics(weekStart);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Reports */}
      <MetricCard
        icon={FileText}
        iconColor="bg-indigo-600"
        value={metrics?.total_reports_this_week ?? 0}
        label="Reports This Week"
        loading={isLoading}
      />

      {/* Compliance Rate */}
      <MetricCard
        icon={CheckCircle}
        iconColor="bg-emerald-600"
        value={`${Math.round(metrics?.submission_compliance_rate ?? 0)}%`}
        label="Compliance Rate"
        loading={isLoading}
      />

      {/* Open Blockers */}
      <MetricCard
        icon={AlertTriangle}
        iconColor="bg-red-500"
        value={metrics?.open_blockers_count ?? 0}
        label="Open Blockers"
        loading={isLoading}
      />

      {/* Team Members */}
      <MetricCard
        icon={Users}
        iconColor="bg-sky-500"
        value={metrics?.total_team_members ?? 0}
        label="Team Members"
        loading={isLoading}
      />
    </div>
  );
}
