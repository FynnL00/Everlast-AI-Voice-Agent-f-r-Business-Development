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
import { normalizeObjection } from "@/lib/utils";
import type { Lead } from "@/lib/types";

interface ObjectionConversionCorrelationProps {
  leads: Lead[];
}

interface CorrelationEntry {
  objection: string;
  konvertiert: number;
  verloren: number;
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

export default function ObjectionConversionCorrelation({ leads }: ObjectionConversionCorrelationProps) {
  const data = useMemo<CorrelationEntry[]>(() => {
    // Find top 5 objections
    const globalCounts: Record<string, number> = {};
    leads.forEach((l) => {
      if (l.objections_raised) {
        l.objections_raised.forEach((obj) => {
          const normalized = normalizeObjection(obj);
          if (normalized) {
            globalCounts[normalized] = (globalCounts[normalized] || 0) + 1;
          }
        });
      }
    });

    const top5 = Object.entries(globalCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    // For each top 5 objection, count converted vs lost
    const result: CorrelationEntry[] = top5.map((objection) => {
      let konvertiert = 0;
      let verloren = 0;

      leads.forEach((l) => {
        if (!l.objections_raised) return;
        const hasObjection = l.objections_raised.some(
          (obj) => normalizeObjection(obj) === objection
        );
        if (!hasObjection) return;

        if (l.status === "converted" || l.status === "appointment_booked") {
          konvertiert++;
        } else if (l.status === "lost") {
          verloren++;
        }
      });

      return { objection, konvertiert, verloren };
    });

    return result;
  }, [leads]);

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-px w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Einwand-Ergebnis-Korrelation</CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="h-[320px]">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Keine Einwand-Daten vorhanden
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 20, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="objection"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={60}
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
                <Bar dataKey="konvertiert" fill="var(--score-good)" radius={[4, 4, 0, 0]} barSize={18} />
                <Bar dataKey="verloren" fill="var(--score-danger)" radius={[4, 4, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
