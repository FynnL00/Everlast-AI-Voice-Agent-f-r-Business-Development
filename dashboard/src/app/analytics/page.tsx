"use client";

import { useLeads } from "@/lib/leads-context";
import PageHeader from "@/components/ui/PageHeader";
import AnalyticsKPIs from "@/components/analytics/AnalyticsKPIs";
import SentimentDistribution from "@/components/analytics/SentimentDistribution";
import DropOffAnalysis from "@/components/analytics/DropOffAnalysis";
import ScoreBreakdown from "@/components/analytics/ScoreBreakdown";
import DecisionMakerRatio from "@/components/analytics/DecisionMakerRatio";
import CallDurationDistribution from "@/components/analytics/CallDurationDistribution";
import { PieChart } from "lucide-react";

export default function AnalyticsPage() {
  const { leads, loading } = useLeads();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Analytik lädt...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <PageHeader
        title="Analytik"
        subtitle="Detaillierte Auswertungen"
        icon={PieChart}
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
