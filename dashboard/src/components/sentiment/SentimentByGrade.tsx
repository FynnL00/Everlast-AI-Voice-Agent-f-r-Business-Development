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
import { SENTIMENT_COLORS } from "@/lib/types";
import type { Lead } from "@/lib/types";

interface SentimentByGradeProps {
  leads: Lead[];
}

interface GradeEntry {
  grade: string;
  Positiv: number;
  Neutral: number;
  Negativ: number;
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
        Grade: <span className="font-semibold text-foreground">{label}</span>
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

export default function SentimentByGrade({ leads }: SentimentByGradeProps) {
  const data = useMemo<GradeEntry[]>(() => {
    const grades: ("A" | "B" | "C")[] = ["A", "B", "C"];
    return grades.map((grade) => {
      const gradeLeads = leads.filter((l) => l.lead_grade === grade && l.sentiment !== null);
      return {
        grade,
        Positiv: gradeLeads.filter((l) => l.sentiment === "positiv").length,
        Neutral: gradeLeads.filter((l) => l.sentiment === "neutral").length,
        Negativ: gradeLeads.filter((l) => l.sentiment === "negativ").length,
      };
    });
  }, [leads]);

  const hasData = data.some((d) => d.Positiv > 0 || d.Neutral > 0 || d.Negativ > 0);

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-px w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Sentiment nach Lead-Grade</CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="h-[320px]">
          {!hasData ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Keine Sentiment-Daten vorhanden
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 20, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="gradSentPositiv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SENTIMENT_COLORS.positiv} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={SENTIMENT_COLORS.positiv} stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="gradSentNeutral" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SENTIMENT_COLORS.neutral} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={SENTIMENT_COLORS.neutral} stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="gradSentNegativ" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SENTIMENT_COLORS.negativ} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={SENTIMENT_COLORS.negativ} stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="grade"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 14, fontWeight: 600 }}
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
                <Legend
                  verticalAlign="top"
                  height={32}
                  formatter={(value: string) => (
                    <span className="text-xs text-muted-foreground font-medium ml-1">{value}</span>
                  )}
                />
                <Bar dataKey="Positiv" fill="url(#gradSentPositiv)" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Neutral" fill="url(#gradSentNeutral)" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="Negativ" fill="url(#gradSentNegativ)" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
