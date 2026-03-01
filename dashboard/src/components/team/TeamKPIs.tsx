"use client";

import { useMemo } from "react";
import { Users, UserCheck, UserX, BarChart3 } from "lucide-react";
import type { Lead, TeamMember } from "@/lib/types";
import { KPICard } from "@/components/ui/KPICard";

interface TeamKPIsProps {
  teamMembers: TeamMember[];
  leads: Lead[];
}

export default function TeamKPIs({ teamMembers, leads }: TeamKPIsProps) {
  const kpis = useMemo(() => {
    const activeMembers = teamMembers.filter((m) => m.is_active).length;
    const assignedLeads = leads.filter((l) => l.assigned_to !== null).length;
    const openLeads = leads.filter((l) => l.assigned_to === null).length;
    const avgLeadsPerMember =
      activeMembers > 0 ? Math.round(assignedLeads / activeMembers) : 0;

    return { activeMembers, assignedLeads, openLeads, avgLeadsPerMember };
  }, [teamMembers, leads]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        label="Teammitglieder"
        numericValue={kpis.activeMembers}
        icon={Users}
        colorClass="text-blue-400"
        bgClass="bg-blue-500/10"
        subtitle="Aktive Mitarbeiter"
      />
      <KPICard
        label="Zugewiesene Leads"
        numericValue={kpis.assignedLeads}
        icon={UserCheck}
        colorClass="text-green-400"
        bgClass="bg-green-500/10"
        subtitle="Leads mit Zuweisung"
      />
      <KPICard
        label="Offene Leads"
        numericValue={kpis.openLeads}
        icon={UserX}
        colorClass="text-amber-400"
        bgClass="bg-amber-500/10"
        subtitle="Ohne Zuweisung"
      />
      <KPICard
        label="Ø Leads/Mitarbeiter"
        numericValue={kpis.avgLeadsPerMember}
        icon={BarChart3}
        colorClass="text-purple-400"
        bgClass="bg-purple-500/10"
        subtitle="Durchschnittliche Auslastung"
      />
    </div>
  );
}
