"use client";

import type { Lead } from "@/lib/types";
import Card from "@/components/ui/Card";
import { getSentimentColor } from "@/lib/utils";

interface ConversationSummaryProps {
  summary: string | null;
  sentiment: Lead["sentiment"];
}

const SENTIMENT_LABELS: Record<string, string> = {
  positiv: "Positiv",
  neutral: "Neutral",
  negativ: "Negativ",
};

export default function ConversationSummary({
  summary,
  sentiment,
}: ConversationSummaryProps) {
  const sentimentColor = sentiment ? getSentimentColor(sentiment) : null;
  const sentimentLabel = sentiment ? SENTIMENT_LABELS[sentiment] : null;

  return (
    <Card>
      <h3 className="text-sm font-medium text-[var(--muted)] mb-4">
        Gespraechszusammenfassung
      </h3>

      {/* Sentiment banner */}
      {sentimentColor && sentimentLabel && (
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 mb-4 text-sm font-medium"
          style={{
            backgroundColor: `${sentimentColor}15`,
            color: sentimentColor,
          }}
        >
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: sentimentColor }}
          />
          Stimmung: {sentimentLabel}
        </div>
      )}

      {/* Summary text */}
      {summary ? (
        <p className="text-sm text-[var(--foreground)] leading-relaxed">
          {summary}
        </p>
      ) : (
        <p className="text-sm text-[var(--muted)] italic">
          Keine Zusammenfassung verfuegbar
        </p>
      )}
    </Card>
  );
}
