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
  LabelList,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import type { Lead } from "@/lib/types";

interface DropOffAnalysisProps {
  leads: Lead[];
}

interface DropOffEntry {
  phase: string;
  count: number;
  percentage: number;
  barSize: number;
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
      <span className="text-muted-foreground ml-2">{entry.count} Abbrüche ({entry.percentage}%)</span>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderBarLabel(props: any) {
  const { x, y, width, height, value } = props;
  if (!value) return null;
  return (
    <text
      x={(x as number) + (width as number) + 8}
      y={(y as number) + (height as number) / 2}
      fill="var(--muted-foreground)"
      fontSize={11}
      fontWeight={600}
      dominantBaseline="central"
    >
      {value}
    </text>
  );
}

// Funnel bar sizes: decreasing widths to create funnel effect
const FUNNEL_SIZES = [28, 24, 20, 16, 14, 12, 10, 8];
const FUNNEL_OPACITIES = [0.95, 0.85, 0.75, 0.65, 0.55, 0.5, 0.45, 0.4];

export default function DropOffAnalysis({ leads }: DropOffAnalysisProps) {
  const data = useMemo<DropOffEntry[]>(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      if (l.drop_off_point) {
        const phase = l.drop_off_point;
        counts[phase] = (counts[phase] || 0) + 1;
      }
    });
    const sorted = Object.entries(counts)
      .map(([phase, count]) => ({ phase, count }))
      .sort((a, b) => b.count - a.count);

    const maxCount = sorted.length > 0 ? sorted[0].count : 1;
    return sorted.map((entry, i) => ({
      ...entry,
      percentage: Math.round((entry.count / maxCount) * 100),
      barSize: FUNNEL_SIZES[Math.min(i, FUNNEL_SIZES.length - 1)],
    }));
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
              <BarChart data={data} layout="vertical" margin={{ left: 20, right: 50 }}>
                <defs>
                  {data.map((_, i) => (
                    <linearGradient key={i} id={`gradDropOff${i}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={FUNNEL_OPACITIES[Math.min(i, FUNNEL_OPACITIES.length - 1)]} />
                      <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={FUNNEL_OPACITIES[Math.min(i, FUNNEL_OPACITIES.length - 1)] * 0.4} />
                    </linearGradient>
                  ))}
                </defs>
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
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.phase}
                      fill={`url(#gradDropOff${index})`}
                    />
                  ))}
                  <LabelList dataKey="count" content={renderBarLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
