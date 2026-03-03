"use client";

import { useState } from "react";
import type { CallAttempt } from "@/lib/types";
import { DISPOSITION_LABELS, DISPOSITION_COLORS } from "@/lib/types";
import DispositionBadge from "@/components/ui/DispositionBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatFullDate, formatDuration } from "@/lib/utils";
import { ChevronDown, ChevronUp, Phone, Clock } from "lucide-react";

interface CallAttemptTimelineProps {
  attempts: CallAttempt[];
}

const DOT_COLORS: Record<string, string> = {
  connected: "var(--score-good)",
  no_answer: "var(--muted-foreground)",
  voicemail: "var(--score-warning)",
  dnc_request: "var(--destructive)",
  demo_booked: "var(--score-good)",
  qualified: "var(--chart-5)",
  busy: "var(--chart-3)",
  wrong_number: "var(--destructive)",
  gatekeeper: "var(--chart-4)",
  callback: "var(--chart-5)",
  not_interested: "var(--score-danger)",
  technical_error: "var(--chart-3)",
};

export default function CallAttemptTimeline({ attempts }: CallAttemptTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = [...attempts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Phone size={16} className="text-primary" />
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            Anrufversuche
          </CardTitle>
          <span className="text-xs text-muted-foreground tabular-nums ml-auto">
            {attempts.length} Versuch{attempts.length !== 1 ? "e" : ""}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {sorted.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">
            Noch keine Anrufversuche
          </p>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-border/50" />

            <div className="space-y-0">
              {sorted.map((attempt, idx) => {
                const isExpanded = expandedId === attempt.id;
                const dotColor =
                  DOT_COLORS[attempt.disposition_code] || "var(--muted-foreground)";
                const isLast = idx === sorted.length - 1;

                return (
                  <div key={attempt.id} className="relative pl-8">
                    {/* Dot */}
                    <div
                      className="absolute left-[7px] top-4 w-[9px] h-[9px] rounded-full border-2 z-10"
                      style={{
                        backgroundColor: dotColor,
                        borderColor: dotColor,
                      }}
                    />

                    {/* Content */}
                    <div
                      className={`py-3 ${!isLast ? "border-b border-border/30" : ""}`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {formatFullDate(attempt.created_at)}
                        </span>
                        <DispositionBadge disposition={attempt.disposition_code} />
                        {attempt.duration_seconds !== null && attempt.duration_seconds > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock size={10} />
                            {formatDuration(attempt.duration_seconds)}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground/60 ml-auto">
                          #{attempt.attempt_number}
                        </span>
                      </div>

                      {/* Expandable notes */}
                      {attempt.notes && (
                        <div className="mt-1">
                          <button
                            onClick={() =>
                              setExpandedId(isExpanded ? null : attempt.id)
                            }
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp size={12} />
                            ) : (
                              <ChevronDown size={12} />
                            )}
                            Notizen
                          </button>
                          {isExpanded && (
                            <p className="text-xs text-muted-foreground mt-1.5 pl-4 border-l-2 border-border/50">
                              {attempt.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
