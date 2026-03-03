"use client";

import { useMemo } from "react";
import { Check, Minus, Phone, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { DISPOSITION_LABELS } from "@/lib/types";
import type { Lead } from "@/lib/types";
import type { CadenceStep, CadenceStepState } from "@/lib/cadence-utils";
import { cn } from "@/lib/utils";

interface FollowUpCadenceTimelineProps {
  steps: CadenceStep[];
  maxAttempts: number;
  leadStatus: Lead["status"];
  className?: string;
}

const CADENCE_RATIONALE: Record<number, string> = {
  0: "Erstkontakt",
  1: "Schnelles Follow-Up",
  3: "Raum lassen, präsent bleiben",
  5: "Mitte der Woche, neuer Anlauf",
  8: "Neue Woche, frischer Kontext",
  12: "Letzter Versuch",
};

function formatShortDate(date: Date): string {
  const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const day = days[date.getDay()];
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${day} ${dd}.${mm}`;
}

function formatTooltipDate(date: Date): string {
  const days = [
    "Sonntag", "Montag", "Dienstag", "Mittwoch",
    "Donnerstag", "Freitag", "Samstag",
  ];
  const day = days[date.getDay()];
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${day}, ${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

function formatDurationShort(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getNodeStyle(state: CadenceStepState) {
  switch (state) {
    case "completed_success":
      return {
        size: "w-7 h-7",
        bg: "var(--score-good)",
        border: "var(--score-good)",
        glow: "0 0 12px var(--glow-good)",
        iconColor: "text-white",
      };
    case "completed_no_answer":
      return {
        size: "w-7 h-7",
        bg: "var(--muted-foreground)",
        border: "var(--muted-foreground)",
        glow: "none",
        iconColor: "text-white",
      };
    case "completed_other":
      return {
        size: "w-7 h-7",
        bg: "var(--score-warning)",
        border: "var(--score-warning)",
        glow: "none",
        iconColor: "text-white",
      };
    case "current":
      return {
        size: "w-8 h-8",
        bg: "transparent",
        border: "var(--primary)",
        glow: "none",
        iconColor: "text-primary",
      };
    case "upcoming":
      return {
        size: "w-6 h-6",
        bg: "transparent",
        border: "var(--border)",
        glow: "none",
        iconColor: "text-muted-foreground/50",
      };
    case "skipped":
      return {
        size: "w-6 h-6",
        bg: "transparent",
        border: "var(--border)",
        glow: "none",
        iconColor: "text-muted-foreground/30",
      };
  }
}

function NodeIcon({ state }: { state: CadenceStepState }) {
  switch (state) {
    case "completed_success":
      return <Check size={14} strokeWidth={3} />;
    case "completed_no_answer":
    case "completed_other":
      return <Minus size={12} strokeWidth={3} />;
    case "current":
      return <Phone size={12} strokeWidth={2} />;
    case "upcoming":
      return <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />;
    case "skipped":
      return <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />;
  }
}

function ConnectorLine({
  fromState,
  toState,
  flexGrow,
}: {
  fromState: CadenceStepState;
  toState: CadenceStepState;
  flexGrow: number;
}) {
  const isCompleted =
    fromState.startsWith("completed") && toState.startsWith("completed");
  const isToCurrent = toState === "current";

  return (
    <div
      className="h-0.5 self-center min-w-[24px]"
      style={{
        flexGrow,
        background: isCompleted
          ? "var(--muted-foreground)"
          : isToCurrent
            ? "var(--primary)"
            : "transparent",
        borderTop:
          !isCompleted && !isToCurrent
            ? "2px dashed var(--border)"
            : undefined,
        opacity: isCompleted ? 0.4 : isToCurrent ? 0.5 : 0.3,
      }}
    />
  );
}

export default function FollowUpCadenceTimeline({
  steps,
  maxAttempts,
  leadStatus,
  className,
}: FollowUpCadenceTimelineProps) {
  const lineGaps = useMemo(() => {
    if (steps.length < 2) return [];
    const gaps: number[] = [];
    for (let i = 1; i < steps.length; i++) {
      const diff = steps[i].dayOffset - steps[i - 1].dayOffset;
      gaps.push(Math.max(diff, 0.5)); // minimum visual weight
    }
    return gaps;
  }, [steps]);

  if (steps.length === 0) {
    return (
      <Card className={cn("shadow-sm", className)}>
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Follow-Up Cadence
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <Calendar size={24} className="mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                Die Follow-Up Cadence startet mit dem ersten Anrufversuch.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-primary" />
          <CardTitle className="text-sm font-semibold text-muted-foreground">
            Follow-Up Cadence
          </CardTitle>
          <span className="text-[10px] text-muted-foreground/60 ml-auto">
            {steps.filter((s) => s.state.startsWith("completed")).length}/{maxAttempts} Versuche
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-5 pb-6">
        {/* Horizontal timeline */}
        <div className="overflow-x-auto scrollbar-none -mx-2 px-2">
          <div className="flex items-stretch min-w-fit">
            {steps.map((step, idx) => {
              const style = getNodeStyle(step.state);
              const isLast = idx === steps.length - 1;
              const gap = !isLast ? lineGaps[idx] : 0;
              const rationale =
                CADENCE_RATIONALE[step.dayOffset] ??
                (step.dayOffset > 0 ? `+${Math.round(step.dayOffset)} Tage` : "");
              const dispositionLabel = step.disposition
                ? DISPOSITION_LABELS[step.disposition] ?? step.disposition
                : null;

              return (
                <div
                  key={step.stepNumber}
                  className="flex items-stretch animate-cadence-step"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  {/* Node column */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center min-w-[80px] cursor-default">
                        {/* Day label */}
                        <span
                          className={cn(
                            "text-[11px] tracking-wider font-semibold uppercase mb-2",
                            step.state === "current"
                              ? "text-primary"
                              : step.state.startsWith("completed")
                                ? "text-muted-foreground"
                                : "text-muted-foreground/40"
                          )}
                        >
                          Tag {Math.round(step.dayOffset)}
                        </span>

                        {/* Node */}
                        <div
                          className={cn(
                            "rounded-full flex items-center justify-center shrink-0 transition-all duration-200",
                            style.size,
                            style.iconColor,
                            step.state === "current" && "animate-cadence-pulse",
                            step.state === "skipped" && "border-dashed opacity-40"
                          )}
                          style={{
                            backgroundColor:
                              step.state === "current"
                                ? "oklch(0.55 0.22 260 / 0.15)"
                                : style.bg,
                            borderWidth: step.state === "current" ? 2 : step.state === "upcoming" || step.state === "skipped" ? 1 : 0,
                            borderStyle: step.state === "skipped" ? "dashed" : "solid",
                            borderColor: style.border,
                            boxShadow: style.glow,
                          }}
                        >
                          <NodeIcon state={step.state} />
                        </div>

                        {/* Bottom labels */}
                        <div className="flex flex-col items-center mt-2 gap-0.5">
                          <span
                            className={cn(
                              "text-xs tabular-nums whitespace-nowrap",
                              step.state === "current"
                                ? "text-primary font-semibold"
                                : step.state.startsWith("completed")
                                  ? "text-muted-foreground"
                                  : "text-muted-foreground/40"
                            )}
                          >
                            {formatShortDate(
                              step.actualDate ?? step.plannedDate
                            )}
                          </span>

                          {dispositionLabel && (
                            <span className="text-[10px] text-muted-foreground/70 whitespace-nowrap">
                              {dispositionLabel}
                            </span>
                          )}

                          {step.state === "current" && (
                            <span className="text-[10px] font-semibold text-primary whitespace-nowrap">
                              Nächster Anruf
                            </span>
                          )}

                          {step.state === "upcoming" && (
                            <span className="text-[10px] text-muted-foreground/30 whitespace-nowrap">
                              Geplant
                            </span>
                          )}
                        </div>
                      </div>
                    </TooltipTrigger>

                    <TooltipContent side="bottom" className="max-w-[220px] p-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-xs">
                            Versuch #{step.stepNumber}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Tag {Math.round(step.dayOffset)}
                          </span>
                        </div>

                        {rationale && (
                          <p className="text-[10px] text-muted-foreground/70 italic">
                            {rationale}
                          </p>
                        )}

                        <div className="border-t border-border/50 pt-1.5 space-y-1">
                          {step.actualDate && (
                            <div className="flex justify-between text-[10px]">
                              <span className="text-muted-foreground">Durchgeführt</span>
                              <span className="tabular-nums">
                                {formatTooltipDate(step.actualDate)}
                              </span>
                            </div>
                          )}

                          {!step.actualDate && (
                            <div className="flex justify-between text-[10px]">
                              <span className="text-muted-foreground">Geplant</span>
                              <span className="tabular-nums">
                                {formatTooltipDate(step.plannedDate)}
                              </span>
                            </div>
                          )}

                          {dispositionLabel && (
                            <div className="flex justify-between text-[10px]">
                              <span className="text-muted-foreground">Ergebnis</span>
                              <span>{dispositionLabel}</span>
                            </div>
                          )}

                          {step.duration !== null && step.duration > 0 && (
                            <div className="flex justify-between text-[10px]">
                              <span className="text-muted-foreground">Dauer</span>
                              <span className="tabular-nums">
                                {formatDurationShort(step.duration)}
                              </span>
                            </div>
                          )}

                          {step.notes && (
                            <p className="text-[10px] text-muted-foreground/70 mt-1 border-t border-border/30 pt-1">
                              {step.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>

                  {/* Connector line */}
                  {!isLast && (
                    <ConnectorLine
                      fromState={step.state}
                      toState={steps[idx + 1].state}
                      flexGrow={gap}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
