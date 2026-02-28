"use client";

import { useLeads } from "@/lib/leads-context";
import PageHeader from "@/components/ui/PageHeader";
import AnalyticsKPIs from "@/components/analytics/AnalyticsKPIs";
import SentimentDistribution from "@/components/analytics/SentimentDistribution";
import DropOffAnalysis from "@/components/analytics/DropOffAnalysis";
import ScoreBreakdown from "@/components/analytics/ScoreBreakdown";
import DecisionMakerRatio from "@/components/analytics/DecisionMakerRatio";
import CallDurationDistribution from "@/components/analytics/CallDurationDistribution";

export default function AnalyticsPage() {
  const { leads, loading } = useLeads();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Analytik laedt...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Analytik"
        subtitle="Detaillierte Auswertungen"
      />

      {/* KPI Row */}
      <AnalyticsKPIs leads={leads} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <SentimentDistribution leads={leads} />
        <DropOffAnalysis leads={leads} />
        <ScoreBreakdown leads={leads} />
        <DecisionMakerRatio leads={leads} />
      </div>

      {/* Full-width chart */}
      <div className="mt-4">
        <CallDurationDistribution leads={leads} />
      </div>
    </div>
  );
}
