"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import type { LeadQuote } from "@/lib/types";

interface QuoteStatsProps {
  quotes: LeadQuote[];
  totalCount: number;
}

export default function QuoteStats({ quotes, totalCount }: QuoteStatsProps) {
  const stats = useMemo(() => {
    const fromCaller = quotes.filter((q) => q.speaker === "caller").length;
    const fromAgent = quotes.filter((q) => q.speaker === "agent").length;
    const positiv = quotes.filter((q) => q.sentiment === "positiv").length;
    const neutral = quotes.filter((q) => q.sentiment === "neutral").length;
    const negativ = quotes.filter((q) => q.sentiment === "negativ").length;
    return { fromCaller, fromAgent, positiv, neutral, negativ };
  }, [quotes]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-muted-foreground font-medium">
        {totalCount} {totalCount === 1 ? "Zitat" : "Zitate"} insgesamt
      </span>
      <div className="w-px h-4 bg-border" />
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-200"
        >
          {stats.fromAgent} Agent
        </Badge>
        <Badge
          variant="outline"
          className="text-[10px] bg-green-500/10 text-green-600 border-green-200"
        >
          {stats.fromCaller} Anrufer
        </Badge>
      </div>
      <div className="w-px h-4 bg-border" />
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-200"
        >
          {stats.positiv} Positiv
        </Badge>
        <Badge
          variant="outline"
          className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-200"
        >
          {stats.neutral} Neutral
        </Badge>
        <Badge
          variant="outline"
          className="text-[10px] bg-red-500/10 text-red-600 border-red-200"
        >
          {stats.negativ} Negativ
        </Badge>
      </div>
    </div>
  );
}
