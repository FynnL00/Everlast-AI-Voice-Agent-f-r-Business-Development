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
import { SENTIMENT_COLORS } from "@/lib/types";
import type { Lead } from "@/lib/types";

interface SentimentOverTimeProps {
  leads: Lead[];
  subtitle?: string;
  days?: number;
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

export default function SentimentOverTime({ leads, subtitle, days = 30 }: SentimentOverTimeProps) {
  const data = useMemo(() => {
    const now = new Date();
    const bucketCount = Math.max(days, 1);
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - bucketCount);

    // Initialize daily buckets
    const dailyData: Record<string, { positiv: number; neutral: number; negativ: number }> = {};
    for (let i = bucketCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", timeZone: "Europe/Berlin" });
      dailyData[key] = { positiv: 0, neutral: 0, negativ: 0 };
    }

    // Fill buckets
    leads.forEach((l) => {
      if (!l.sentiment) return;
      const createdAt = new Date(l.created_at);
      if (createdAt < cutoff) return;

      const key = createdAt.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", timeZone: "Europe/Berlin" });
      if (dailyData[key] && l.sentiment in dailyData[key]) {
        dailyData[key][l.sentiment]++;
      }
    });

    return Object.entries(dailyData).map(([date, counts]) => ({
      date,
      Positiv: counts.positiv,
      Neutral: counts.neutral,
      Negativ: counts.negativ,
    }));
  }, [leads, days]);

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-px w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Sentiment-Verlauf</CardTitle>
        {subtitle && <span className="text-xs text-muted-foreground font-medium">{subtitle}</span>}
      </CardHeader>
      <CardContent className="pb-6">
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="sentGradPositiv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SENTIMENT_COLORS.positiv} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={SENTIMENT_COLORS.positiv} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="sentGradNeutral" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SENTIMENT_COLORS.neutral} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={SENTIMENT_COLORS.neutral} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="sentGradNegativ" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SENTIMENT_COLORS.negativ} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={SENTIMENT_COLORS.negativ} stopOpacity={0.02} />
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
              <Area
                type="monotone"
                dataKey="Positiv"
                stackId="sentiment"
                stroke={SENTIMENT_COLORS.positiv}
                strokeWidth={2}
                fill="url(#sentGradPositiv)"
                dot={false}
                activeDot={{ r: 4, fill: SENTIMENT_COLORS.positiv, stroke: "var(--background)", strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="Neutral"
                stackId="sentiment"
                stroke={SENTIMENT_COLORS.neutral}
                strokeWidth={2}
                fill="url(#sentGradNeutral)"
                dot={false}
                activeDot={{ r: 4, fill: SENTIMENT_COLORS.neutral, stroke: "var(--background)", strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="Negativ"
                stackId="sentiment"
                stroke={SENTIMENT_COLORS.negativ}
                strokeWidth={2}
                fill="url(#sentGradNegativ)"
                dot={false}
                activeDot={{ r: 4, fill: SENTIMENT_COLORS.negativ, stroke: "var(--background)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
