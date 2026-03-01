"use client";

import { Phone, TrendingUp, CalendarCheck, Clock, Star } from "lucide-react";
import { KPICard } from "@/components/ui/KPICard";

interface KPICardsProps {
  callsToday: number;
  totalCalls: number;
  winRate: number;
  appointmentRate: number;
  avgDuration: number;
  aLeadsToday: number;
  sparklines?: {
    calls?: number[];
    winRate?: number[];
    appointments?: number[];
    aLeads?: number[];
  };
}

export default function KPICards({
  callsToday,
  totalCalls,
  winRate,
  appointmentRate,
  avgDuration,
  aLeadsToday,
  sparklines,
}: KPICardsProps) {
  const mins = Math.floor(avgDuration / 60);
  const secs = Math.round(avgDuration % 60);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <KPICard
        label="Anrufe heute"
        numericValue={callsToday}
        suffix=""
        icon={Phone}
        colorClass="text-purple-400"
        bgClass="bg-purple-500/10"
        subtitle={`Gesamt: ${totalCalls}`}
        sparklineData={sparklines?.calls}
      />
      <KPICard
        label="Win Rate"
        numericValue={winRate}
        suffix="%"
        icon={TrendingUp}
        colorClass="text-green-400"
        bgClass="bg-green-500/10"
        subtitle="Gewonnen / Abgeschlossen"
        sparklineData={sparklines?.winRate}
      />
      <KPICard
        label="Termin-Quote"
        numericValue={appointmentRate}
        suffix="%"
        icon={CalendarCheck}
        colorClass="text-blue-400"
        bgClass="bg-blue-500/10"
        subtitle="Gebuchte Termine / Anrufe"
        sparklineData={sparklines?.appointments}
      />
      <KPICard
        label="Gesprächsdauer"
        value={`${mins}:${secs.toString().padStart(2, "0")}`}
        icon={Clock}
        colorClass="text-amber-400"
        bgClass="bg-amber-500/10"
        subtitle="Durchschnittlich"
      />
      <KPICard
        label="A-Leads heute"
        numericValue={aLeadsToday}
        suffix=""
        icon={Star}
        colorClass="text-red-400"
        bgClass="bg-red-500/10"
        sparklineData={sparklines?.aLeads}
      />
    </div>
  );
}
