"use client";

import type { Lead } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { getSentimentColor, getSentimentScoreColor } from "@/lib/utils";

interface ConversationSummaryProps {
  summary: string | null;
  sentiment: Lead["sentiment"];
  sentimentScore?: number | null;
  sentimentReason?: string | null;
}

const SENTIMENT_LABELS: Record<string, string> = {
  positiv: "Positiv",
  neutral: "Neutral",
  negativ: "Negativ",
};

export default function ConversationSummary({
  summary,
  sentiment,
  sentimentScore,
  sentimentReason,
}: ConversationSummaryProps) {
  const sentimentColor = sentiment ? getSentimentColor(sentiment) : null;
  const sentimentLabel = sentiment ? SENTIMENT_LABELS[sentiment] : null;
  const hasScore = sentimentScore != null;

  return (
    <Card className="shadow-sm border border-border">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center justify-between">
          <span>Gesprächszusammenfassung</span>
          {/* Sentiment banner */}
          {sentimentColor && sentimentLabel && (
            <div
              className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset"
              style={{
                backgroundColor: `${sentimentColor}15`,
                color: sentimentColor,
                borderColor: `${sentimentColor}30`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: sentimentColor }}
              />
              {sentimentLabel}
              {hasScore && (
                <span className="ml-1 font-mono text-[10px] opacity-75">
                  {(sentimentScore * 100).toFixed(0)}%
                </span>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Sentiment reason */}
        {sentimentReason && (
          <div
            className="text-xs leading-relaxed rounded-lg px-3 py-2 border"
            style={{
              backgroundColor: sentimentColor ? `${sentimentColor}08` : undefined,
              borderColor: sentimentColor ? `${sentimentColor}20` : "var(--border)",
              color: "var(--muted-foreground)",
            }}
          >
            <span className="font-semibold" style={{ color: sentimentColor ?? undefined }}>
              Sentiment-Begründung:
            </span>{" "}
            {sentimentReason}
          </div>
        )}

        {/* Summary text */}
        {summary ? (
          <div className="text-sm text-foreground/90 leading-relaxed space-y-3 font-medium">
            {summary.split('\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center p-6 bg-muted/20 border border-dashed border-border/50 rounded-xl">
            <p className="text-sm text-muted-foreground italic">
              Keine Zusammenfassung verfügbar
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
