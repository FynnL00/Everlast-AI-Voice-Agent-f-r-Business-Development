"use client";

import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import type { Lead } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center justify-between">
          <span>Call Briefing</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4">
        {lead.briefing ? (
          <div className="space-y-4">
            <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed bg-muted/20 p-4 rounded-xl border border-border/50">
              {lead.briefing}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              {lead.briefing_generated_at && (
                <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                  Generiert: {formatFullDate(lead.briefing_generated_at)}
                </p>
              )}

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold border-2 border-border/80 bg-background text-foreground hover:bg-muted hover:border-foreground/30 rounded-lg px-3 py-1.5 transition-all disabled:opacity-50 group"
              >
                {isGenerating ? (
                  <Loader2 size={14} className="animate-spin text-primary" />
                ) : (
                  <Wand2 size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                )}
                Neu generieren
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <Wand2 className="text-primary w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Noch kein Briefing
            </p>
            <p className="text-[13px] text-muted-foreground mb-5 max-w-[240px] mx-auto leading-relaxed">
              KI erstellt ein maßgeschneidertes Demo-Briefing basierend auf dem Gespräch.
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center justify-center w-full gap-2 bg-primary hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20 text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-bold transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Wird generiert...
                </>
              ) : (
                <>
                  <Wand2 size={16} />
                  Briefing generieren
                </>
              )}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
