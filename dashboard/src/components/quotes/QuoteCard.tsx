"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import type { LeadQuote, ScoringDimension } from "@/lib/types";
import { SCORING_DIMENSION_LABELS, SCORING_DIMENSION_COLORS } from "@/lib/types";
import { cn } from "@/lib/utils";

interface QuoteCardProps {
  quote: LeadQuote;
}

const SENTIMENT_BORDER: Record<string, string> = {
  positiv: "border-l-emerald-500",
  neutral: "border-l-amber-500",
  negativ: "border-l-red-500",
};

const SENTIMENT_BADGE: Record<string, string> = {
  positiv: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  neutral: "bg-amber-500/10 text-amber-600 border-amber-200",
  negativ: "bg-red-500/10 text-red-600 border-red-200",
};

const SENTIMENT_LABEL: Record<string, string> = {
  positiv: "Positiv",
  neutral: "Neutral",
  negativ: "Negativ",
};

const SPEAKER_BADGE: Record<string, { className: string; label: string }> = {
  agent: {
    className: "bg-blue-500/10 text-blue-600 border-blue-200",
    label: "Agent",
  },
  caller: {
    className: "bg-green-500/10 text-green-600 border-green-200",
    label: "Anrufer",
  },
};

export default function QuoteCard({ quote }: QuoteCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(quote.quote_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  const borderColor =
    quote.sentiment && SENTIMENT_BORDER[quote.sentiment]
      ? SENTIMENT_BORDER[quote.sentiment]
      : "border-l-gray-300";

  return (
    <Card className={cn("border-l-4", borderColor)}>
      <CardContent className="pt-4 pb-4">
        {/* Quote text */}
        <p className="text-base text-foreground leading-relaxed mb-2">
          <span className="text-muted-foreground">&bdquo;</span>
          {quote.quote_text}
          <span className="text-muted-foreground">&ldquo;</span>
        </p>

        {/* Reasoning / context */}
        {quote.context && (
          <p className="text-xs text-muted-foreground italic mb-3 pl-3 border-l-2 border-muted">
            {quote.context}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {/* Scoring dimension badge */}
          {quote.scoring_dimension && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-semibold",
                SCORING_DIMENSION_COLORS[quote.scoring_dimension as ScoringDimension]
              )}
            >
              {SCORING_DIMENSION_LABELS[quote.scoring_dimension as ScoringDimension]}
              {quote.score_value != null && (
                <span className="ml-1 font-mono">{quote.score_value}/3</span>
              )}
            </Badge>
          )}

          {/* Speaker badge */}
          {quote.speaker && SPEAKER_BADGE[quote.speaker] && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px]",
                SPEAKER_BADGE[quote.speaker].className
              )}
            >
              {SPEAKER_BADGE[quote.speaker].label}
            </Badge>
          )}

          {/* Sentiment badge */}
          {quote.sentiment && SENTIMENT_BADGE[quote.sentiment] && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px]",
                SENTIMENT_BADGE[quote.sentiment]
              )}
            >
              {SENTIMENT_LABEL[quote.sentiment]}
            </Badge>
          )}
        </div>

        {/* Bottom row: lead link + copy button */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
            {quote.lead_id && (
              <Link
                href={`/leads/${quote.lead_id}`}
                className="hover:text-primary transition-colors truncate"
              >
                {quote.lead_name ?? "Unbekannt"}
                {quote.lead_company && ` - ${quote.lead_company}`}
              </Link>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <>
                <Check size={14} className="text-green-500" />
                Kopiert
              </>
            ) : (
              <>
                <Copy size={14} />
                Kopieren
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
