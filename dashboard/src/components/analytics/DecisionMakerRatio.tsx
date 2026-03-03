"use client";

import { useMemo, useEffect, useState, useRef } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import type { Lead } from "@/lib/types";

interface DecisionMakerRatioProps {
  leads: Lead[];
  subtitle?: string;
}

// SVG gauge needle rendered as an overlay on top of the donut
function GaugeNeedleOverlay({ percentage, containerRef }: {
  percentage: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [animatedPct, setAnimatedPct] = useState(0);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setDims({ width: rect.width, height: rect.height });
    });
    ro.observe(el);
    setDims({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, [containerRef]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPct(percentage), 150);
    return () => clearTimeout(timer);
  }, [percentage]);

  if (dims.width === 0) return null;

  // Match the PieChart cx="50%" cy="45%"
  const cx = dims.width / 2;
  const cy = dims.height * 0.45;
  const needleLength = 58; // just inside inner radius of 70

  // startAngle=90, endAngle=-270 means:
  // 0% at 90 deg (top), 100% at 90-360 = -270 deg (full circle back to top)
  const angleInDeg = 90 - (animatedPct / 100) * 360;
  const radian = (angleInDeg * Math.PI) / 180;
  const x2 = cx + needleLength * Math.cos(radian);
  const y2 = cy - needleLength * Math.sin(radian);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={dims.width}
      height={dims.height}
      style={{ overflow: "visible" }}
    >
      {/* Needle line with CSS transition for smooth animation */}
      <line
        x1={cx}
        y1={cy}
        x2={x2}
        y2={y2}
        stroke="var(--chart-4)"
        strokeWidth={2.5}
        strokeLinecap="round"
        style={{
          transition: "x2 1s cubic-bezier(0.34, 1.56, 0.64, 1), y2 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />
      {/* Outer glow circle */}
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill="none"
        stroke="var(--chart-4)"
        strokeWidth={1}
        opacity={0.3}
      />
      {/* Center dot */}
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill="var(--chart-4)"
        stroke="var(--card)"
        strokeWidth={2}
      />
    </svg>
  );
}

export default function DecisionMakerRatio({ leads, subtitle }: DecisionMakerRatioProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, percentage } = useMemo(() => {
    const total = leads.length;
    const dm = leads.filter((l) => l.is_decision_maker === true).length;
    const nonDm = total - dm;
    const pct = total > 0 ? (dm / total) * 100 : 0;

    return {
      data: [
        { name: "Entscheider", value: dm, color: "var(--chart-4)" },
        { name: "Nicht-Entscheider", value: nonDm, color: "var(--muted)" },
      ],
      percentage: pct,
    };
  }, [leads]);

  const total = data[0].value + data[1].value;

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-px w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Entscheider-Quote</CardTitle>
        {subtitle && <span className="text-xs text-muted-foreground font-medium">{subtitle}</span>}
      </CardHeader>
      <CardContent className="pb-6">
        <div className="h-[280px] relative" ref={containerRef}>
          {total === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Keine Daten vorhanden
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={90}
                    dataKey="value"
                    stroke="none"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {data.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Gauge needle overlay */}
              <GaugeNeedleOverlay percentage={percentage} containerRef={containerRef} />
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-10%]">
                <span className="text-3xl font-bold text-foreground">
                  {percentage.toFixed(0)}%
                </span>
                <span className="text-xs text-muted-foreground mt-1">Entscheider</span>
              </div>
            </>
          )}
        </div>
        {/* Legend */}
        {total > 0 && (
          <div className="flex items-center justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: data[0].color }} />
              <span className="text-xs text-muted-foreground font-medium">Entscheider ({data[0].value})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: data[1].color }} />
              <span className="text-xs text-muted-foreground font-medium">Andere ({data[1].value})</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
