"use client";

import { useState, useEffect } from "react";
import Dialog from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTeam } from "@/lib/team-context";
import type { TeamMember } from "@/lib/types";

interface EditTeamMemberDialogProps {
  open: boolean;
  onClose: () => void;
  member: TeamMember | null;
}

export default function EditTeamMemberDialog({
  open,
  onClose,
  member,
}: EditTeamMemberDialogProps) {
  const { updateTeamMember } = useTeam();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamMember["role"]>("sales_rep");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setEmail(member.email);
      setRole(member.role);
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !name.trim() || !email.trim()) return;

    setSubmitting(true);
    await updateTeamMember(member.id, {
      name: name.trim(),
      email: email.trim(),
      role,
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="Mitarbeiter bearbeiten">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="edit-name"
            className="block text-xs font-medium text-muted-foreground mb-1"
          >
            Name *
          </label>
          <input
            id="edit-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-sidebar-border bg-background/50 text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-ring/50 focus:border-sidebar-ring transition-all"
          />
        </div>

        <div>
          <label
            htmlFor="edit-email"
            className="block text-xs font-medium text-muted-foreground mb-1"
          >
            E-Mail *
          </label>
          <input
            id="edit-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-sidebar-border bg-background/50 text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-ring/50 focus:border-sidebar-ring transition-all"
          />
        </div>

        <div>
          <label
            htmlFor="edit-role"
            className="block text-xs font-medium text-muted-foreground mb-1"
          >
            Rolle
          </label>
          <select
            id="edit-role"
            value={role}
            onChange={(e) => setRole(e.target.value as TeamMember["role"])}
            className="w-full rounded-lg border border-sidebar-border bg-background/50 text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-ring/50 focus:border-sidebar-ring transition-all"
          >
            <option value="sales_rep">Sales Rep</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? "Wird gespeichert..." : "Speichern"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
