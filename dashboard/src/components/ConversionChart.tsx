"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/Card";

interface ConversionChartProps {
  data: { date: string; rate: number; calls: number }[];
  subtitle?: string;
}

const DATAKEY_LABELS: Record<string, string> = {
  calls: "Calls",
  rate: "Conversion",
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg bg-card border border-border px-3 py-2 shadow-lg min-w-[130px] backdrop-blur-xl text-xs relative z-[100]">
      <p className="text-muted-foreground mb-1.5">
        Datum: <span className="font-semibold text-foreground">{label}</span>
      </p>
      <div className="space-y-0.5">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">
              {DATAKEY_LABELS[entry.dataKey] ?? entry.dataKey}:
            </span>
            <span className="font-bold text-foreground">
              {entry.dataKey === "rate" ? `${entry.value.toFixed(1)}%` : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ConversionChart({ data, subtitle }: ConversionChartProps) {
  const maxCalls = Math.max(...data.map((d) => d.calls), 1);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
    const timer = setTimeout(() => setRevealed(true), 50);
    return () => clearTimeout(timer);
  }, [data, subtitle]);

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 w-full h-full overflow-visible">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Entwicklung</CardTitle>
        <CardDescription>{subtitle ?? "Letzte 7 Tage"}</CardDescription>
      </CardHeader>
      <CardContent className="pb-6 overflow-visible">
        <div
          className="h-[280px] overflow-visible"
          style={{
            clipPath: revealed ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
            transition: "clip-path 2.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="gradientCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradientRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="rate"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
                domain={[0, 100]}
              />
              <YAxis
                yAxisId="calls"
                orientation="right"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={[0, Math.ceil(maxCalls * 1.2)]}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--border)" }} isAnimationActive={false} allowEscapeViewBox={{ x: true, y: true }} />
              <Legend
                verticalAlign="top"
                align="left"
                height={48}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingLeft: 14 }}
                formatter={(value: string) => (
                  <span className="text-xs text-muted-foreground font-medium ml-1">
                    {value === "rate" ? "Conversion" : "Calls"}
                  </span>
                )}
              />
              <Area
                yAxisId="rate"
                type="monotone"
                dataKey="rate"
                stroke="var(--chart-2)"
                strokeWidth={2}
                fill="url(#gradientRate)"
                dot={false}
                activeDot={{ r: 4, fill: "var(--chart-2)", stroke: "var(--background)", strokeWidth: 2 }}
                isAnimationActive={false}
              />
              <Area
                yAxisId="calls"
                type="monotone"
                dataKey="calls"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#gradientCalls)"
                dot={false}
                activeDot={{ r: 4, fill: "var(--chart-1)", stroke: "var(--background)", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
