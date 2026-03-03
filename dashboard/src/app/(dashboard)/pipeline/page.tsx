"use client";

import { useMemo } from "react";
import {
  KanbanSquare,
  Layers,
  TrendingUp,
  TrendingDown,
  Target,
} from "lucide-react";
import { useLeads } from "@/lib/leads-context";
import PageHeader from "@/components/ui/PageHeader";
import { KPICard } from "@/components/ui/KPICard";
import PipelineSummary from "@/components/pipeline/PipelineSummary";
import PipelineBoard from "@/components/pipeline/PipelineBoard";

export default function PipelinePage() {
  const { filteredLeads, loading } = useLeads();

  const kpis = useMemo(() => {
    const inPipeline = filteredLeads.filter(
      (l) => !["converted", "lost"].includes(l.status)
    ).length;

    const converted = filteredLeads.filter(
      (l) => l.status === "converted"
    ).length;
    const lost = filteredLeads.filter((l) => l.status === "lost").length;
    const closedTotal = converted + lost;

    const winRate =
      closedTotal > 0 ? Math.round((converted / closedTotal) * 100) : 0;
    const lostRate =
      closedTotal > 0 ? Math.round((lost / closedTotal) * 100) : 0;

    const leadsWithScore = filteredLeads.filter(
      (l) => l.total_score !== null && l.total_score > 0
    );
    const avgScore =
      leadsWithScore.length > 0
        ? Math.round(
            (leadsWithScore.reduce((sum, l) => sum + (l.total_score ?? 0), 0) /
              leadsWithScore.length) *
              10
          ) / 10
        : 0;

    return { inPipeline, winRate, lostRate, avgScore };
  }, [filteredLeads]);

  return (
    <div className="min-h-screen py-6 md:py-8 max-w-[1900px] mx-auto space-y-6">
      <PageHeader
        title="Pipeline"
        subtitle="Leads nach Status in der Vertriebspipeline"
        icon={KanbanSquare}
      />

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="glass p-6 rounded-2xl w-full transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 block">
              Pipeline KPIs
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                label="Pipeline-Gesamt"
                numericValue={kpis.inPipeline}
                icon={Layers}
                colorClass="text-blue-400"
                bgClass="bg-blue-500/10"
                tooltip="Anzahl aktiver Leads, die noch nicht converted oder lost sind."
              />
              <KPICard
                label="Win Rate"
                numericValue={kpis.winRate}
                suffix="%"
                icon={TrendingUp}
                colorClass="text-green-400"
                bgClass="bg-green-500/10"
                tooltip="Anteil der abgeschlossenen Deals, die gewonnen wurden."
                tooltipFormula="Win Rate = Converted ÷ (Converted + Lost) × 100"
              />
              <KPICard
                label="Lost Rate"
                numericValue={kpis.lostRate}
                suffix="%"
                icon={TrendingDown}
                colorClass="text-red-400"
                bgClass="bg-red-500/10"
                tooltip="Anteil der abgeschlossenen Deals, die verloren gingen."
                tooltipFormula="Lost Rate = Lost ÷ (Converted + Lost) × 100"
              />
              <KPICard
                label="Ø Score"
                value={kpis.avgScore.toFixed(1)}
                icon={Target}
                colorClass="text-purple-400"
                bgClass="bg-purple-500/10"
                tooltip="Durchschnittlicher Qualifizierungsscore aller bewerteten Leads."
                tooltipFormula="Ø Score = Summe Scores ÷ Bewertete Leads"
              />
            </div>
          </div>

          <PipelineSummary />
          <PipelineBoard />
        </>
      )}
    </div>
  );
}
