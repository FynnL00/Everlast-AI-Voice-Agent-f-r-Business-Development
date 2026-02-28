"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import Card from "@/components/ui/Card";

interface TranscriptViewerProps {
  transcript: string | null;
}

export default function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const highlightedHtml = useMemo(() => {
    if (!transcript || !searchTerm.trim()) return null;

    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    return transcript.replace(
      regex,
      '<mark class="bg-yellow-400/80 text-[var(--background)] rounded-sm px-0.5">$1</mark>'
    );
  }, [transcript, searchTerm]);

  if (!transcript) {
    return (
      <Card>
        <h3 className="text-sm font-medium text-[var(--muted)] mb-4">
          Transkript
        </h3>
        <p className="text-sm text-[var(--muted)] italic">
          Kein Transkript verfügbar
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[var(--muted)]">
          Transkript
        </h3>
        <button
          type="button"
          onClick={toggle}
          className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
        >
          {isOpen ? (
            <>
              Transkript verbergen
              <ChevronUp size={14} />
            </>
          ) : (
            <>
              Transkript anzeigen
              <ChevronDown size={14} />
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <>
          {/* Search field */}
          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Im Transkript suchen..."
              className="w-full bg-transparent border border-[var(--card-border)] rounded-lg pl-8 pr-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          {/* Transcript content */}
          <div className="max-h-96 overflow-y-auto rounded-lg bg-[var(--background)] p-4">
            {highlightedHtml ? (
              <pre
                className="font-mono text-sm text-[var(--text-secondary)] whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            ) : (
              <pre className="font-mono text-sm text-[var(--text-secondary)] whitespace-pre-wrap break-words">
                {transcript}
              </pre>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
