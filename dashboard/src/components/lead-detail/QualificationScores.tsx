"use client";

import type { Lead } from "@/lib/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { getGradeColor } from "@/lib/utils";

interface QualificationScoresProps {
  lead: Lead;
}

interface ScoreBarProps {
  label: string;
  score: number | null;
}

function ScoreBar({ label, score }: ScoreBarProps) {
  if (score == null) {
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm text-[var(--text-secondary)]">{label}</span>
          <span className="text-sm text-[var(--muted)]">&mdash;</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--card-border)]" />
      </div>
    );
  }

  const percentage = Math.round((score / 3) * 100);
  const fillColor =
    score >= 3
      ? "var(--success)"
      : score === 2
        ? "var(--warning)"
        : "var(--danger)";

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
        <span className="text-sm font-medium" style={{ color: fillColor }}>
          {score}/3
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--card-border)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: fillColor,
          }}
        />
      </div>
    </div>
  );
}

export default function QualificationScores({ lead }: QualificationScoresProps) {
  const totalScore = lead.total_score;

  return (
    <Card>
      <h3 className="text-sm font-medium text-[var(--muted)] mb-4">
        Qualifizierungs-Scores
      </h3>

      <ScoreBar label="Unternehmensgroesse" score={lead.score_company_size} />
      <ScoreBar label="Tech-Stack" score={lead.score_tech_stack} />
      <ScoreBar label="Pain Point" score={lead.score_pain_point} />
      <ScoreBar label="Timeline" score={lead.score_timeline} />

      {/* Total */}
      <div className="flex items-center justify-between pt-4 mt-2 border-t border-[var(--card-border)]">
        <span className="text-sm font-medium text-[var(--text-secondary)]">
          Gesamt: {totalScore != null ? `${totalScore}/12` : "\u2014"}
        </span>
        {lead.lead_grade && (
          <Badge
            label={`${lead.lead_grade}-Lead`}
            color={getGradeColor(lead.lead_grade)}
            size="md"
          />
        )}
      </div>
    </Card>
  );
}
