"use client";

import { useMemo } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import type { Lead } from "@/lib/types";

interface ScoreBreakdownProps {
  leads: Lead[];
}

interface RadarEntry {
  dimension: string;
  value: number;
  fullMark: 3;
}

const DIMENSION_LABELS: Record<string, string> = {
  company_size: "Unternehmensgröße",
  tech_stack: "Tech-Stack",
  pain_point: "Pain Point",
  timeline: "Zeitrahmen",
  budget: "Budget",
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: RadarEntry }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-xl bg-card border border-border px-4 py-3 shadow-[0_6px_20px_rgba(0,0,0,0.4)] min-w-[160px] backdrop-blur-xl">
      <span className="font-semibold text-foreground">{entry.dimension}</span>
      <span className="text-muted-foreground ml-2">Ø {entry.value.toFixed(2)}</span>
    </div>
  );
}

export default function ScoreBreakdown({ leads }: ScoreBreakdownProps) {
  const data = useMemo<RadarEntry[]>(() => {
    const dimensions = [
      { key: "score_company_size" as const, label: DIMENSION_LABELS.company_size },
      { key: "score_tech_stack" as const, label: DIMENSION_LABELS.tech_stack },
      { key: "score_pain_point" as const, label: DIMENSION_LABELS.pain_point },
      { key: "score_timeline" as const, label: DIMENSION_LABELS.timeline },
      { key: "score_budget" as const, label: DIMENSION_LABELS.budget },
    ];

    return dimensions.map(({ key, label }) => {
      const scored = leads.filter((l) => l[key] !== null && l[key] !== undefined);
      const avg = scored.length > 0 ? scored.reduce((sum, l) => sum + (l[key] ?? 0), 0) / scored.length : 0;
      return { dimension: label, value: Math.round(avg * 100) / 100, fullMark: 3 as const };
    });
  }, [leads]);

  const hasData = data.some((d) => d.value > 0);

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-px w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Score-Radar</CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="h-[280px]">
          {!hasData ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Keine Score-Daten vorhanden
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
                <defs>
                  <linearGradient id="gradRadar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--score-good)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--score-good)" stopOpacity={0.1} />
                  </linearGradient>
                  <filter id="radarGlow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 3]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  tickCount={4}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="var(--score-good)"
                  fill="url(#gradRadar)"
                  fillOpacity={1}
                  strokeWidth={2}
                  style={{ filter: "url(#radarGlow)" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
