"use client";

import { Phone, CalendarCheck, Clock, Star } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface KPICardsProps {
  totalCalls: number;
  conversionRate: number;
  avgDuration: number;
  aLeadsToday: number;
}

function KPICard({
  label,
  value,
  numericValue,
  suffix = "",
  icon: Icon,
  colorClass,
  bgClass,
}: {
  label: string;
  value?: string;
  numericValue?: number;
  suffix?: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <div className="flex items-center p-4 rounded-2xl bg-sidebar-accent/50 border border-border relative group hover:bg-sidebar-accent transition-colors gap-4">
      <div className={`p-3 rounded-full shrink-0 ${bgClass} ${colorClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</span>
        <span className="text-2xl font-bold tabular-nums text-foreground">
          {numericValue !== undefined ? (
            <AnimatedNumber value={numericValue} suffix={suffix} />
          ) : (
            value
          )}
        </span>
      </div>
    </div>
  );
}

export default function KPICards({
  totalCalls,
  conversionRate,
  avgDuration,
  aLeadsToday,
}: KPICardsProps) {
  const mins = Math.floor(avgDuration / 60);
  const secs = Math.round(avgDuration % 60);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        label="Total Calls"
        numericValue={totalCalls}
        suffix=""
        icon={Phone}
        colorClass="text-purple-400"
        bgClass="bg-purple-500/10"
      />
      <KPICard
        label="Conversion Rate"
        numericValue={conversionRate}
        suffix="%"
        icon={CalendarCheck}
        colorClass="text-green-400"
        bgClass="bg-green-500/10"
      />
      <KPICard
        label="Gesprächsdauer"
        value={`${mins}:${secs.toString().padStart(2, "0")}`}
        icon={Clock}
        colorClass="text-amber-400"
        bgClass="bg-amber-500/10"
      />
      <KPICard
        label="A-Leads heute"
        numericValue={aLeadsToday}
        suffix=""
        icon={Star}
        colorClass="text-red-400"
        bgClass="bg-red-500/10"
      />
    </div>
  );
}
