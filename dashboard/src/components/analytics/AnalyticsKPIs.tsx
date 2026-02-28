"use client";

import { useMemo } from "react";
import { Shield, Target, Smile, CalendarCheck } from "lucide-react";
import type { Lead } from "@/lib/types";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface AnalyticsKPIsProps {
  leads: Lead[];
}

function KPICard({
  label,
  value,
  numericValue,
  suffix = "",
  icon: Icon,
  colorClass,
  bgClass,
  subtitle,
}: {
  label: string;
  value?: string;
  numericValue?: number;
  suffix?: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center p-4 rounded-2xl bg-sidebar-accent/50 border border-border relative group hover:bg-sidebar-accent transition-colors gap-4">
      <div className={`p-3 rounded-full shrink-0 ${bgClass} ${colorClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">{label}</span>
        <span className="text-2xl font-bold tabular-nums text-foreground">
          {numericValue !== undefined ? (
            <AnimatedNumber value={numericValue} suffix={suffix} />
          ) : (
            value
          )}
        </span>
        <span className="text-[10px] text-muted-foreground mt-0.5 tracking-tight truncate">{subtitle}</span>
      </div>
    </div>
  );
}

export default function AnalyticsKPIs({ leads }: AnalyticsKPIsProps) {
  const kpis = useMemo(() => {
    const total = leads.length;

    // Decision-maker percentage
    const decisionMakers = leads.filter((l) => l.is_decision_maker === true).length;
    const decisionMakerPct = total > 0 ? (decisionMakers / total) * 100 : 0;

    // Average total_score (only leads that have a score)
    const leadsWithScore = leads.filter((l) => l.total_score !== null && l.total_score !== undefined);
    const avgScore =
      leadsWithScore.length > 0
        ? leadsWithScore.reduce((sum, l) => sum + (l.total_score ?? 0), 0) / leadsWithScore.length
        : 0;

    // Positive sentiment rate
    const leadsWithSentiment = leads.filter((l) => l.sentiment !== null);
    const positiveSentiment = leadsWithSentiment.filter((l) => l.sentiment === "positiv").length;
    const positivePct = leadsWithSentiment.length > 0 ? (positiveSentiment / leadsWithSentiment.length) * 100 : 0;

    // A-Lead appointment rate
    const aLeads = leads.filter((l) => l.lead_grade === "A");
    const aLeadsWithAppointment = aLeads.filter((l) => l.appointment_booked).length;
    const aLeadAppointmentPct = aLeads.length > 0 ? (aLeadsWithAppointment / aLeads.length) * 100 : 0;

    return { decisionMakerPct, avgScore, positivePct, aLeadAppointmentPct };
  }, [leads]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        label="Entscheider-Quote"
        numericValue={kpis.decisionMakerPct}
        suffix="%"
        icon={Shield}
        colorClass="text-purple-400"
        bgClass="bg-purple-500/10"
        subtitle="Anteil Entscheidungsträger"
      />
      <KPICard
        label="Ø Score"
        numericValue={kpis.avgScore}
        suffix=""
        icon={Target}
        colorClass="text-amber-400"
        bgClass="bg-amber-500/10"
        subtitle="Durchschnittlicher Lead-Score"
      />
      <KPICard
        label="Positiv-Rate"
        numericValue={kpis.positivePct}
        suffix="%"
        icon={Smile}
        colorClass="text-green-400"
        bgClass="bg-green-500/10"
        subtitle="Positives Gesprächssentiment"
      />
      <KPICard
        label="A-Lead Termin-%"
        numericValue={kpis.aLeadAppointmentPct}
        suffix="%"
        icon={CalendarCheck}
        colorClass="text-pink-400"
        bgClass="bg-pink-500/10"
        subtitle="A-Leads mit geb. Termin"
      />
    </div>
  );
}
