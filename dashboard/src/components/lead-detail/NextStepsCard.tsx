"use client";

import { useState, useCallback } from "react";
import { CircleCheck, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface NextStepsCardProps {
  steps: string[] | null;
  onUpdate: (steps: string[]) => Promise<void>;
}

export default function NextStepsCard({ steps, onUpdate }: NextStepsCardProps) {
  const [newStep, setNewStep] = useState("");
  const currentSteps = steps ?? [];

  const addStep = useCallback(async () => {
    const trimmed = newStep.trim();
    if (!trimmed) return;
    const updated = [...currentSteps, trimmed];
    setNewStep("");
    await onUpdate(updated);
  }, [newStep, currentSteps, onUpdate]);

  const removeStep = useCallback(
    async (index: number) => {
      const updated = currentSteps.filter((_, i) => i !== index);
      await onUpdate(updated);
    },
    [currentSteps, onUpdate]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addStep();
      }
    },
    [addStep]
  );

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-semibold text-muted-foreground">
          Nächste Schritte
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4">
        {currentSteps.length > 0 ? (
          <ul className="space-y-2.5 mb-5">
            {currentSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3 group bg-muted/20 px-3 py-2.5 rounded-lg border border-border/50 hover:bg-muted/40 transition-colors">
                <CircleCheck
                  size={16}
                  className="text-primary mt-0.5 shrink-0 opacity-80"
                />
                <span className="flex-1 text-sm font-medium text-foreground">
                  {step}
                </span>
                <button
                  type="button"
                  onClick={() => removeStep(idx)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1 rounded-md transition-all shrink-0"
                  aria-label="Schritt entfernen"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 mb-4 text-center border border-dashed border-border/50 rounded-xl bg-muted/10">
            <span className="text-xs font-medium text-muted-foreground mt-1">Keine nächsten Schritte definiert</span>
          </div>
        )}

        {/* Add step input */}
        <div className="flex items-center gap-2 relative mt-auto">
          <input
            type="text"
            value={newStep}
            onChange={(e) => setNewStep(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Schritt hinzufügen..."
            className="w-full bg-card/60 border border-border/80 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          <button
            type="button"
            onClick={addStep}
            disabled={!newStep.trim()}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-primary/10 disabled:hover:text-primary"
            aria-label="Schritt hinzufügen"
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
