import Link from "next/link";
import type { Lead } from "@/lib/types";
import SentimentIndicator from "@/components/leads/SentimentIndicator";
import DispositionBadge from "@/components/ui/DispositionBadge";
import { cn, getGradeColor, formatDate } from "@/lib/utils";
import { Building2, Clock, CalendarDays, GripVertical, PhoneOutgoing } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";

interface PipelineCardProps {
  lead: Lead;
  isDragOverlay?: boolean;
}

export default function PipelineCard({ lead, isDragOverlay }: PipelineCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
  });

  const cardContent = (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      className={cn(
        "group relative rounded-xl border border-border bg-card/60 backdrop-blur-md p-4 shadow-sm",
        "transition-[transform,box-shadow,background-color,border-color] duration-200 hover:bg-card/80 hover:shadow-md hover:border-foreground/20 hover:-translate-y-px cursor-pointer flex flex-col gap-2.5",
        isDragging && !isDragOverlay && "opacity-30",
        isDragOverlay && "shadow-xl border-primary/30"
      )}
      role="button"
      aria-label={`Lead ${lead.caller_name ?? "Unbekannt"}, Status: ${lead.status}`}
      tabIndex={0}
    >
      {/* Hidden radial glow following mouse position (simplified for static cards) */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_60%)]" />

      {/* Top row: Drag handle + Name + Grade */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            {...(isDragOverlay ? {} : listeners)}
            {...(isDragOverlay ? {} : attributes)}
            className="shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none"
            aria-label="Drag-Handle"
            tabIndex={-1}
            onClick={(e) => e.preventDefault()}
          >
            <GripVertical size={14} />
          </button>
          <span className="text-sm font-bold text-foreground truncate max-w-[130px]">
            {lead.caller_name || "Unbekannt"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {lead.call_attempts > 0 && (
            <div className="flex items-center gap-0.5 text-[10px] font-bold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
              <PhoneOutgoing size={10} />
              {lead.call_attempts}
            </div>
          )}
          <SentimentIndicator sentiment={lead.sentiment} sentimentScore={lead.sentiment_score} />
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

      {/* Disposition Badge */}
      {lead.disposition_code && (
        <div className="mt-0.5">
          <DispositionBadge disposition={lead.disposition_code} size="sm" />
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
  );

  // If this is a drag overlay, don't wrap in Link
  if (isDragOverlay) {
    return cardContent;
  }

  return (
    <Link href={`/leads/${lead.id}`}>
      {cardContent}
    </Link>
  );
}
