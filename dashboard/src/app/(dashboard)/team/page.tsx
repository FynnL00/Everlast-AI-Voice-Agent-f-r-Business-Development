"use client";

import { useState } from "react";
import { UserCog, UserPlus, Users as UsersIcon } from "lucide-react";
import { useTeam } from "@/lib/team-context";
import { useLeads } from "@/lib/leads-context";
import PageHeader from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import TeamKPIs from "@/components/team/TeamKPIs";
import TeamPerformanceChart from "@/components/team/TeamPerformanceChart";
import TeamMemberGrid from "@/components/team/TeamMemberGrid";
import AddTeamMemberDialog from "@/components/team/AddTeamMemberDialog";
import EditTeamMemberDialog from "@/components/team/EditTeamMemberDialog";
import type { TeamMember } from "@/lib/types";

export default function TeamPage() {
  const { teamMembers, loading: teamLoading, removeTeamMember } = useTeam();
  const { leads, loading: leadsLoading } = useLeads();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const loading = teamLoading || leadsLoading;

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setEditDialogOpen(true);
  };

  const handleRemove = async (id: string) => {
    await removeTeamMember(id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">
          Team lädt...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 md:py-8 max-w-[1900px] mx-auto space-y-6">
      <PageHeader
        title="Team-Verwaltung"
        subtitle="Mitarbeiter verwalten und zuweisen"
        icon={UserCog}
        rightContent={
          <Button size="sm" onClick={() => setAddDialogOpen(true)}>
            <UserPlus size={16} />
            Mitarbeiter hinzufügen
          </Button>
        }
      />

      {/* KPI Row */}
      <TeamKPIs teamMembers={teamMembers} leads={leads} />

      {/* Performance Chart */}
      <TeamPerformanceChart teamMembers={teamMembers} leads={leads} />

      {/* Team Member Grid */}
      {teamMembers.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="Noch keine Teammitglieder"
          description="Fügen Sie Teammitglieder hinzu, um Leads zuzuweisen und die Teamleistung zu verfolgen."
          action={{
            label: "Mitarbeiter hinzufügen",
            onClick: () => setAddDialogOpen(true),
          }}
        />
      ) : (
        <TeamMemberGrid
          teamMembers={teamMembers}
          leads={leads}
          onEdit={handleEdit}
          onRemove={handleRemove}
        />
      )}

      {/* Dialogs */}
      <AddTeamMemberDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
      />
      <EditTeamMemberDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingMember(null);
        }}
        member={editingMember}
      />
    </div>
  );
}
