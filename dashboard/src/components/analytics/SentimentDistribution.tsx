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
import Card from "@/components/ui/Card";
import type { Lead } from "@/lib/types";

interface SentimentDistributionProps {
  leads: Lead[];
}

const SENTIMENT_CONFIG: Record<string, { label: string; color: string }> = {
  positiv: { label: "Positiv", color: "#42d77d" },
  neutral: { label: "Neutral", color: "#f59e0b" },
  negativ: { label: "Negativ", color: "#ef4444" },
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
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm shadow-lg">
      <span style={{ color: entry.color }}>{entry.name}</span>
      <span className="text-[var(--text-secondary)] ml-2">{entry.value} Leads</span>
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
    <Card>
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">
        Stimmungsverteilung
      </h3>
      <div className="h-[260px]">
        {total === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--text-secondary)] text-sm">
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
                dataKey="value"
                stroke="none"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: "#8b8fa3" }}
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
                  <span className="text-xs text-[var(--text-secondary)]">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
