"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import type { Lead } from "@/lib/types";

interface ObjectionRankingProps {
  leads: Lead[];
}

interface ObjectionEntry {
  objection: string;
  count: number;
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function normalizeObjection(obj: string): string {
  return obj.trim().replace(/\s+/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ObjectionEntry }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-xl bg-card border border-border px-4 py-3 shadow-[0_6px_20px_rgba(0,0,0,0.4)] min-w-[160px] backdrop-blur-xl">
      <span className="font-semibold text-foreground">{entry.objection}</span>
      <span className="text-muted-foreground ml-2">{entry.count}x genannt</span>
    </div>
  );
}

export default function ObjectionRanking({ leads }: ObjectionRankingProps) {
  const data = useMemo<ObjectionEntry[]>(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      if (l.objections_raised) {
        l.objections_raised.forEach((obj) => {
          const normalized = normalizeObjection(obj);
          if (normalized) {
            counts[normalized] = (counts[normalized] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(counts)
      .map(([objection, count]) => ({ objection, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [leads]);

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-0.5 w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Top 10 Einwände</CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="h-[360px]">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Keine Einwand-Daten vorhanden
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="objection"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={140}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.2 }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                  {data.map((entry, index) => (
                    <Cell key={entry.objection} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
