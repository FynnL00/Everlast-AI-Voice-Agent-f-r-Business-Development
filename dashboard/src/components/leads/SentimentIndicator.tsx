import { getSentimentScoreColor } from "@/lib/utils";

interface SentimentIndicatorProps {
  sentiment: string | null;
  sentimentScore?: number | null;
  sentimentReason?: string | null;
  showLabel?: boolean;
}

const SENTIMENT_CONFIG: Record<string, { label: string; color: string }> = {
  positiv: { label: "Positiv", color: "var(--score-good)" },
  neutral: { label: "Neutral", color: "var(--score-warning)" },
  negativ: { label: "Negativ", color: "var(--score-danger)" },
};

export default function SentimentIndicator({
  sentiment,
  sentimentScore,
  sentimentReason,
  showLabel = false,
}: SentimentIndicatorProps) {
  const config = sentiment ? SENTIMENT_CONFIG[sentiment] : null;
  if (!config) return <span className="text-muted-foreground">&mdash;</span>;

  const hasScore = sentimentScore != null;
  const scoreColor = hasScore ? getSentimentScoreColor(sentimentScore) : config.color;

  return (
    <div className="group relative flex items-center gap-2">
      {/* Score bar when available, otherwise dot */}
      {hasScore ? (
        <div className="flex items-center gap-1.5">
          <div className="w-12 h-2 rounded-full bg-muted/50 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.round(sentimentScore * 100)}%`,
                backgroundColor: scoreColor,
              }}
            />
          </div>
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {(sentimentScore * 100).toFixed(0)}
          </span>
        </div>
      ) : (
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: config.color }}
        />
      )}

      {showLabel && (
        <span className="text-xs" style={{ color: config.color }}>
          {config.label}
        </span>
      )}

      {/* Tooltip with reason */}
      {sentimentReason && (
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 pointer-events-none">
          <div className="rounded-lg bg-popover border border-border px-3 py-2 shadow-lg max-w-[260px]">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {sentimentReason}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
