"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PieChart } from "lucide-react";
import { useLeads } from "@/lib/leads-context";
import PageHeader from "@/components/ui/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Overview tab components
import AnalyticsKPIs from "@/components/analytics/AnalyticsKPIs";
import SentimentDistribution from "@/components/analytics/SentimentDistribution";
import DropOffAnalysis from "@/components/analytics/DropOffAnalysis";
import ScoreBreakdown from "@/components/analytics/ScoreBreakdown";
import DecisionMakerRatio from "@/components/analytics/DecisionMakerRatio";
import CallDurationDistribution from "@/components/analytics/CallDurationDistribution";

// Sentiment tab components
import SentimentKPIs from "@/components/sentiment/SentimentKPIs";
import SentimentOverTime from "@/components/sentiment/SentimentOverTime";
import SentimentByGrade from "@/components/sentiment/SentimentByGrade";
import SentimentConversionMatrix from "@/components/sentiment/SentimentConversionMatrix";

// Objections tab components
import ObjectionsKPIs from "@/components/objections/ObjectionsKPIs";
import ObjectionRanking from "@/components/objections/ObjectionRanking";
import ObjectionConversionCorrelation from "@/components/objections/ObjectionConversionCorrelation";
import ObjectionTrend from "@/components/objections/ObjectionTrend";
import ObjectionCounterArguments from "@/components/objections/ObjectionCounterArguments";

function AnalyticsContent() {
  const { leads, loading } = useLeads();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = searchParams.get("tab") ?? "overview";

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Analytik lädt...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 md:py-8 max-w-[1900px] mx-auto space-y-6">
      <PageHeader
        title="Analytik"
        subtitle="Detaillierte Auswertungen"
        icon={PieChart}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="overview">Überblick</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="objections">Einwände</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6">
            <AnalyticsKPIs leads={leads} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SentimentDistribution leads={leads} />
              <DropOffAnalysis leads={leads} />
              <ScoreBreakdown leads={leads} />
              <DecisionMakerRatio leads={leads} />
            </div>
            <CallDurationDistribution leads={leads} />
          </div>
        </TabsContent>

        {/* Sentiment Tab */}
        <TabsContent value="sentiment">
          <div className="space-y-6">
            <SentimentKPIs leads={leads} />
            <SentimentOverTime leads={leads} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SentimentByGrade leads={leads} />
              <SentimentConversionMatrix leads={leads} />
            </div>
          </div>
        </TabsContent>

        {/* Objections Tab */}
        <TabsContent value="objections">
          <div className="space-y-6">
            <ObjectionsKPIs leads={leads} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ObjectionRanking leads={leads} />
              <ObjectionConversionCorrelation leads={leads} />
            </div>
            <ObjectionTrend leads={leads} />
            <ObjectionCounterArguments leads={leads} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground animate-pulse">Laden...</div>
        </div>
      }
    >
      <AnalyticsContent />
    </Suspense>
  );
}
