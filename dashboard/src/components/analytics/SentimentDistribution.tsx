"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import type { Lead } from "@/lib/types";

interface SentimentDistributionProps {
  leads: Lead[];
}

const SENTIMENT_CONFIG: Record<string, { label: string; color: string }> = {
  positiv: { label: "Positiv", color: "var(--score-good)" },
  neutral: { label: "Neutral", color: "var(--score-warning)" },
  negativ: { label: "Negativ", color: "var(--score-danger)" },
};

interface SentimentEntry {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: SentimentEntry }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-xl bg-card border border-border px-4 py-3 shadow-[0_6px_20px_rgba(0,0,0,0.4)] min-w-[160px] backdrop-blur-xl">
      <span className="font-semibold" style={{ color: entry.color }}>{entry.name}</span>
      <span className="text-muted-foreground ml-2">{entry.value} Leads</span>
    </div>
  );
}

export default function SentimentDistribution({ leads }: SentimentDistributionProps) {
  const data = useMemo<SentimentEntry[]>(() => {
    const counts: Record<string, number> = { positiv: 0, neutral: 0, negativ: 0 };
    leads.forEach((l) => {
      if (l.sentiment && counts[l.sentiment] !== undefined) {
        counts[l.sentiment]++;
      }
    });
    return Object.entries(SENTIMENT_CONFIG).map(([key, cfg]) => ({
      name: cfg.label,
      value: counts[key],
      color: cfg.color,
    }));
  }, [leads]);

  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-0.5 w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Stimmungsverteilung</CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="h-[280px]">
          {total === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Keine Sentiment-Daten vorhanden
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="45%"
                  outerRadius={80}
                  innerRadius={60}
                  dataKey="value"
                  stroke="none"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: "var(--muted-foreground)" }}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string) => (
                    <span className="text-xs text-muted-foreground font-medium ml-1">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
