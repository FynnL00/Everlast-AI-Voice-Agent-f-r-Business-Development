"use client";

import { useState, useEffect, useCallback } from "react";
import { Quote, MessageSquareQuote } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import QuoteStats from "@/components/quotes/QuoteStats";
import QuoteFilters from "@/components/quotes/QuoteFilters";
import QuoteList from "@/components/quotes/QuoteList";
import type { LeadQuote } from "@/lib/types";

interface QuoteFiltersValue {
  search: string;
  speaker: string;
  sentiment: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<LeadQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<QuoteFiltersValue>({
    search: "",
    speaker: "",
    sentiment: "",
  });

  const fetchQuotes = useCallback(
    async (page: number, append: boolean = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "20");
        if (filters.search) params.set("search", filters.search);
        if (filters.speaker) params.set("speaker", filters.speaker);
        if (filters.sentiment) params.set("sentiment", filters.sentiment);

        const res = await fetch(`/api/quotes?${params.toString()}`);
        if (!res.ok) {
          console.error("Failed to fetch quotes");
          return;
        }

        const json = await res.json();
        const data = json.data as LeadQuote[];
        const pag = json.pagination as PaginationInfo;

        if (append) {
          setQuotes((prev) => [...prev, ...data]);
        } else {
          setQuotes(data);
        }
        setPagination(pag);
      } catch (err) {
        console.error("Failed to fetch quotes:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters]
  );

  // Fetch on mount and when filters change
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchQuotes(1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchQuotes]);

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchQuotes(pagination.page + 1, true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">
          Zitate laden...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <PageHeader
        title="Zitate"
        subtitle="Wichtige Aussagen aus Gesprächen"
        icon={Quote}
      />

      {quotes.length === 0 && !filters.search && !filters.speaker && !filters.sentiment ? (
        <EmptyState
          icon={MessageSquareQuote}
          title="Noch keine Zitate extrahiert"
          description="Zitate werden automatisch aus Gesprächen generiert."
        />
      ) : (
        <>
          {/* Stats */}
          <QuoteStats quotes={quotes} totalCount={pagination.total} />

          {/* Filters */}
          <QuoteFilters filters={filters} onFilterChange={setFilters} />

          {/* Quote list */}
          {quotes.length === 0 ? (
            <EmptyState
              icon={MessageSquareQuote}
              title="Keine Zitate gefunden"
              description="Passen Sie Ihre Filter an, um Zitate zu finden."
            />
          ) : (
            <QuoteList quotes={quotes} />
          )}

          {/* Load more button */}
          {pagination.page < pagination.totalPages && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Lädt..." : "Mehr laden"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
