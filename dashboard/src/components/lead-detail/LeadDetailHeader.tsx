"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Clock, Calendar } from "lucide-react";
import type { Lead } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import StatusBadge from "@/components/leads/StatusBadge";
import SentimentIndicator from "@/components/leads/SentimentIndicator";
import { getGradeColor, formatDuration, formatDate } from "@/lib/utils";

interface LeadDetailHeaderProps {
  lead: Lead;
}

export default function LeadDetailHeader({ lead }: LeadDetailHeaderProps) {
  return (
    <div>
      {/* Back link */}
      <Link
        href="/leads"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-4 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span>Zurück zu Leads</span>
      </Link>

      {/* Name + Grade */}
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold text-foreground tracking-tight leading-none">
          {lead.caller_name || "Unbekannter Lead"}
        </h1>
        {lead.lead_grade && (
          <div
            className="px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset"
            style={{
              backgroundColor: `${getGradeColor(lead.lead_grade)}15`,
              color: getGradeColor(lead.lead_grade),
              borderColor: `${getGradeColor(lead.lead_grade)}30`
            }}
          >
            {lead.lead_grade}-Lead
          </div>
        )}
      </div>

      {/* Metadata row — each item has an icon or label for context */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground font-medium mt-3">
        <div className="flex items-center h-8 bg-sidebar-accent/50 px-2.5 rounded-md border border-border">
          <StatusBadge status={lead.status} />
        </div>
        <div className="flex items-center gap-1.5 h-8 bg-sidebar-accent/50 px-2.5 rounded-md border border-border">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Stimmung</span>
          <SentimentIndicator sentiment={lead.sentiment} sentimentScore={lead.sentiment_score} sentimentReason={lead.sentiment_reason} showLabel />
        </div>
        {lead.call_duration_seconds != null && (
          <div className="flex items-center gap-1.5 h-8 bg-sidebar-accent/50 px-2.5 rounded-md border border-border">
            <Clock size={14} className="text-muted-foreground" />
            <span>{formatDuration(lead.call_duration_seconds)}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 h-8 bg-sidebar-accent/50 px-2.5 rounded-md border border-border">
          <Calendar size={14} className="text-muted-foreground" />
          <span>Angerufen am {formatDate(lead.created_at)}</span>
        </div>
        <div className="flex items-center gap-1.5 h-8 bg-sidebar-accent/50 px-2.5 rounded-md border border-border">
          <Shield
            size={14}
            className={
              lead.is_decision_maker
                ? "text-score-good"
                : "text-muted-foreground"
            }
          />
          <span className={lead.is_decision_maker ? "text-foreground" : "text-muted-foreground"}>
            {lead.is_decision_maker === true
              ? "Entscheider"
              : lead.is_decision_maker === false
                ? "Kein Entscheider"
                : "Unbekannt"}
          </span>
        </div>
      </div>
    </div>
  );
}
