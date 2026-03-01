"use client";

import { useMemo } from "react";
import { Shield, Target, Smile, CalendarCheck } from "lucide-react";
import type { Lead } from "@/lib/types";
import { KPICard } from "@/components/ui/KPICard";

interface AnalyticsKPIsProps {
  leads: Lead[];
}

export default function AnalyticsKPIs({ leads }: AnalyticsKPIsProps) {
  const kpis = useMemo(() => {
    const total = leads.length;

    // Decision-maker percentage (only count leads where we know the answer)
    const decisionMakers = leads.filter((l) => l.is_decision_maker === true).length;
    const knowns = leads.filter(l => l.is_decision_maker !== null).length;
    const decisionMakerPct = knowns > 0 ? (decisionMakers / knowns) * 100 : 0;

    // Average total_score (only leads that have at least one individual score set)
    const leadsWithScore = leads.filter(l =>
      l.score_company_size !== null || l.score_tech_stack !== null ||
      l.score_pain_point !== null || l.score_timeline !== null
    );
    const avgScore = leadsWithScore.length > 0
      ? leadsWithScore.reduce((sum, l) => sum + (l.total_score ?? 0), 0) / leadsWithScore.length : 0;

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
