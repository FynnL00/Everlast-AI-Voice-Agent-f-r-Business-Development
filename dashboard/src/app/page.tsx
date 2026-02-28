"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Lead } from "@/lib/types";
import KPICards from "@/components/KPICards";
import LeadScoreDistribution from "@/components/LeadScoreDistribution";
import ConversionChart from "@/components/ConversionChart";
import LeadTable from "@/components/LeadTable";
import ObjectionChart from "@/components/ObjectionChart";
import { LayoutDashboard } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

// Select only the fields the dashboard needs (avoid loading large transcripts)
const DASHBOARD_FIELDS = "id, created_at, caller_name, company, email, phone, company_size, current_stack, pain_point, timeline, score_company_size, score_tech_stack, score_pain_point, score_timeline, total_score, lead_grade, call_id, call_duration_seconds, conversation_summary, sentiment, objections_raised, drop_off_point, appointment_booked, appointment_datetime, status, next_steps";

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);

  const fetchLeads = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("leads")
      .select(DASHBOARD_FIELDS)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch leads:", error.message);
    }
    if (data) {
      setLeads(data as Lead[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeads();

    if (!isSupabaseConfigured()) {
      setIsLive(false);
      return;
    }

    // Optimistic realtime subscription – handle INSERT and UPDATE separately
    const channel = supabase
      .channel("leads-realtime")
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
          setLeads((prev) =>
            prev.map((lead) =>
              lead.id === (payload.new as Lead).id
                ? (payload.new as Lead)
                : lead
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "leads" },
        (payload) => {
          setLeads((prev) =>
            prev.filter((lead) => lead.id !== (payload.old as { id: string }).id)
          );
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

  // Calculate KPIs (memoized to avoid re-computing on every render)
  const { totalCalls, conversionRate, avgDuration, aLeadsToday } = useMemo(() => {
    const total = leads.length;
    const booked = leads.filter((l) => l.appointment_booked).length;
    const conversion = total > 0 ? (booked / total) * 100 : 0;
    const duration =
      total > 0
        ? leads.reduce((sum, l) => sum + (l.call_duration_seconds || 0), 0) / total
        : 0;

    // Use Europe/Berlin timezone for "today" calculation
    const berlinDate = new Date().toLocaleDateString("sv-SE", {
      timeZone: "Europe/Berlin",
    }); // "sv-SE" gives YYYY-MM-DD format
    const aToday = leads.filter(
      (l) => l.lead_grade === "A" && l.created_at.startsWith(berlinDate)
    ).length;

    return { totalCalls: total, conversionRate: conversion, avgDuration: duration, aLeadsToday: aToday };
  }, [leads]);

  // Grade distribution (memoized)
  const gradeDistribution = useMemo(
    () => [
      { grade: "A-Lead", count: leads.filter((l) => l.lead_grade === "A").length, color: "#22c55e" },
      { grade: "B-Lead", count: leads.filter((l) => l.lead_grade === "B").length, color: "#f59e0b" },
      { grade: "C-Lead", count: leads.filter((l) => l.lead_grade === "C").length, color: "#ef4444" },
    ],
    [leads]
  );

  // Objection distribution (memoized)
  const objectionDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      l.objections_raised?.forEach((obj) => {
        counts[obj] = (counts[obj] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([objection, count]) => ({ objection, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [leads]);

  // Conversion trend (last 7 days, memoized, timezone-aware)
  const conversionTrend = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
        const dayLeads = leads.filter((l) => l.created_at.startsWith(dateStr));
        const dayBooked = dayLeads.filter((l) => l.appointment_booked).length;
        const rate = dayLeads.length > 0 ? (dayBooked / dayLeads.length) * 100 : 0;
        return {
          date: d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", timeZone: "Europe/Berlin" }),
          rate: Math.round(rate * 10) / 10,
          calls: dayLeads.length,
        };
      }),
    [leads]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">Dashboard lädt...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="Dashboard"
        icon={LayoutDashboard}
        rightContent={
          <>
            <div className="flex items-center gap-2 justify-end mb-1">
              <span
                className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${isLive ? "bg-status-completed text-status-completed animate-pulse" : "bg-muted-foreground text-muted-foreground"
                  }`}
              />
              <span className="text-sm font-medium text-muted-foreground drop-shadow-sm">
                {isLive ? "Live" : "Offline"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              {leads.length} Leads · Echtzeit-KPIs
            </p>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="glass p-6 rounded-2xl w-full">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 block">
          MAIN KPIS
        </span>
        <KPICards
          totalCalls={totalCalls}
          conversionRate={conversionRate}
          avgDuration={avgDuration}
          aLeadsToday={aLeadsToday}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2">
          <ConversionChart data={conversionTrend} />
        </div>
        <LeadScoreDistribution data={gradeDistribution} />
      </div>

      {/* Table + Objections Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2">
          <LeadTable leads={leads.slice(0, 10)} />
        </div>
        <ObjectionChart data={objectionDistribution} />
      </div>
    </div>
  );
}
