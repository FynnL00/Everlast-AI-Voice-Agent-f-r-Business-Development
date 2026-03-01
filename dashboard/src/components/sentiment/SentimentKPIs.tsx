"use client";

import { useMemo } from "react";
import { Smile, Meh, Frown, TrendingUp, TrendingDown } from "lucide-react";
import type { Lead } from "@/lib/types";
import { KPICard } from "@/components/ui/KPICard";

interface SentimentKPIsProps {
  leads: Lead[];
}

export default function SentimentKPIs({ leads }: SentimentKPIsProps) {
  const kpis = useMemo(() => {
    const withSentiment = leads.filter((l) => l.sentiment !== null);
    const total = withSentiment.length;

    const positive = withSentiment.filter((l) => l.sentiment === "positiv").length;
    const neutral = withSentiment.filter((l) => l.sentiment === "neutral").length;
    const negative = withSentiment.filter((l) => l.sentiment === "negativ").length;

    const positivePct = total > 0 ? Math.round((positive / total) * 100) : 0;
    const neutralPct = total > 0 ? Math.round((neutral / total) * 100) : 0;
    const negativePct = total > 0 ? Math.round((negative / total) * 100) : 0;

    // Trend: compare last 7 days vs. the 7 days before that
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const recentLeads = withSentiment.filter((l) => new Date(l.created_at) >= sevenDaysAgo);
    const previousLeads = withSentiment.filter(
      (l) => new Date(l.created_at) >= fourteenDaysAgo && new Date(l.created_at) < sevenDaysAgo
    );

    const recentPositivePct =
      recentLeads.length > 0
        ? (recentLeads.filter((l) => l.sentiment === "positiv").length / recentLeads.length) * 100
        : 0;
    const previousPositivePct =
      previousLeads.length > 0
        ? (previousLeads.filter((l) => l.sentiment === "positiv").length / previousLeads.length) * 100
        : 0;

    const trendImproving = recentPositivePct >= previousPositivePct;
    const trendDelta = Math.round(recentPositivePct - previousPositivePct);

    return { positivePct, neutralPct, negativePct, trendImproving, trendDelta };
  }, [leads]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        label="Positiv-Rate"
        numericValue={kpis.positivePct}
        suffix="%"
        icon={Smile}
        colorClass="text-green-400"
        bgClass="bg-green-500/10"
        tooltip="Anteil der Gespräche, die als positiv eingestuft wurden."
        tooltipFormula="Rate = Positive ÷ Alle mit Sentiment × 100"
      />
      <KPICard
        label="Neutral-Rate"
        numericValue={kpis.neutralPct}
        suffix="%"
        icon={Meh}
        colorClass="text-amber-400"
        bgClass="bg-amber-500/10"
        tooltip="Anteil der Gespräche mit neutraler Stimmung."
        tooltipFormula="Rate = Neutrale ÷ Alle mit Sentiment × 100"
      />
      <KPICard
        label="Negativ-Rate"
        numericValue={kpis.negativePct}
        suffix="%"
        icon={Frown}
        colorClass="text-red-400"
        bgClass="bg-red-500/10"
        tooltip="Anteil der Gespräche mit negativem Sentiment."
        tooltipFormula="Rate = Negative ÷ Alle mit Sentiment × 100"
      />
      <KPICard
        label="Trend"
        value={`${kpis.trendDelta >= 0 ? "+" : ""}${kpis.trendDelta}%`}
        icon={kpis.trendImproving ? TrendingUp : TrendingDown}
        colorClass={kpis.trendImproving ? "text-green-400" : "text-red-400"}
        bgClass={kpis.trendImproving ? "bg-green-500/10" : "bg-red-500/10"}
        tooltip="Veränderung der Positiv-Rate im Vergleich zur Vorwoche."
        tooltipFormula="Trend = Positiv-Rate (7 Tage) − Positiv-Rate (Vorwoche)"
      />
    </div>
  );
}
