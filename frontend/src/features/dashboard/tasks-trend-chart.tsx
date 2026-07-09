// ──────────────────────────────────────────────────────────────────────────────
// TasksTrendChart — Renders a line chart showing weekly task completion trends
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTasksTrend } from "@/hooks/use-dashboard";
import { useUsers } from "@/hooks/use-users";
import { formatWeekRange } from "@/lib/date-utils";
import { Spinner } from "@/components/ui/spinner";

export function TasksTrendChart() {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const { data: usersData } = useUsers(1, 100); // Fetch all users for dropdown
  const { data: trendData, isLoading } = useTasksTrend(
    12,
    selectedUserId || undefined,
  );

  // Format date ticks: "Jul 1"
  const formatXAxis = (tickItem: string) => {
    try {
      const date = new Date(tickItem);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return tickItem;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-3 rounded-lg shadow-lg text-xs space-y-1">
          <p className="font-semibold text-[hsl(var(--foreground))]">
            Week of {formatWeekRange(data.week_start)}
          </p>
          <p className="text-indigo-600 dark:text-indigo-400 font-medium">
            Tasks Completed: {data.tasks_completed_count}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex flex-col h-[400px]">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-[hsl(var(--border))]">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          Completed Tasks Trend (Last 12 Wks)
        </CardTitle>

        {/* Member filter dropdown */}
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="text-xs h-8 rounded-lg border border-[hsl(var(--input))] bg-transparent px-2 focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]"
        >
          <option value="">All Team Members</option>
          {usersData?.items.map((user) => (
            <option key={user.id} value={user.id}>
              {user.full_name}
            </option>
          ))}
        </select>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 p-6 flex items-center justify-center">
        {isLoading ? (
          <Spinner />
        ) : !trendData || trendData.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            No trend data available.
          </p>
        ) : (
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="week_start"
                  tickFormatter={formatXAxis}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  stroke="hsl(var(--border))"
                  dy={10}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  stroke="hsl(var(--border))"
                  dx={-5}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="tasks_completed_count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{
                    r: 4,
                    stroke: "hsl(var(--primary))",
                    strokeWidth: 1,
                    fill: "hsl(var(--card))",
                  }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
