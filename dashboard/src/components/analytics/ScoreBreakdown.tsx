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
import Card from "@/components/ui/Card";
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
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm shadow-lg">
      <span className="text-[var(--foreground)]">{entry.dimension}</span>
      <span className="text-[var(--text-secondary)] ml-2">Ø {entry.value.toFixed(2)}</span>
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
    ];

    return dimensions.map(({ key, label }) => {
      const scored = leads.filter((l) => l[key] !== null && l[key] !== undefined);
      const avg = scored.length > 0 ? scored.reduce((sum, l) => sum + (l[key] ?? 0), 0) / scored.length : 0;
      return { dimension: label, value: Math.round(avg * 100) / 100, fullMark: 3 as const };
    });
  }, [leads]);

  const hasData = data.some((d) => d.value > 0);

  return (
    <Card>
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">
        Score-Radar
      </h3>
      <div className="h-[260px]">
        {!hasData ? (
          <div className="flex items-center justify-center h-full text-[var(--text-secondary)] text-sm">
            Keine Score-Daten vorhanden
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: "#6b7280", fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 3]}
                tick={{ fill: "#6b7280", fontSize: 10 }}
                tickCount={4}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
