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

interface ConversionChartProps {
  data: { date: string; rate: number; calls: number }[];
}

const DATAKEY_LABELS: Record<string, string> = {
  calls: "Total Calls",
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
    <div className="rounded-xl bg-[var(--card)] border border-[var(--card-border)] px-4 py-3 shadow-lg min-w-[160px]">
      <p className="text-[var(--text-secondary)] text-sm mb-2">
        Datum: <span className="font-semibold text-[var(--foreground)]">{label}</span>
      </p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[var(--text-secondary)]">
              {DATAKEY_LABELS[entry.dataKey] ?? entry.dataKey}:
            </span>
            <span className="font-bold text-[var(--foreground)]">
              {entry.dataKey === "rate" ? `${entry.value.toFixed(1)}%` : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ConversionChart({ data }: ConversionChartProps) {
  const maxCalls = Math.max(...data.map((d) => d.calls), 1);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-[var(--card-shadow)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[var(--muted)]">
          Score-Entwicklung
        </h3>
        <span className="text-xs text-[var(--muted)]">Letzte 7 Tage</span>
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="gradientCalls" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradientRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
              </linearGradient>
              {/* Clip mask for left-to-right reveal */}
              <clipPath id="reveal-clip">
                <rect
                  x="0"
                  y="0"
                  width={revealed ? "100%" : "0%"}
                  height="100%"
                  style={{ transition: "width 1.2s cubic-bezier(0.22, 1, 0.36, 1)" }}
                />
              </clipPath>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#232548" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#8b8fa3", fontSize: 11 }}
              axisLine={{ stroke: "#232548" }}
              tickLine={false}
            />
            <YAxis
              yAxisId="rate"
              tick={{ fill: "#8b8fa3", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
            />
            <YAxis
              yAxisId="calls"
              orientation="right"
              tick={{ fill: "#8b8fa3", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, Math.ceil(maxCalls * 1.2)]}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={32}
              formatter={(value: string) => (
                <span className="text-xs text-[var(--text-secondary)]">
                  {value === "calls" ? "Total Calls" : "Conversion"}
                </span>
              )}
            />
            <Area
              yAxisId="calls"
              type="monotone"
              dataKey="calls"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#gradientCalls)"
              dot={false}
              activeDot={{ r: 4, fill: "#3b82f6", stroke: "#1a1d3e", strokeWidth: 2 }}
              clipPath="url(#reveal-clip)"
              isAnimationActive={true}
              animationDuration={1200}
              animationEasing="ease-out"
            />
            <Area
              yAxisId="rate"
              type="monotone"
              dataKey="rate"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#gradientRate)"
              dot={false}
              activeDot={{ r: 4, fill: "#8b5cf6", stroke: "#1a1d3e", strokeWidth: 2 }}
              clipPath="url(#reveal-clip)"
              isAnimationActive={true}
              animationDuration={1400}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
