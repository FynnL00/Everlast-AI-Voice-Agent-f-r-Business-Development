"use client";

import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import type { Lead } from "@/lib/types";

interface BestTimeHeatmapProps {
  leads: Lead[];
  subtitle?: string;
}

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const WEEKDAY_FULL = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 08 to 19

// Map JS getDay() (0=Sun) to our 0=Mon index
function jsToWeekdayIndex(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

interface CellData {
  connected: number;
  total: number;
  rate: number;
}

export default function BestTimeHeatmap({ leads, subtitle }: BestTimeHeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    day: number;
    hour: number;
    data: CellData;
    x: number;
    y: number;
  } | null>(null);

  const { grid, hasData, maxRate } = useMemo(() => {
    // Initialize 7x12 grid
    const cells: CellData[][] = Array.from({ length: 7 }, () =>
      Array.from({ length: 12 }, () => ({ connected: 0, total: 0, rate: 0 }))
    );

    let dataFound = false;
    const connectedDispositions = new Set([
      "connected",
      "callback",
    ]);

    leads.forEach((lead) => {
      if (lead.call_direction !== "outbound") return;
      if (!lead.call_started_at) return;

      const dt = new Date(lead.call_started_at);
      const dayIdx = jsToWeekdayIndex(dt.getDay());
      const hour = dt.getHours();

      // Only hours 08-19
      if (hour < 8 || hour > 19) return;
      const hourIdx = hour - 8;

      cells[dayIdx][hourIdx].total++;
      dataFound = true;

      if (
        lead.disposition_code !== null &&
        connectedDispositions.has(lead.disposition_code)
      ) {
        cells[dayIdx][hourIdx].connected++;
      }
    });

    // Calculate rates
    let peak = 0;
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 12; h++) {
        const cell = cells[d][h];
        cell.rate = cell.total > 0 ? cell.connected / cell.total : 0;
        if (cell.rate > peak) peak = cell.rate;
      }
    }

    return { grid: cells, hasData: dataFound, maxRate: peak };
  }, [leads]);

  // Color interpolation: gray(0%) -> light green -> dark green(100%)
  function getCellColor(rate: number, total: number): string {
    if (total === 0) return "var(--muted)";
    if (maxRate === 0) return "var(--muted)";
    const intensity = rate / maxRate; // 0 to 1
    const alpha = 0.15 + intensity * 0.85;
    // Use score-good color with varying opacity
    return `color-mix(in oklch, var(--score-good) ${Math.round(alpha * 100)}%, var(--muted) ${Math.round((1 - alpha) * 100)}%)`;
  }

  function handleMouseEnter(
    e: React.MouseEvent<HTMLDivElement>,
    day: number,
    hour: number,
    data: CellData
  ) {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      day,
      hour,
      data,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  }

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-px w-full h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">Beste Anrufzeiten</CardTitle>
        <div className="flex items-center gap-3">
          <CardDescription>Connection Rate nach Wochentag & Uhrzeit</CardDescription>
          {subtitle && <span className="text-xs text-muted-foreground font-medium">{subtitle}</span>}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {!hasData ? (
          <div className="flex-1 flex items-center justify-center py-8">
            <p className="text-muted-foreground text-sm">
              Noch keine Outbound-Daten für die Erreichbarkeitsanalyse vorhanden.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Hour labels row */}
            <div className="flex items-end mb-1.5 ml-10">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex-1 text-center text-[11px] text-muted-foreground tabular-nums font-medium"
                >
                  {String(hour).padStart(2, "0")}
                </div>
              ))}
            </div>

            {/* Grid rows */}
            <div className="flex flex-col gap-1">
              {WEEKDAYS.map((day, dayIdx) => (
                <div key={day} className="flex items-center gap-1.5">
                  {/* Weekday label */}
                  <span className="shrink-0 w-8 text-xs text-muted-foreground font-medium text-right">
                    {day}
                  </span>

                  {/* Hour cells */}
                  <div className="flex-1 flex gap-0.5">
                    {HOURS.map((hour, hourIdx) => {
                      const cell = grid[dayIdx][hourIdx];
                      return (
                        <div
                          key={`${dayIdx}-${hourIdx}`}
                          className="flex-1 aspect-[1.8] rounded-[4px] cursor-default transition-all duration-150 hover:ring-2 hover:ring-foreground/30 hover:scale-110 hover:z-10 relative"
                          style={{
                            backgroundColor: getCellColor(cell.rate, cell.total),
                          }}
                          onMouseEnter={(e) =>
                            handleMouseEnter(e, dayIdx, hourIdx, cell)
                          }
                          onMouseLeave={() => setTooltip(null)}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-3">
              <span className="text-[11px] text-muted-foreground">Niedrig</span>
              <div className="flex gap-0.5">
                {[0, 0.25, 0.5, 0.75, 1].map((val) => (
                  <div
                    key={val}
                    className="w-4 h-3 rounded-[2px]"
                    style={{
                      backgroundColor:
                        val === 0
                          ? "var(--muted)"
                          : `color-mix(in oklch, var(--score-good) ${Math.round((0.15 + val * 0.85) * 100)}%, var(--muted) ${Math.round((1 - (0.15 + val * 0.85)) * 100)}%)`,
                    }}
                  />
                ))}
              </div>
              <span className="text-[11px] text-muted-foreground">Hoch</span>
            </div>

            {/* Floating tooltip */}
            {tooltip && tooltip.data.total > 0 && (
              <div
                className="fixed z-50 pointer-events-none"
                style={{
                  left: tooltip.x,
                  top: tooltip.y - 8,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <div className="rounded-xl bg-card border border-border px-4 py-3 shadow-[0_6px_20px_rgba(0,0,0,0.4)] min-w-[200px] backdrop-blur-xl">
                  <p className="font-semibold text-foreground text-sm">
                    {WEEKDAY_FULL[tooltip.day]} {HOURS[tooltip.hour]}:00 – {HOURS[tooltip.hour] + 1}:00
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    {Math.round(tooltip.data.rate * 100)}% Connection Rate
                    <span className="ml-1 opacity-70">
                      ({tooltip.data.connected}/{tooltip.data.total})
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
