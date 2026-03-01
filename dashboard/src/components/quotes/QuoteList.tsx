"use client";

import type { LeadQuote } from "@/lib/types";
import QuoteCard from "./QuoteCard";

interface QuoteListProps {
  quotes: LeadQuote[];
}

export default function QuoteList({ quotes }: QuoteListProps) {
  return (
    <div className="space-y-3">
      {quotes.map((quote) => (
        <QuoteCard key={quote.id} quote={quote} />
      ))}
    </div>
  );
}
