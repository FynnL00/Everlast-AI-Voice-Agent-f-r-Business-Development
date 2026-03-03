"use client";

import { Info } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

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
  tooltip?: string;
  tooltipFormula?: string;
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
  trend,
  tooltip,
  tooltipFormula,
}: KPICardProps) {
  const ariaValue = numericValue !== undefined ? `${numericValue}${suffix}` : value ?? "-";

  return (
    <div
      className="flex items-center p-5 rounded-2xl bg-sidebar-accent/50 border border-border relative group hover:bg-sidebar-accent hover:border-foreground/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-px transition-all duration-200 gap-5"
      role="status"
      aria-label={`${label}: ${ariaValue}`}
    >
      <div className={`p-3 rounded-full shrink-0 ${bgClass} ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
            {label}
          </span>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-help"
                  aria-label={`Info: ${label}`}
                  tabIndex={0}
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-64 p-3">
                <p className="font-semibold text-card-foreground text-sm mb-1">{label}</p>
                <p className="text-xs text-card-foreground/80 leading-relaxed">{tooltip}</p>
                {tooltipFormula && (
                  <p className="text-[11px] text-muted-foreground mt-2 font-mono">{tooltipFormula}</p>
                )}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums text-foreground leading-none">
            {numericValue !== undefined ? (
              <AnimatedNumber value={numericValue} suffix={suffix} />
            ) : (
              value ?? "-"
            )}
          </span>
          {trend && (
            <span className={`text-sm font-semibold ${trend.improving ? "text-emerald-500" : "text-red-500"}`}>
              {trend.delta > 0 ? "+" : ""}{trend.delta}%
            </span>
          )}
        </div>
        {subtitle && (
          <span className="text-[10px] text-muted-foreground mt-1 tracking-tight truncate">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
