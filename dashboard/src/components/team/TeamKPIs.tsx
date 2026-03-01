"use client";

import { useMemo } from "react";
import { Users, UserCheck, UserX, BarChart3 } from "lucide-react";
import type { Lead, TeamMember } from "@/lib/types";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface TeamKPIsProps {
  teamMembers: TeamMember[];
  leads: Lead[];
}

function KPICard({
  label,
  numericValue,
  suffix,
  icon: Icon,
  colorClass,
  bgClass,
  subtitle,
}: {
  label: string;
  numericValue: number;
  suffix?: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center p-4 rounded-2xl bg-sidebar-accent/50 border border-border relative group hover:bg-sidebar-accent transition-colors gap-4">
      <div className={`p-3 rounded-full shrink-0 ${bgClass} ${colorClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">
          {label}
        </span>
        <span className="text-2xl font-bold tabular-nums text-foreground">
          <AnimatedNumber value={numericValue} suffix={suffix ?? ""} />
        </span>
        <span className="text-[10px] text-muted-foreground mt-0.5 tracking-tight truncate">
          {subtitle}
        </span>
      </div>
    </div>
  );
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
