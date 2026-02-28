"use client";

import { useMemo } from "react";
import { Shield, Target, Smile, CalendarCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import type { Lead } from "@/lib/types";

interface AnalyticsKPIsProps {
  leads: Lead[];
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
  subtitle: string;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
        <Icon size={20} color={color} />
      </div>
      <div className="text-3xl font-bold" style={{ color }}>
        {value}
      </div>
      <p className="text-xs text-[var(--text-secondary)] mt-1">{subtitle}</p>
    </Card>
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        label="Entscheider-Quote"
        value={`${kpis.decisionMakerPct.toFixed(1)}%`}
        icon={Shield}
        color="#8b5cf6"
        subtitle="Anteil Entscheidungstraeger"
      />
      <KPICard
        label="Ø Score"
        value={kpis.avgScore.toFixed(1)}
        icon={Target}
        color="#f59e0b"
        subtitle="Durchschnittlicher Lead-Score"
      />
      <KPICard
        label="Positiv-Rate"
        value={`${kpis.positivePct.toFixed(1)}%`}
        icon={Smile}
        color="#42d77d"
        subtitle="Positives Gespraechssentiment"
      />
      <KPICard
        label="A-Lead Termin-%"
        value={`${kpis.aLeadAppointmentPct.toFixed(1)}%`}
        icon={CalendarCheck}
        color="#EA4B71"
        subtitle="A-Leads mit gebuchtem Termin"
      />
    </div>
  );
}
