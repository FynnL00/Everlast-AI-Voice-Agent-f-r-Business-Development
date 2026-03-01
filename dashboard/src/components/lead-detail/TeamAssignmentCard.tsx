"use client";

import { useState } from "react";
import { UserCog, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useTeam } from "@/lib/team-context";
import { ROLE_LABELS } from "@/lib/types";
import TeamMemberSelect from "@/components/ui/team-member-select";

interface TeamAssignmentCardProps {
  assignedTo: string | null;
  onAssign: (id: string | null) => Promise<void>;
}

export default function TeamAssignmentCard({
  assignedTo,
  onAssign,
}: TeamAssignmentCardProps) {
  const { teamMembers, getTeamMember } = useTeam();
  const [saving, setSaving] = useState(false);

  const assignedMember = assignedTo ? getTeamMember(assignedTo) : undefined;

  const handleChange = async (id: string | null) => {
    setSaving(true);
    try {
      await onAssign(id);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <UserCog size={16} className="text-muted-foreground" />
          Zuständigkeit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Current assignment display */}
          {assignedMember ? (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-primary/5 border border-primary/15">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                {assignedMember.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {assignedMember.name}
                </p>
                <span className="inline-block text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  {ROLE_LABELS[assignedMember.role]}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-4 bg-muted/20 border border-dashed border-border/50 rounded-xl text-muted-foreground">
              <div className="flex flex-col items-center gap-1.5">
                <UserCog size={20} className="opacity-50" />
                <span className="text-xs font-medium">Nicht zugewiesen</span>
              </div>
            </div>
          )}

          {/* Assignment dropdown */}
          <div className="relative">
            <TeamMemberSelect
              value={assignedTo}
              onChange={handleChange}
              teamMembers={teamMembers}
              placeholder="Mitarbeiter zuweisen..."
              size="sm"
              allowClear
            />
            {saving && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Loader2 size={14} className="animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
