"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { TeamMember } from "@/lib/types";

interface TeamContextValue {
  teamMembers: TeamMember[];
  loading: boolean;
  getTeamMember: (id: string) => TeamMember | undefined;
  addTeamMember: (member: Omit<TeamMember, "id" | "created_at">) => Promise<TeamMember | null>;
  updateTeamMember: (id: string, fields: Partial<TeamMember>) => Promise<TeamMember | null>;
  removeTeamMember: (id: string) => Promise<boolean>;
}

const TeamContext = createContext<TeamContextValue | null>(null);

export function useTeam(): TeamContextValue {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeam must be used within a TeamProvider");
  return ctx;
}

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all team members
  const fetchTeamMembers = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Failed to fetch team members:", error.message);
    }
    if (data) {
      setTeamMembers(data as TeamMember[]);
    }
    setLoading(false);
  }, []);

  // Realtime subscription
  useEffect(() => {
    fetchTeamMembers();

    if (!isSupabaseConfigured()) return;

    const channel = supabase
      .channel("team-members-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "team_members" },
        (payload) => {
          setTeamMembers((prev) => [...prev, payload.new as TeamMember].sort((a, b) => a.name.localeCompare(b.name)));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "team_members" },
        (payload) => {
          const updated = payload.new as TeamMember;
          setTeamMembers((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "team_members" },
        (payload) => {
          const oldId = (payload.old as { id: string }).id;
          setTeamMembers((prev) => prev.filter((m) => m.id !== oldId));
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [fetchTeamMembers]);

  const getTeamMember = useCallback(
    (id: string) => teamMembers.find((m) => m.id === id),
    [teamMembers]
  );

  const addTeamMember = useCallback(
    async (member: Omit<TeamMember, "id" | "created_at">): Promise<TeamMember | null> => {
      try {
        const res = await fetch("/api/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(member),
        });
        if (!res.ok) {
          const err = await res.json();
          console.error("Failed to add team member:", err.error);
          return null;
        }
        return (await res.json()) as TeamMember;
      } catch (err) {
        console.error("Failed to add team member:", err);
        return null;
      }
    },
    []
  );

  const updateTeamMember = useCallback(
    async (id: string, fields: Partial<TeamMember>): Promise<TeamMember | null> => {
      try {
        const res = await fetch(`/api/team/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fields),
        });
        if (!res.ok) {
          const err = await res.json();
          console.error("Failed to update team member:", err.error);
          return null;
        }
        return (await res.json()) as TeamMember;
      } catch (err) {
        console.error("Failed to update team member:", err);
        return null;
      }
    },
    []
  );

  const removeTeamMember = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        console.error("Failed to remove team member:", err.error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Failed to remove team member:", err);
      return false;
    }
  }, []);

  const value = useMemo<TeamContextValue>(
    () => ({
      teamMembers,
      loading,
      getTeamMember,
      addTeamMember,
      updateTeamMember,
      removeTeamMember,
    }),
    [teamMembers, loading, getTeamMember, addTeamMember, updateTeamMember, removeTeamMember]
  );

  return (
    <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
  );
}
