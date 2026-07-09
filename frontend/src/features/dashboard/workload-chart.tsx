// ──────────────────────────────────────────────────────────────────────────────
// WorkloadChart — Renders a pie chart showing workload distribution by project
// ──────────────────────────────────────────────────────────────────────────────

"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useWorkloadDistribution } from "@/hooks/use-dashboard";
import { Spinner } from "@/components/ui/spinner";

interface WorkloadChartProps {
  weekStart: string;
}

export function WorkloadChart({ weekStart }: WorkloadChartProps) {
  const { data: workload, isLoading } = useWorkloadDistribution(weekStart);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-3 rounded-lg shadow-lg text-xs space-y-1">
          <p className="font-semibold text-[hsl(var(--foreground))]">
            {data.project_name}
          </p>
          <p className="text-indigo-600 dark:text-indigo-400 font-medium">
            Tasks Count: {data.task_count}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex flex-col h-[400px]">
      <CardHeader className="border-b border-[hsl(var(--border))] pb-4">
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          Workload Distribution by Project
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 p-6 flex items-center justify-center">
        {isLoading ? (
          <Spinner />
        ) : !workload || workload.length === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            No workload data for this week.
          </p>
        ) : (
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workload}
                  dataKey="task_count"
                  nameKey="project_name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  label={({ name, percent }) =>
                    `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  {workload.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.project_color || "#6366f1"}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
