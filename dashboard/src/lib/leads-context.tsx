"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Lead, LeadFilters } from "@/lib/types";

// Fields fetched for the list view (no transcript for performance)
const CONTEXT_FIELDS =
  "id, created_at, caller_name, company, email, phone, company_size, current_stack, pain_point, timeline, score_company_size, score_tech_stack, score_pain_point, score_timeline, total_score, lead_grade, call_id, call_duration_seconds, conversation_summary, sentiment, objections_raised, drop_off_point, appointment_booked, appointment_datetime, is_decision_maker, status, next_steps, notes, briefing, briefing_generated_at, assigned_to";

const DEFAULT_FILTERS: LeadFilters = {
  grades: [],
  statuses: [],
  sentiments: [],
  appointmentBooked: null,
  dateRange: { from: null, to: null },
  assignedTo: null,
};

interface LeadsContextValue {
  leads: Lead[];
  loading: boolean;
  isLive: boolean;
  filteredLeads: Lead[];
  filters: LeadFilters;
  setFilters: React.Dispatch<React.SetStateAction<LeadFilters>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  fetchLeadDetail: (id: string) => Promise<Lead | null>;
  updateLead: (id: string, fields: Record<string, unknown>) => Promise<Lead | null>;
  generateBriefing: (id: string) => Promise<string | null>;
}

const LeadsContext = createContext<LeadsContextValue | null>(null);

export function useLeads(): LeadsContextValue {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error("useLeads must be used within a LeadsProvider");
  return ctx;
}

export function LeadsProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [filters, setFilters] = useState<LeadFilters>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");

  // Cache for full lead details (includes transcript)
  const detailCache = useRef<Map<string, Lead>>(new Map());

  // ---- Fetch all leads (list view) ----
  const fetchLeads = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("leads")
      .select(CONTEXT_FIELDS)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch leads:", error.message);
    }
    if (data) {
      setLeads(data as Lead[]);
    }
    setLoading(false);
  }, []);

  // ---- Realtime subscription ----
  useEffect(() => {
    fetchLeads();

    if (!isSupabaseConfigured()) {
      setIsLive(false);
      return;
    }

    const channel = supabase
      .channel("leads-context-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leads" },
        (payload) => {
          setLeads((prev) => [payload.new as Lead, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "leads" },
        (payload) => {
          const updated = payload.new as Lead;
          // Invalidate detail cache on update
          detailCache.current.delete(updated.id);
          setLeads((prev) =>
            prev.map((lead) => (lead.id === updated.id ? updated : lead))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "leads" },
        (payload) => {
          const oldId = (payload.old as { id: string }).id;
          detailCache.current.delete(oldId);
          setLeads((prev) => prev.filter((lead) => lead.id !== oldId));
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error("Realtime subscription error:", err);
          setIsLive(false);
        } else {
          setIsLive(status === "SUBSCRIBED");
        }
      });

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [fetchLeads]);

  // ---- Fetch single lead with ALL fields (including transcript) ----
  const fetchLeadDetail = useCallback(async (id: string): Promise<Lead | null> => {
    const cached = detailCache.current.get(id);
    if (cached) return cached;

    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Failed to fetch lead detail:", error.message);
      return null;
    }

    const lead = data as Lead;
    detailCache.current.set(id, lead);
    return lead;
  }, []);

  // ---- Update a lead via API route ----
  const updateLead = useCallback(
    async (id: string, fields: Record<string, unknown>): Promise<Lead | null> => {
      try {
        const res = await fetch(`/api/leads/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fields),
        });

        if (!res.ok) {
          const err = await res.json();
          console.error("Failed to update lead:", err.error);
          return null;
        }

        const updated = (await res.json()) as Lead;

        // Update local state optimistically
        detailCache.current.delete(id);
        setLeads((prev) =>
          prev.map((lead) => (lead.id === id ? { ...lead, ...updated } : lead))
        );

        return updated;
      } catch (err) {
        console.error("Failed to update lead:", err);
        return null;
      }
    },
    []
  );

  // ---- Generate briefing via API route ----
  const generateBriefing = useCallback(async (id: string): Promise<string | null> => {
    try {
      const res = await fetch(`/api/leads/${id}/briefing`);
      if (!res.ok) {
        const err = await res.json();
        console.error("Failed to generate briefing:", err.error);
        return null;
      }
      const data = await res.json();
      const briefing = data.briefing as string;

      // Update local state with the new briefing
      detailCache.current.delete(id);
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === id
            ? { ...lead, briefing, briefing_generated_at: new Date().toISOString() }
            : lead
        )
      );

      return briefing;
    } catch (err) {
      console.error("Failed to generate briefing:", err);
      return null;
    }
  }, []);

  // ---- Client-side filtering + search ----
  const filteredLeads = useMemo(() => {
    let result = leads;

    // Team member filter (from LeadFilters)
    if (filters.assignedTo) {
      result = result.filter((l) => l.assigned_to === filters.assignedTo);
    }

    // Grade filter
    if (filters.grades.length > 0) {
      result = result.filter(
        (l) => l.lead_grade !== null && filters.grades.includes(l.lead_grade)
      );
    }

    // Status filter
    if (filters.statuses.length > 0) {
      result = result.filter((l) => filters.statuses.includes(l.status));
    }

    // Sentiment filter
    if (filters.sentiments.length > 0) {
      result = result.filter(
        (l) =>
          l.sentiment !== null &&
          filters.sentiments.includes(l.sentiment)
      );
    }

    // Appointment booked filter
    if (filters.appointmentBooked !== null) {
      result = result.filter(
        (l) => l.appointment_booked === filters.appointmentBooked
      );
    }

    // Date range filter
    if (filters.dateRange.from) {
      const from = new Date(filters.dateRange.from).getTime();
      result = result.filter((l) => new Date(l.created_at).getTime() >= from);
    }
    if (filters.dateRange.to) {
      const to = new Date(filters.dateRange.to).getTime();
      result = result.filter((l) => new Date(l.created_at).getTime() <= to);
    }

    // Search query (caller_name, company, email)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          (l.caller_name && l.caller_name.toLowerCase().includes(q)) ||
          (l.company && l.company.toLowerCase().includes(q)) ||
          (l.email && l.email.toLowerCase().includes(q))
      );
    }

    return result;
  }, [leads, filters, searchQuery]);

  const value = useMemo<LeadsContextValue>(
    () => ({
      leads,
      loading,
      isLive,
      filteredLeads,
      filters,
      setFilters,
      searchQuery,
      setSearchQuery,
      fetchLeadDetail,
      updateLead,
      generateBriefing,
    }),
    [
      leads,
      loading,
      isLive,
      filteredLeads,
      filters,
      searchQuery,
      fetchLeadDetail,
      updateLead,
      generateBriefing,
    ]
  );

  return (
    <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>
  );
}
