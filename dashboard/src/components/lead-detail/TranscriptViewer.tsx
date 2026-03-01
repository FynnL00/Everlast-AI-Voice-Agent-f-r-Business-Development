"use client";

import { useState, useMemo } from "react";
import { Search, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface TranscriptViewerProps {
  transcript: string | null;
}

export default function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");

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
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <FileText size={16} />
          Transkript
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
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
          />
        </div>

        {/* Transcript content - always visible, no collapse */}
        <div className="max-h-[600px] min-h-[200px] overflow-y-auto rounded-xl bg-sidebar-accent/50 p-5 border border-border/50 shadow-inner scrollbar-thin">
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
    </Card>
  );
}
