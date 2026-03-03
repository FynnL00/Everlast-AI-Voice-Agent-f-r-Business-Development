"use client";

import { ShieldAlert } from "lucide-react";
import { useLeads } from "@/lib/leads-context";
import PageHeader from "@/components/ui/PageHeader";
import ObjectionsKPIs from "@/components/objections/ObjectionsKPIs";
import ObjectionRanking from "@/components/objections/ObjectionRanking";
import ObjectionConversionCorrelation from "@/components/objections/ObjectionConversionCorrelation";
import ObjectionTrend from "@/components/objections/ObjectionTrend";
import ObjectionCounterArguments from "@/components/objections/ObjectionCounterArguments";
import DropOffAnalysis from "@/components/analytics/DropOffAnalysis";

export default function ObjectionsPage() {
  const { leads, loading } = useLeads();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 md:py-8 max-w-[1900px] mx-auto space-y-6">
      <PageHeader
        title="Gesprächshürden"
        subtitle="Einwände und Abbruchpunkte"
        icon={ShieldAlert}
      />
      <ObjectionsKPIs leads={leads} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ObjectionRanking leads={leads} />
        <DropOffAnalysis leads={leads} />
      </div>
      <ObjectionConversionCorrelation leads={leads} />
      <ObjectionTrend leads={leads} />
      <ObjectionCounterArguments leads={leads} />
    </div>
  );
}
