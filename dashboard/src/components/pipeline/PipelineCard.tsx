import Link from "next/link";
import type { Lead } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import SentimentIndicator from "@/components/leads/SentimentIndicator";
import { cn, getGradeColor, formatDate } from "@/lib/utils";
import { Building2, Clock, CalendarDays } from "lucide-react";

interface PipelineCardProps {
  lead: Lead;
}

export default function PipelineCard({ lead }: PipelineCardProps) {
  return (
    <Link href={`/leads/${lead.id}`}>
      <div
        className={cn(
          "group relative rounded-xl border border-border bg-card/60 backdrop-blur-md p-4 shadow-sm",
          "transition-[transform,box-shadow,background-color,border-color] duration-200 hover:bg-card/80 hover:shadow-md hover:border-foreground/20 hover:-translate-y-0.5 cursor-pointer flex flex-col gap-2.5"
        )}
      >
        {/* Hidden radial glow following mouse position (simplified for static cards) */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_60%)]" />

        {/* Top row: Name + Grade */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-bold text-foreground truncate max-w-[150px]">
            {lead.caller_name || "Unbekannt"}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <SentimentIndicator sentiment={lead.sentiment} />
            {lead.lead_grade && (
              <div
                className="flex items-center justify-center w-5 h-5 rounded hover:bg-opacity-80 transition-colors text-[10px] font-bold tracking-wider"
                style={{
                  backgroundColor: `${getGradeColor(lead.lead_grade)}15`,
                  color: getGradeColor(lead.lead_grade),
                  border: `1px solid ${getGradeColor(lead.lead_grade)}30`
                }}
              >
                {lead.lead_grade}
              </div>
            )}
          </div>
        </div>

        {/* Company */}
        {lead.company && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <Building2 size={12} className="shrink-0" />
            <span className="truncate max-w-[180px]">
              {lead.company}
            </span>
          </div>
        )}

        {/* Booked Appointment Badge */}
        {lead.appointment_booked && (
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-score-good bg-score-good-bg border border-score-good/20 px-1.5 py-0.5 rounded w-fit mt-1">
            <CalendarDays size={10} />
            Termin gebucht
          </div>
        )}

        {/* Bottom row: Date + Score */}
        <div className="flex items-center justify-between mt-1 pt-2 border-t border-border/40">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
            <Clock size={10} />
            <span>
              {formatDate(lead.created_at)}
            </span>
          </div>
          {lead.total_score !== null && (
            <span className="text-[10px] font-bold text-foreground">
              {lead.total_score} Pkt.
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
