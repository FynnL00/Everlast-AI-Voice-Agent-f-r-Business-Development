"use client";

import { useLeads } from "@/lib/leads-context";
import PageHeader from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import SentimentKPIs from "@/components/sentiment/SentimentKPIs";
import SentimentOverTime from "@/components/sentiment/SentimentOverTime";
import SentimentByGrade from "@/components/sentiment/SentimentByGrade";
import SentimentConversionMatrix from "@/components/sentiment/SentimentConversionMatrix";
import { SmilePlus } from "lucide-react";

export default function SentimentPage() {
  const { leads, loading } = useLeads();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Sentiment-Analyse lädt...</div>
      </div>
    );
  }

  const hasSentiment = leads.some((l) => l.sentiment !== null);

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <PageHeader
        title="Sentiment-Analyse"
        subtitle="Stimmung und Gesprächsqualität"
        icon={SmilePlus}
      />

      {!hasSentiment ? (
        <EmptyState
          icon={SmilePlus}
          title="Keine Sentiment-Daten vorhanden"
          description="Sobald Gespräche ausgewertet werden, erscheinen hier detaillierte Sentiment-Analysen."
        />
      ) : (
        <>
          {/* KPI Row */}
          <SentimentKPIs leads={leads} />

          {/* Full-width time chart */}
          <SentimentOverTime leads={leads} />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SentimentByGrade leads={leads} />
            <SentimentConversionMatrix leads={leads} />
          </div>
        </>
      )}
    </div>
  );
}
