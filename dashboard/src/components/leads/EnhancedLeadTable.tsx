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
import { Badge } from "@/components/ui/Badge";

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
    return <ArrowUpDown size={14} className="text-muted-foreground opacity-50 transition-opacity hover:opacity-100" />;
  }
  return direction === "asc"
    ? <ArrowUp size={14} className="text-primary" />
    : <ArrowDown size={14} className="text-primary" />;
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
    <div className="overflow-x-auto w-full px-4 sm:px-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60">
            {COLUMNS.map((col) => (
              <th
                key={col.field}
                className={cn(
                  "px-4 py-4 text-left text-xs font-semibold text-muted-foreground tracking-wider uppercase",
                  col.className,
                  col.sortable && "cursor-pointer select-none hover:text-foreground transition-colors group"
                )}
                onClick={() => col.sortable && onSort(col.field)}
              >
                <div className={cn("inline-flex items-center gap-1.5",
                  col.className?.includes("text-right") && "justify-end",
                  col.className?.includes("text-center") && "justify-center"
                )}>
                  {col.label}
                  {col.sortable && (
                    <SortIcon
                      field={col.field}
                      currentField={sortField}
                      direction={sortDirection}
                    />
                  )}
                </div>
              </th>
            ))}
            {/* Arrow column */}
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <Link
              key={lead.id}
              href={`/leads/${lead.id}`}
              className="contents"
            >
              <tr className="group hover:bg-muted/50 border-b border-border/40 transition-colors duration-200 cursor-pointer">
                {/* Name */}
                <td className="px-4 py-4 align-middle">
                  <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {lead.caller_name || "Unbekannt"}
                  </div>
                  {lead.phone && (
                    <div className="text-xs text-muted-foreground mt-0.5 tracking-wide font-mono">{lead.phone}</div>
                  )}
                </td>

                {/* Firma */}
                <td className="px-4 py-4 align-middle">
                  <div className="font-medium text-foreground">
                    {lead.company || "\u2014"}
                  </div>
                  {lead.company_size && (
                    <div className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wider">{lead.company_size}</div>
                  )}
                </td>

                {/* Score / Grade */}
                <td className="px-4 py-4 text-center align-middle">
                  {lead.lead_grade ? (
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shadow-sm ring-1 ring-inset"
                      style={{
                        backgroundColor: `${getGradeColor(lead.lead_grade)}15`,
                        color: getGradeColor(lead.lead_grade),
                        "--tw-ring-color": `${getGradeColor(lead.lead_grade)}30`
                      } as React.CSSProperties}
                    >
                      {lead.lead_grade}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">&mdash;</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-4 align-middle">
                  <StatusBadge status={lead.status} />
                </td>

                {/* Sentiment */}
                <td className="px-4 py-4 text-center align-middle">
                  <div className="flex justify-center">
                    <SentimentIndicator sentiment={lead.sentiment} showLabel />
                  </div>
                </td>

                {/* Dauer */}
                <td className="px-4 py-4 text-right align-middle text-muted-foreground font-mono text-xs">
                  {lead.call_duration_seconds != null
                    ? formatDuration(lead.call_duration_seconds)
                    : "\u2014"}
                </td>

                {/* Termin */}
                <td className="px-4 py-4 align-middle text-center">
                  {lead.appointment_booked && lead.appointment_datetime ? (
                    <Badge className="bg-score-good-bg text-score-good hover:bg-score-good-bg shrink-0">
                      <CalendarCheck size={12} className="mr-1" />
                      Gebucht
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">&mdash;</span>
                  )}
                </td>

                {/* Datum */}
                <td className="px-4 py-4 text-right align-middle text-muted-foreground text-xs whitespace-nowrap">
                  {formatDate(lead.created_at)}
                </td>

                {/* Arrow */}
                <td className="px-2 py-4 text-right align-middle">
                  <ChevronRight
                    size={16}
                    className="text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
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
