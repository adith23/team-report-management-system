// ──────────────────────────────────────────────────────────────────────────────
// WorkloadChart — Renders a bar chart showing workload distribution by project
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { Project, Report } from "@/types";

interface WorkloadChartProps {
  reports: Report[];
  projects: Project[];
  loading?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1c1d26] border border-[#2c2d3c] p-3 rounded-lg shadow-lg text-xs space-y-1">
        <p className="font-semibold text-slate-300">{data.project_name}</p>
        <p className="text-blue-500 font-medium">
          Hours Logged: {data.hours} hrs
        </p>
      </div>
    );
  }
  return null;
};

export function WorkloadChart({
  reports,
  projects,
  loading = false,
}: WorkloadChartProps) {
  // Aggregate hours per project from report list
  const projectHoursMap: Record<string, { hours: number; color: string }> = {};

  // Initialize with all active projects
  projects.forEach((p) => {
    projectHoursMap[p.name] = { hours: 0, color: p.color_hex };
  });

  // Accumulate hours
  reports.forEach((r) => {
    if (r.project_name && r.hours_worked) {
      if (!projectHoursMap[r.project_name]) {
        projectHoursMap[r.project_name] = { hours: 0, color: "#6366f1" };
      }
      projectHoursMap[r.project_name].hours += Number(r.hours_worked);
    }
  });

  const workloadData = Object.entries(projectHoursMap).map(([name, val]) => ({
    project_name: name,
    project_color: val.color,
    hours: val.hours,
  }));

  // Format project names for X-Axis tick truncation: e.g. "Client Portal Redesign" -> "Client.."
  const formatXAxis = (name: string) => {
    return name.length > 8 ? `${name.substring(0, 6)}..` : name;
  };

  return (
    <Card className="flex flex-col h-[380px] bg-[#15161e] border border-[#21222d] rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Workload Distribution by Project (Hours)
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 px-6 pb-6 flex flex-col justify-between">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner />
          </div>
        ) : workloadData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-slate-500">No workload data for this week.</p>
          </div>
        ) : (
          <>
            {/* Bar Chart */}
            <div className="w-full h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={workloadData}
                  margin={{ top: 20, right: 10, left: -25, bottom: 0 }}
                  barGap={0}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#21222d"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="project_name"
                    tickFormatter={formatXAxis}
                    tick={{ fill: "#64748b", fontSize: 9, fontWeight: 500 }}
                    tickLine={false}
                    stroke="#21222d"
                    dy={10}
                  />
                  <YAxis
                    tickFormatter={(val) => `${val}h`}
                    tick={{ fill: "#64748b", fontSize: 9, fontWeight: 500 }}
                    tickLine={false}
                    stroke="#21222d"
                    dx={-5}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="hours"
                    radius={[4, 4, 0, 0]}
                    barSize={28}
                    label={{
                      position: "top",
                      fill: "#fff",
                      fontSize: 9,
                      fontWeight: 600,
                      formatter: (v: number) => (v > 0 ? `${v}h` : ""),
                    }}
                  >
                    {workloadData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.project_color || "#3b82f6"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Flex Legend at bottom */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-4 px-2">
              {workloadData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: entry.project_color }}
                  />
                  <span className="text-[10px] text-slate-400 font-medium">
                    {entry.project_name} ({entry.hours} hrs)
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
