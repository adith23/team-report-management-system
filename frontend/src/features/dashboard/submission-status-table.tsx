// ──────────────────────────────────────────────────────────────────────────────
// SubmissionStatusTable — Shows submission compliance status per member
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useSubmissionStatus } from "@/hooks/use-dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatDateTime } from "@/lib/utils";

interface SubmissionStatusTableProps {
  weekStart: string;
}

export function SubmissionStatusTable({ weekStart }: SubmissionStatusTableProps) {
  const { data: statusList, isLoading } = useSubmissionStatus(weekStart);

  return (
    <Card className="flex flex-col h-[400px]">
      <CardHeader className="border-b border-[hsl(var(--border))] pb-4">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          Team Submission Status
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-0">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner />
          </div>
        ) : !statusList || statusList.length === 0 ? (
          <div className="p-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
            No team members registered.
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {statusList.map((item) => (
              <div
                key={item.user_id}
                className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors"
              >
                <div>
                  <h4 className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {item.user_full_name}
                  </h4>
                  {item.submitted_at ? (
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                      Submitted {formatDateTime(item.submitted_at)}
                    </p>
                  ) : (
                    <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                      Waiting for update
                    </p>
                  )}
                </div>

                <div>
                  {item.status === "submitted" && (
                    <Badge variant="success" dot dotColor="bg-green-500">
                      Submitted
                    </Badge>
                  )}
                  {item.status === "pending" && (
                    <Badge variant="warning" dot dotColor="bg-yellow-500">
                      Pending
                    </Badge>
                  )}
                  {item.status === "late" && (
                    <Badge variant="destructive" dot dotColor="bg-red-500" className="animate-pulse">
                      Late
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
