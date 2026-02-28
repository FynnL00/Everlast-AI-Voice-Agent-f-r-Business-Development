"use client";

import { Phone, CalendarCheck, Clock, Star } from "lucide-react";
import Card from "@/components/ui/Card";

interface KPICardsProps {
  totalCalls: number;
  conversionRate: number;
  avgDuration: number;
  aLeadsToday: number;
}

function KPICard({
  label,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}) {
  return (
    <Card accentColor={color}>
      <div className="flex items-center gap-4">
        {/* Icon circle */}
        <div
          className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon size={22} color={color} />
        </div>

        {/* Content */}
        <div className="min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            {label}
          </span>
          <div className="text-3xl font-bold leading-tight" style={{ color }}>
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-[var(--muted)] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </Card>
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
        value={totalCalls.toString()}
        icon={Phone}
        color="#8b5cf6"
        subtitle="Alle eingehenden Anrufe"
      />
      <KPICard
        label="Conversion Rate"
        value={`${conversionRate.toFixed(1)}%`}
        icon={CalendarCheck}
        color="#22c55e"
        subtitle="Calls → gebuchte Termine"
      />
      <KPICard
        label="Ø Gesprächsdauer"
        value={`${mins}:${secs.toString().padStart(2, "0")}`}
        icon={Clock}
        color="#f59e0b"
        subtitle="Minuten pro Call"
      />
      <KPICard
        label="A-Leads heute"
        value={aLeadsToday.toString()}
        icon={Star}
        color="#ff6d5a"
        subtitle="Hot Leads mit Score 10-12"
      />
    </div>
  );
}
