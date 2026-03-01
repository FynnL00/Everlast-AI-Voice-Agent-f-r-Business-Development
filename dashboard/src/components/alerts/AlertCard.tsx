"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Info, ExternalLink, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { useTeam } from "@/lib/team-context";
import { useLeads } from "@/lib/leads-context";
import TeamMemberSelect from "@/components/ui/team-member-select";
import type { AlertItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  alert: AlertItem;
}

const SEVERITY_CONFIG = {
  high: {
    borderColor: "border-l-red-500",
    icon: AlertTriangle,
    iconColor: "text-red-500",
    badgeBg: "bg-red-500/10 text-red-600 border-red-200",
    label: "Hoch",
  },
  medium: {
    borderColor: "border-l-amber-500",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    badgeBg: "bg-amber-500/10 text-amber-600 border-amber-200",
    label: "Mittel",
  },
  low: {
    borderColor: "border-l-gray-400",
    icon: Info,
    iconColor: "text-gray-400",
    badgeBg: "bg-gray-500/10 text-gray-600 border-gray-200",
    label: "Niedrig",
  },
};

export default function AlertCard({ alert }: AlertCardProps) {
  const config = SEVERITY_CONFIG[alert.riskLevel];
  const Icon = config.icon;
  const { teamMembers } = useTeam();
  const { updateLead } = useLeads();
  const [showAssign, setShowAssign] = useState(false);

  const handleAssign = async (teamMemberId: string | null) => {
    await updateLead(alert.lead.id, { assigned_to: teamMemberId });
    setShowAssign(false);
  };

  return (
    <Card
      className={cn("border-l-4", config.borderColor)}
      aria-label={`Warnung für ${alert.lead.caller_name ?? "Unbekannt"}, Risiko: ${config.label}`}
    >
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          {/* Severity icon */}
          <div className="shrink-0 mt-0.5">
            <Icon size={18} className={config.iconColor} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Link
                href={`/leads/${alert.lead.id}`}
                className="text-sm font-bold text-foreground hover:text-primary transition-colors truncate"
              >
                {alert.lead.caller_name ?? "Unbekannt"}
              </Link>
              {alert.lead.company && (
                <span className="text-xs text-muted-foreground truncate">
                  {alert.lead.company}
                </span>
              )}
              <Badge
                variant="outline"
                className={cn("text-[10px] ml-auto shrink-0", config.badgeBg)}
              >
                {config.label}
              </Badge>
            </div>

            {/* Reasons */}
            <ul className="space-y-0.5 mb-2">
              {alert.reasons.map((reason, i) => (
                <li
                  key={i}
                  className="text-xs text-muted-foreground flex items-start gap-1.5"
                >
                  <span className="text-muted-foreground/60 mt-0.5 shrink-0">
                    &bull;
                  </span>
                  {reason}
                </li>
              ))}
            </ul>

            {/* Badges row */}
            <div className="flex items-center gap-2 flex-wrap">
              {alert.daysSinceLastActivity > 0 && (
                <Badge
                  variant="outline"
                  className="text-[10px] bg-sidebar-accent/50"
                >
                  Seit {alert.daysSinceLastActivity}{" "}
                  {alert.daysSinceLastActivity === 1 ? "Tag" : "Tagen"} inaktiv
                </Badge>
              )}
              <Badge
                variant="outline"
                className="text-[10px] bg-sidebar-accent/50"
              >
                {alert.suggestedAction}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/leads/${alert.lead.id}`}>
                  <ExternalLink size={14} />
                  Kontaktieren
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAssign(!showAssign)}
              >
                <UserPlus size={14} />
                Zuweisen
              </Button>
            </div>

            {/* Assign dropdown */}
            {showAssign && (
              <div className="mt-2 max-w-xs">
                <TeamMemberSelect
                  value={alert.lead.assigned_to}
                  onChange={handleAssign}
                  teamMembers={teamMembers}
                  placeholder="Mitarbeiter wählen"
                  size="sm"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
