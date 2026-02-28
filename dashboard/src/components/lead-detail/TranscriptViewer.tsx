"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

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
      '<mark class="bg-yellow-500/80 text-foreground font-bold rounded-sm px-1 py-0.5">$1</mark>'
    );
  }, [transcript, searchTerm]);

  if (!transcript) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <FileText size={16} />
            Transkript
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6 bg-muted/20 border border-dashed border-border/50 rounded-xl">
            <p className="text-sm font-medium text-muted-foreground italic">
              Kein Transkript verfügbar
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-sm transition-all duration-300", isOpen ? "ring-1 ring-border shadow-md" : "")}>
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors rounded-xl"
        onClick={toggle}
      >
        <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <FileText size={16} className={isOpen ? "text-primary" : ""} />
          <span className={isOpen ? "text-foreground" : ""}>Transkript</span>
        </h3>
        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          {isOpen ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>
      </div>

      {isOpen && (
        <CardContent className="pt-2 pb-6 px-6">
          {/* Search field */}
          <div className="relative mb-4">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Im Transkript suchen..."
              className="w-full bg-background border border-border/80 rounded-lg pl-9 pr-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors shadow-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Transcript content */}
          <div className="max-h-96 min-h-[200px] overflow-y-auto rounded-xl bg-sidebar-accent/50 p-5 border border-border/50 shadow-inner scrollbar-thin">
            {highlightedHtml ? (
              <pre
                className="font-mono text-xs sm:text-sm text-foreground/80 whitespace-pre-wrap break-words leading-relaxed"
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            ) : (
              <pre className="font-mono text-xs sm:text-sm text-foreground/80 whitespace-pre-wrap break-words leading-relaxed">
                {transcript}
              </pre>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
