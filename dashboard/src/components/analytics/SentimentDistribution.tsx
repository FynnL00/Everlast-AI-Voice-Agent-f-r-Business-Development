"use client";

import { useMemo, useState, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import type { Lead } from "@/lib/types";

interface SentimentDistributionProps {
  leads: Lead[];
}

const SENTIMENT_CONFIG: Record<string, { label: string; color: string; light: string }> = {
  positiv: { label: "Positiv", color: "#10b981", light: "#6ee7b7" },
  neutral: { label: "Neutral", color: "#facc15", light: "#fde047" },
  negativ: { label: "Negativ", color: "#ef4444", light: "#fca5a5" },
};

interface SentimentEntry {
  name: string;
  value: number;
  color: string;
  light: string;
}

function renderGlowActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 3}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        filter="url(#sentiment-glow)"
        style={{ transition: "all 0.2s ease-out" }}
      />
    </g>
  );
}

const renderCustomLabel = (props: any) => {
  const { cx, cy, midAngle, outerRadius, percent, name, payload } = props;
  if (percent === 0) return null;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.15;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill={payload.color}
      fontSize={12}
      fontWeight="600"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${name} ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: SentimentEntry }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-xl bg-card border border-border px-4 py-3 shadow-[0_6px_20px_rgba(0,0,0,0.4)] min-w-[160px] backdrop-blur-xl pointer-events-none">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className="font-semibold text-foreground">{entry.name}</span>
      </div>
      <p className="text-muted-foreground ml-4 mt-0.5">{entry.value} Leads</p>
    </div>
  );
}

export default function SentimentDistribution({ leads }: SentimentDistributionProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const onPieEnter = useCallback((_: any, index: number) => setActiveIndex(index), []);
  const onPieLeave = useCallback(() => setActiveIndex(undefined), []);

  const data = useMemo<SentimentEntry[]>(() => {
    const counts: Record<string, number> = { positiv: 0, neutral: 0, negativ: 0 };
    leads.forEach((l) => {
      if (l.sentiment && counts[l.sentiment] !== undefined) {
        counts[l.sentiment]++;
      }
    });
    return Object.entries(SENTIMENT_CONFIG).map(([key, cfg]) => ({
      name: cfg.label,
      value: counts[key],
      color: cfg.color,
      light: cfg.light,
    }));
  }, [leads]);

  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-0.5 w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Stimmungsverteilung</CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="h-[280px]">
          {total === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Keine Sentiment-Daten vorhanden
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {data.map((entry, i) => (
                    <radialGradient key={`sentiment-radial-${i}`} id={`sentiment-radial-${i}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                      <stop offset="100%" stopColor={entry.light} stopOpacity={0.8} />
                    </radialGradient>
                  ))}
                  <filter id="sentiment-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <Pie
                  data={data}
                  cx="50%"
                  cy="45%"
                  outerRadius={85}
                  innerRadius={55}
                  dataKey="value"
                  strokeWidth={0}
                  paddingAngle={3}
                  animationDuration={1200}
                  animationEasing="ease-out"
                  label={renderCustomLabel}
                  labelLine={{ stroke: "var(--muted-foreground)", strokeWidth: 1, opacity: 0.5 }}
                  {...({ activeIndex } as any)}
                  activeShape={renderGlowActiveShape}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  cursor="pointer"
                >
                  {data.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={`url(#sentiment-radial-${i})`}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string, entry: any) => {
                    const d = data.find(item => item.name === value);
                    return (
                      <span className="text-xs font-medium ml-1" style={{ color: d?.color }}>
                        {value}
                      </span>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
