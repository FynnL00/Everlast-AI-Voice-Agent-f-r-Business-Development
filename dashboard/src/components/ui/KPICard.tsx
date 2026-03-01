"use client";

import { AnimatedNumber } from "@/components/ui/animated-number";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export interface KPICardProps {
  label: string;
  value?: string;
  numericValue?: number;
  suffix?: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  subtitle?: string;
  sparklineData?: number[];
  trend?: { delta: number; improving: boolean } | null;
}

export function KPICard({
  label,
  value,
  numericValue,
  suffix = "",
  icon: Icon,
  colorClass,
  bgClass,
  subtitle,
  sparklineData,
}: KPICardProps) {
  const ariaValue = numericValue !== undefined ? `${numericValue}${suffix}` : value ?? "-";

  return (
    <div
      className="flex items-center p-4 rounded-2xl bg-sidebar-accent/50 border border-border relative group hover:bg-sidebar-accent transition-colors gap-4"
      role="status"
      aria-label={`${label}: ${ariaValue}`}
    >
      <div className={`p-3 rounded-full shrink-0 ${bgClass} ${colorClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">
          {label}
        </span>
        <span className="text-2xl font-bold tabular-nums text-foreground">
          {numericValue !== undefined ? (
            <AnimatedNumber value={numericValue} suffix={suffix} />
          ) : (
            value ?? "-"
          )}
        </span>
        {subtitle && (
          <span className="text-[10px] text-muted-foreground mt-0.5 tracking-tight truncate">
            {subtitle}
          </span>
        )}
        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-1 h-8 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData.map((v, i) => ({ v, i }))}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
