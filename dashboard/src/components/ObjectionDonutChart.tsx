"use client";

import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface ObjectionDonutChartProps {
  data: { objection: string; count: number }[];
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--muted-foreground)",
];

function renderActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.15))" }}
      />
    </g>
  );
}

export default function ObjectionDonutChart({ data }: ObjectionDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const total = useMemo(() => data.reduce((sum, d) => sum + d.count, 0), [data]);

  const chartData = useMemo(() => {
    const top5 = data.slice(0, 5);
    const rest = data.slice(5);
    const restCount = rest.reduce((sum, d) => sum + d.count, 0);
    const result = top5.map((d) => ({ name: d.objection, value: d.count }));
    if (restCount > 0) {
      result.push({ name: `Andere (${rest.length})`, value: restCount });
    }
    return result;
  }, [data]);

  if (data.length === 0) {
    return (
      <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 w-full h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Einwände</CardTitle>
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
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Einwände</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {/* Donut */}
        <div className="w-full h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
                activeIndex={activeIndex ?? undefined}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                animationBegin={0}
                animationDuration={1000}
                animationEasing="ease-out"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="w-full space-y-2 mt-2">
          {chartData.map((item, i) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
            const isActive = activeIndex === i;
            return (
              <div
                key={item.name}
                className={`flex items-center gap-3 px-3 py-1.5 rounded-lg transition-colors cursor-default ${
                  isActive ? "bg-muted/60" : "hover:bg-muted/30"
                }`}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-sm text-foreground font-medium truncate flex-1">
                  {item.name}
                </span>
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
