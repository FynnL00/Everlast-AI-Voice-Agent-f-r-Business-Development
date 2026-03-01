"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { normalizeObjection } from "@/lib/utils";
import type { Lead } from "@/lib/types";

interface ObjectionTrendProps {
  leads: Lead[];
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-xl bg-card border border-border px-4 py-3 shadow-[0_6px_20px_rgba(0,0,0,0.4)] min-w-[160px] backdrop-blur-xl">
      <p className="text-muted-foreground text-sm mb-2">
        <span className="font-semibold text-foreground">{label}</span>
      </p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.dataKey}:</span>
            <span className="font-bold text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ObjectionTrend({ leads }: ObjectionTrendProps) {
  const { data, top5 } = useMemo(() => {
    // Find top 5 objections overall
    const globalCounts: Record<string, number> = {};
    leads.forEach((l) => {
      if (l.objections_raised) {
        l.objections_raised.forEach((obj) => {
          const normalized = normalizeObjection(obj);
          if (normalized) {
            globalCounts[normalized] = (globalCounts[normalized] || 0) + 1;
          }
        });
      }
    });

    const top5Objections = Object.entries(globalCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    // Group by calendar week (last 4 weeks)
    const now = new Date();
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const weeklyData: Record<string, Record<string, number>> = {};

    leads.forEach((l) => {
      const createdAt = new Date(l.created_at);
      if (createdAt < fourWeeksAgo) return;
      if (!l.objections_raised) return;

      const weekNum = getISOWeek(createdAt);
      const weekKey = `KW ${weekNum}`;

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {};
        top5Objections.forEach((obj) => {
          weeklyData[weekKey][obj] = 0;
        });
      }

      l.objections_raised.forEach((obj) => {
        const normalized = normalizeObjection(obj);
        if (top5Objections.includes(normalized)) {
          weeklyData[weekKey][normalized] = (weeklyData[weekKey][normalized] || 0) + 1;
        }
      });
    });

    // Generate week entries for the last 4 weeks (in order)
    const weeks: string[] = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const weekKey = `KW ${getISOWeek(d)}`;
      if (!weeks.includes(weekKey)) {
        weeks.push(weekKey);
      }
    }

    const chartData = weeks.map((week) => {
      const entry: Record<string, string | number> = { week };
      top5Objections.forEach((obj) => {
        entry[obj] = weeklyData[week]?.[obj] || 0;
      });
      return entry;
    });

    return { data: chartData, top5: top5Objections };
  }, [leads]);

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-0.5 w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Einwand-Trend</CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="h-[320px]">
          {top5.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Keine Einwand-Daten vorhanden
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <defs>
                  {top5.map((_, i) => (
                    <linearGradient key={`objTrend-grad-${i}`} id={`objTrendGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS[i]} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={CHART_COLORS[i]} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--border)" }} />
                <Legend
                  verticalAlign="top"
                  height={32}
                  formatter={(value: string) => (
                    <span className="text-xs text-muted-foreground font-medium ml-1">{value}</span>
                  )}
                />
                {top5.map((objection, i) => (
                  <Area
                    key={objection}
                    type="monotone"
                    dataKey={objection}
                    stackId="objections"
                    stroke={CHART_COLORS[i]}
                    strokeWidth={2}
                    fill={`url(#objTrendGrad-${i})`}
                    dot={false}
                    activeDot={{ r: 4, fill: CHART_COLORS[i], stroke: "var(--background)", strokeWidth: 2 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
