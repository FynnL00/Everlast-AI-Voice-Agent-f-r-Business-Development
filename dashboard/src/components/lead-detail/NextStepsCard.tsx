"use client";

import { useState, useCallback } from "react";
import { CircleCheck, Plus, X } from "lucide-react";
import Card from "@/components/ui/Card";

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
    <Card>
      <h3 className="text-sm font-medium text-[var(--muted)] mb-4">
        Nächste Schritte
      </h3>

      {currentSteps.length > 0 ? (
        <ul className="space-y-2 mb-4">
          {currentSteps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-2 group">
              <CircleCheck
                size={16}
                className="text-[var(--accent)] mt-0.5 shrink-0"
              />
              <span className="flex-1 text-sm text-[var(--foreground)]">
                {step}
              </span>
              <button
                type="button"
                onClick={() => removeStep(idx)}
                className="opacity-0 group-hover:opacity-100 text-[var(--muted)] hover:text-[var(--danger)] transition-all shrink-0"
                aria-label="Schritt entfernen"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[var(--muted)] italic mb-4">
          Keine nächsten Schritte definiert
        </p>
      )}

      {/* Add step input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={newStep}
            onChange={(e) => setNewStep(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Schritt hinzufügen..."
            className="w-full bg-transparent border border-[var(--card-border)] rounded-lg pl-3 pr-8 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          <button
            type="button"
            onClick={addStep}
            disabled={!newStep.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--accent)] transition-colors disabled:opacity-30"
            aria-label="Schritt hinzufügen"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
}
