"use client";

import { Search } from "lucide-react";

interface QuoteFiltersValue {
  search: string;
  speaker: string;
  sentiment: string;
}

interface QuoteFiltersProps {
  filters: QuoteFiltersValue;
  onFilterChange: (filters: QuoteFiltersValue) => void;
}

export default function QuoteFilters({
  filters,
  onFilterChange,
}: QuoteFiltersProps) {
  const update = (partial: Partial<QuoteFiltersValue>) => {
    onFilterChange({ ...filters, ...partial });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          placeholder="Zitate durchsuchen..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-sidebar-border bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-ring/50 focus:border-sidebar-ring transition-all"
        />
      </div>

      {/* Speaker filter */}
      <select
        value={filters.speaker}
        onChange={(e) => update({ speaker: e.target.value })}
        className="rounded-lg border border-sidebar-border bg-background/50 text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-ring/50 focus:border-sidebar-ring transition-all"
      >
        <option value="">Alle Sprecher</option>
        <option value="agent">Agent</option>
        <option value="caller">Anrufer</option>
      </select>

      {/* Sentiment filter */}
      <select
        value={filters.sentiment}
        onChange={(e) => update({ sentiment: e.target.value })}
        className="rounded-lg border border-sidebar-border bg-background/50 text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-ring/50 focus:border-sidebar-ring transition-all"
      >
        <option value="">Alle Sentiments</option>
        <option value="positiv">Positiv</option>
        <option value="neutral">Neutral</option>
        <option value="negativ">Negativ</option>
      </select>
    </div>
  );
}
