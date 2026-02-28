"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Card from "@/components/ui/Card";
import type { Lead } from "@/lib/types";

interface CallDurationDistributionProps {
  leads: Lead[];
}

interface DurationBucket {
  label: string;
  count: number;
  minSec: number;
  maxSec: number;
}

const BUCKETS: { label: string; min: number; max: number }[] = [
  { label: "0-1 min", min: 0, max: 60 },
  { label: "1-2 min", min: 60, max: 120 },
  { label: "2-3 min", min: 120, max: 180 },
  { label: "3-5 min", min: 180, max: 300 },
  { label: "5-8 min", min: 300, max: 480 },
  { label: "8+ min", min: 480, max: Infinity },
];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: DurationBucket }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm shadow-lg">
      <span className="text-[var(--foreground)]">{entry.label}</span>
      <span className="text-[var(--text-secondary)] ml-2">{entry.count} Gespraeche</span>
    </div>
  );
}

export default function CallDurationDistribution({ leads }: CallDurationDistributionProps) {
  const data = useMemo<DurationBucket[]>(() => {
    return BUCKETS.map((bucket) => {
      const count = leads.filter((l) => {
        const dur = l.call_duration_seconds;
        if (dur === null || dur === undefined) return false;
        return dur >= bucket.min && dur < bucket.max;
      }).length;
      return {
        label: bucket.label,
        count,
        minSec: bucket.min,
        maxSec: bucket.max,
      };
    });
  }, [leads]);

  const hasData = data.some((d) => d.count > 0);

  return (
    <Card>
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">
        Gespraechsdauer
      </h3>
      <div className="h-[260px]">
        {!hasData ? (
          <div className="flex items-center justify-center h-full text-[var(--text-secondary)] text-sm">
            Keine Gespraechsdauer-Daten vorhanden
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d4e" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#8b8fa3", fontSize: 12 }}
                axisLine={{ stroke: "#2a2d4e" }}
              />
              <YAxis
                tick={{ fill: "#8b8fa3", fontSize: 12 }}
                axisLine={{ stroke: "#2a2d4e" }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
