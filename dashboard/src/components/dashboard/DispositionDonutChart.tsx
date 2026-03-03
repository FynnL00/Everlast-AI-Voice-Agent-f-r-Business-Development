"use client";

import { useMemo, useState, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
  Tooltip,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import type { Lead, DispositionCode } from "@/lib/types";
import { DISPOSITION_LABELS, DISPOSITION_COLORS } from "@/lib/types";

interface DispositionDonutChartProps {
  leads: Lead[];
  subtitle?: string;
}

/* Hex fallbacks for SVG gradient compatibility */
const CHART_COLORS_HEX = [
  ["#d4603a", "#7a2e15"],
  ["#2a9d8f", "#155f56"],
  ["#456990", "#1e3044"],
  ["#e9c46a", "#9b7b2a"],
  ["#e0a938", "#8c6510"],
  ["#8d99ae", "#4a4f59"],
  ["#c44569", "#7a1d3a"],
  ["#4a90d9", "#1e3a6a"],
  ["#6b5b95", "#3d2e5a"],
  ["#88b04b", "#4f6b28"],
  ["#f7786b", "#a34438"],
  ["#3498db", "#1a5276"],
];

const DOT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--muted-foreground)",
  "var(--score-good)",
  "var(--score-warning)",
  "var(--score-danger)",
  "var(--destructive)",
  "var(--primary)",
  "var(--chart-1)",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: "url(#disposition-glow)" }}
      />
    </g>
  );
}

function CustomTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  total: number;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const { name, value } = payload[0];
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
  return (
    <div className="rounded-lg bg-card border border-border px-3 py-2 shadow-lg backdrop-blur-xl text-xs z-[100]">
      <p className="text-foreground font-medium mb-0.5">{name}</p>
      <p className="text-muted-foreground">
        {value}x · <span className="font-semibold text-foreground">{pct}%</span>
      </p>
    </div>
  );
}

export default function DispositionDonutChart({ leads, subtitle }: DispositionDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    const counts = new Map<DispositionCode, number>();
    leads.forEach((l) => {
      if (l.disposition_code) {
        counts.set(l.disposition_code, (counts.get(l.disposition_code) || 0) + 1);
      }
    });
    return Array.from(counts.entries())
      .map(([code, count]) => ({
        name: DISPOSITION_LABELS[code] || code,
        code,
        value: count,
        color: DISPOSITION_COLORS[code] || "var(--muted-foreground)",
      }))
      .sort((a, b) => b.value - a.value);
  }, [leads]);

  const total = useMemo(
    () => chartData.reduce((sum, d) => sum + d.value, 0),
    [chartData]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEnter = useCallback((_: any, index: number) => setActiveIndex(index), []);
  const onLeave = useCallback(() => setActiveIndex(null), []);

  if (chartData.length === 0) {
    return (
      <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 w-full h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Disposition</CardTitle>
          <CardDescription>{subtitle ?? "Gesamt"}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm py-8 text-center">
            Noch keine Daten vorhanden
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 w-full h-full overflow-visible relative ${
        activeIndex !== null ? "z-50" : "z-0"
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Disposition</CardTitle>
        <CardDescription>{subtitle ?? "Gesamt"}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center overflow-visible">
        {/* Donut */}
        <div className="w-full h-[210px] overflow-visible">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart style={{ overflow: "visible" }}>
              <defs>
                {CHART_COLORS_HEX.map(([highlight, shadow], i) => (
                  <radialGradient
                    key={`dgrad-${i}`}
                    id={`disposition-grad-${i}`}
                    cx="30%"
                    cy="30%"
                    r="70%"
                  >
                    <stop offset="0%" stopColor={highlight} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={shadow} stopOpacity={0.85} />
                  </radialGradient>
                ))}
                <filter id="disposition-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="disposition-depth" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="shadow" />
                  <feOffset dx="0" dy="4" result="offsetShadow" />
                  <feComposite in="SourceGraphic" in2="offsetShadow" operator="over" />
                </filter>
              </defs>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={88}
                paddingAngle={2.5}
                dataKey="value"
                stroke="none"
                activeIndex={activeIndex ?? undefined}
                activeShape={ActiveShape}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
                animationBegin={0}
                animationDuration={1000}
                animationEasing="ease-out"
                style={{ filter: "url(#disposition-depth)" }}
              >
                {chartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={`url(#disposition-grad-${i % CHART_COLORS_HEX.length})`}
                    style={{
                      transition: "opacity 0.2s ease",
                      opacity: activeIndex === null || activeIndex === i ? 1 : 0.45,
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip total={total} />}
                isAnimationActive={false}
                allowEscapeViewBox={{ x: true, y: true }}
                wrapperStyle={{ zIndex: 9999 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="w-full space-y-1 mt-1">
          {chartData.map((item, i) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
            const isActive = activeIndex === i;
            return (
              <div
                key={item.code}
                className="relative group/legend"
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div
                  className={`flex items-center gap-3 px-3 py-1.5 rounded-lg transition-colors cursor-default ${
                    isActive ? "bg-muted/60" : "hover:bg-muted/30"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: DOT_COLORS[i % DOT_COLORS.length] }}
                  />
                  <span className="text-sm text-foreground font-medium truncate flex-1">
                    {item.name}
                  </span>
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
