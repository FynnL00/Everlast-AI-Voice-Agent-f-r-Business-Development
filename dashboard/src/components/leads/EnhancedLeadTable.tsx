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
import DispositionBadge from "@/components/ui/DispositionBadge";
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
  { field: "caller_name", label: "Name / Firma", sortable: true },
  { field: "total_score", label: "Score", sortable: true, className: "text-center" },
  { field: "status", label: "Status", sortable: true },
  { field: "call_attempts", label: "Versuche", sortable: true, className: "text-center" },
  { field: "disposition_code", label: "Disposition", sortable: true },
  { field: "appointment_booked", label: "Termin", sortable: true, className: "text-center" },
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
              <tr
                key={lead.id}
                className="group/row hover:bg-muted/50 border-b border-border/40 transition-colors duration-200 cursor-pointer"
              >
                {/* Name / Firma (merged) */}
                <td className="px-4 py-4 align-middle">
                  <Link href={`/leads/${lead.id}`} className="block">
                    <div className="font-semibold text-foreground group-hover/row:text-primary transition-colors">
                      {lead.caller_name || "Unbekannt"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {lead.company || "\u2014"}
                      {lead.company_size && (
                        <span className="text-[11px] uppercase tracking-wider"> · {lead.company_size}</span>
                      )}
                    </div>
                    {lead.phone && (
                      <div className="text-xs text-muted-foreground mt-0.5 tracking-wide font-mono">{lead.phone}</div>
                    )}
                  </Link>
                </td>

                {/* Score / Grade */}
                <td className="px-4 py-4 text-center align-middle">
                  <Link href={`/leads/${lead.id}`} className="block">
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
                  </Link>
                </td>

                {/* Status + Sentiment + Duration (merged) */}
                <td className="px-4 py-4 align-middle">
                  <Link href={`/leads/${lead.id}`} className="block">
                    <StatusBadge status={lead.status} />
                    <div className="flex items-center gap-2 mt-1.5">
                      <SentimentIndicator sentiment={lead.sentiment} showLabel />
                      {lead.call_duration_seconds != null && (
                        <>
                          <span className="text-border">·</span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {formatDuration(lead.call_duration_seconds)}
                          </span>
                        </>
                      )}
                    </div>
                  </Link>
                </td>

                {/* Versuche */}
                <td className="px-4 py-4 align-middle text-center">
                  <Link href={`/leads/${lead.id}`} className="block">
                    {lead.call_direction === 'outbound' && lead.call_attempts > 0 ? (
                      <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full text-xs font-bold bg-muted/60 text-foreground">
                        {lead.call_attempts}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">&mdash;</span>
                    )}
                  </Link>
                </td>

                {/* Disposition */}
                <td className="px-4 py-4 align-middle">
                  <Link href={`/leads/${lead.id}`} className="block">
                    {lead.disposition_code ? (
                      <DispositionBadge disposition={lead.disposition_code} size="sm" />
                    ) : (
                      <span className="text-muted-foreground">&mdash;</span>
                    )}
                  </Link>
                </td>

                {/* Termin */}
                <td className="px-4 py-4 align-middle text-center">
                  <Link href={`/leads/${lead.id}`} className="block">
                    {lead.appointment_booked && lead.appointment_datetime ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(lead.appointment_datetime)}
                        </span>
                        <Badge className="bg-score-good-bg text-score-good hover:bg-score-good-bg shrink-0">
                          <CalendarCheck size={12} className="mr-1" />
                          Gebucht
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">&mdash;</span>
                    )}
                  </Link>
                </td>

                {/* Arrow */}
                <td className="px-2 py-4 text-right align-middle">
                  <Link href={`/leads/${lead.id}`} className="block">
                    <ChevronRight
                      size={16}
                      className="text-muted-foreground group-hover/row:text-primary transition-colors opacity-0 group-hover/row:opacity-100"
                    />
                  </Link>
                </td>
              </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
