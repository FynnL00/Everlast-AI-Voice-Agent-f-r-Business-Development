"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { LeadQuote, ScoringDimension } from "@/lib/types";
import { SCORING_DIMENSION_LABELS, SCORING_DIMENSION_ORDER } from "@/lib/types";
import { cn } from "@/lib/utils";
import QuoteCard from "./QuoteCard";

interface QuotesAccordionProps {
  quotes: LeadQuote[];
}

const DIMENSION_BORDER: Record<string, string> = {
  company_size: "border-l-blue-500",
  tech_stack: "border-l-purple-500",
  pain_point: "border-l-orange-500",
  timeline: "border-l-teal-500",
  budget: "border-l-emerald-500",
  engagement: "border-l-indigo-500",
  sentiment: "border-l-pink-500",
  objection: "border-l-red-500",
  drop_off: "border-l-amber-500",
  general: "border-l-gray-400",
};

const DIMENSION_TEXT: Record<string, string> = {
  company_size: "text-blue-600",
  tech_stack: "text-purple-600",
  pain_point: "text-orange-600",
  timeline: "text-teal-600",
  budget: "text-emerald-600",
  engagement: "text-indigo-600",
  sentiment: "text-pink-600",
  objection: "text-red-600",
  drop_off: "text-amber-600",
  general: "text-gray-500",
};

export default function QuotesAccordion({ quotes }: QuotesAccordionProps) {
  const grouped = quotes.reduce<Record<string, LeadQuote[]>>((acc, q) => {
    const dim = q.scoring_dimension || "general";
    if (!acc[dim]) acc[dim] = [];
    acc[dim].push(q);
    return acc;
  }, {});

  const dimensions = SCORING_DIMENSION_ORDER.filter((dim) => grouped[dim]?.length);

  // First category open by default
  const [openDim, setOpenDim] = useState<string | null>(dimensions[0] ?? null);

  const toggle = (dim: string) => {
    setOpenDim((prev) => (prev === dim ? null : dim));
  };

  return (
    <div className="divide-y divide-border/50">
      {dimensions.map((dim) => {
        const isOpen = openDim === dim;
        const count = grouped[dim].length;

        return (
          <div key={dim} className={cn("border-l-2 transition-colors duration-200", DIMENSION_BORDER[dim] || "border-l-gray-400")}>
            {/* Accordion header */}
            <button
              onClick={() => toggle(dim)}
              className="flex items-center w-full gap-2 py-2 px-3 text-left transition-colors duration-150 hover:bg-muted/30"
            >
              <ChevronRight
                size={14}
                className={cn(
                  "shrink-0 text-muted-foreground/50 transition-transform duration-200",
                  isOpen && "rotate-90"
                )}
              />
              <span className={cn("text-xs font-semibold tracking-wide", DIMENSION_TEXT[dim] || "text-gray-500")}>
                {SCORING_DIMENSION_LABELS[dim as ScoringDimension]}
              </span>
              <span className="text-[10px] text-muted-foreground/40 tabular-nums">
                {count}
              </span>
            </button>

            {/* Accordion content */}
            {isOpen && (
              <div className="pl-3 pr-1 pb-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                {grouped[dim].map((quote) => (
                  <QuoteCard key={quote.id} quote={quote} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
