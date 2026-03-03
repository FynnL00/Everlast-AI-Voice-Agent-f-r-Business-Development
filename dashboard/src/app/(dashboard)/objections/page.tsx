"use client";

import { useMemo, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { useLeads } from "@/lib/leads-context";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/ui/PageHeader";
import ObjectionsKPIs from "@/components/objections/ObjectionsKPIs";
import ObjectionRanking from "@/components/objections/ObjectionRanking";
import ObjectionConversionCorrelation from "@/components/objections/ObjectionConversionCorrelation";
import ObjectionTrend from "@/components/objections/ObjectionTrend";
import ObjectionCounterArguments from "@/components/objections/ObjectionCounterArguments";
import DropOffAnalysis from "@/components/analytics/DropOffAnalysis";

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

export default function ObjectionsPage() {
  const { leads, loading } = useLeads();
  const [timeRange, setTimeRange] = useState<TimeRange>("total");

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
        <div className="text-muted-foreground animate-pulse">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 md:py-8 max-w-[1900px] mx-auto space-y-6">
      <PageHeader
        title="Einwände"
        subtitle="Einwände und Abbruchpunkte"
        icon={ShieldAlert}
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

      <div className="glass p-6 rounded-2xl w-full transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-px">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 block">
          EINWAND KPIS
        </span>
        <ObjectionsKPIs leads={timeFilteredLeads} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ObjectionRanking leads={timeFilteredLeads} />
        <DropOffAnalysis leads={timeFilteredLeads} />
      </div>
      <ObjectionConversionCorrelation leads={timeFilteredLeads} />
      <ObjectionTrend leads={timeFilteredLeads} />
      <ObjectionCounterArguments leads={timeFilteredLeads} />
    </div>
  );
}
