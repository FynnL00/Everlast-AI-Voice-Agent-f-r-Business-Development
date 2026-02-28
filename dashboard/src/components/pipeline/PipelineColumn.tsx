import type { Lead } from "@/lib/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import PipelineCard from "./PipelineCard";
import { cn } from "@/lib/utils";

interface PipelineColumnProps {
  status: Lead["status"];
  leads: Lead[];
}

export default function PipelineColumn({ status, leads }: PipelineColumnProps) {
  const label = STATUS_LABELS[status];
  const color = STATUS_COLORS[status];

  return (
    <div className="min-w-[250px] flex flex-col rounded-xl border border-[var(--card-border)] bg-[var(--background)] overflow-hidden shadow-[var(--card-shadow)]">
      {/* Colored top border */}
      <div className="h-1 shrink-0" style={{ backgroundColor: color }} />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-[var(--card-border)]">
        <span className="text-sm font-medium text-[var(--foreground)]">
          {label}
        </span>
        <Badge label={String(leads.length)} color={color} size="sm" />
      </div>

      {/* Cards container - scrollable */}
      <div
        className={cn(
          "flex-1 overflow-y-auto p-2 space-y-2",
          "min-h-[120px] max-h-[calc(100vh-320px)]"
        )}
      >
        {leads.length === 0 ? (
          <div className="flex items-center justify-center h-20">
            <span className="text-xs text-[var(--muted)]">Keine Leads</span>
          </div>
        ) : (
          leads.map((lead) => (
            <PipelineCard key={lead.id} lead={lead} />
          ))
        )}
      </div>
    </div>
  );
}
