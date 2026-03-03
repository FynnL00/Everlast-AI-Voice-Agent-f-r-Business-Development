"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { Lead } from "@/lib/types";
import { useCampaigns } from "@/lib/campaigns-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import CallButton from "@/components/ui/CallButton";
import { getGradeColor } from "@/lib/utils";
import { PhoneOutgoing, ArrowRight } from "lucide-react";

interface ToCallTodayListProps {
  leads: Lead[];
}

const TERMINAL_STATUSES: Lead["status"][] = [
  "converted",
  "lost",
  "dnc",
  "exhausted",
];

export default function ToCallTodayList({ leads }: ToCallTodayListProps) {
  const { campaigns } = useCampaigns();

  const campaignMap = useMemo(() => {
    const map = new Map<string, string>();
    campaigns.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [campaigns]);

  const dueLeads = useMemo(() => {
    const now = new Date();
    return leads
      .filter(
        (l) =>
          l.next_call_scheduled_at &&
          new Date(l.next_call_scheduled_at) <= now &&
          !l.is_dnc &&
          l.call_direction === "outbound" &&
          !TERMINAL_STATUSES.includes(l.status) &&
          l.status !== "demo_booked" as Lead["status"]
      )
      .sort((a, b) => {
        // A-Leads first
        const gradeOrder: Record<string, number> = { A: 0, B: 1, C: 2 };
        const gA = gradeOrder[a.lead_grade ?? "C"] ?? 2;
        const gB = gradeOrder[b.lead_grade ?? "C"] ?? 2;
        if (gA !== gB) return gA - gB;
        // Then by due date (oldest first)
        return (
          new Date(a.next_call_scheduled_at!).getTime() -
          new Date(b.next_call_scheduled_at!).getTime()
        );
      })
      .slice(0, 10);
  }, [leads]);

  const formatRelativeTime = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "gerade eben";
    if (minutes < 60) return `vor ${minutes} Min.`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `vor ${hours} Std.`;
    const days = Math.floor(hours / 24);
    return `vor ${days} Tag${days > 1 ? "en" : ""}`;
  };

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 w-full h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <PhoneOutgoing size={16} className="text-primary" />
          <CardTitle className="text-base font-semibold">Heute anrufen</CardTitle>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {dueLeads.length} fällig
        </span>
      </CardHeader>
      <CardContent>
        {dueLeads.length === 0 ? (
          <p className="text-muted-foreground text-sm py-6 text-center">
            Keine fälligen Anrufe
          </p>
        ) : (
          <div className="space-y-1">
            {dueLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/30 transition-colors group"
              >
                {/* Grade dot */}
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: getGradeColor(lead.lead_grade) }}
                />

                {/* Name / Company */}
                <Link
                  href={`/leads/${lead.id}`}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {lead.caller_name || "Unbekannt"}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {lead.company && <span className="truncate">{lead.company}</span>}
                    {lead.campaign_id && campaignMap.get(lead.campaign_id) && (
                      <>
                        <span>·</span>
                        <span className="truncate">{campaignMap.get(lead.campaign_id)}</span>
                      </>
                    )}
                  </div>
                </Link>

                {/* Due since */}
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(lead.next_call_scheduled_at!)}
                  </p>
                  {lead.follow_up_reason && (
                    <p className="text-[10px] text-muted-foreground/70 truncate max-w-[100px]">
                      {lead.follow_up_reason}
                    </p>
                  )}
                </div>

                {/* Attempts */}
                <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                  #{lead.call_attempts}
                </span>

                {/* Call button */}
                <CallButton lead={lead} size="sm" />
              </div>
            ))}

            {/* Show all link */}
            <Link
              href="/leads"
              className="flex items-center justify-center gap-1 text-xs text-primary hover:underline py-2 mt-1"
            >
              Alle anzeigen
              <ArrowRight size={12} />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
