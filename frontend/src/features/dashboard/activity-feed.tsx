// ──────────────────────────────────────────────────────────────────────────────
// ActivityFeed — Displays team activity logs and timelines
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useRecentActivity } from "@/hooks/use-dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { formatRelativeTime } from "@/lib/utils";
import { FileText, Plus, FileEdit } from "lucide-react";

export function ActivityFeed() {
  const { data: feed, isLoading } = useRecentActivity();

  return (
    <Card className="flex flex-col h-[400px]">
      <CardHeader className="border-b border-[hsl(var(--border))] pb-4">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          Recent Activity
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-0">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner />
          </div>
        ) : !feed || feed.length === 0 ? (
          <div className="p-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
            No recent activity recorded.
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {feed.map((activity, idx) => (
              <div key={activity.report_id + idx} className="flex gap-3 text-sm">
                <Avatar name={activity.user_full_name} size="sm" className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[hsl(var(--foreground))] text-xs md:text-sm">
                    <span className="font-semibold">{activity.user_full_name}</span>{" "}
                    {activity.action === "submitted" && "submitted a report for"}
                    {activity.action === "created" && "created a draft for"}
                    {activity.action === "updated" && "updated a draft for"}{" "}
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {activity.project_name}
                    </span>
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                    {formatRelativeTime(activity.timestamp)}
                  </p>
                </div>

                <div className="shrink-0">
                  {activity.action === "submitted" && (
                    <div className="h-7 w-7 rounded-full bg-green-500/10 flex items-center justify-center">
                      <FileText className="h-3.5 w-3.5 text-green-600" />
                    </div>
                  )}
                  {activity.action === "created" && (
                    <div className="h-7 w-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Plus className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                  )}
                  {activity.action === "updated" && (
                    <div className="h-7 w-7 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <FileEdit className="h-3.5 w-3.5 text-yellow-600" />
                    </div>
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
