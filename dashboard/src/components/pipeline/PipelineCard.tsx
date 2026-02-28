import Link from "next/link";
import type { Lead } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import SentimentIndicator from "@/components/leads/SentimentIndicator";
import { cn, getGradeColor, formatDate } from "@/lib/utils";
import { Building2, Clock } from "lucide-react";

interface PipelineCardProps {
  lead: Lead;
}

export default function PipelineCard({ lead }: PipelineCardProps) {
  return (
    <Link href={`/leads/${lead.id}`}>
      <div
        className={cn(
          "rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3 shadow-[var(--card-shadow)]",
          "transition-all duration-150 hover:bg-[var(--card-hover)] hover:shadow-[var(--card-shadow-hover)] cursor-pointer"
        )}
      >
        {/* Top row: Name + Grade */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-sm font-medium text-[var(--foreground)] truncate">
            {lead.caller_name || "Unbekannt"}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <SentimentIndicator sentiment={lead.sentiment} />
            {lead.lead_grade && (
              <Badge
                label={lead.lead_grade}
                color={getGradeColor(lead.lead_grade)}
                size="sm"
              />
            )}
          </div>
        </div>

        {/* Company */}
        {lead.company && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <Building2 size={12} className="text-[var(--muted)] shrink-0" />
            <span className="text-xs text-[var(--text-secondary)] truncate">
              {lead.company}
            </span>
          </div>
        )}

        {/* Bottom row: Date + Score */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <Clock size={11} className="text-[var(--muted)]" />
            <span className="text-[10px] text-[var(--muted)]">
              {formatDate(lead.created_at)}
            </span>
          </div>
          {lead.total_score !== null && (
            <span className="text-[10px] text-[var(--text-secondary)]">
              {lead.total_score} Pkt.
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
