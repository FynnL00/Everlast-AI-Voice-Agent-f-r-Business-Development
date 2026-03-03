"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PieChart } from "lucide-react";
import { useLeads } from "@/lib/leads-context";
import PageHeader from "@/components/ui/PageHeader";
import { cn } from "@/lib/utils";
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

// Reachability tab components
import OutboundFunnel from "@/components/analytics/OutboundFunnel";
import BestTimeHeatmap from "@/components/dashboard/BestTimeHeatmap";
import ConnectionRateOverTime from "@/components/analytics/ConnectionRateOverTime";

type TimeRange = "today" | "7d" | "30d" | "total";

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  today: "Heute",
  "7d": "7 Tage",
  "30d": "30 Tage",
  total: "Total",
};

const berlinFormatter = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" });
function toBerlinDate(iso: string): string {
  return berlinFormatter.format(new Date(iso));
}

function AnalyticsContent() {
  const { leads, loading } = useLeads();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = searchParams.get("tab") ?? "overview";
  const [timeRange, setTimeRange] = useState<TimeRange>("total");

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

  const timeFilteredLeads = useMemo(() => {
    if (timeRange === "total") return leads;
    const now = new Date();
    if (timeRange === "today") {
      const berlinToday = toBerlinDate(now.toISOString());
      return leads.filter(l => toBerlinDate(l.created_at) === berlinToday);
    }
    const days = timeRange === "7d" ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    cutoff.setHours(0, 0, 0, 0);
    return leads.filter(l => new Date(l.created_at) >= cutoff);
  }, [leads, timeRange]);

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
        rightContent={
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border/50">
            {(["today", "7d", "30d", "total"] as const).map((range) => {
              const isActive = timeRange === range;
              return (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {TIME_RANGE_LABELS[range]}
                </button>
              );
            })}
          </div>
        }
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="overview">Überblick</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="objections">Einwände</TabsTrigger>
          <TabsTrigger value="reachability">Erreichbarkeit</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6">
            <AnalyticsKPIs leads={timeFilteredLeads} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SentimentDistribution leads={timeFilteredLeads} />
              <DropOffAnalysis leads={timeFilteredLeads} />
              <ScoreBreakdown leads={timeFilteredLeads} />
              <DecisionMakerRatio leads={timeFilteredLeads} />
            </div>
            <CallDurationDistribution leads={timeFilteredLeads} />
          </div>
        </TabsContent>

        {/* Sentiment Tab */}
        <TabsContent value="sentiment">
          <div className="space-y-6">
            <SentimentKPIs leads={timeFilteredLeads} />
            <SentimentOverTime leads={timeFilteredLeads} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SentimentByGrade leads={timeFilteredLeads} />
              <SentimentConversionMatrix leads={timeFilteredLeads} />
            </div>
          </div>
        </TabsContent>

        {/* Objections Tab */}
        <TabsContent value="objections">
          <div className="space-y-6">
            <ObjectionsKPIs leads={timeFilteredLeads} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ObjectionRanking leads={timeFilteredLeads} />
              <ObjectionConversionCorrelation leads={timeFilteredLeads} />
            </div>
            <ObjectionTrend leads={timeFilteredLeads} />
            <ObjectionCounterArguments leads={timeFilteredLeads} />
          </div>
        </TabsContent>

        {/* Reachability Tab */}
        <TabsContent value="reachability">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <OutboundFunnel leads={timeFilteredLeads} />
              <BestTimeHeatmap leads={timeFilteredLeads} />
            </div>
            <ConnectionRateOverTime leads={timeFilteredLeads} />
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
