"use client";

import { useState } from "react";
import Dialog from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface CreateCampaignDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateCampaignDialog({ open, onClose }: CreateCampaignDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxAttempts, setMaxAttempts] = useState(5);
  const [callingWindowStart, setCallingWindowStart] = useState("09:00");
  const [callingWindowEnd, setCallingWindowEnd] = useState("18:00");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Kampagnenname ist erforderlich");
      return;
    }

    setSaving(true);
    setError(null);

    const { error: insertError } = await supabase.from("campaigns").insert({
      name: name.trim(),
      description: description.trim() || null,
      status: "draft",
      calling_window_start: callingWindowStart,
      calling_window_end: callingWindowEnd,
      cadence_config: {
        max_attempts: maxAttempts,
        intervals_minutes: [60, 240, 1440, 2880, 4320],
        voicemail_action: "skip",
        leave_voicemail_after_attempt: 3,
      },
    });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    // Reset and close
    setName("");
    setDescription("");
    setMaxAttempts(5);
    setCallingWindowStart("09:00");
    setCallingWindowEnd("18:00");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="Neue Kampagne erstellen">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. DACH Enterprise Q1"
            className="w-full bg-card/50 border border-border/80 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Beschreibung
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optionale Beschreibung..."
            rows={2}
            className="w-full bg-card/50 border border-border/80 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
          />
        </div>

        {/* Max Attempts */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Max. Versuche
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={maxAttempts}
            onChange={(e) => setMaxAttempts(Number(e.target.value))}
            className="w-full bg-card/50 border border-border/80 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        {/* Calling Window */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Anruffenster Start
            </label>
            <input
              type="time"
              value={callingWindowStart}
              onChange={(e) => setCallingWindowStart(e.target.value)}
              className="w-full bg-card/50 border border-border/80 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Anruffenster Ende
            </label>
            <input
              type="time"
              value={callingWindowEnd}
              onChange={(e) => setCallingWindowEnd(e.target.value)}
              className="w-full bg-card/50 border border-border/80 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-destructive font-medium">{error}</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-border bg-card hover:bg-sidebar-accent transition-colors text-foreground"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Erstellen
          </button>
        </div>
      </form>
    </Dialog>
  );
}
