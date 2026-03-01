"use client";

import { useMemo } from "react";
import { useLeads } from "@/lib/leads-context";
import { useTeam } from "@/lib/team-context";
import KPICards from "@/components/KPICards";
import LeadScoreDistribution from "@/components/LeadScoreDistribution";
import ConversionChart from "@/components/ConversionChart";
import LeadTable from "@/components/LeadTable";
import ObjectionDonutChart from "@/components/ObjectionDonutChart";
import DropOffAnalysis from "@/components/analytics/DropOffAnalysis";
import { LayoutDashboard } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { normalizeObjection } from "@/lib/utils";
import AppointmentCalendar from "@/components/dashboard/AppointmentCalendar";
import AlertBanner from "@/components/dashboard/AlertBanner";

/** Convert a UTC timestamp to a YYYY-MM-DD string in Europe/Berlin timezone */
const berlinFormatter = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" });
function toBerlinDate(iso: string): string {
  return berlinFormatter.format(new Date(iso));
}

export default function Dashboard() {
  const { leads, loading, isLive } = useLeads();
  const { teamMembers } = useTeam();

  const memberNames = useMemo(() => {
    const map: Record<string, string> = {};
    teamMembers.forEach((m) => { map[m.id] = m.name; });
    return map;
  }, [teamMembers]);

  // Calculate KPIs (memoized to avoid re-computing on every render)
  const { totalCalls, callsToday, conversionRate, avgDuration, positiveSentimentRate } = useMemo(() => {
    const total = leads.length;

    // Conversion rate: leads that booked an appointment / total
    const booked = leads.filter((l) => l.appointment_booked).length;
    const conversionRate = total > 0 ? (booked / total) * 100 : 0;

    // Avg duration — only count leads that actually had a call
    const leadsWithDuration = leads.filter(l => l.call_duration_seconds != null && l.call_duration_seconds > 0);
    const duration = leadsWithDuration.length > 0
      ? leadsWithDuration.reduce((sum, l) => sum + l.call_duration_seconds!, 0) / leadsWithDuration.length : 0;

    // Use Europe/Berlin timezone for "today" calculation
    const berlinToday = toBerlinDate(new Date().toISOString());
    const todayLeads = leads.filter(l => toBerlinDate(l.created_at) === berlinToday);
    const aToday = todayLeads.filter(l => l.lead_grade === "A").length;

    // Positive sentiment rate
    const leadsWithSentiment = leads.filter(l => l.sentiment);
    const positiveCount = leadsWithSentiment.filter(l => l.sentiment === "positiv").length;
    const positiveSentimentRate = leadsWithSentiment.length > 0 ? Math.round((positiveCount / leadsWithSentiment.length) * 100) : 0;

    return { totalCalls: total, callsToday: todayLeads.length, conversionRate, avgDuration: duration, positiveSentimentRate };
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
    <div className="min-h-screen py-6 md:py-8 max-w-[1900px] mx-auto space-y-6">
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
      <div className="glass p-6 rounded-2xl w-full transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 block">
          MAIN KPIS
        </span>
        <KPICards
          callsToday={callsToday}
          totalCalls={totalCalls}
          conversionRate={conversionRate}
          avgDuration={avgDuration}
          positiveSentimentRate={positiveSentimentRate}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 relative z-10">
          <ConversionChart data={conversionTrend} />
        </div>
        <LeadScoreDistribution data={gradeDistribution} />
      </div>

      {/* Appointment Calendar */}
      <AppointmentCalendar events={calendarEvents} memberNames={memberNames} />

      {/* Top Objections: Donut 1/3, Bar Chart 2/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ObjectionDonutChart data={objectionDistribution} />
        <div className="lg:col-span-2">
          <DropOffAnalysis leads={leads} />
        </div>
      </div>

      {/* Lead Table */}
      <LeadTable leads={leads.slice(0, 10)} />
    </div>
  );
}
