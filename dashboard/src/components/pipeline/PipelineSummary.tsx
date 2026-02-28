"use client";

import { useMemo } from "react";
import { useLeads } from "@/lib/leads-context";
import type { Lead } from "@/lib/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ArrowRight, TrendingDown } from "lucide-react";

const FUNNEL_STAGES: Lead["status"][] = [
  "new",
  "contacted",
  "qualified",
  "appointment_booked",
  "converted",
];

export default function PipelineSummary() {
  const { filteredLeads } = useLeads();

  const { stageCounts, maxCount, lostCount, conversions } = useMemo(() => {
    const counts: Record<Lead["status"], number> = {
      new: 0,
      contacted: 0,
      qualified: 0,
      appointment_booked: 0,
      converted: 0,
      lost: 0,
    };
    for (const lead of filteredLeads) {
      counts[lead.status]++;
    }

    const cumulative: number[] = [];
    let sum = 0;
    for (let i = FUNNEL_STAGES.length - 1; i >= 0; i--) {
      sum += counts[FUNNEL_STAGES[i]];
      cumulative[i] = sum;
    }

    const max = Math.max(...cumulative, 1);

    const convRates: (number | null)[] = [];
    for (let i = 0; i < FUNNEL_STAGES.length - 1; i++) {
      const from = cumulative[i];
      const to = cumulative[i + 1];
      convRates.push(from > 0 ? Math.round((to / from) * 100) : null);
    }

    return {
      stageCounts: cumulative,
      maxCount: max,
      lostCount: counts.lost,
      conversions: convRates,
    };
  }, [filteredLeads]);

  if (filteredLeads.length === 0) return null;

  return (
    <Card className="mb-6 w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Funnel-Übersicht
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="space-y-3">
          {FUNNEL_STAGES.map((status, idx) => {
            const count = stageCounts[idx];
            const widthPct = Math.max((count / maxCount) * 100, 4);
            const color = STATUS_COLORS[status];

            return (
              <div key={status}>
                {/* Stage row */}
                <div className="flex items-center gap-4">
                  <span className="w-32 shrink-0 text-xs font-medium text-muted-foreground text-right">
                    {STATUS_LABELS[status]}
                  </span>
                  <div className="flex-1 flex items-center gap-2">
                    <div
                      className="h-8 rounded flex items-center justify-end pr-3 transition-all duration-1000 ease-out shadow-sm relative overflow-hidden group hover:brightness-110"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: `${color}25`,
                        borderLeft: `4px solid ${color}`,
                        minWidth: "40px",
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span
                        className="text-xs font-bold tabular-nums drop-shadow-md"
                        style={{ color: color }}
                      >
                        {count}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Conversion arrow between stages */}
                {idx < FUNNEL_STAGES.length - 1 && conversions[idx] !== null && (
                  <div className="flex items-center gap-3 py-1">
                    <span className="w-32 shrink-0" />
                    <div className="flex items-center gap-1.5 pl-3">
                      <ArrowRight size={12} className="text-muted-foreground" />
                      <span className="text-xs font-semibold text-muted-foreground">
                        {conversions[idx]}% Konvertierung
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Lost leads indicator */}
        {lostCount > 0 && (
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-border/50">
            <span className="w-32 shrink-0 text-xs font-medium text-muted-foreground text-right">
              Verloren
            </span>
            <div className="flex items-center gap-2.5 bg-red-500/10 px-3 py-1.5 rounded-md border border-red-500/20">
              <TrendingDown size={14} className="text-red-400" />
              <span className="text-sm font-bold text-red-400">
                {lostCount}
              </span>
              {filteredLeads.length > 0 && (
                <span className="text-xs font-medium text-red-400/70 ml-1">
                  ({Math.round((lostCount / filteredLeads.length) * 100)}% Verlustrate)
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
