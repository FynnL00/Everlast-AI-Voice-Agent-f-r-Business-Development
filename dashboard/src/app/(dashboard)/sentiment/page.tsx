"use client";

import { useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { useLeads } from "@/lib/leads-context";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/ui/PageHeader";
import SentimentKPIs from "@/components/sentiment/SentimentKPIs";
import SentimentOverTime from "@/components/sentiment/SentimentOverTime";
import SentimentByGrade from "@/components/sentiment/SentimentByGrade";
import SentimentConversionMatrix from "@/components/sentiment/SentimentConversionMatrix";

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

export default function SentimentPage() {
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
        title="Sentiment"
        subtitle="Stimmungsanalyse der Gespräche"
        icon={Heart}
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
          SENTIMENT KPIS
        </span>
        <SentimentKPIs leads={timeFilteredLeads} />
      </div>

      <SentimentOverTime leads={timeFilteredLeads} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SentimentByGrade leads={timeFilteredLeads} />
        <SentimentConversionMatrix leads={timeFilteredLeads} />
      </div>
    </div>
  );
}
