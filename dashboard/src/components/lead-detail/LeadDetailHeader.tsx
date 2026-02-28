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
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        <span>Zurück zu Leads</span>
      </Link>

      {/* Main header row */}
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold">
          {lead.caller_name || "Unbekannter Lead"}
        </h1>
        {lead.lead_grade && (
          <Badge
            label={`${lead.lead_grade}-Lead`}
            color={getGradeColor(lead.lead_grade)}
            size="md"
          />
        )}
        <StatusBadge status={lead.status} />
        <SentimentIndicator sentiment={lead.sentiment} showLabel />
      </div>

      {/* Secondary info row */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
        {lead.call_duration_seconds != null && (
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-[var(--muted)]" />
            <span>{formatDuration(lead.call_duration_seconds)}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-[var(--muted)]" />
          <span>{formatDate(lead.created_at)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield
            size={14}
            className={
              lead.is_decision_maker
                ? "text-[var(--success)]"
                : "text-[var(--muted)]"
            }
          />
          <span>
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
