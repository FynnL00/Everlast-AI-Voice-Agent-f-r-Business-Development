"use client";

import { Phone, TrendingUp, Clock, SmilePlus } from "lucide-react";
import { KPICard } from "@/components/ui/KPICard";

interface KPICardsProps {
  callsInRange: number;
  callLabel: string;
  callSubtitle?: string;
  conversionRate: number;
  avgDuration: number;
  positiveSentimentRate: number;
}

export default function KPICards({
  callsInRange,
  callLabel,
  callSubtitle,
  conversionRate,
  avgDuration,
  positiveSentimentRate,
}: KPICardsProps) {
  const mins = Math.floor(avgDuration / 60);
  const secs = Math.round(avgDuration % 60);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        label={callLabel}
        numericValue={callsInRange}
        suffix=""
        icon={Phone}
        colorClass="text-purple-400"
        bgClass="bg-purple-500/10"
        subtitle={callSubtitle}
        tooltip="Anzahl eingehender Anrufe im gewählten Zeitraum."
      />
      <KPICard
        label="Conversion-Rate"
        numericValue={conversionRate}
        suffix="%"
        icon={TrendingUp}
        colorClass="text-green-400"
        bgClass="bg-green-500/10"
        tooltip="Anteil der Anrufe, die zu einem gebuchten Termin geführt haben."
        tooltipFormula="Conversion Rate = Termine ÷ Alle Anrufe × 100"
      />
      <KPICard
        label="Gesprächsdauer"
        value={`${mins}:${secs.toString().padStart(2, "0")}`}
        icon={Clock}
        colorClass="text-amber-400"
        bgClass="bg-amber-500/10"
        tooltip="Durchschnittliche Dauer aller aufgezeichneten Gespräche."
        tooltipFormula="Ø Dauer = Summe Gesprächszeiten ÷ Anzahl Gespräche"
      />
      <KPICard
        label="Sentiment"
        numericValue={positiveSentimentRate}
        suffix="%"
        icon={SmilePlus}
        colorClass="text-emerald-400"
        bgClass="bg-emerald-500/10"
        tooltip="Anteil der Gespräche mit positiver Stimmungsanalyse."
        tooltipFormula="Positiv-Rate = Positive Calls ÷ Calls mit Sentiment × 100"
      />
    </div>
  );
}
