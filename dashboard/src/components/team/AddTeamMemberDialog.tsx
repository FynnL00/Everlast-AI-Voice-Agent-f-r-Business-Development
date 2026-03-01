"use client";

import { useState } from "react";
import Dialog from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTeam } from "@/lib/team-context";
import type { TeamMember } from "@/lib/types";

interface AddTeamMemberDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddTeamMemberDialog({
  open,
  onClose,
}: AddTeamMemberDialogProps) {
  const { addTeamMember } = useTeam();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamMember["role"]>("sales_rep");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSubmitting(true);
    await addTeamMember({
      name: name.trim(),
      email: email.trim(),
      role,
      avatar_url: null,
      is_active: true,
    });
    setSubmitting(false);
    setName("");
    setEmail("");
    setRole("sales_rep");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="Mitarbeiter hinzufügen">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="add-name"
            className="block text-xs font-medium text-muted-foreground mb-1"
          >
            Name *
          </label>
          <input
            id="add-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Max Mustermann"
            className="w-full rounded-lg border border-sidebar-border bg-background/50 text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-ring/50 focus:border-sidebar-ring transition-all"
          />
        </div>

        <div>
          <label
            htmlFor="add-email"
            className="block text-xs font-medium text-muted-foreground mb-1"
          >
            E-Mail *
          </label>
          <input
            id="add-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="max@beispiel.de"
            className="w-full rounded-lg border border-sidebar-border bg-background/50 text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sidebar-ring/50 focus:border-sidebar-ring transition-all"
          />
        </div>

        <div>
          <label
            htmlFor="add-role"
            className="block text-xs font-medium text-muted-foreground mb-1"
          >
            Rolle
          </label>
          <select
            id="add-role"
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
            {submitting ? "Wird hinzugefügt..." : "Hinzufügen"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
