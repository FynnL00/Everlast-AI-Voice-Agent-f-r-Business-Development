"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function getVisiblePages(current: number, total: number): (number | "...")[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i);
  }

  const pages: (number | "...")[] = [];

  if (current <= 2) {
    // Near the beginning
    pages.push(0, 1, 2, "...", total - 1);
  } else if (current >= total - 3) {
    // Near the end
    pages.push(0, "...", total - 3, total - 2, total - 1);
  } else {
    // In the middle
    pages.push(0, "...", current - 1, current, current + 1, "...", total - 1);
  }

  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = currentPage * pageSize + 1;
  const end = Math.min((currentPage + 1) * pageSize, totalItems);
  const visiblePages = getVisiblePages(currentPage, totalPages);

  const buttonBase = cn(
    "inline-flex items-center justify-center rounded-lg border transition-colors duration-150",
    "text-sm font-medium min-w-[36px] h-9"
  );

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-3", className)}>
      {/* Info text */}
      <span className="text-sm text-[var(--text-secondary)]">
        Zeige {start}&ndash;{end} von {totalItems} Leads
      </span>

      {/* Page controls */}
      <div className="flex items-center gap-1">
        {/* Prev button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className={cn(
            buttonBase,
            "px-2 border-[var(--card-border)] bg-[var(--card)]",
            currentPage === 0
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-[var(--card-hover)] text-[var(--foreground)]"
          )}
          aria-label="Vorherige Seite"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page numbers */}
        {visiblePages.map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="inline-flex items-center justify-center min-w-[36px] h-9 text-sm text-[var(--muted)]"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                buttonBase,
                page === currentPage
                  ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                  : "border-[var(--card-border)] bg-[var(--card)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)]"
              )}
            >
              {page + 1}
            </button>
          )
        )}

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className={cn(
            buttonBase,
            "px-2 border-[var(--card-border)] bg-[var(--card)]",
            currentPage >= totalPages - 1
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-[var(--card-hover)] text-[var(--foreground)]"
          )}
          aria-label="Naechste Seite"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
