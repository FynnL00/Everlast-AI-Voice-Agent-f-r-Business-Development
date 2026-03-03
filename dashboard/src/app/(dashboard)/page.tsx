"use client";

import { useMemo, useState } from "react";
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
import { cn, normalizeObjection } from "@/lib/utils";
import AppointmentCalendar from "@/components/dashboard/AppointmentCalendar";
import AlertBanner from "@/components/dashboard/AlertBanner";

type TimeRange = "today" | "7d" | "30d" | "total";

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  today: "Heute",
  "7d": "7 Tage",
  "30d": "30 Tage",
  total: "Total",
};

/** Convert a UTC timestamp to a YYYY-MM-DD string in Europe/Berlin timezone */
const berlinFormatter = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" });
function toBerlinDate(iso: string): string {
  return berlinFormatter.format(new Date(iso));
}

export default function Dashboard() {
  const { leads, loading } = useLeads();
  const { teamMembers } = useTeam();
  const [timeRange, setTimeRange] = useState<TimeRange>("total");

  const memberNames = useMemo(() => {
    const map: Record<string, string> = {};
    teamMembers.forEach((m) => { map[m.id] = m.name; });
    return map;
  }, [teamMembers]);

  // Filter leads by selected time range
  const timeFilteredLeads = useMemo(() => {
    if (timeRange === "total") return leads;
    const now = new Date();
    if (timeRange === "today") {
      const berlinToday = toBerlinDate(now.toISOString());
      return leads.filter(l => toBerlinDate(l.created_at) === berlinToday);
    }
    const days = timeRange === "7d" ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    cutoff.setHours(0, 0, 0, 0);
    return leads.filter(l => new Date(l.created_at) >= cutoff);
  }, [leads, timeRange]);

  // Calculate KPIs from time-filtered leads
  const { callsInRange, conversionRate, avgDuration, positiveSentimentRate } = useMemo(() => {
    const total = timeFilteredLeads.length;

    const booked = timeFilteredLeads.filter((l) => l.appointment_booked).length;
    const conversionRate = total > 0 ? (booked / total) * 100 : 0;

    const leadsWithDuration = timeFilteredLeads.filter(l => l.call_duration_seconds != null && l.call_duration_seconds > 0);
    const duration = leadsWithDuration.length > 0
      ? leadsWithDuration.reduce((sum, l) => sum + l.call_duration_seconds!, 0) / leadsWithDuration.length : 0;

    const leadsWithSentiment = timeFilteredLeads.filter(l => l.sentiment);
    const positiveCount = leadsWithSentiment.filter(l => l.sentiment === "positiv").length;
    const positiveSentimentRate = leadsWithSentiment.length > 0 ? Math.round((positiveCount / leadsWithSentiment.length) * 100) : 0;

    return { callsInRange: total, conversionRate, avgDuration: duration, positiveSentimentRate };
  }, [timeFilteredLeads]);

  // KPI label
  const kpiCallLabel = "Anrufe";

  // Grade distribution (memoized)
  const gradeDistribution = useMemo(
    () => [
      { grade: "A-Lead", count: timeFilteredLeads.filter((l) => l.lead_grade === "A").length, color: "var(--score-good)" },
      { grade: "B-Lead", count: timeFilteredLeads.filter((l) => l.lead_grade === "B").length, color: "var(--score-warning)" },
      { grade: "C-Lead", count: timeFilteredLeads.filter((l) => l.lead_grade === "C").length, color: "var(--score-danger)" },
    ],
    [timeFilteredLeads]
  );

  // Objection distribution with normalization (memoized)
  const objectionDistribution = useMemo(() => {
    const counts: Record<string, { display: string; count: number }> = {};
    timeFilteredLeads.forEach((l) => {
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
  }, [timeFilteredLeads]);

  // Calendar events for AppointmentCalendar (always show all)
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

  // Conversion trend — dynamic day count based on time range
  const trendDays = timeRange === "today" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 7;
  const conversionTrend = useMemo(() => {
    const leadsByDate = new Map<string, typeof leads>();
    timeFilteredLeads.forEach(l => {
      const key = toBerlinDate(l.created_at);
      if (!leadsByDate.has(key)) leadsByDate.set(key, []);
      leadsByDate.get(key)!.push(l);
    });

    return Array.from({ length: trendDays }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (trendDays - 1 - i));
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
  }, [timeFilteredLeads, trendDays]);

  const chartSubtitle = timeRange === "today" ? "Heute"
    : timeRange === "7d" ? "Letzte 7 Tage"
    : timeRange === "30d" ? "Letzte 30 Tage"
    : "Gesamt";

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
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border/50">
            {(["today", "7d", "30d", "total"] as const).map((range) => {
              const isActive = timeRange === range;
              return (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {TIME_RANGE_LABELS[range]}
                </button>
              );
            })}
          </div>
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
          callsInRange={callsInRange}
          callLabel={kpiCallLabel}
          conversionRate={conversionRate}
          avgDuration={avgDuration}
          positiveSentimentRate={positiveSentimentRate}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 relative z-10">
          <ConversionChart data={conversionTrend} subtitle={chartSubtitle} />
        </div>
        <LeadScoreDistribution data={gradeDistribution} subtitle={chartSubtitle} />
      </div>

      {/* Appointment Calendar */}
      <AppointmentCalendar events={calendarEvents} memberNames={memberNames} />

      {/* Top Objections: Donut 1/3, Bar Chart 2/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ObjectionDonutChart data={objectionDistribution} subtitle={chartSubtitle} />
        <div className="lg:col-span-2">
          <DropOffAnalysis leads={timeFilteredLeads} subtitle={chartSubtitle} />
        </div>
      </div>

      {/* Lead Table */}
      <LeadTable leads={leads.slice(0, 10)} />
    </div>
  );
}
