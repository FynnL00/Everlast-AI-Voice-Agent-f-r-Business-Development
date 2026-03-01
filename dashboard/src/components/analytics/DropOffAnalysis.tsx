"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import type { Lead } from "@/lib/types";

interface DropOffAnalysisProps {
  leads: Lead[];
  subtitle?: string;
}

interface DropOffEntry {
  phase: string;
  count: number;
  percentage: number;
}

const PHASE_COLORS = [
  { bar: "#ef4444", glow: "#ef444450", badge: "#ef4444", bg: "#ef444410" },
  { bar: "#f97316", glow: "#f9731650", badge: "#f97316", bg: "#f9731610" },
  { bar: "#eab308", glow: "#eab30850", badge: "#eab308", bg: "#eab30810" },
  { bar: "#22c55e", glow: "#22c55e50", badge: "#22c55e", bg: "#22c55e10" },
  { bar: "#3b82f6", glow: "#3b82f650", badge: "#3b82f6", bg: "#3b82f610" },
  { bar: "#8b5cf6", glow: "#8b5cf650", badge: "#8b5cf6", bg: "#8b5cf610" },
];

export default function DropOffAnalysis({ leads, subtitle }: DropOffAnalysisProps) {
  const [revealed, setRevealed] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const { data, totalDropOffs } = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      if (l.drop_off_point) {
        counts[l.drop_off_point] = (counts[l.drop_off_point] || 0) + 1;
      }
    });

    const sorted = Object.entries(counts)
      .map(([phase, count]) => ({ phase, count }))
      .sort((a, b) => b.count - a.count);

    const total = sorted.reduce((sum, e) => sum + e.count, 0);

    const entries: DropOffEntry[] = sorted.map((entry) => ({
      ...entry,
      percentage: total > 0 ? Math.round((entry.count / total) * 100) : 0,
    }));

    return { data: entries, totalDropOffs: total };
  }, [leads]);

  const maxCount = data.length > 0 ? data[0].count : 1;

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">Gesprächsabbrüche</CardTitle>
        <div className="flex items-center gap-3">
          {totalDropOffs > 0 && (
            <span className="text-xs text-muted-foreground font-medium tabular-nums">
              {totalDropOffs} gesamt
            </span>
          )}
          <CardDescription>{subtitle ?? "Gesamt"}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {data.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Noch keine Daten vorhanden</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-evenly gap-1">
            {data.map((item, i) => {
              const pct = (item.count / maxCount) * 100;
              const color = PHASE_COLORS[i % PHASE_COLORS.length];
              const isHovered = hoveredIndex === i;

              return (
                <div
                  key={item.phase}
                  className="group/row"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    opacity: revealed ? 1 : 0,
                    transform: revealed ? "translateY(0)" : "translateY(10px)",
                    transition: `opacity 0.5s ease ${i * 100}ms, transform 0.5s ease ${i * 100}ms`,
                  }}
                >
                  <div
                    className="flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 cursor-default"
                    style={{
                      backgroundColor: isHovered ? color.bg : "transparent",
                    }}
                  >
                    {/* Rank badge - larger */}
                    <span
                      className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white transition-all duration-200"
                      style={{
                        backgroundColor: color.badge,
                        transform: isHovered ? "scale(1.08)" : "scale(1)",
                        boxShadow: isHovered
                          ? `0 4px 16px ${color.glow}`
                          : `0 2px 8px ${color.glow}`,
                      }}
                    >
                      {i + 1}
                    </span>

                    {/* Phase name + percentage subtitle */}
                    <div className="shrink-0 w-32">
                      <span className="block text-sm text-foreground font-semibold">
                        {item.phase}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {item.percentage}% aller Abbrüche
                      </span>
                    </div>

                    {/* Bar track - taller */}
                    <div className="flex-1 h-10 rounded-xl bg-muted/30 relative overflow-hidden">
                      {/* Gradient fill */}
                      <div
                        className="absolute inset-y-0 left-0 rounded-xl"
                        style={{
                          width: revealed ? `${pct}%` : "0%",
                          background: `linear-gradient(90deg, ${color.bar}18, ${color.bar}${isHovered ? "50" : "38"})`,
                          transition: `width 1s cubic-bezier(0.22, 1, 0.36, 1) ${i * 100 + 200}ms, background 0.2s ease`,
                        }}
                      />
                      {/* Leading edge */}
                      <div
                        className="absolute inset-y-2 rounded-full"
                        style={{
                          width: revealed ? `${pct}%` : "0%",
                          borderRight: `3px solid ${color.bar}`,
                          filter: isHovered ? `drop-shadow(0 0 8px ${color.glow})` : "none",
                          transition: `width 1s cubic-bezier(0.22, 1, 0.36, 1) ${i * 100 + 200}ms, filter 0.2s ease`,
                        }}
                      />
                      {/* Inner count label - only if bar is wide enough */}
                      {pct >= 40 && (
                        <div
                          className="absolute inset-0 flex items-center px-4"
                          style={{
                            opacity: revealed ? 1 : 0,
                            transition: `opacity 0.4s ease ${i * 100 + 800}ms`,
                          }}
                        >
                          <span
                            className="text-xs font-semibold tabular-nums"
                            style={{ color: `${color.bar}cc` }}
                          >
                            {item.count} {item.count === 1 ? "Abbruch" : "Abbrüche"}
                          </span>
                        </div>
                      )}
                      {/* Shimmer on hover */}
                      {isHovered && (
                        <div
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: `linear-gradient(90deg, transparent 0%, ${color.bar}0a 50%, transparent 100%)`,
                            animation: "shimmer 1.5s ease-in-out infinite",
                          }}
                        />
                      )}
                    </div>

                    {/* Big count */}
                    <span
                      className="shrink-0 text-2xl font-bold tabular-nums transition-all duration-200"
                      style={{
                        color: color.bar,
                        textShadow: isHovered ? `0 0 16px ${color.glow}` : "none",
                      }}
                    >
                      {item.count}
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
