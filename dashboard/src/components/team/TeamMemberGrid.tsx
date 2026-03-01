"use client";

import { useMemo } from "react";
import type { Lead, TeamMember } from "@/lib/types";
import TeamMemberCard from "./TeamMemberCard";

interface TeamMemberGridProps {
  teamMembers: TeamMember[];
  leads: Lead[];
  onEdit: (member: TeamMember) => void;
  onRemove: (id: string) => void;
}

export default function TeamMemberGrid({
  teamMembers,
  leads,
  onEdit,
  onRemove,
}: TeamMemberGridProps) {
  const sorted = useMemo(
    () => [...teamMembers].sort((a, b) => a.name.localeCompare(b.name)),
    [teamMembers]
  );

  const statsMap = useMemo(() => {
    const map = new Map<
      string,
      { assignedLeads: number; aLeads: number; conversionRate: number }
    >();

    for (const member of teamMembers) {
      const memberLeads = leads.filter((l) => l.assigned_to === member.id);
      const aLeads = memberLeads.filter((l) => l.lead_grade === "A").length;
      const converted = memberLeads.filter(
        (l) => l.status === "converted"
      ).length;
      const conversionRate =
        memberLeads.length > 0
          ? Math.round((converted / memberLeads.length) * 100)
          : 0;

      map.set(member.id, {
        assignedLeads: memberLeads.length,
        aLeads,
        conversionRate,
      });
    }

    return map;
  }, [teamMembers, leads]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sorted.map((member) => (
        <TeamMemberCard
          key={member.id}
          member={member}
          stats={
            statsMap.get(member.id) ?? {
              assignedLeads: 0,
              aLeads: 0,
              conversionRate: 0,
            }
          }
          onEdit={() => onEdit(member)}
          onRemove={() => onRemove(member.id)}
        />
      ))}
    </div>
  );
}
