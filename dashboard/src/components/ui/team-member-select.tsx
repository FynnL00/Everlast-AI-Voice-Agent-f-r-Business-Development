"use client";

import type { TeamMember } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TeamMemberSelectProps {
  value: string | null;
  onChange: (teamMemberId: string | null) => void;
  teamMembers: TeamMember[];
  placeholder?: string;
  size?: "sm" | "md";
  className?: string;
  allowClear?: boolean;
}

export default function TeamMemberSelect({
  value,
  onChange,
  teamMembers,
  placeholder = "Alle Mitarbeiter",
  size = "md",
  className,
  allowClear = true,
}: TeamMemberSelectProps) {
  const activeMembers = teamMembers.filter((m) => m.is_active);

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className={cn(
        "w-full rounded-lg border border-sidebar-border bg-background/50 text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-sidebar-ring/50 focus:border-sidebar-ring",
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm",
        className
      )}
    >
      <option value="">{placeholder}</option>
      {activeMembers.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}
        </option>
      ))}
    </select>
  );
}
