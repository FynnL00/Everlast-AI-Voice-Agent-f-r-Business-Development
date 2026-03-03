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
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { SENTIMENT_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/lib/types";
import type { Lead } from "@/lib/types";

interface SentimentConversionMatrixProps {
  leads: Lead[];
  subtitle?: string;
}

const STATUSES: Lead["status"][] = ["new", "not_reached", "contacted", "qualified", "appointment_booked", "converted", "lost"];

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
    <div className="rounded-xl bg-card border border-border px-4 py-3 shadow-[0_6px_20px_rgba(0,0,0,0.4)] min-w-[200px] backdrop-blur-xl">
      <p className="text-muted-foreground text-sm mb-2">
        <span className="font-semibold text-foreground">{label}</span>
      </p>
      <div className="space-y-1">
        {payload
          .filter((entry) => entry.value > 0)
          .map((entry) => (
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

export default function SentimentConversionMatrix({ leads, subtitle }: SentimentConversionMatrixProps) {
  const data = useMemo(() => {
    const sentiments: NonNullable<Lead["sentiment"]>[] = ["positiv", "neutral", "negativ"];

    return sentiments.map((sentiment) => {
      const sentimentLeads = leads.filter((l) => l.sentiment === sentiment);
      const entry: Record<string, string | number> = {
        sentiment: SENTIMENT_LABELS[sentiment],
      };

      STATUSES.forEach((status) => {
        entry[STATUS_LABELS[status]] = sentimentLeads.filter((l) => l.status === status).length;
      });

      return entry;
    });
  }, [leads]);

  const hasData = leads.some((l) => l.sentiment !== null);

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-px w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Konversion nach Sentiment</CardTitle>
        {subtitle && <span className="text-xs text-muted-foreground font-medium">{subtitle}</span>}
      </CardHeader>
      <CardContent className="pb-6">
        <div className="h-[320px]">
          {!hasData ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Keine Sentiment-Daten vorhanden
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
                  dataKey="sentiment"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 13, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.2 }} />
                <Legend
                  verticalAlign="top"
                  height={40}
                  wrapperStyle={{ paddingBottom: 8 }}
                  formatter={(value: string) => (
                    <span className="text-[10px] text-muted-foreground font-medium ml-1">{value}</span>
                  )}
                />
                {STATUSES.map((status) => (
                  <Bar
                    key={status}
                    dataKey={STATUS_LABELS[status]}
                    stackId="status"
                    fill={STATUS_COLORS[status]}
                    radius={0}
                    barSize={24}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
