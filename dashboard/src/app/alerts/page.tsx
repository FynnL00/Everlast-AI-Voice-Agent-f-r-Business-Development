"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Clock,
  UserX,
} from "lucide-react";
import { useLeads } from "@/lib/leads-context";
import { useAlerts } from "@/lib/hooks/useAlerts";
import PageHeader from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { KPICard } from "@/components/ui/KPICard";
import AlertSeverityTabs from "@/components/alerts/AlertSeverityTabs";
import AlertList from "@/components/alerts/AlertList";
import RiskDonutChart from "@/components/alerts/RiskDonutChart";

export default function AlertsPage() {
  const { leads, loading } = useLeads();
  const alerts = useAlerts(leads);
  const [activeSeverity, setActiveSeverity] = useState("all");

  const counts = useMemo(() => {
    const high = alerts.filter((a) => a.riskLevel === "high").length;
    const medium = alerts.filter((a) => a.riskLevel === "medium").length;
    const low = alerts.filter((a) => a.riskLevel === "low").length;
    return { all: alerts.length, high, medium, low };
  }, [alerts]);

  const kpis = useMemo(() => {
    const avgInactiveDays =
      alerts.length > 0
        ? Math.round(
            alerts.reduce((sum, a) => sum + a.daysSinceLastActivity, 0) /
              alerts.length
          )
        : 0;

    const unassignedCount = alerts.filter(
      (a) => a.reasons.some((r) => r.includes("zugewiesen"))
    ).length;

    const unassignedPct =
      alerts.length > 0 ? Math.round((unassignedCount / alerts.length) * 100) : 0;

    return { avgInactiveDays, unassignedPct };
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    if (activeSeverity === "all") return alerts;
    return alerts.filter((a) => a.riskLevel === activeSeverity);
  }, [alerts, activeSeverity]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground animate-pulse">
          Frühwarnsystem lädt...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <PageHeader
        title="Frühwarnsystem"
        subtitle="Leads mit Handlungsbedarf erkennen"
        icon={AlertTriangle}
      />

      {alerts.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Keine Warnungen"
          description="Aktuell gibt es keine Leads mit Handlungsbedarf. Alle Leads sind auf gutem Kurs."
        />
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              label="Warnungen"
              numericValue={counts.all}
              icon={AlertTriangle}
              colorClass="text-amber-400"
              bgClass="bg-amber-500/10"
              subtitle="Leads mit Handlungsbedarf"
            />
            <KPICard
              label="Hohes Risiko"
              numericValue={counts.high}
              icon={ShieldAlert}
              colorClass="text-red-400"
              bgClass="bg-red-500/10"
              subtitle="Sofort kontaktieren"
            />
            <KPICard
              label="Ø Inaktive Tage"
              numericValue={kpis.avgInactiveDays}
              icon={Clock}
              colorClass="text-blue-400"
              bgClass="bg-blue-500/10"
              subtitle="Durchschnitt aller Alerts"
            />
            <KPICard
              label="Nicht zugewiesen"
              numericValue={kpis.unassignedPct}
              suffix="%"
              icon={UserX}
              colorClass="text-purple-400"
              bgClass="bg-purple-500/10"
              subtitle="der gewarnten Leads"
            />
          </div>

          {/* Severity tabs */}
          <AlertSeverityTabs
            activeSeverity={activeSeverity}
            onSeverityChange={setActiveSeverity}
            counts={counts}
          />

          {/* Donut chart + Alert list grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <RiskDonutChart alerts={alerts} />
            </div>
            <div className="lg:col-span-2">
              <AlertList alerts={filteredAlerts} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
