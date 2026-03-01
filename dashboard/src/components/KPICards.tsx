"use client";

import { Phone, TrendingUp, Clock, SmilePlus } from "lucide-react";
import { KPICard } from "@/components/ui/KPICard";

interface KPICardsProps {
  callsToday: number;
  totalCalls: number;
  conversionRate: number;
  avgDuration: number;
  positiveSentimentRate: number;
}

export default function KPICards({
  callsToday,
  totalCalls,
  conversionRate,
  avgDuration,
  positiveSentimentRate,
}: KPICardsProps) {
  const mins = Math.floor(avgDuration / 60);
  const secs = Math.round(avgDuration % 60);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        label="Anrufe heute"
        numericValue={callsToday}
        suffix=""
        icon={Phone}
        colorClass="text-purple-400"
        bgClass="bg-purple-500/10"
        subtitle={`Gesamt: ${totalCalls}`}
      />
      <KPICard
        label="Conversion-Rate"
        numericValue={conversionRate}
        suffix="%"
        icon={TrendingUp}
        colorClass="text-green-400"
        bgClass="bg-green-500/10"
        subtitle="Termine / Alle Anrufe"
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
        label="Sentiment"
        numericValue={positiveSentimentRate}
        suffix="%"
        icon={SmilePlus}
        colorClass="text-emerald-400"
        bgClass="bg-emerald-500/10"
        subtitle="Positiv gestimmte Calls"
      />
    </div>
  );
}
