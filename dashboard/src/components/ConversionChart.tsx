"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ConversionChartProps {
  data: { date: string; rate: number }[];
}

export default function ConversionChart({ data }: ConversionChartProps) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <h3 className="text-sm font-medium text-[var(--muted)] mb-4">
        Conversion Trend (7 Tage)
      </h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="date" stroke="#737373" fontSize={12} />
            <YAxis
              stroke="#737373"
              fontSize={12}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: "#141414",
                border: "1px solid #262626",
                borderRadius: "8px",
                color: "#ededed",
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, "Conversion"]}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: "#8b5cf6", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
