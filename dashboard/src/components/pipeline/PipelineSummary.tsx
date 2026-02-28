"use client";

import { useMemo } from "react";
import { useLeads } from "@/lib/leads-context";
import type { Lead } from "@/lib/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import Card from "@/components/ui/Card";
import { ArrowRight, TrendingDown } from "lucide-react";

/** Pipeline stages in funnel order (excluding "lost" which is shown separately). */
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

    // Cumulative counts: each stage includes all leads that reached it or further
    // For funnel visualization we compute the cumulative forward counts
    const cumulative: number[] = [];
    let sum = 0;
    for (let i = FUNNEL_STAGES.length - 1; i >= 0; i--) {
      sum += counts[FUNNEL_STAGES[i]];
      cumulative[i] = sum;
    }

    const max = Math.max(...cumulative, 1);

    // Conversion rates between adjacent stages
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
    <Card className="p-5 mb-6">
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">
        Funnel-Uebersicht
      </h3>

      <div className="space-y-2">
        {FUNNEL_STAGES.map((status, idx) => {
          const count = stageCounts[idx];
          const widthPct = Math.max((count / maxCount) * 100, 4);
          const color = STATUS_COLORS[status];

          return (
            <div key={status}>
              {/* Stage row */}
              <div className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-xs text-[var(--text-secondary)] text-right">
                  {STATUS_LABELS[status]}
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <div
                    className="h-7 rounded-md flex items-center justify-end pr-2 transition-all duration-500"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: `${color}30`,
                      borderLeft: `3px solid ${color}`,
                      minWidth: "32px",
                    }}
                  >
                    <span
                      className="text-xs font-semibold"
                      style={{ color }}
                    >
                      {count}
                    </span>
                  </div>
                </div>
              </div>

              {/* Conversion arrow between stages */}
              {idx < FUNNEL_STAGES.length - 1 && conversions[idx] !== null && (
                <div className="flex items-center gap-3 py-0.5">
                  <span className="w-28 shrink-0" />
                  <div className="flex items-center gap-1 pl-2">
                    <ArrowRight size={10} className="text-[var(--muted)]" />
                    <span className="text-[10px] text-[var(--muted)]">
                      {conversions[idx]}%
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
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[var(--card-border)]">
          <span className="w-28 shrink-0 text-xs text-[var(--text-secondary)] text-right">
            Verloren
          </span>
          <div className="flex items-center gap-2">
            <TrendingDown size={14} className="text-[var(--danger)]" />
            <span className="text-xs font-semibold text-[var(--danger)]">
              {lostCount}
            </span>
            {filteredLeads.length > 0 && (
              <span className="text-[10px] text-[var(--muted)]">
                ({Math.round((lostCount / filteredLeads.length) * 100)}% Verlustrate)
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
