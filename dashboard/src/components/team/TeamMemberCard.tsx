"use client";

import { useMemo } from "react";
import { Pencil, UserMinus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import type { TeamMember } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/types";

interface TeamMemberCardProps {
  member: TeamMember;
  stats: {
    assignedLeads: number;
    aLeads: number;
    conversionRate: number;
  };
  onEdit: () => void;
  onRemove: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const ROLE_COLOR: Record<TeamMember["role"], string> = {
  admin: "bg-purple-500/10 text-purple-600 border-purple-200",
  manager: "bg-blue-500/10 text-blue-600 border-blue-200",
  sales_rep: "bg-green-500/10 text-green-600 border-green-200",
};

export default function TeamMemberCard({
  member,
  stats,
  onEdit,
  onRemove,
}: TeamMemberCardProps) {
  const initials = useMemo(() => getInitials(member.name), [member.name]);

  return (
    <Card className="flex flex-col">
      <CardContent className="pt-6 flex flex-col flex-1">
        {/* Top section: Avatar + Info */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-sm font-bold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-foreground truncate">
              {member.name}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {member.email}
            </p>
            <Badge
              variant="outline"
              className={`mt-1.5 text-[10px] ${ROLE_COLOR[member.role]}`}
            >
              {ROLE_LABELS[member.role]}
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 py-3 border-t border-border">
          <div className="text-center">
            <div className="text-lg font-bold tabular-nums text-foreground">
              {stats.assignedLeads}
            </div>
            <div className="text-[10px] text-muted-foreground">Leads</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold tabular-nums text-foreground">
              {stats.aLeads}
            </div>
            <div className="text-[10px] text-muted-foreground">A-Leads</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold tabular-nums text-foreground">
              {stats.conversionRate}%
            </div>
            <div className="text-[10px] text-muted-foreground">Conversion</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 mt-auto pt-3 border-t border-border">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil size={14} />
            Bearbeiten
          </Button>
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-destructive hover:text-destructive">
            <UserMinus size={14} />
            Deaktivieren
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
