"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useLeads } from "@/lib/leads-context";
import type { Lead } from "@/lib/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { TrendingDown } from "lucide-react";

const FUNNEL_STAGES: Lead["status"][] = [
  "new",
  "contacted",
  "qualified",
  "appointment_booked",
  "converted",
];

export default function PipelineSummary() {
  const { filteredLeads } = useLeads();

  const { chartData, lostCount } = useMemo(() => {
    const counts: Record<Lead["status"], number> = {
      new: 0,
      contacted: 0,
      qualified: 0,
      appointment_booked: 0,
      converted: 0,
      lost: 0,
    };
    for (const lead of filteredLeads) {
      counts[lead.status]++;
    }

    // Compute cumulative counts for funnel view
    const cumulative: number[] = [];
    let sum = 0;
    for (let i = FUNNEL_STAGES.length - 1; i >= 0; i--) {
      sum += counts[FUNNEL_STAGES[i]];
      cumulative[i] = sum;
    }

    const data = FUNNEL_STAGES.map((status, idx) => ({
      name: STATUS_LABELS[status],
      count: cumulative[idx],
      color: STATUS_COLORS[status],
    }));

    return { chartData: data, lostCount: counts.lost };
  }, [filteredLeads]);

  if (filteredLeads.length === 0) return null;

  return (
    <Card className="mb-6 w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Funnel-Übersicht
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.5}
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              width={75}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value} Leads`, "Kumuliert"]}
            />
            <Bar
              dataKey="count"
              radius={[0, 6, 6, 0]}
              maxBarSize={32}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Lost leads indicator */}
        {lostCount > 0 && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
            <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground text-right">
              Verloren
            </span>
            <div className="flex items-center gap-2.5 bg-red-500/10 px-3 py-1.5 rounded-md border border-red-500/20">
              <TrendingDown size={14} className="text-red-400" />
              <span className="text-sm font-bold text-red-400">
                {lostCount}
              </span>
              {filteredLeads.length > 0 && (
                <span className="text-xs font-medium text-red-400/70 ml-1">
                  ({Math.round((lostCount / filteredLeads.length) * 100)}%
                  Verlustrate)
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
