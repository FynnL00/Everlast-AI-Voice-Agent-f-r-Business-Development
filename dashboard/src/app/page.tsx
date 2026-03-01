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
import { normalizeObjection } from "@/lib/utils";
import { computeSparklineData } from "@/lib/sparkline";
import AppointmentCalendar from "@/components/dashboard/AppointmentCalendar";
import AlertBanner from "@/components/dashboard/AlertBanner";

/** Convert a UTC timestamp to a YYYY-MM-DD string in Europe/Berlin timezone */
const berlinFormatter = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" });
function toBerlinDate(iso: string): string {
  return berlinFormatter.format(new Date(iso));
}

export default function Dashboard() {
  const { leads, loading, isLive } = useLeads();

  // Calculate KPIs (memoized to avoid re-computing on every render)
  const { totalCalls, callsToday, appointmentRate, winRate, avgDuration, aLeadsToday } = useMemo(() => {
    const total = leads.length;

    // Appointment rate (formerly "conversion rate")
    const booked = leads.filter((l) => l.appointment_booked).length;
    const appointmentRate = total > 0 ? (booked / total) * 100 : 0;

    // Win rate: converted / (converted + lost)
    const converted = leads.filter(l => l.status === "converted").length;
    const closedDeals = leads.filter(l => ["converted", "lost"].includes(l.status)).length;
    const winRate = closedDeals > 0 ? (converted / closedDeals) * 100 : 0;

    // Avg duration — only count leads that actually had a call
    const leadsWithDuration = leads.filter(l => l.call_duration_seconds != null && l.call_duration_seconds > 0);
    const duration = leadsWithDuration.length > 0
      ? leadsWithDuration.reduce((sum, l) => sum + l.call_duration_seconds!, 0) / leadsWithDuration.length : 0;

    // Use Europe/Berlin timezone for "today" calculation
    const berlinToday = toBerlinDate(new Date().toISOString());
    const todayLeads = leads.filter(l => toBerlinDate(l.created_at) === berlinToday);
    const aToday = todayLeads.filter(l => l.lead_grade === "A").length;

    return { totalCalls: total, callsToday: todayLeads.length, appointmentRate, winRate, avgDuration: duration, aLeadsToday: aToday };
  }, [leads]);

  // Grade distribution (memoized)
  const gradeDistribution = useMemo(
    () => [
      { grade: "A-Lead", count: leads.filter((l) => l.lead_grade === "A").length, color: "var(--score-good)" },
      { grade: "B-Lead", count: leads.filter((l) => l.lead_grade === "B").length, color: "var(--score-warning)" },
      { grade: "C-Lead", count: leads.filter((l) => l.lead_grade === "C").length, color: "var(--score-danger)" },
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

  // Sparkline data for KPICards (7-day trends)
  const sparklines = useMemo(() => ({
    calls: computeSparklineData(leads, (dayLeads) => dayLeads.length),
    winRate: computeSparklineData(leads, (dayLeads) => {
      const converted = dayLeads.filter((l) => l.status === "converted").length;
      const closed = dayLeads.filter((l) => ["converted", "lost"].includes(l.status)).length;
      return closed > 0 ? Math.round((converted / closed) * 100) : 0;
    }),
    appointments: computeSparklineData(leads, (dayLeads) => {
      const booked = dayLeads.filter((l) => l.appointment_booked).length;
      return dayLeads.length > 0 ? Math.round((booked / dayLeads.length) * 100) : 0;
    }),
    aLeads: computeSparklineData(leads, (dayLeads) =>
      dayLeads.filter((l) => l.lead_grade === "A").length
    ),
  }), [leads]);

  // Calendar events for AppointmentCalendar
  const calendarEvents = useMemo(() =>
    leads
      .filter((l) => l.appointment_booked && l.appointment_datetime)
      .map((l) => ({
        id: l.id,
        title: `${l.caller_name ?? "Unbekannt"} — ${l.company ?? "Firma"}`,
        datetime: l.appointment_datetime!,
        grade: l.lead_grade,
        assignedTo: l.assigned_to,
      })),
    [leads]
  );

  // Conversion trend (last 7 days, memoized, timezone-aware on both sides)
  const conversionTrend = useMemo(() => {
    const leadsByDate = new Map<string, typeof leads>();
    leads.forEach(l => {
      const key = toBerlinDate(l.created_at);
      if (!leadsByDate.has(key)) leadsByDate.set(key, []);
      leadsByDate.get(key)!.push(l);
    });

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = toBerlinDate(d.toISOString());
      const dayLeads = leadsByDate.get(dateStr) ?? [];
      const dayBooked = dayLeads.filter((l) => l.appointment_booked).length;
      const rate = dayLeads.length > 0 ? (dayBooked / dayLeads.length) * 100 : 0;
      return {
        date: d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", timeZone: "Europe/Berlin" }),
        rate: Math.round(rate * 10) / 10,
        calls: dayLeads.length,
      };
    });
  }, [leads]);

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

      {/* Alert Banner */}
      <AlertBanner leads={leads} />

      {/* KPI Cards */}
      <div className="glass p-6 rounded-2xl w-full">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 block">
          MAIN KPIS
        </span>
        <KPICards
          callsToday={callsToday}
          totalCalls={totalCalls}
          winRate={winRate}
          appointmentRate={appointmentRate}
          avgDuration={avgDuration}
          aLeadsToday={aLeadsToday}
          sparklines={sparklines}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ConversionChart data={conversionTrend} />
        </div>
        <LeadScoreDistribution data={gradeDistribution} />
      </div>

      {/* Appointment Calendar */}
      <AppointmentCalendar events={calendarEvents} />

      {/* Table + Objections Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <LeadTable leads={leads.slice(0, 10)} />
        </div>
        <ObjectionChart data={objectionDistribution} />
      </div>
    </div>
  );
}
