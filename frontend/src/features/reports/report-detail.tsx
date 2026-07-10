// ──────────────────────────────────────────────────────────────────────────────
// ReportDetail — Read-only detail view of a weekly report
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Send,
  Calendar,
  CheckCircle,
  FileText,
  AlertTriangle,
  Clock,
  BookOpen,
} from "lucide-react";
import { useReport, useSubmitReport } from "@/hooks/use-reports";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/data-display/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { formatWeekRange, formatDate } from "@/lib/date-utils";
import { ROUTES } from "@/lib/constants";
import { ReportStatus } from "@/types/common";
import { toast } from "@/components/ui/toast";

interface ReportDetailProps {
  reportId: string;
}

export function ReportDetail({ reportId }: ReportDetailProps) {
  const router = useRouter();
  const { data: report, isLoading, isError, refetch } = useReport(reportId);

  const submitMutation = useSubmitReport();

  const handleSubmitting = () => {
    submitMutation.mutate(reportId, {
      onSuccess: () => {
        toast.success("Report submitted successfully!");
        refetch();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to submit report.");
      },
    });
  };

  const handleEditClick = () => {
    if (!report) return;
    router.push(ROUTES.REPORT_EDIT(reportId));
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Report Not Found</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          {"The requested report doesn't exist or you don't have access."}
        </p>
        <Link href={ROUTES.REPORTS} className="mt-6 inline-block">
          <Button variant="secondary">Back to Reports</Button>
        </Link>
      </div>
    );
  }

  const isPendingActions = submitMutation.isPending;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header / Breadcrumbs */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <span>Member Workspace</span>
            <span>/</span>
            <Link
              href={ROUTES.REPORTS}
              className="hover:text-slate-300 transition-colors"
            >
              Weekly Reports
            </Link>
            <span>/</span>
            <span className="text-slate-300">Detail</span>
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleEditClick}
            disabled={isPendingActions}
            className="bg-transparent border border-[#2c2d3c] hover:bg-slate-800 text-slate-300 hover:text-white text-xs px-3 py-1.5 h-8 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="h-3.5 w-3.5" />
            {report.status === ReportStatus.DRAFT
              ? "Edit Draft"
              : "Re-open & Edit"}
          </Button>

          {report.status === ReportStatus.DRAFT && (
            <Button
              variant="primary"
              onClick={handleSubmitting}
              loading={isPendingActions}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 h-8 rounded-lg transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Send className="h-3.5 w-3.5" />
              Submit Report
            </Button>
          )}
        </div>
      </div>

      {/* Main Title Block */}
      <PageHeader
        title={`Weekly Report: ${formatWeekRange(report.week_start)}`}
        subtitle={`Submitted by ${report.user_full_name}`}
        action={<StatusBadge status={report.status} size="md" />}
      />

      {/* Metadata card: Project, hours, submit status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4 p-5">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Project / Category
            </p>
            <h4 className="font-semibold text-sm mt-0.5">
              {report.project_name || "Uncategorized"}
            </h4>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Hours Logged
            </p>
            <h4 className="font-semibold text-sm mt-0.5">
              {report.hours_worked !== null
                ? `${report.hours_worked} hours`
                : "None recorded"}
            </h4>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
            <CheckCircle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Submission Status
            </p>
            <h4 className="font-semibold text-sm mt-0.5">
              {report.submitted_at
                ? `Submitted on ${formatDate(report.submitted_at)}`
                : "Not submitted yet"}
            </h4>
          </div>
        </Card>
      </div>

      {/* Lists of tasks and blockers */}
      <div className="space-y-6">
        {/* Completed Tasks */}
        <Card>
          <CardHeader className="border-b border-[hsl(var(--border))] py-4 px-6">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-green-700 dark:text-green-400 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Tasks Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {report.tasks_completed.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                No completed tasks recorded.
              </p>
            ) : (
              <ul className="space-y-3">
                {report.tasks_completed.map((task, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2.5">
                    <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] w-5 text-right mt-0.5 shrink-0">
                      {idx + 1}.
                    </span>
                    <span className="text-[hsl(var(--foreground))]">
                      {task.description}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Planned Tasks */}
        <Card>
          <CardHeader className="border-b border-[hsl(var(--border))] py-4 px-6">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Tasks Planned for Next Week
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {report.tasks_planned.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                No planned tasks recorded.
              </p>
            ) : (
              <ul className="space-y-3">
                {report.tasks_planned.map((task, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2.5">
                    <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] w-5 text-right mt-0.5 shrink-0">
                      {idx + 1}.
                    </span>
                    <span className="text-[hsl(var(--foreground))]">
                      {task.description}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Blockers */}
        <Card>
          <CardHeader className="border-b border-[hsl(var(--border))] py-4 px-6">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Blockers & Challenges
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {report.blockers.length === 0 ? (
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                No blockers recorded this week.
              </p>
            ) : (
              <ul className="space-y-3">
                {report.blockers.map((blocker, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2.5">
                    <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))] w-5 text-right mt-0.5 shrink-0">
                      {idx + 1}.
                    </span>
                    <div className="flex-1">
                      <span
                        className={
                          blocker.is_resolved
                            ? "line-through text-[hsl(var(--muted-foreground))]"
                            : "text-[hsl(var(--foreground))]"
                        }
                      >
                        {blocker.description}
                      </span>
                      {blocker.is_resolved && (
                        <span className="ml-2 inline-flex items-center rounded bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/15">
                          Resolved
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Additional Notes */}
        {report.notes && (
          <Card>
            <CardHeader className="border-b border-[hsl(var(--border))] py-4 px-6">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Notes / Links
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-[hsl(var(--foreground))] whitespace-pre-line leading-relaxed">
                {report.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
