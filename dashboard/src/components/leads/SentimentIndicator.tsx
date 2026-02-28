interface SentimentIndicatorProps {
  sentiment: string | null;
  showLabel?: boolean;
}

const SENTIMENT_CONFIG: Record<string, { label: string; color: string }> = {
  positiv: { label: "Positiv", color: "#42d77d" },
  neutral: { label: "Neutral", color: "#f59e0b" },
  negativ: { label: "Negativ", color: "#ef4444" },
};

export default function SentimentIndicator({ sentiment, showLabel = false }: SentimentIndicatorProps) {
  const config = sentiment ? SENTIMENT_CONFIG[sentiment] : null;
  if (!config) return <span className="text-muted-foreground">&mdash;</span>;

  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: config.color }}
      />
      {showLabel && (
        <span className="text-xs" style={{ color: config.color }}>
          {config.label}
        </span>
      )}
    </div>
  );
}
