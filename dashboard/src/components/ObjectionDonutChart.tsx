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

interface ObjectionDonutChartProps {
  data: { objection: string; count: number }[];
  subtitle?: string;
}

/* Gradient pairs: [highlight, shadow] — hex for SVG compat */
const COLOR_PAIRS = [
  ["#d4603a", "#7a2e15"],
  ["#2a9d8f", "#155f56"],
  ["#456990", "#1e3044"],
  ["#e9c46a", "#9b7b2a"],
  ["#e0a938", "#8c6510"],
  ["#8d99ae", "#4a4f59"],
];

const DOT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--muted-foreground)",
];

function ActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;
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
        style={{ filter: "url(#donut-glow)" }}
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

export default function ObjectionDonutChart({
  data,
  subtitle,
}: ObjectionDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = useMemo(
    () => data.reduce((sum, d) => sum + d.count, 0),
    [data],
  );

  const chartData = useMemo(() => {
    if (data.length <= 5) return data.map((d) => ({ name: d.objection, value: d.count }));
    const top5 = data.slice(0, 5);
    const rest = data.slice(5);
    const restCount = rest.reduce((sum, d) => sum + d.count, 0);
    const result = top5.map((d) => ({ name: d.objection, value: d.count }));
    if (restCount > 0) {
      result.push({ name: `Rest (${rest.length})`, value: restCount });
    }
    return result;
  }, [data]);

  const onEnter = useCallback((_: any, index: number) => setActiveIndex(index), []);
  const onLeave = useCallback(() => setActiveIndex(null), []);

  if (data.length === 0) {
    return (
      <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-px w-full h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">Einwände</CardTitle>
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
    <Card className={`transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-px w-full h-full overflow-visible relative ${activeIndex !== null ? "z-50" : "z-0"}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Einwände</CardTitle>
        <CardDescription>{subtitle ?? "Gesamt"}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center overflow-visible">
        {/* Donut */}
        <div className="w-full h-[210px] overflow-visible">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart style={{ overflow: "visible" }}>
              <defs>
                {/* Radial gradients per segment for glossy look */}
                {COLOR_PAIRS.map(([highlight, shadow], i) => (
                  <radialGradient
                    key={`grad-${i}`}
                    id={`donut-grad-${i}`}
                    cx="30%"
                    cy="30%"
                    r="70%"
                  >
                    <stop offset="0%" stopColor={highlight} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={shadow} stopOpacity={0.85} />
                  </radialGradient>
                ))}
                {/* Glow filter for active segment */}
                <filter id="donut-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {/* Soft inner shadow via drop-shadow on the whole pie group */}
                <filter id="donut-depth" x="-10%" y="-10%" width="120%" height="120%">
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
                style={{ filter: "url(#donut-depth)" }}
              >
                {chartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={`url(#donut-grad-${i % COLOR_PAIRS.length})`}
                    style={{
                      transition: "opacity 0.2s ease",
                      opacity:
                        activeIndex === null || activeIndex === i ? 1 : 0.45,
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
            const pct =
              total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
            const isActive = activeIndex === i;
            return (
              <div
                key={item.name}
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
                {/* Hover tooltip for truncated names */}
                <span className="pointer-events-none opacity-0 group-hover/legend:opacity-100 transition-opacity duration-150 absolute left-3 bottom-full mb-1.5 z-[9999] rounded-lg bg-card border border-border px-3 py-2 shadow-lg backdrop-blur-xl text-xs text-foreground font-normal whitespace-normal w-max max-w-[260px]">
                  {item.name} — {item.value}x ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
