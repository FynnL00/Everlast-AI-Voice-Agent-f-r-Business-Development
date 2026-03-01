"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface ObjectionChartProps {
  data: { objection: string; count: number }[];
}

const barColors = [
  { from: "var(--chart-1)", to: "var(--chart-1)" },
  { from: "var(--chart-2)", to: "var(--chart-2)" },
  { from: "var(--chart-3)", to: "var(--chart-3)" },
  { from: "var(--chart-4)", to: "var(--chart-4)" },
  { from: "var(--chart-5)", to: "var(--chart-5)" },
];

export default function ObjectionChart({ data }: ObjectionChartProps) {
  const [revealed, setRevealed] = useState(false);
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 w-full h-full overflow-visible">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Top Einwände</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">
            Noch keine Daten vorhanden
          </p>
        ) : (
          <div className="space-y-3">
            {data.map((item, i) => {
              const pct = (item.count / maxCount) * 100;
              const color = barColors[i % barColors.length];
              return (
                <div
                  key={item.objection}
                  className="group/row flex items-center gap-3"
                  style={{
                    opacity: revealed ? 1 : 0,
                    transform: revealed ? "translateX(0)" : "translateX(-12px)",
                    transition: `opacity 0.5s ease ${i * 100}ms, transform 0.5s ease ${i * 100}ms`,
                  }}
                >
                  {/* Rank badge */}
                  <span
                    className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white/90"
                    style={{ backgroundColor: color.from, opacity: 0.85 }}
                  >
                    {i + 1}
                  </span>

                  {/* Label */}
                  <span className="relative shrink-0 w-40 group/label cursor-default">
                    <span className="block text-sm text-foreground font-medium truncate">
                      {item.objection}
                    </span>
                    <span className="pointer-events-none opacity-0 group-hover/label:opacity-100 transition-opacity duration-150 absolute left-0 bottom-full mb-1.5 z-[9999] rounded-lg bg-card border border-border px-3 py-2 shadow-lg backdrop-blur-xl text-xs text-foreground font-normal whitespace-normal w-max max-w-[280px]">
                      {item.objection}
                    </span>
                  </span>

                  {/* Progress bar track */}
                  <div className="flex-1 h-8 rounded-lg bg-muted/50 relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-lg"
                      style={{
                        width: revealed ? `${pct}%` : "0%",
                        background: `linear-gradient(90deg, ${color.from}33, ${color.from}66)`,
                        transition: `width 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${i * 100 + 200}ms`,
                      }}
                    />
                    {/* Bright leading edge */}
                    <div
                      className="absolute inset-y-0 rounded-lg"
                      style={{
                        width: revealed ? `${pct}%` : "0%",
                        borderRight: `3px solid ${color.from}`,
                        transition: `width 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${i * 100 + 200}ms`,
                      }}
                    />
                  </div>

                  {/* Count */}
                  <span
                    className="shrink-0 w-10 text-right text-sm font-bold tabular-nums"
                    style={{ color: color.from }}
                  >
                    {item.count}x
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
