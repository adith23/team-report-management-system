// ──────────────────────────────────────────────────────────────────────────────
// ReportCard — Displays summary of a single weekly report matching mockup theme
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import {
  FileText,
  Calendar,
  Clock,
  AlertTriangle,
  CheckSquare,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/data-display/status-badge";
import { useProjects } from "@/hooks/use-projects";
import { formatWeekRange, formatDate } from "@/lib/date-utils";
import { ROUTES } from "@/lib/constants";
import type { Report } from "@/types";

interface ReportCardProps {
  report: Report;
}

export function ReportCard({ report }: ReportCardProps) {
  const { data: projects } = useProjects();
  const completedCount = report.tasks_completed.length;
  const plannedCount = report.tasks_planned.length;
  const unresolvedBlockers = report.blockers.filter(
    (b) => !b.is_resolved,
  ).length;

  // Resolve matching project color dynamically
  const matchingProj = projects?.find((p) => p.name === report.project_name);
  const projectColor = matchingProj?.color_hex || "#94a3b8";

  return (
    <Card
      hover
      className="overflow-hidden border border-[#21222d] bg-[#15161e]"
    >
      <Link
        href={ROUTES.REPORT_DETAIL(report.id)}
        className="block p-5 space-y-4"
      >
        {/* Header: Week range + Status badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>Week Range</span>
            </div>
            <h3 className="font-semibold text-slate-100 text-sm sm:text-base">
              {formatWeekRange(report.week_start)}
            </h3>
          </div>
          <StatusBadge status={report.status} />
        </div>

        {/* Project Name (Color Tag) */}
        <div className="flex items-center gap-2 pt-1">
          <span
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: projectColor }}
          />
          <span className="text-xs font-semibold text-slate-200">
            {report.project_name || "Uncategorized"}
          </span>
        </div>

        {/* Stats grid: completed tasks, planned tasks, hours, blockers */}
        <div className="grid grid-cols-2 gap-4 border-t border-[#21222d]/60 pt-4">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
              Tasks Completed
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100">
              <CheckSquare className="h-3.5 w-3.5 text-green-500 shrink-0" />
              <span>
                {completedCount} {completedCount === 1 ? "task" : "tasks"}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
              Planned Tasks
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100">
              <FileText className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>
                {plannedCount} {plannedCount === 1 ? "task" : "tasks"}
              </span>
            </div>
          </div>

          {report.hours_worked !== null && (
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                Hours Logged
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{report.hours_worked} hrs</span>
              </div>
            </div>
          )}

          {unresolvedBlockers > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                Active Blockers
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>{unresolvedBlockers} unresolved</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer: Date Submitted */}
        {report.submitted_at && (
          <div className="text-[10px] text-slate-500 border-t border-[#21222d]/60 pt-3">
            Submitted on {formatDate(report.submitted_at)}
          </div>
        )}
      </Link>
    </Card>
  );
}
