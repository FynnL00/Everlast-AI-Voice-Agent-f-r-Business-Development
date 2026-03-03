"use client";

import { useMemo } from "react";
import { Smile, Meh, Frown, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
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

    // Score-basierter Durchschnitt (feingranular)
    const withScore = leads.filter((l) => l.sentiment_score != null);
    const avgScore =
      withScore.length > 0
        ? withScore.reduce((sum, l) => sum + (l.sentiment_score ?? 0), 0) / withScore.length
        : null;

    // Trend: Score-Durchschnitt letzte 7 Tage vs. Vorwoche
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const recentWithScore = withScore.filter((l) => new Date(l.created_at) >= sevenDaysAgo);
    const previousWithScore = withScore.filter(
      (l) => new Date(l.created_at) >= fourteenDaysAgo && new Date(l.created_at) < sevenDaysAgo
    );

    const recentAvg =
      recentWithScore.length > 0
        ? recentWithScore.reduce((s, l) => s + (l.sentiment_score ?? 0), 0) / recentWithScore.length
        : null;
    const previousAvg =
      previousWithScore.length > 0
        ? previousWithScore.reduce((s, l) => s + (l.sentiment_score ?? 0), 0) / previousWithScore.length
        : null;

    // Fallback auf kategorischen Trend wenn keine Scores vorhanden
    let trendDelta: number;
    let trendImproving: boolean;

    if (recentAvg !== null && previousAvg !== null) {
      trendDelta = Math.round((recentAvg - previousAvg) * 100);
      trendImproving = recentAvg >= previousAvg;
    } else {
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
      trendDelta = Math.round(recentPositivePct - previousPositivePct);
      trendImproving = recentPositivePct >= previousPositivePct;
    }

    return { positivePct, neutralPct, negativePct, avgScore, trendImproving, trendDelta };
  }, [leads]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <KPICard
        label="Sentiment-Score"
        value={kpis.avgScore !== null ? (kpis.avgScore * 100).toFixed(0) : "–"}
        suffix={kpis.avgScore !== null ? "/100" : ""}
        icon={BarChart3}
        colorClass={
          kpis.avgScore === null ? "text-muted-foreground"
          : kpis.avgScore >= 0.67 ? "text-green-400"
          : kpis.avgScore <= 0.33 ? "text-red-400"
          : "text-amber-400"
        }
        bgClass={
          kpis.avgScore === null ? "bg-muted/10"
          : kpis.avgScore >= 0.67 ? "bg-green-500/10"
          : kpis.avgScore <= 0.33 ? "bg-red-500/10"
          : "bg-amber-500/10"
        }
        tooltip="Durchschnittlicher Sentiment-Score aller Gespräche (0 = sehr negativ, 100 = sehr positiv)."
        tooltipFormula="Score = Ø sentiment_score × 100"
      />
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
        tooltip="Veränderung des Sentiment-Scores im Vergleich zur Vorwoche."
        tooltipFormula="Trend = Ø Score (7 Tage) − Ø Score (Vorwoche) × 100"
      />
    </div>
  );
}
