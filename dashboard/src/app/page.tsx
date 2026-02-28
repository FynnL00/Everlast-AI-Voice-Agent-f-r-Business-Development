"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Lead } from "@/lib/types";
import KPICards from "@/components/KPICards";
import LeadScoreDistribution from "@/components/LeadScoreDistribution";
import ConversionChart from "@/components/ConversionChart";
import LeadTable from "@/components/LeadTable";
import ObjectionChart from "@/components/ObjectionChart";

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
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
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

    // Realtime subscription
    const channel = supabase
      .channel("leads-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        () => {
          fetchLeads();
        }
      )
      .subscribe((status) => {
        setIsLive(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeads]);

  // Calculate KPIs
  const totalCalls = leads.length;
  const bookedCount = leads.filter((l) => l.appointment_booked).length;
  const conversionRate = totalCalls > 0 ? (bookedCount / totalCalls) * 100 : 0;

  const avgDuration =
    totalCalls > 0
      ? leads.reduce((sum, l) => sum + (l.call_duration_seconds || 0), 0) /
        totalCalls
      : 0;

  const today = new Date().toISOString().split("T")[0];
  const aLeadsToday = leads.filter(
    (l) => l.lead_grade === "A" && l.created_at.startsWith(today)
  ).length;

  // Grade distribution
  const gradeDistribution = [
    {
      grade: "A-Lead",
      count: leads.filter((l) => l.lead_grade === "A").length,
      color: "#22c55e",
    },
    {
      grade: "B-Lead",
      count: leads.filter((l) => l.lead_grade === "B").length,
      color: "#f59e0b",
    },
    {
      grade: "C-Lead",
      count: leads.filter((l) => l.lead_grade === "C").length,
      color: "#ef4444",
    },
  ];

  // Objection distribution
  const objectionCounts: Record<string, number> = {};
  leads.forEach((l) => {
    l.objections_raised?.forEach((obj) => {
      objectionCounts[obj] = (objectionCounts[obj] || 0) + 1;
    });
  });
  const objectionDistribution = Object.entries(objectionCounts)
    .map(([objection, count]) => ({ objection, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Conversion trend (last 7 days)
  const conversionTrend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const dayLeads = leads.filter((l) => l.created_at.startsWith(dateStr));
    const dayBooked = dayLeads.filter((l) => l.appointment_booked).length;
    const rate = dayLeads.length > 0 ? (dayBooked / dayLeads.length) * 100 : 0;
    return {
      date: d.toLocaleDateString("de-DE", { weekday: "short" }),
      rate: Math.round(rate * 10) / 10,
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--muted)]">Dashboard lädt...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">n8n Voice Agent Dashboard</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Echtzeit-KPIs für Lead-Qualifizierung & Terminbuchung
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isLive ? "bg-[var(--success)] animate-pulse" : "bg-[var(--muted)]"
            }`}
          />
          <span className="text-sm text-[var(--muted)]">
            {isLive ? "Live" : "Offline"}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards
        totalCalls={totalCalls}
        conversionRate={conversionRate}
        avgDuration={avgDuration}
        aLeadsToday={aLeadsToday}
      />

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
