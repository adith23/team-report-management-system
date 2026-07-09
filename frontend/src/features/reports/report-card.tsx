// ──────────────────────────────────────────────────────────────────────────────
// ReportCard — Displays summary of a single weekly report
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import { FileText, Calendar, Clock, AlertTriangle, CheckSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/data-display/status-badge";
import { formatWeekRange, formatDate } from "@/lib/date-utils";
import { ROUTES } from "@/lib/constants";
import type { Report } from "@/types";

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
  const completedCount = report.tasks_completed.length;
  const plannedCount = report.tasks_planned.length;
  const unresolvedBlockers = report.blockers.filter((b) => !b.is_resolved).length;

  return (
    <Card hover className="overflow-hidden">
      <Link href={ROUTES.REPORT_DETAIL(report.id)} className="block p-5 space-y-4">
        {/* Header: Week range + Status badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>Week Range</span>
            </div>
            <h3 className="font-semibold text-[hsl(var(--foreground))] text-base sm:text-lg">
              {formatWeekRange(report.week_start)}
            </h3>
          </div>
          <StatusBadge status={report.status} />
        </div>

        {/* Project Name (Color Tag) */}
        <div className="flex items-center gap-2">
          <span
            className="h-3.5 w-3.5 rounded-full border border-black/10 shrink-0"
            style={{ backgroundColor: report.project_name ? "#4f46e5" : "#94a3b8" }} // Simple placeholder fallback or matching hex colors if color exists
          />
          <span className="text-sm font-medium text-[hsl(var(--foreground))]">
            {report.project_name || "Uncategorized"}
          </span>
        </div>

        {/* Stats grid: completed tasks, planned tasks, hours, blockers */}
        <div className="grid grid-cols-2 gap-4 border-t border-[hsl(var(--border))] pt-4">
          <div className="space-y-1">
            <span className="text-xs text-[hsl(var(--muted-foreground))] block">Tasks Completed</span>
            <div className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--foreground))]">
              <CheckSquare className="h-4 w-4 text-green-500 shrink-0" />
              <span>{completedCount} {completedCount === 1 ? "task" : "tasks"}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-[hsl(var(--muted-foreground))] block">Planned Tasks</span>
            <div className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--foreground))]">
              <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
              <span>{plannedCount} {plannedCount === 1 ? "task" : "tasks"}</span>
            </div>
          </div>

          {report.hours_worked !== null && (
            <div className="space-y-1">
              <span className="text-xs text-[hsl(var(--muted-foreground))] block">Hours Logged</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-[hsl(var(--foreground))]">
                <Clock className="h-4 w-4 text-slate-500 shrink-0" />
                <span>{report.hours_worked} hrs</span>
              </div>
            </div>
          )}

          {unresolvedBlockers > 0 && (
            <div className="space-y-1">
              <span className="text-xs text-[hsl(var(--muted-foreground))] block">Active Blockers</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{unresolvedBlockers} unresolved</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer: Date Submitted */}
        {report.submitted_at && (
          <div className="text-xs text-[hsl(var(--muted-foreground))] border-t border-[hsl(var(--border))] pt-3">
            Submitted on {formatDate(report.submitted_at)}
          </div>
        )}
      </Link>
    </Card>
  );
}
