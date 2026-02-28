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
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import type { Lead } from "@/lib/types";

interface DropOffAnalysisProps {
  leads: Lead[];
}

interface DropOffEntry {
  phase: string;
  count: number;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: DropOffEntry }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-xl bg-card border border-border px-4 py-3 shadow-[0_6px_20px_rgba(0,0,0,0.4)] min-w-[160px] backdrop-blur-xl">
      <span className="font-semibold text-foreground">{entry.phase}</span>
      <span className="text-muted-foreground ml-2">{entry.count} Abbrüche</span>
    </div>
  );
}

export default function DropOffAnalysis({ leads }: DropOffAnalysisProps) {
  const data = useMemo<DropOffEntry[]>(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      if (l.drop_off_point) {
        const phase = l.drop_off_point;
        counts[phase] = (counts[phase] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([phase, count]) => ({ phase, count }))
      .sort((a, b) => b.count - a.count);
  }, [leads]);

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-0.5 w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Drop-off Analyse</CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="h-[280px]">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Keine Drop-off-Daten vorhanden
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
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
                  dataKey="phase"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.2 }} />
                <Bar dataKey="count" fill="var(--chart-3)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
