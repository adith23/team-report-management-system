// ──────────────────────────────────────────────────────────────────────────────
// TasksTrendChart — Renders a line chart showing weekly task completion trends
// ──────────────────────────────────────────────────────────────────────────────

"use client";

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
import { formatWeekRange } from "@/lib/date-utils";
import { Spinner } from "@/components/ui/spinner";
import type { TaskTrendPoint } from "@/types";

interface TasksTrendChartProps {
  selectedUserId?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as TaskTrendPoint;
    return (
      <div className="bg-[#1c1d26] border border-[#2c2d3c] p-3 rounded-lg shadow-lg text-xs space-y-1">
        <p className="font-semibold text-slate-300">
          Week of {formatWeekRange(data.week_start)}
        </p>
        <p className="text-blue-500 font-medium">
          Tasks Completed: {data.tasks_completed_count}
        </p>
      </div>
    );
  }
  return null;
};

export function TasksTrendChart({ selectedUserId }: TasksTrendChartProps) {
  const { data: trendData, isLoading } = useTasksTrend(6, selectedUserId || undefined);

  // Format date ticks: "Jun 1"
  const formatXAxis = (tickItem: string) => {
    try {
      const date = new Date(tickItem);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return tickItem;
    }
  };

  return (
    <Card className="flex flex-col h-[380px] bg-[#15161e] border border-[#21222d] rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Tasks Completed Trend
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 px-6 pb-6 flex items-center justify-center">
        {isLoading ? (
          <Spinner />
        ) : !trendData || trendData.length === 0 ? (
          <p className="text-sm text-slate-500">No trend data available.</p>
        ) : (
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 25, right: 15, left: -25, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#21222d"
                  vertical={false}
                />
                <XAxis
                  dataKey="week_start"
                  tickFormatter={formatXAxis}
                  tick={{ fill: "#64748b", fontSize: 9, fontWeight: 500 }}
                  tickLine={false}
                  stroke="#21222d"
                  dy={10}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#64748b", fontSize: 9, fontWeight: 500 }}
                  tickLine={false}
                  stroke="#21222d"
                  dx={-5}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="tasks_completed_count"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{
                    r: 4,
                    stroke: "#15161e",
                    strokeWidth: 2,
                    fill: "#3b82f6",
                  }}
                  activeDot={{ r: 5, strokeWidth: 0, fill: "#3b82f6" }}
                  label={{
                    fill: "#fff",
                    fontSize: 9,
                    position: "top",
                    dy: -10,
                    fontWeight: 600,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
