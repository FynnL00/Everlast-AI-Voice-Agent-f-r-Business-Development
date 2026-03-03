"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import type { Lead } from "@/lib/types";

interface ConnectionRateOverTimeProps {
  leads: Lead[];
  subtitle?: string;
  days?: number;
}

interface DayEntry {
  date: string;
  rate: number;
  connected: number;
  total: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { payload: DayEntry }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-xl bg-card border border-border px-4 py-3 shadow-[0_6px_20px_rgba(0,0,0,0.4)] min-w-[180px] backdrop-blur-xl pointer-events-none">
      <p className="font-semibold text-foreground text-sm">{label}</p>
      <div className="mt-1.5 space-y-0.5">
        <p className="text-sm">
          <span className="text-muted-foreground">Connection Rate: </span>
          <span className="font-bold text-foreground">{entry.rate}%</span>
        </p>
        <p className="text-sm text-muted-foreground">
          {entry.connected} von {entry.total} erreicht
        </p>
      </div>
    </div>
  );
}

export default function ConnectionRateOverTime({ leads, subtitle, days = 30 }: ConnectionRateOverTimeProps) {
  const data = useMemo<DayEntry[]>(() => {
    const now = new Date();
    const bucketCount = Math.max(days, 1);
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - bucketCount);

    const connectedDispositions = new Set([
      "connected",
      "callback",
    ]);

    // Initialize daily buckets
    const dailyData: Record<string, { connected: number; total: number }> = {};
    for (let i = bucketCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        timeZone: "Europe/Berlin",
      });
      dailyData[key] = { connected: 0, total: 0 };
    }

    // Fill buckets with outbound call data
    leads.forEach((l) => {
      if (l.call_direction !== "outbound") return;
      if (l.call_attempts === 0) return;

      const dateStr = l.last_call_attempt_at ?? l.call_started_at ?? l.created_at;
      const dt = new Date(dateStr);
      if (dt < cutoff) return;

      const key = dt.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        timeZone: "Europe/Berlin",
      });

      if (dailyData[key]) {
        dailyData[key].total++;
        if (
          l.disposition_code !== null &&
          connectedDispositions.has(l.disposition_code)
        ) {
          dailyData[key].connected++;
        }
      }
    });

    return Object.entries(dailyData).map(([date, counts]) => ({
      date,
      rate: counts.total > 0 ? Math.round((counts.connected / counts.total) * 100) : 0,
      connected: counts.connected,
      total: counts.total,
    }));
  }, [leads, days]);

  const hasData = data.some((d) => d.total > 0);

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-px w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Connection Rate</CardTitle>
        <div className="flex items-center gap-3">
          <CardDescription>Anteil erreichter Kontakte pro Tag</CardDescription>
          {subtitle && <span className="text-xs text-muted-foreground font-medium">{subtitle}</span>}
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="h-[300px]">
          {!hasData ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Noch keine Outbound-Daten vorhanden.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="connectionRateGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--border)" }} />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="var(--chart-2)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "var(--chart-2)",
                    stroke: "var(--background)",
                    strokeWidth: 2,
                  }}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
