"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface LeadScoreDistributionProps {
  data: { grade: string; count: number; color: string }[];
}

export default function LeadScoreDistribution({
  data,
}: LeadScoreDistributionProps) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-[var(--card-shadow)]">
      <h3 className="text-sm font-medium text-[var(--muted)] mb-4">
        Lead-Score Verteilung
      </h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="grade" stroke="#737373" fontSize={14} />
            <YAxis stroke="#737373" fontSize={12} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "#141414",
                border: "1px solid #262626",
                borderRadius: "8px",
                color: "#ededed",
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
