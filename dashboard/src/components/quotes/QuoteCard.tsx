"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { LeadQuote } from "@/lib/types";
import { cn } from "@/lib/utils";

interface QuoteCardProps {
  quote: LeadQuote;
}

const SENTIMENT_EMOJI: Record<string, string> = {
  positiv: "🟢",
  neutral: "🟡",
  negativ: "🔴",
};

const SPEAKER_LABEL: Record<string, string> = {
  agent: "Agent",
  caller: "Anrufer",
};

export default function QuoteCard({ quote }: QuoteCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(quote.quote_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <div
      className="group cursor-pointer"
      onClick={() => quote.context && setExpanded((v) => !v)}
    >
      {/* Main row: quote + meta inline */}
      <div className="flex items-start gap-2 py-1.5 px-2 -mx-2 rounded-lg transition-colors duration-150 hover:bg-muted/40">
        {/* Quote text — fills available space */}
        <p className="flex-1 text-[13px] text-foreground/90 leading-snug min-w-0">
          <span className="text-muted-foreground/40">&bdquo;</span>
          <span className="line-clamp-2">{quote.quote_text}</span>
          <span className="text-muted-foreground/40">&ldquo;</span>
        </p>

        {/* Inline meta: score · speaker · sentiment · copy */}
        <div className="flex items-center gap-2 shrink-0 text-[11px] text-muted-foreground pt-0.5">
          {quote.score_value != null && (
            <span className="font-mono font-medium text-foreground/60">
              {quote.score_value}/3
            </span>
          )}
          {quote.speaker && SPEAKER_LABEL[quote.speaker] && (
            <span className="hidden sm:inline">{SPEAKER_LABEL[quote.speaker]}</span>
          )}
          {quote.sentiment && SENTIMENT_EMOJI[quote.sentiment] && (
            <span className="text-[10px] leading-none">{SENTIMENT_EMOJI[quote.sentiment]}</span>
          )}
          <button
            onClick={handleCopy}
            className={cn(
              "p-0.5 rounded transition-all duration-150 text-muted-foreground/50 hover:text-foreground",
              copied ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            title="Kopieren"
          >
            {copied ? (
              <Check size={12} className="text-emerald-500" />
            ) : (
              <Copy size={12} />
            )}
          </button>
        </div>
      </div>

      {/* Expandable context (progressive disclosure) */}
      {quote.context && expanded && (
        <div className="pl-2 pr-8 pb-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-[11px] text-muted-foreground/60 italic leading-snug">
            {quote.context}
          </p>
        </div>
      )}
    </div>
  );
}
