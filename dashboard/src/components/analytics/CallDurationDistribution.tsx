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

interface CallDurationDistributionProps {
  leads: Lead[];
  subtitle?: string;
}

interface DurationBucket {
  label: string;
  count: number;
  minSec: number;
  maxSec: number;
}

const BUCKETS: { label: string; min: number; max: number }[] = [
  { label: "0-1 min", min: 0, max: 60 },
  { label: "1-2 min", min: 60, max: 120 },
  { label: "2-3 min", min: 120, max: 180 },
  { label: "3-5 min", min: 180, max: 300 },
  { label: "5-8 min", min: 300, max: 480 },
  { label: "8+ min", min: 480, max: Infinity },
];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: DurationBucket }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-xl bg-card border border-border px-4 py-3 shadow-[0_6px_20px_rgba(0,0,0,0.4)] min-w-[160px] backdrop-blur-xl">
      <span className="font-semibold text-foreground">{entry.label}</span>
      <span className="text-muted-foreground ml-2">{entry.count} Gespräche</span>
    </div>
  );
}

export default function CallDurationDistribution({ leads, subtitle }: CallDurationDistributionProps) {
  const data = useMemo<DurationBucket[]>(() => {
    return BUCKETS.map((bucket) => {
      const count = leads.filter((l) => {
        const dur = l.call_duration_seconds;
        if (dur === null || dur === undefined) return false;
        return dur >= bucket.min && dur < bucket.max;
      }).length;
      return {
        label: bucket.label,
        count,
        minSec: bucket.min,
        maxSec: bucket.max,
      };
    });
  }, [leads]);

  const hasData = data.some((d) => d.count > 0);

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-px w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Gesprächsdauer</CardTitle>
        {subtitle && <span className="text-xs text-muted-foreground font-medium">{subtitle}</span>}
      </CardHeader>
      <CardContent className="pb-6">
        <div className="h-[280px]">
          {!hasData ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Keine Gesprächsdauer-Daten vorhanden
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ bottom: 5, top: 10 }}>
                <defs>
                  <linearGradient id="gradDuration" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-5)" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="var(--chart-5)" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
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
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.2 }} />
                <Bar dataKey="count" fill="url(#gradDuration)" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
