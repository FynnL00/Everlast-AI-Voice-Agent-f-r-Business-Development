"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Card from "@/components/ui/Card";

interface NotesEditorProps {
  notes: string | null;
  onSave: (notes: string) => Promise<void>;
}

export default function NotesEditor({ notes, onSave }: NotesEditorProps) {
  const [value, setValue] = useState(notes ?? "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestValue = useRef(value);

  // Keep latestValue in sync
  latestValue.current = value;

  // Reset local value when notes prop changes externally
  useEffect(() => {
    setValue(notes ?? "");
  }, [notes]);

  const performSave = useCallback(
    async (text: string) => {
      setSaveStatus("saving");
      try {
        await onSave(text);
        setSaveStatus("saved");
        // Clear "Gespeichert" after 2 seconds
        setTimeout(() => {
          setSaveStatus((prev) => (prev === "saved" ? "idle" : prev));
        }, 2000);
      } catch {
        setSaveStatus("idle");
      }
    },
    [onSave]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      // Debounced auto-save after 1 second
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        performSave(newValue);
      }, 1000);
    },
    [performSave]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[var(--muted)]">Notizen</h3>
        <span className="text-xs text-[var(--muted)] min-w-[80px] text-right">
          {saveStatus === "saving" && "Speichert..."}
          {saveStatus === "saved" && (
            <span className="text-[var(--success)]">Gespeichert</span>
          )}
        </span>
      </div>

      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Notizen hinzufügen..."
        className="w-full min-h-32 bg-transparent border-none text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] resize-y focus:outline-none leading-relaxed"
      />
    </Card>
  );
}
