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
import Card from "@/components/ui/Card";
import type { Lead } from "@/lib/types";

interface DropOffAnalysisProps {
  leads: Lead[];
}

interface DropOffEntry {
  phase: string;
  count: number;
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
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm shadow-lg">
      <span className="text-[var(--foreground)]">{entry.phase}</span>
      <span className="text-[var(--text-secondary)] ml-2">{entry.count} Abbrüche</span>
    </div>
  );
}

export default function DropOffAnalysis({ leads }: DropOffAnalysisProps) {
  const data = useMemo<DropOffEntry[]>(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      if (l.drop_off_point) {
        const phase = l.drop_off_point;
        counts[phase] = (counts[phase] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([phase, count]) => ({ phase, count }))
      .sort((a, b) => b.count - a.count);
  }, [leads]);

  return (
    <Card>
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">
        Drop-off Analyse
      </h3>
      <div className="h-[260px]">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--text-secondary)] text-sm">
            Keine Drop-off-Daten vorhanden
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="phase"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
                width={90}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
