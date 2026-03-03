"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import type { Lead } from "@/lib/types";

interface OutboundFunnelProps {
  leads: Lead[];
  subtitle?: string;
}

interface FunnelStage {
  label: string;
  count: number;
  color: string;
  glow: string;
  bg: string;
}

const STAGE_COLORS = [
  { color: "#6366f1", glow: "#6366f150", bg: "#6366f110" }, // Indigo - Versuche
  { color: "#3b82f6", glow: "#3b82f650", bg: "#3b82f610" }, // Blue - Erreicht
  { color: "#f59e0b", glow: "#f59e0b50", bg: "#f59e0b10" }, // Amber - Qualifiziert
  { color: "#22c55e", glow: "#22c55e50", bg: "#22c55e10" }, // Green - Demo gebucht
  { color: "#10b981", glow: "#10b98150", bg: "#10b98110" }, // Emerald - Konvertiert
];

export default function OutboundFunnel({ leads, subtitle }: OutboundFunnelProps) {
  const [revealed, setRevealed] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const stages = useMemo<FunnelStage[]>(() => {
    const outboundLeads = leads.filter((l) => l.call_direction === "outbound");

    // 1. Versuche: all outbound leads with at least 1 call_attempt
    const attempts = outboundLeads.filter((l) => l.call_attempts > 0);

    // 2. Erreicht: disposition = connected, callback
    const connectedDispositions = new Set(["connected", "callback"]);
    const reached = outboundLeads.filter(
      (l) => l.disposition_code !== null && connectedDispositions.has(l.disposition_code)
    );

    // 3. Qualifiziert: status = qualified or further in pipeline
    const qualified = outboundLeads.filter(
      (l) => l.status === "qualified" || l.status === "appointment_booked" || l.status === "converted"
    );

    // 4. Demo gebucht: appointment_booked = true
    const demoBooked = outboundLeads.filter(
      (l) => l.appointment_booked === true
    );

    // 5. Konvertiert: status = converted
    const converted = outboundLeads.filter(
      (l) => l.status === "converted"
    );

    return [
      { label: "Versuche", count: attempts.length, ...STAGE_COLORS[0] },
      { label: "Erreicht", count: reached.length, ...STAGE_COLORS[1] },
      { label: "Qualifiziert", count: qualified.length, ...STAGE_COLORS[2] },
      { label: "Demo gebucht", count: demoBooked.length, ...STAGE_COLORS[3] },
      { label: "Konvertiert", count: converted.length, ...STAGE_COLORS[4] },
    ];
  }, [leads]);

  const maxCount = Math.max(stages[0]?.count ?? 1, 1);
  const totalAttempts = stages[0]?.count ?? 0;

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-px w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">Outbound Funnel</CardTitle>
        <div className="flex items-center gap-3">
          {totalAttempts > 0 && (
            <span className="text-xs text-muted-foreground font-medium tabular-nums">
              {totalAttempts} Anrufversuche
            </span>
          )}
          {subtitle && <span className="text-xs text-muted-foreground font-medium">{subtitle}</span>}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {totalAttempts === 0 ? (
          <div className="flex-1 flex items-center justify-center py-8">
            <p className="text-muted-foreground text-sm">
              Noch keine Outbound-Daten vorhanden.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-evenly gap-2">
            {stages.map((stage, i) => {
              const pct = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
              const barWidth = Math.max(pct, 4); // minimum visible width
              const isHovered = hoveredIndex === i;

              // Conversion rate from previous stage
              const prevCount = i > 0 ? stages[i - 1].count : 0;
              const conversionRate =
                i > 0 && prevCount > 0
                  ? Math.round((stage.count / prevCount) * 100)
                  : null;

              return (
                <div
                  key={stage.label}
                  className="group/row"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    opacity: revealed ? 1 : 0,
                    transform: revealed ? "translateY(0)" : "translateY(10px)",
                    transition: `opacity 0.5s ease ${i * 80}ms, transform 0.5s ease ${i * 80}ms`,
                  }}
                >
                  <div
                    className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-default"
                    style={{
                      backgroundColor: isHovered ? stage.bg : "transparent",
                    }}
                  >
                    {/* Stage label */}
                    <span className="shrink-0 w-28 text-sm text-foreground font-medium text-right">
                      {stage.label}
                    </span>

                    {/* Bar */}
                    <div className="flex-1 h-10 rounded-lg bg-muted/30 relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-lg flex items-center transition-all duration-200"
                        style={{
                          width: revealed ? `${barWidth}%` : "0%",
                          background: `linear-gradient(90deg, ${stage.color}20, ${stage.color}${isHovered ? "60" : "40"})`,
                          borderRight: `3px solid ${stage.color}`,
                          transition: `width 1s cubic-bezier(0.22, 1, 0.36, 1) ${i * 80 + 200}ms, background 0.2s ease`,
                          boxShadow: isHovered ? `0 0 12px ${stage.glow}` : "none",
                        }}
                      >
                        <span
                          className="px-3 text-sm font-bold tabular-nums whitespace-nowrap"
                          style={{ color: stage.color }}
                        >
                          {stage.count}
                        </span>
                      </div>
                    </div>

                    {/* Conversion rate arrow */}
                    <span className="shrink-0 w-16 text-sm text-muted-foreground tabular-nums text-right">
                      {conversionRate !== null ? (
                        <span>
                          <span className="opacity-60">{"\u2192"}</span> {conversionRate}%
                        </span>
                      ) : (
                        ""
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
