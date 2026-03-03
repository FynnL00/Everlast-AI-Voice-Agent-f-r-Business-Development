"use client";

import { useMemo } from "react";
import { Smile, Meh, Frown, BarChart3 } from "lucide-react";
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

    // Per-card trend: letzte 7 Tage vs. Vorwoche
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const recentSentiment = withSentiment.filter((l) => new Date(l.created_at) >= sevenDaysAgo);
    const previousSentiment = withSentiment.filter(
      (l) => new Date(l.created_at) >= fourteenDaysAgo && new Date(l.created_at) < sevenDaysAgo
    );

    // Score trend
    const recentWithScore = withScore.filter((l) => new Date(l.created_at) >= sevenDaysAgo);
    const previousWithScore = withScore.filter(
      (l) => new Date(l.created_at) >= fourteenDaysAgo && new Date(l.created_at) < sevenDaysAgo
    );
    const recentScoreAvg = recentWithScore.length > 0
      ? recentWithScore.reduce((s, l) => s + (l.sentiment_score ?? 0), 0) / recentWithScore.length
      : null;
    const previousScoreAvg = previousWithScore.length > 0
      ? previousWithScore.reduce((s, l) => s + (l.sentiment_score ?? 0), 0) / previousWithScore.length
      : null;
    const scoreTrend = recentScoreAvg !== null && previousScoreAvg !== null
      ? { delta: Math.round((recentScoreAvg - previousScoreAvg) * 100), improving: recentScoreAvg >= previousScoreAvg }
      : null;

    // Rate trends helper
    const rateTrend = (sentiment: string) => {
      const rRecent = recentSentiment.length > 0
        ? Math.round((recentSentiment.filter((l) => l.sentiment === sentiment).length / recentSentiment.length) * 100)
        : 0;
      const rPrevious = previousSentiment.length > 0
        ? Math.round((previousSentiment.filter((l) => l.sentiment === sentiment).length / previousSentiment.length) * 100)
        : 0;
      if (recentSentiment.length === 0 && previousSentiment.length === 0) return null;
      const delta = rRecent - rPrevious;
      // For negativ, improving means it went DOWN
      const improving = sentiment === "negativ" ? delta <= 0 : delta >= 0;
      return { delta, improving };
    };

    return {
      positivePct, neutralPct, negativePct, avgScore,
      scoreTrend,
      positiveTrend: rateTrend("positiv"),
      neutralTrend: rateTrend("neutral"),
      negativeTrend: rateTrend("negativ"),
    };
  }, [leads]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        trend={kpis.scoreTrend}
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
        trend={kpis.positiveTrend}
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
        trend={kpis.neutralTrend}
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
        trend={kpis.negativeTrend}
        tooltip="Anteil der Gespräche mit negativem Sentiment."
        tooltipFormula="Rate = Negative ÷ Alle mit Sentiment × 100"
      />
    </div>
  );
}
