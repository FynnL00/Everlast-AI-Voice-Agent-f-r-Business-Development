"use client";

import { Heart } from "lucide-react";
import { useLeads } from "@/lib/leads-context";
import PageHeader from "@/components/ui/PageHeader";
import SentimentKPIs from "@/components/sentiment/SentimentKPIs";
import SentimentOverTime from "@/components/sentiment/SentimentOverTime";
import SentimentByGrade from "@/components/sentiment/SentimentByGrade";
import SentimentConversionMatrix from "@/components/sentiment/SentimentConversionMatrix";

export default function SentimentPage() {
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
        title="Sentiment"
        subtitle="Stimmungsanalyse der Gespräche"
        icon={Heart}
      />
      <SentimentKPIs leads={leads} />
      <SentimentOverTime leads={leads} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SentimentByGrade leads={leads} />
        <SentimentConversionMatrix leads={leads} />
      </div>
    </div>
  );
}
