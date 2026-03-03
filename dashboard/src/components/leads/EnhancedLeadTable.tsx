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
import { cn, formatDate, getGradeColor } from "@/lib/utils";
import type { Lead, SortField, SortDirection } from "@/lib/types";
import StatusBadge from "@/components/leads/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

interface EnhancedLeadTableProps {
  leads: Lead[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

interface ColumnDef {
  key: string;
  field?: SortField;
  label: string;
  sortable: boolean;
  className?: string;
}

const COLUMNS: ColumnDef[] = [
  { key: "name", field: "caller_name", label: "Name", sortable: true },
  { key: "company", field: "company", label: "Unternehmen", sortable: true },
  { key: "status", field: "status", label: "Status", sortable: true },
  { key: "score", field: "total_score", label: "Score", sortable: true, className: "text-center" },
  { key: "email", label: "E-Mail", sortable: false },
  { key: "phone", label: "Telefon", sortable: false },
  { key: "appointment", field: "appointment_booked", label: "Termin", sortable: true },
];

function SortIcon({ field, currentField, direction }: {
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
}) {
  if (field !== currentField) {
    return <ArrowUpDown size={12} className="text-muted-foreground/40 group-hover:text-muted-foreground transition-opacity" />;
  }
  return direction === "asc"
    ? <ArrowUp size={12} className="text-primary" />
    : <ArrowDown size={12} className="text-primary" />;
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
    <div className="overflow-x-auto w-full">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
          <tr className="border-b border-border/50">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-5 py-3.5 text-left text-sm font-medium text-muted-foreground",
                  col.className,
                  col.sortable && "cursor-pointer select-none hover:text-foreground transition-colors group"
                )}
                onClick={() => col.sortable && col.field && onSort(col.field)}
              >
                <div className={cn("inline-flex items-center gap-1.5",
                  col.className?.includes("text-center") && "justify-center"
                )}>
                  {col.label}
                  {col.sortable && col.field && (
                    <SortIcon
                      field={col.field}
                      currentField={sortField}
                      direction={sortDirection}
                    />
                  )}
                </div>
              </th>
            ))}
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
              <tr
                key={lead.id}
                className="group/row even:bg-muted/20 hover:bg-muted/40 border-b border-border/30 transition-colors duration-150 cursor-pointer"
              >
                {/* Name */}
                <td className="px-5 py-5 align-middle">
                  <Link href={`/leads/${lead.id}`} className="block">
                    <span className="font-medium text-foreground group-hover/row:text-primary transition-colors">
                      {lead.caller_name || "Unbekannt"}
                    </span>
                  </Link>
                </td>

                {/* Unternehmen */}
                <td className="px-5 py-5 align-middle">
                  <Link href={`/leads/${lead.id}`} className="block text-muted-foreground">
                    {lead.company || "\u2014"}
                  </Link>
                </td>

                {/* Status */}
                <td className="px-5 py-5 align-middle">
                  <Link href={`/leads/${lead.id}`} className="block">
                    <StatusBadge status={lead.status} outboundState={lead.outbound_state} />
                  </Link>
                </td>

                {/* Score */}
                <td className="px-5 py-5 text-center align-middle">
                  <Link href={`/leads/${lead.id}`} className="block">
                    {lead.lead_grade ? (
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ring-1 ring-inset"
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

                {/* E-Mail */}
                <td className="px-5 py-5 align-middle">
                  <Link href={`/leads/${lead.id}`} className="block text-muted-foreground text-sm truncate max-w-[200px]">
                    {lead.email || "\u2014"}
                  </Link>
                </td>

                {/* Telefon */}
                <td className="px-5 py-5 align-middle">
                  <Link href={`/leads/${lead.id}`} className="block text-muted-foreground tabular-nums">
                    {lead.phone || "\u2014"}
                  </Link>
                </td>

                {/* Termin */}
                <td className="px-5 py-5 align-middle">
                  <Link href={`/leads/${lead.id}`} className="block">
                    {lead.appointment_booked && lead.appointment_datetime ? (
                      <div className="flex flex-col items-start gap-1">
                        <Badge className="bg-score-good-bg text-score-good hover:bg-score-good-bg whitespace-nowrap">
                          <CalendarCheck size={12} className="mr-1" />
                          Gebucht
                        </Badge>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(lead.appointment_datetime)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">&mdash;</span>
                    )}
                  </Link>
                </td>

                {/* Arrow */}
                <td className="px-2 py-5 text-right align-middle">
                  <Link href={`/leads/${lead.id}`} className="block">
                    <ChevronRight
                      size={16}
                      className="text-muted-foreground/30 group-hover/row:text-primary transition-colors group-hover/row:opacity-100"
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
