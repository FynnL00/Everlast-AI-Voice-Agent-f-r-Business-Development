"use client";

import { useMemo } from "react";
import { useLeads } from "@/lib/leads-context";
import KPICards from "@/components/KPICards";
import LeadScoreDistribution from "@/components/LeadScoreDistribution";
import ConversionChart from "@/components/ConversionChart";
import LeadTable from "@/components/LeadTable";
import ObjectionChart from "@/components/ObjectionChart";
import { LayoutDashboard } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

/** Convert a UTC timestamp to a YYYY-MM-DD string in Europe/Berlin timezone */
function toBerlinDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("sv-SE", {
    timeZone: "Europe/Berlin",
  });
}

/** Normalize objection strings for consistent counting */
function normalizeObjection(obj: string): string {
  return obj.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function Dashboard() {
  const { leads, loading, isLive } = useLeads();

  // Calculate KPIs (memoized to avoid re-computing on every render)
  const { totalCalls, conversionRate, avgDuration, aLeadsToday } = useMemo(() => {
    const total = leads.length;
    const booked = leads.filter((l) => l.appointment_booked).length;
    const conversion = total > 0 ? (booked / total) * 100 : 0;
    const duration =
      total > 0
        ? leads.reduce((sum, l) => sum + (l.call_duration_seconds || 0), 0) / total
        : 0;

    // Use Europe/Berlin timezone for "today" calculation – convert BOTH sides
    const berlinToday = toBerlinDate(new Date().toISOString());
    const aToday = leads.filter(
      (l) => l.lead_grade === "A" && toBerlinDate(l.created_at) === berlinToday
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

  // Objection distribution with normalization (memoized)
  const objectionDistribution = useMemo(() => {
    const counts: Record<string, { display: string; count: number }> = {};
    leads.forEach((l) => {
      l.objections_raised?.forEach((obj) => {
        const key = normalizeObjection(obj);
        if (!counts[key]) {
          counts[key] = { display: obj.trim(), count: 0 };
        }
        counts[key].count++;
      });
    });
    return Object.values(counts)
      .map(({ display, count }) => ({ objection: display, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [leads]);

  // Conversion trend (last 7 days, memoized, timezone-aware on both sides)
  const conversionTrend = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = toBerlinDate(d.toISOString());
        const dayLeads = leads.filter((l) => toBerlinDate(l.created_at) === dateStr);
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
