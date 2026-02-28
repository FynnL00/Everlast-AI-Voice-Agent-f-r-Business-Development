"use client";

import Link from "next/link";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Users,
  CalendarCheck,
} from "lucide-react";
import { cn, formatDuration, formatDate, getGradeColor } from "@/lib/utils";
import type { Lead, SortField, SortDirection } from "@/lib/types";
import StatusBadge from "@/components/leads/StatusBadge";
import SentimentIndicator from "@/components/leads/SentimentIndicator";
import EmptyState from "@/components/ui/EmptyState";

interface EnhancedLeadTableProps {
  leads: Lead[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

interface ColumnDef {
  field: SortField;
  label: string;
  sortable: boolean;
  className?: string;
}

const COLUMNS: ColumnDef[] = [
  { field: "caller_name", label: "Name", sortable: true },
  { field: "company", label: "Firma", sortable: true },
  { field: "total_score", label: "Score", sortable: true, className: "text-center" },
  { field: "status", label: "Status", sortable: true },
  { field: "sentiment", label: "Sentiment", sortable: true, className: "text-center" },
  { field: "call_duration_seconds", label: "Dauer", sortable: true, className: "text-right" },
  { field: "appointment_booked", label: "Termin", sortable: true },
  { field: "created_at", label: "Datum", sortable: true, className: "text-right" },
];

function SortIcon({ field, currentField, direction }: {
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
}) {
  if (field !== currentField) {
    return <ArrowUpDown size={14} className="text-[var(--muted)]" />;
  }
  return direction === "asc"
    ? <ArrowUp size={14} className="text-[var(--accent)]" />
    : <ArrowDown size={14} className="text-[var(--accent)]" />;
}

export default function EnhancedLeadTable({
  leads,
  sortField,
  sortDirection,
  onSort,
}: EnhancedLeadTableProps) {
  if (leads.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Keine Leads gefunden"
        description="Passe deine Filter an oder warte auf neue Anrufe."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--card-border)]">
            {COLUMNS.map((col) => (
              <th
                key={col.field}
                className={cn(
                  "px-4 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider",
                  col.className,
                  col.sortable && "cursor-pointer select-none hover:text-[var(--foreground)] transition-colors"
                )}
                onClick={() => col.sortable && onSort(col.field)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <SortIcon
                      field={col.field}
                      currentField={sortField}
                      direction={sortDirection}
                    />
                  )}
                </span>
              </th>
            ))}
            {/* Arrow column */}
            <th className="w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--card-border)]">
          {leads.map((lead) => (
            <Link
              key={lead.id}
              href={`/leads/${lead.id}`}
              className="contents"
            >
              <tr className="group hover:bg-[var(--card-hover)] transition-colors duration-150 cursor-pointer">
                {/* Name */}
                <td className="px-4 py-3">
                  <div className="font-medium text-[var(--foreground)]">
                    {lead.caller_name || "Unbekannt"}
                  </div>
                  {lead.phone && (
                    <div className="text-xs text-[var(--muted)] mt-0.5">{lead.phone}</div>
                  )}
                </td>

                {/* Firma */}
                <td className="px-4 py-3">
                  <div className="text-[var(--foreground)]">
                    {lead.company || "\u2014"}
                  </div>
                  {lead.company_size && (
                    <div className="text-xs text-[var(--muted)] mt-0.5">{lead.company_size}</div>
                  )}
                </td>

                {/* Score / Grade */}
                <td className="px-4 py-3 text-center">
                  {lead.lead_grade ? (
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: getGradeColor(lead.lead_grade) }}
                    >
                      {lead.lead_grade}
                    </span>
                  ) : (
                    <span className="text-[var(--muted)]">&mdash;</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <StatusBadge status={lead.status} />
                </td>

                {/* Sentiment */}
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center">
                    <SentimentIndicator sentiment={lead.sentiment} showLabel />
                  </div>
                </td>

                {/* Dauer */}
                <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                  {lead.call_duration_seconds != null
                    ? formatDuration(lead.call_duration_seconds)
                    : "\u2014"}
                </td>

                {/* Termin */}
                <td className="px-4 py-3">
                  {lead.appointment_booked && lead.appointment_datetime ? (
                    <div className="inline-flex items-center gap-1.5 text-xs text-[var(--success)]">
                      <CalendarCheck size={14} />
                      {formatDate(lead.appointment_datetime)}
                    </div>
                  ) : (
                    <span className="text-[var(--muted)]">&mdash;</span>
                  )}
                </td>

                {/* Datum */}
                <td className="px-4 py-3 text-right text-[var(--text-secondary)]">
                  {formatDate(lead.created_at)}
                </td>

                {/* Arrow */}
                <td className="px-2 py-3 text-right">
                  <ChevronRight
                    size={16}
                    className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors"
                  />
                </td>
              </tr>
            </Link>
          ))}
        </tbody>
      </table>
    </div>
  );
}
