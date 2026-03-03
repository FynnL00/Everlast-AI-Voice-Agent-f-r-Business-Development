"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Treemap,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { normalizeObjection, cn } from "@/lib/utils";
import type { Lead } from "@/lib/types";
import { BarChart3, Grid3X3 } from "lucide-react";

interface ObjectionRankingProps {
  leads: Lead[];
  subtitle?: string;
}

interface ObjectionEntry {
  objection: string;
  count: number;
}

interface TreemapEntry {
  name: string;
  size: number;
  fill: string;
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ObjectionEntry }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-xl bg-card border border-border px-4 py-3 shadow-[0_6px_20px_rgba(0,0,0,0.4)] min-w-[160px] backdrop-blur-xl">
      <span className="font-semibold text-foreground">{entry.objection}</span>
      <span className="text-muted-foreground ml-2">{entry.count}x genannt</span>
    </div>
  );
}

// Custom Treemap tooltip
function TreemapTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: TreemapEntry }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-xl bg-card border border-border px-4 py-3 shadow-[0_6px_20px_rgba(0,0,0,0.4)] min-w-[160px] backdrop-blur-xl">
      <span className="font-semibold text-foreground">{entry.name}</span>
      <span className="text-muted-foreground ml-2">{entry.size}x genannt</span>
    </div>
  );
}

// Custom treemap content renderer
function TreemapContent(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  size?: number;
  fill?: string;
  root?: unknown;
  depth?: number;
  index?: number;
}) {
  const { x = 0, y = 0, width = 0, height = 0, name, size, fill, depth } = props;
  if (depth !== 1) return null;

  const showText = width > 50 && height > 30;
  const showSize = width > 40 && height > 45;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        fill={fill}
        fillOpacity={0.7}
        stroke="var(--card)"
        strokeWidth={2}
      />
      {showText && (
        <text
          x={x + width / 2}
          y={y + height / 2 - (showSize ? 6 : 0)}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--foreground)"
          fontSize={Math.min(12, width / 8)}
          fontWeight={600}
        >
          {name && name.length > width / 8 ? name.slice(0, Math.floor(width / 8)) + "..." : name}
        </text>
      )}
      {showSize && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 12}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--muted-foreground)"
          fontSize={10}
        >
          {size}x
        </text>
      )}
    </g>
  );
}

export default function ObjectionRanking({ leads, subtitle }: ObjectionRankingProps) {
  const [viewMode, setViewMode] = useState<"bar" | "treemap">("bar");

  const data = useMemo<ObjectionEntry[]>(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      if (l.objections_raised) {
        l.objections_raised.forEach((obj) => {
          const normalized = normalizeObjection(obj);
          if (normalized) {
            counts[normalized] = (counts[normalized] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(counts)
      .map(([objection, count]) => ({ objection, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [leads]);

  const treemapData = useMemo<TreemapEntry[]>(
    () =>
      data.map((d, i) => ({
        name: d.objection,
        size: d.count,
        fill: CHART_COLORS[i % CHART_COLORS.length],
      })),
    [data]
  );

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-px w-full h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base font-semibold">Top 10 Einwände</CardTitle>
            {subtitle && <span className="text-xs text-muted-foreground font-medium">{subtitle}</span>}
          </div>
          <div className="flex items-center gap-1 bg-sidebar-accent/50 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("bar")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "bar"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Balkendiagramm"
            >
              <BarChart3 size={14} />
            </button>
            <button
              onClick={() => setViewMode("treemap")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "treemap"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label="Treemap"
            >
              <Grid3X3 size={14} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="h-[360px]">
          {data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Keine Einwand-Daten vorhanden
            </div>
          ) : viewMode === "bar" ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
                <defs>
                  {CHART_COLORS.map((color, i) => (
                    <linearGradient key={i} id={`gradObjRank${i}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.35} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="objection"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={140}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.2 }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                  {data.map((entry, index) => (
                    <Cell key={entry.objection} fill={`url(#gradObjRank${index % CHART_COLORS.length})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="var(--card)"
                content={<TreemapContent />}
              >
                <Tooltip content={<TreemapTooltip />} />
              </Treemap>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
