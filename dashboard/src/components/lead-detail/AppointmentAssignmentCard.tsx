"use client";

import { useState } from "react";
import { CalendarCheck, Calendar, UserCog, Loader2 } from "lucide-react";
import type { Lead } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/Card";
import { useTeam } from "@/lib/team-context";
import { ROLE_LABELS } from "@/lib/types";
import TeamMemberSelect from "@/components/ui/team-member-select";
import { formatFullDate } from "@/lib/utils";

interface AppointmentAssignmentCardProps {
  lead: Lead;
  onStatusChange: (status: Lead["status"]) => Promise<void>;
  onAssign: (id: string | null) => Promise<void>;
}

const ALL_STATUSES: Lead["status"][] = [
  "new",
  "contacted",
  "qualified",
  "appointment_booked",
  "converted",
  "lost",
  "not_reached",
  "rejected",
];

export default function AppointmentAssignmentCard({
  lead,
  onStatusChange,
  onAssign,
}: AppointmentAssignmentCardProps) {
  const { teamMembers, getTeamMember } = useTeam();
  const [statusSaving, setStatusSaving] = useState(false);
  const [assignSaving, setAssignSaving] = useState(false);

  const assignedMember = lead.assigned_to
    ? getTeamMember(lead.assigned_to)
    : undefined;

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value as Lead["status"];
    if (newStatus === lead.status) return;
    setStatusSaving(true);
    try {
      await onStatusChange(newStatus);
    } finally {
      setStatusSaving(false);
    }
  };

  const handleAssign = async (id: string | null) => {
    setAssignSaving(true);
    try {
      await onAssign(id);
    } finally {
      setAssignSaving(false);
    }
  };

  return (
    <Card className="shadow-sm">
      {/* Header: Lead Name + Status Dropdown */}
      <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-4 border-b border-border/50">
        <h2 className="text-lg font-bold text-foreground truncate">
          {lead.caller_name || "Unbekannter Lead"}
        </h2>
        <div className="relative shrink-0">
          <select
            value={lead.status}
            onChange={handleStatusChange}
            disabled={statusSaving}
            className="bg-card/50 border border-border/80 rounded-lg px-3 py-1.5 text-sm font-semibold text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50 appearance-none cursor-pointer hover:bg-card hover:border-border pr-8"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.5rem center",
              backgroundSize: "0.875rem",
            }}
          >
            {ALL_STATUSES.map((status) => (
              <option key={status} value={status} className="bg-card text-foreground">
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          {statusSaving && (
            <div className="absolute right-8 top-1/2 -translate-y-1/2">
              <Loader2 size={14} className="animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>

      <CardContent className="pt-4 space-y-5">
        {/* Termin Section */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Termin
          </h3>
          {lead.appointment_booked ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold bg-score-good-bg text-score-good border border-score-good/20 shadow-sm">
                <CalendarCheck size={18} className="shrink-0" />
                Termin erfolgreich gebucht
              </div>
              <div className="pl-2 border-l-2 border-score-good/30 space-y-1 py-1">
                {lead.appointment_datetime && (
                  <p className="text-base font-semibold text-foreground tracking-tight">
                    {formatFullDate(lead.appointment_datetime)}
                  </p>
                )}
                {lead.cal_booking_id && (
                  <p className="text-xs text-muted-foreground font-mono">
                    ID: {lead.cal_booking_id}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-5 bg-muted/20 border border-dashed border-border/50 rounded-xl text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <Calendar size={22} className="opacity-50" />
                <span className="text-sm font-medium">Kein Termin gebucht</span>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border/50" />

        {/* Zuständigkeit Section */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <UserCog size={14} />
            Zuständigkeit
          </h3>
          {assignedMember ? (
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-primary/5 border border-primary/15 mb-3">
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
            <div className="flex items-center justify-center p-4 bg-muted/20 border border-dashed border-border/50 rounded-xl text-muted-foreground mb-3">
              <div className="flex flex-col items-center gap-1.5">
                <UserCog size={20} className="opacity-50" />
                <span className="text-xs font-medium">Nicht zugewiesen</span>
              </div>
            </div>
          )}

          <div className="relative">
            <TeamMemberSelect
              value={lead.assigned_to}
              onChange={handleAssign}
              teamMembers={teamMembers}
              placeholder="Mitarbeiter zuweisen..."
              size="sm"
              allowClear
            />
            {assignSaving && (
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
