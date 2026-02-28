"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { Lead } from "@/lib/types";
import Card from "@/components/ui/Card";
import { formatFullDate } from "@/lib/utils";

interface BriefingCardProps {
  lead: Lead;
  onGenerate: () => Promise<void>;
}

export default function BriefingCard({ lead, onGenerate }: BriefingCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <h3 className="text-sm font-medium text-[var(--muted)] mb-4">
        Demo-Briefing
      </h3>

      {lead.briefing ? (
        <>
          <div className="text-sm text-[var(--foreground)] whitespace-pre-wrap leading-relaxed mb-3">
            {lead.briefing}
          </div>

          {lead.briefing_generated_at && (
            <p className="text-xs text-[var(--muted)] mb-3">
              Generiert am: {formatFullDate(lead.briefing_generated_at)}
            </p>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 text-xs border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:border-[var(--text-secondary)] rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            {isGenerating && <Loader2 size={12} className="animate-spin" />}
            Neu generieren
          </button>
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            KI erstellt ein maßgeschneidertes Demo-Briefing basierend auf dem
            Gespräch.
          </p>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Wird generiert...
              </>
            ) : (
              "Briefing generieren"
            )}
          </button>
        </div>
      )}
    </Card>
  );
}
