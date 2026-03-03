"use client";

import { useState } from "react";
import Dialog from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

interface AddDNCDialogProps {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

const REASON_OPTIONS = [
  { value: "manual", label: "Manuell" },
  { value: "customer_request", label: "Kundenanfrage" },
  { value: "legal", label: "Rechtlich" },
  { value: "wrong_number", label: "Falsche Nummer" },
  { value: "competitor", label: "Wettbewerber" },
];

export default function AddDNCDialog({ open, onClose, onAdded }: AddDNCDialogProps) {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("manual");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError("Telefonnummer ist erforderlich");
      return;
    }

    setSaving(true);
    setError(null);

    const { error: insertError } = await supabase.from("dnc_list").insert({
      phone: phone.trim(),
      email: email.trim() || null,
      reason,
      notes: notes.trim() || null,
      is_active: true,
    });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    // Reset and close
    setPhone("");
    setEmail("");
    setReason("manual");
    setNotes("");
    onAdded();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="DNC-Eintrag hinzufügen">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Telefonnummer <span className="text-destructive">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+49 123 456 7890"
            className="w-full bg-card/50 border border-border/80 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            autoFocus
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            E-Mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="optional@example.com"
            className="w-full bg-card/50 border border-border/80 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Grund
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-card/50 border border-border/80 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 1rem center",
              backgroundSize: "1rem",
            }}
          >
            {REASON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-card text-foreground">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Notizen
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optionale Notizen..."
            rows={2}
            className="w-full bg-card/50 border border-border/80 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
          />
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
            Hinzufügen
          </button>
        </div>
      </form>
    </Dialog>
  );
}
