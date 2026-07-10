// ──────────────────────────────────────────────────────────────────────────────
// SubmissionStatusTable — Shows submission compliance status per member
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import { toast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import type { User, Report, Project } from "@/types";

interface SubmissionStatusTableProps {
  reports: Report[];
  activeUsers: User[];
  projects: Project[];
  selectedUserId: string;
  selectedProjectId: string;
  loading?: boolean;
}

export function SubmissionStatusTable({
  reports,
  activeUsers,
  projects,
  selectedUserId,
  selectedProjectId,
  loading = false,
}: SubmissionStatusTableProps) {
  // Handle nudge notification
  const handleNudge = (userName: string) => {
    toast.success(`Nudge notification sent to ${userName}!`);
  };

  // Filter active users based on global member filter
  const targetUsers = selectedUserId
    ? activeUsers.filter((u) => u.id === selectedUserId)
    : activeUsers;

  return (
    <div className="bg-[#15161e] border border-[#21222d] rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-[#21222d]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Team Submission Status
        </h3>
      </div>

      <div className="overflow-x-auto w-full">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Spinner />
          </div>
        ) : targetUsers.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No team members registered.
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#21222d]">
                <th className="py-3 px-6 text-[10px] tracking-wider text-slate-400 font-bold uppercase">
                  Team Member
                </th>
                <th className="py-3 px-6 text-[10px] tracking-wider text-slate-400 font-bold uppercase">
                  Submissions Status
                </th>
                <th className="py-3 px-6 text-[10px] tracking-wider text-slate-400 font-bold uppercase">
                  Project
                </th>
                <th className="py-3 px-6 text-[10px] tracking-wider text-slate-400 font-bold uppercase">
                  Hours Worked
                </th>
                <th className="py-3 px-6 text-[10px] tracking-wider text-slate-400 font-bold uppercase">
                  Tasks Completed
                </th>
                <th className="py-3 px-6 text-[10px] tracking-wider text-slate-400 font-bold uppercase">
                  Open Blockers
                </th>
                <th className="py-3 px-6 text-right text-[10px] tracking-wider text-slate-400 font-bold uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {targetUsers.map((user) => {
                // Find report for this user in the reports list
                const report = reports.find((r) => r.user_id === user.id);

                // Determine display variables
                let statusLabel = "Pending";
                let statusClass = "bg-slate-900/50 text-slate-500 border-slate-800/80";
                let projectName = "—";
                let projectColor = "";
                let hoursStr = "—";
                let tasksCompletedCount = 0;
                let openBlockers = 0;

                if (report) {
                  projectName = report.project_name || "—";
                  const matchingProj = projects.find((p) => p.name === report.project_name);
                  projectColor = matchingProj?.color_hex || "#5c59f0";
                  hoursStr = report.hours_worked !== null ? `${report.hours_worked} hrs` : "—";
                  tasksCompletedCount = report.tasks_completed?.length || 0;
                  openBlockers = report.blockers?.filter((b) => !b.is_resolved).length || 0;

                  if (report.status === "SUBMITTED") {
                    statusLabel = "Submitted";
                    statusClass = "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/25";
                  } else if (report.status === "LATE") {
                    statusLabel = "Late";
                    statusClass = "bg-amber-500/10 text-amber-500 border-amber-500/25";
                  } else if (report.status === "DRAFT") {
                    statusLabel = "Draft";
                    statusClass = "bg-slate-800/50 text-slate-400 border-slate-700/50";
                  }
                }

                return (
                  <tr
                    key={user.id}
                    className="border-b border-[#21222d] hover:bg-[#1a1b24]/40 transition-colors text-xs text-slate-200"
                  >
                    {/* Team Member */}
                    <td className="py-4 px-6 font-semibold text-slate-100">
                      {user.full_name}
                    </td>

                    {/* Submission Status */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusClass}`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full mr-1.5 shrink-0 ${
                            statusLabel === "Submitted"
                              ? "bg-[#10b981]"
                              : statusLabel === "Late"
                              ? "bg-amber-500"
                              : statusLabel === "Draft"
                              ? "bg-slate-400"
                              : "bg-slate-600"
                          }`}
                        />
                        {statusLabel}
                      </span>
                    </td>

                    {/* Project */}
                    <td className="py-4 px-6">
                      {projectName !== "—" ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: projectColor }}
                          />
                          <span className="truncate max-w-[150px] font-medium">{projectName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    {/* Hours Worked */}
                    <td className="py-4 px-6 font-medium">
                      {hoursStr !== "—" ? (
                        <span>{hoursStr}</span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    {/* Tasks Completed */}
                    <td className="py-4 px-6 font-medium">
                      {report ? (
                        <span>{tasksCompletedCount} tasks</span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>

                    {/* Open Blockers */}
                    <td className={`py-4 px-6 font-bold ${openBlockers > 0 ? "text-red-500" : "text-slate-400"}`}>
                      {openBlockers}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-right">
                      {report ? (
                        <Link
                          href={`/reports/${report.id}`}
                          className="inline-flex items-center bg-[#5c59f0] hover:bg-[#4b48d9] text-white text-[10px] font-bold px-3 py-1 rounded transition-colors shadow-sm"
                        >
                          View
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleNudge(user.full_name)}
                          className="inline-flex items-center bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white text-[10px] font-bold px-3 py-1 rounded border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                        >
                          Nudge
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
