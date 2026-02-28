"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { CheckCircle2 } from "lucide-react";

interface NotesEditorProps {
  notes: string | null;
  onSave: (notes: string) => Promise<void>;
}

export default function NotesEditor({ notes, onSave }: NotesEditorProps) {
  const [value, setValue] = useState(notes ?? "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(notes ?? "");
  }, [notes]);

  const performSave = useCallback(
    async (text: string) => {
      setSaveStatus("saving");
      try {
        await onSave(text);
        setSaveStatus("saved");
        setTimeout(() => {
          setSaveStatus((prev) => (prev === "saved" ? "idle" : prev));
        }, 2500);
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

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        performSave(newValue);
      }, 1000);
    },
    [performSave]
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center justify-between">
          <span>Notizen</span>
          <span className="text-xs font-medium text-muted-foreground flex items-center min-w-[80px] justify-end">
            {saveStatus === "saving" && "Speichert..."}
            {saveStatus === "saved" && (
              <span className="text-score-good flex items-center gap-1.5 bg-score-good-bg px-2 py-0.5 rounded-full border border-score-good/20">
                <CheckCircle2 size={12} />
                Gespeichert
              </span>
            )}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0 px-0">
        <textarea
          value={value}
          onChange={handleChange}
          placeholder="Notizen hinzufügen..."
          className="w-full min-h-[160px] bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground resize-y focus:outline-none focus:ring-0 leading-relaxed p-6"
        />
      </CardContent>
    </Card>
  );
}
