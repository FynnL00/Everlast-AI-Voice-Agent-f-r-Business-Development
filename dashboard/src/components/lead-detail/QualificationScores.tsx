"use client";

import { Info } from "lucide-react";
import type { Lead } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { getGradeColor } from "@/lib/utils";

interface QualificationScoresProps {
  lead: Lead;
}

const SCORING_CRITERIA: Record<string, { score: number; label: string; description: string }[]> = {
  "Unternehmensgröße": [
    { score: 3, label: "Enterprise", description: "50+ Mitarbeiter" },
    { score: 2, label: "SMB", description: "10–49 Mitarbeiter" },
    { score: 1, label: "Startup/Solo", description: "Unter 10 Mitarbeiter" },
  ],
  "Tech-Stack": [
    { score: 3, label: "Power User", description: "Nutzt Automation-Tools, sucht Alternative" },
    { score: 2, label: "Beginner", description: "Erste Erfahrung mit Automation" },
    { score: 1, label: "No Automation", description: "Keine Automation-Erfahrung" },
  ],
  "Pain Point": [
    { score: 3, label: "Urgent", description: "Konkreter, dringender Use Case" },
    { score: 2, label: "Exploring", description: "Allgemeines Interesse an Automation" },
    { score: 1, label: "Browsing", description: "Nur informierend, kein konkreter Bedarf" },
  ],
  "Timeline": [
    { score: 3, label: "Immediate", description: "Innerhalb 1 Monat, Budget vorhanden" },
    { score: 2, label: "Planning", description: "1–3 Monate, Budget unklar" },
    { score: 1, label: "No Timeline", description: "Kein konkreter Zeitrahmen" },
  ],
};

interface ScoreBarProps {
  label: string;
  score: number | null;
  detail: string | null;
}

function ScoreBar({ label, score, detail }: ScoreBarProps) {
  const criteria = SCORING_CRITERIA[label];

  if (score == null) {
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm font-medium text-muted-foreground cursor-help border-b border-dashed border-muted-foreground/30">
                {label}
              </span>
            </TooltipTrigger>
            {criteria && (
              <TooltipContent side="right" className="max-w-72 p-3">
                <p className="font-semibold text-card-foreground text-xs mb-2">{label} – Bewertung</p>
                <div className="space-y-1.5">
                  {criteria.map((c) => (
                    <div key={c.score} className="flex items-start gap-2 text-xs">
                      <span className="font-mono font-bold text-card-foreground/70 shrink-0 w-3">{c.score}</span>
                      <span className="text-card-foreground/80">
                        <span className="font-medium">{c.label}</span> – {c.description}
                      </span>
                    </div>
                  ))}
                </div>
              </TooltipContent>
            )}
          </Tooltip>
          <span className="text-sm text-muted-foreground">&mdash;</span>
        </div>
        <div className="h-1.5 rounded-full bg-border/50" />
        {detail && (
          <p className="text-xs text-muted-foreground mt-1.5 truncate" title={detail}>
            {detail}
          </p>
        )}
      </div>
    );
  }

  const percentage = Math.round((score / 3) * 100);
  const fillColor =
    score >= 3
      ? "var(--score-good)"
      : score === 2
        ? "var(--score-warning)"
        : "var(--score-danger)";

  const activeLevel = criteria?.find((c) => c.score === score);

  return (
    <div className="mb-4 group">
      <div className="flex items-center justify-between mb-1.5 transition-colors">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors cursor-help border-b border-dashed border-transparent group-hover:border-primary/30">
              {label}
            </span>
          </TooltipTrigger>
          {criteria && (
            <TooltipContent side="right" className="max-w-72 p-3">
              <p className="font-semibold text-card-foreground text-xs mb-2">{label} – Bewertung</p>
              <div className="space-y-1.5">
                {criteria.map((c) => (
                  <div
                    key={c.score}
                    className={`flex items-start gap-2 text-xs rounded-sm px-1 py-0.5 -mx-1 ${c.score === score ? "bg-primary/10" : ""}`}
                  >
                    <span className={`font-mono font-bold shrink-0 w-3 ${c.score === score ? "text-primary" : "text-card-foreground/70"}`}>
                      {c.score}
                    </span>
                    <span className={c.score === score ? "text-card-foreground" : "text-card-foreground/80"}>
                      <span className="font-medium">{c.label}</span> – {c.description}
                    </span>
                  </div>
                ))}
              </div>
            </TooltipContent>
          )}
        </Tooltip>
        <span className="text-sm font-bold" style={{ color: fillColor }}>
          {score}/3
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_currentColor]"
          style={{
            width: `${percentage}%`,
            backgroundColor: fillColor,
            color: fillColor,
          }}
        />
      </div>
      {detail ? (
        <p className="text-xs text-muted-foreground mt-1.5 truncate" title={detail}>
          {detail}
        </p>
      ) : activeLevel ? (
        <p className="text-xs text-muted-foreground/60 mt-1.5 italic">
          {activeLevel.label} – {activeLevel.description}
        </p>
      ) : null}
    </div>
  );
}

export default function QualificationScores({ lead }: QualificationScoresProps) {
  const totalScore = lead.total_score;

  return (
    <Card className="shadow-sm relative">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="absolute top-2.5 right-3.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-help z-10"
            aria-label="Info: Qualifizierungs-Scores"
            tabIndex={0}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-64 p-3">
          <p className="font-semibold text-card-foreground text-sm mb-1">Qualifizierungs-Scores</p>
          <p className="text-xs text-card-foreground/80 leading-relaxed">
            Jeder Lead wird nach dem Gespräch automatisch per KI in 4 Kategorien bewertet (je 1–3 Punkte).
          </p>
          <p className="text-[11px] text-muted-foreground mt-2 font-mono">
            A-Lead: 10–12 · B-Lead: 7–9 · C-Lead: 4–6
          </p>
        </TooltipContent>
      </Tooltip>
      <CardHeader className="pb-3 border-b border-border/50 mb-4">
        <CardTitle className="text-sm font-semibold text-muted-foreground">
          Qualifizierungs-Scores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScoreBar label="Unternehmensgröße" score={lead.score_company_size} detail={lead.company_size} />
        <ScoreBar label="Tech-Stack" score={lead.score_tech_stack} detail={lead.current_stack} />
        <ScoreBar label="Pain Point" score={lead.score_pain_point} detail={lead.pain_point} />
        <ScoreBar label="Timeline" score={lead.score_timeline} detail={lead.timeline} />

        {/* Total */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-border/50 bg-muted/10 -mx-6 px-6 -mb-6 pb-6 rounded-b-2xl">
          <span className="text-sm font-bold text-foreground">
            Gesamt: {totalScore != null ? <span className="text-primary">{totalScore}/12</span> : "\u2014"}
          </span>
          {lead.lead_grade && (
            <div
              className="px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ring-inset"
              style={{
                backgroundColor: `${getGradeColor(lead.lead_grade)}15`,
                color: getGradeColor(lead.lead_grade),
                borderColor: `${getGradeColor(lead.lead_grade)}30`,
              }}
            >
              {lead.lead_grade}-Lead
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
