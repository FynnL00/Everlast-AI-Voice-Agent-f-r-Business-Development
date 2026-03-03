"use client";

import type { CallAttempt } from "@/lib/types";
import { DISPOSITION_COLORS } from "@/lib/types";
import DispositionBadge from "@/components/ui/DispositionBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatFullDate, formatDuration } from "@/lib/utils";
import { Phone, PhoneIncoming, PhoneOutgoing, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentCallAttemptsCardProps {
  attempts: CallAttempt[];
  loading?: boolean;
  className?: string;
}

const DOT_COLORS: Record<string, string> = {
  connected: "var(--score-good)",
  no_answer: "var(--muted-foreground)",
  voicemail: "var(--score-warning)",
  dnc_request: "var(--destructive)",
  busy: "var(--chart-3)",
  wrong_number: "var(--destructive)",
  gatekeeper: "var(--chart-4)",
  callback: "var(--chart-5)",
  not_interested: "var(--score-danger)",
  technical_error: "var(--chart-3)",
};

const MAX_VISIBLE = 6;

export default function RecentCallAttemptsCard({
  attempts,
  loading,
  className,
}: RecentCallAttemptsCardProps) {
  const sorted = [...attempts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, MAX_VISIBLE);

  return (
    <Card className={cn("shadow-sm flex flex-col", className)}>
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Phone size={16} className="text-primary" />
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            Letzte Anrufe
          </CardTitle>
          {attempts.length > 0 && (
            <span
              className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
                opacity: 0.8,
              }}
            >
              {attempts.length}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-3 flex-1 flex flex-col">
        {loading ? (
          <div className="space-y-3 flex-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-border/50 rounded animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-6">
            <div className="text-center">
              <Phone size={24} className="mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Noch keine Anrufversuche</p>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {sorted.map((attempt, idx) => {
              const dotColor =
                DOT_COLORS[attempt.disposition_code] || "var(--muted-foreground)";
              const isLast = idx === sorted.length - 1;
              const DirectionIcon =
                attempt.direction === "outbound" ? PhoneOutgoing : PhoneIncoming;

              return (
                <div
                  key={attempt.id}
                  className={cn(
                    "flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg transition-colors hover:bg-muted/30",
                    !isLast && "border-b border-border/30"
                  )}
                >
                  {/* Disposition dot */}
                  <div
                    className="w-[9px] h-[9px] rounded-full shrink-0"
                    style={{ backgroundColor: dotColor }}
                  />

                  {/* Direction icon */}
                  <DirectionIcon
                    size={12}
                    className="shrink-0 text-muted-foreground/60"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      {formatFullDate(attempt.created_at)}
                    </span>
                    <DispositionBadge disposition={attempt.disposition_code} />
                    {attempt.duration_seconds !== null &&
                      attempt.duration_seconds > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock size={10} />
                          {formatDuration(attempt.duration_seconds)}
                        </span>
                      )}
                  </div>

                  {/* Attempt number */}
                  <span className="text-[10px] text-muted-foreground/50 tabular-nums shrink-0">
                    #{attempt.attempt_number}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
