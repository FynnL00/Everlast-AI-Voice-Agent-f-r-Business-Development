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
    <div className="min-w-[280px] w-[280px] flex flex-col rounded-2xl border border-border bg-sidebar-accent/30 overflow-hidden shadow-sm backdrop-blur-md">
      {/* Colored top border */}
      <div className="h-1 w-full shrink-0 shadow-[0_0_10px_currentColor]" style={{ backgroundColor: color, color: color }} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-sidebar/50 backdrop-blur-md">
        <span className="text-sm font-semibold text-foreground tracking-tight">
          {label}
        </span>
        <div
          className="px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm"
          style={{ backgroundColor: `${color}20`, color: color, border: `1px solid ${color}40` }}
        >
          {leads.length}
        </div>
      </div>

      {/* Cards container - scrollable */}
      <div
        className={cn(
          "flex-1 overflow-y-auto p-3 space-y-3",
          "min-h-[120px] max-h-[calc(100vh-320px)] scrollbar-thin overflow-x-hidden"
        )}
      >
        {leads.length === 0 ? (
          <div className="flex items-center justify-center h-24 rounded-xl border border-dashed border-border/50 bg-background/20">
            <span className="text-xs font-medium text-muted-foreground">Keine Leads</span>
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
