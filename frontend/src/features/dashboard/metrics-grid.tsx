// ──────────────────────────────────────────────────────────────────────────────
// MetricsGrid — Renders top-level KPI metrics cards matching uploaded UI style
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { Check, Files, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { User, Report } from "@/types";

interface MetricsGridProps {
  reports: Report[];
  activeUsers: User[];
  selectedUserId: string;
  selectedProjectId: string;
  loading?: boolean;
}

export function MetricsGrid({
  reports,
  activeUsers,
  selectedUserId,
  selectedProjectId,
  loading = false,
}: MetricsGridProps) {
  // 1. Calculate Compliance Rate
  const totalUsers = selectedUserId ? 1 : activeUsers.length;
  let submittedCount = 0;

  if (selectedUserId) {
    const hasSubmitted = reports.some(
      (r) => r.user_id === selectedUserId && (r.status === "SUBMITTED" || r.status === "LATE")
    );
    submittedCount = hasSubmitted ? 1 : 0;
  } else {
    // Count distinct user_ids that have submitted reports
    const submittedUserIds = new Set(
      reports
        .filter((r) => r.status === "SUBMITTED" || r.status === "LATE")
        .map((r) => r.user_id)
    );
    submittedCount = submittedUserIds.size;
  }

  const complianceRate = totalUsers > 0 ? Math.round((submittedCount / totalUsers) * 100) : 0;

  // 2. Calculate Total Submissions
  const totalSubmissions = reports.filter(
    (r) => r.status === "SUBMITTED" || r.status === "LATE"
  ).length;

  // 3. Calculate Open Blockers
  let openBlockersCount = 0;
  reports.forEach((r) => {
    r.blockers.forEach((b) => {
      if (!b.is_resolved) {
        openBlockersCount++;
      }
    });
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-[120px] rounded-2xl bg-[#15161e]" />
        <Skeleton className="h-[120px] rounded-2xl bg-[#15161e]" />
        <Skeleton className="h-[120px] rounded-2xl bg-[#15161e]" />
      </div>
    );
  }

  // Circular progress parameter
  const radius = 18;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (complianceRate / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Compliance Rate Card */}
      <div className="bg-[#15161e] border border-[#21222d] rounded-2xl p-6 flex items-center justify-between shadow-sm relative">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
            Compliance Rate
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">{complianceRate}%</span>
            <span className="text-xs font-semibold text-[#10b981]">
              {submittedCount} of {totalUsers} submitted
            </span>
          </div>
        </div>

        {/* Circular Progress Gauge & Icon */}
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="stroke-slate-800"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="stroke-[#10b981]"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="h-6 w-6 rounded-full bg-[#10b981]/10 flex items-center justify-center border border-[#10b981]/25 text-[#10b981]">
            <Check className="h-3 w-3 stroke-[3]" />
          </div>
        </div>
      </div>

      {/* 2. Total Submissions Card */}
      <div className="bg-[#15161e] border border-[#21222d] rounded-2xl p-6 flex items-center justify-between shadow-sm relative">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
            Total Submissions
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">{totalSubmissions}</span>
            <span className="text-xs font-medium text-slate-500">
              Reports submitted
            </span>
          </div>
        </div>

        <div className="h-7 w-7 rounded-lg bg-[#5c59f0]/10 flex items-center justify-center border border-[#5c59f0]/25 text-[#5c59f0]">
          <Files className="h-4 w-4" />
        </div>
      </div>

      {/* 3. Open Blockers Card */}
      <div className="bg-[#15161e] border border-[#21222d] rounded-2xl p-6 flex items-center justify-between shadow-sm relative">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
            Open Blockers
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-red-500">{openBlockersCount}</span>
            <span className="text-xs font-semibold text-red-500/80">
              Unresolved blocker challenges
            </span>
          </div>
        </div>

        <div className="h-7 w-7 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/25 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
          <AlertCircle className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
