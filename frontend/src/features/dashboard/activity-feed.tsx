// ──────────────────────────────────────────────────────────────────────────────
// ActivityFeed — Displays team activity logs and timelines matching mockup UI
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useRecentActivity } from "@/hooks/use-dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { formatRelativeTime } from "@/lib/utils";
import type { Report } from "@/types";

interface ActivityFeedProps {
  reports: Report[];
}

const getAvatarBg = (name: string) => {
  const colors = [
    "bg-blue-600", // Blue
    "bg-[#3b82f6]", // Blue
    "bg-[#8b5cf6]", // Purple
    "bg-[#06b6d4]", // Cyan
    "bg-[#ec4899]", // Pink
  ];
  let sum = 0;
  for (let i = 0; i < name.length; sum += name.charCodeAt(i++));
  return colors[sum % colors.length];
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

export function ActivityFeed({ reports }: ActivityFeedProps) {
  const { data: feed, isLoading } = useRecentActivity();

  return (
    <Card className="flex flex-col bg-[#15161e] border border-[#21222d] rounded-2xl overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-[#21222d]">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Recent Activity Feed
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <Spinner />
          </div>
        ) : !feed || feed.length === 0 ? (
          <div className="text-center text-sm text-slate-500 py-4">
            No recent activity recorded.
          </div>
        ) : (
          <div className="space-y-6">
            {feed.map((activity, idx) => {
              // Find hours if available in current reports
              const matchingReport = reports.find(
                (r) =>
                  r.user_full_name === activity.user_full_name &&
                  r.project_name === activity.project_name
              );
              const hours = matchingReport?.hours_worked;
              const isSubmitted = activity.action === "submitted";

              // Formatting box details
              let detailsText = `Project: ${activity.project_name}`;
              if (isSubmitted && hours !== undefined && hours !== null) {
                detailsText = `Project: ${activity.project_name} (${hours} hrs)`;
              }

              // Determine Action Verb description text
              let actionVerb = "updated draft report";
              let verbMuted = true;

              if (activity.action === "submitted") {
                actionVerb = "submitted weekly report";
                verbMuted = false;
              } else if (activity.action === "created") {
                actionVerb = "created draft report";
                verbMuted = true;
              } else if (activity.action === "updated") {
                actionVerb = "saved draft report";
                verbMuted = true;
              }

              // If action is anything else (e.g. customized statuses in future backend)
              const actionLabel = activity.action as string;
              if (actionLabel.includes("promote") || actionLabel.includes("status")) {
                actionVerb = actionLabel;
                verbMuted = false;
                detailsText = activity.project_name;
              }

              return (
                <div key={activity.report_id + idx} className="flex gap-4 items-start">
                  {/* Circular initials avatar */}
                  <div
                    className={`h-8 w-8 rounded-full ${getAvatarBg(
                      activity.user_full_name
                    )} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}
                  >
                    {getInitials(activity.user_full_name)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-200">
                        <span className="font-semibold text-slate-100 mr-1">
                          {activity.user_full_name}
                        </span>
                        <span className={verbMuted ? "text-slate-400 font-medium" : "text-slate-100 font-semibold"}>
                          {actionVerb}
                        </span>
                      </p>
                      <span className="text-[10px] text-slate-500 font-medium shrink-0">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                    </div>

                    {/* Details Box */}
                    <div className="bg-[#1c1d26] border border-[#2c2d3c] rounded-xl px-4 py-2 text-[10px] font-medium text-slate-400 max-w-max">
                      {detailsText}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
