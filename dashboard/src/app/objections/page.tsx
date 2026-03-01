"use client";

import { useLeads } from "@/lib/leads-context";
import PageHeader from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import ObjectionsKPIs from "@/components/objections/ObjectionsKPIs";
import ObjectionRanking from "@/components/objections/ObjectionRanking";
import ObjectionTrend from "@/components/objections/ObjectionTrend";
import ObjectionConversionCorrelation from "@/components/objections/ObjectionConversionCorrelation";
import ObjectionCounterArguments from "@/components/objections/ObjectionCounterArguments";
import { MessageSquareWarning } from "lucide-react";

export default function ObjectionsPage() {
  const { leads, loading } = useLeads();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Einwände laden...</div>
      </div>
    );
  }

  const hasObjections = leads.some(
    (l) => l.objections_raised && l.objections_raised.length > 0
  );

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <PageHeader
        title="Einwände"
        subtitle="Analyse und Gegenargumente"
        icon={MessageSquareWarning}
      />

      {!hasObjections ? (
        <EmptyState
          icon={MessageSquareWarning}
          title="Keine Einwände erfasst"
          description="Sobald Leads Einwände äußern, erscheinen hier detaillierte Auswertungen."
        />
      ) : (
        <>
          {/* KPI Row */}
          <ObjectionsKPIs leads={leads} />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ObjectionRanking leads={leads} />
            <ObjectionConversionCorrelation leads={leads} />
          </div>

          {/* Full-width trend */}
          <ObjectionTrend leads={leads} />

          {/* Counter arguments */}
          <ObjectionCounterArguments leads={leads} />
        </>
      )}
    </div>
  );
}
