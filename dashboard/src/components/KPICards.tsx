"use client";

import { PhoneOutgoing, PhoneCall, Clock, CalendarCheck } from "lucide-react";
import { KPICard } from "@/components/ui/KPICard";

interface KPICardsProps {
  attempts: number;
  connectionRate: number;
  avgDuration: number;
  demoBookingRate: number;
  callLabel: string;
  callSubtitle?: string;
}

export default function KPICards({
  attempts,
  connectionRate,
  avgDuration,
  demoBookingRate,
  callLabel,
  callSubtitle,
}: KPICardsProps) {
  const mins = Math.floor(avgDuration / 60);
  const secs = Math.round(avgDuration % 60);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        label={callLabel}
        numericValue={attempts}
        suffix=""
        icon={PhoneOutgoing}
        colorClass="text-purple-400"
        bgClass="bg-purple-500/10"
        subtitle={callSubtitle}
        tooltip="Gesamtanzahl aller Outbound-Anrufversuche im gewählten Zeitraum."
      />
      <KPICard
        label="Conversion Rate"
        numericValue={demoBookingRate}
        suffix="%"
        icon={CalendarCheck}
        colorClass="text-emerald-400"
        bgClass="bg-emerald-500/10"
        tooltip="Anteil der erreichten Kontakte, die eine Demo gebucht haben."
        tooltipFormula="Conversion Rate = Demos gebucht ÷ Erreichte × 100"
      />
      <KPICard
        label="Ø Gesprächsdauer"
        value={`${mins}:${secs.toString().padStart(2, "0")}`}
        icon={Clock}
        colorClass="text-cyan-400"
        bgClass="bg-cyan-500/10"
        tooltip="Durchschnittliche Dauer aller verbundenen Gespräche."
        tooltipFormula="Ø Dauer = Summe Gesprächszeiten ÷ Verbundene Gespräche"
      />
      <KPICard
        label="Connection Rate"
        numericValue={connectionRate}
        suffix="%"
        icon={PhoneCall}
        colorClass="text-green-400"
        bgClass="bg-green-500/10"
        tooltip="Anteil der Anrufversuche, bei denen der Kontakt erreicht wurde."
        tooltipFormula="Connection Rate = Erreichte ÷ Versuche × 100"
      />
    </div>
  );
}
