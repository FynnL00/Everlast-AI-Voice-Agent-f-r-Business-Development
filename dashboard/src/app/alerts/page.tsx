"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useLeads } from "@/lib/leads-context";
import PageHeader from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import AlertSummary from "@/components/alerts/AlertSummary";
import AlertSeverityTabs from "@/components/alerts/AlertSeverityTabs";
import AlertList from "@/components/alerts/AlertList";
import type { Lead, AlertItem } from "@/lib/types";

function computeAlerts(leads: Lead[]): AlertItem[] {
  return leads
    .map((lead) => {
      const reasons: string[] = [];
      const now = Date.now();
      const lastActivity = new Date(lead.created_at).getTime();
      const daysSince = Math.floor(
        (now - lastActivity) / (1000 * 60 * 60 * 24)
      );

      // Regel 1: Negatives Sentiment
      if (lead.sentiment === "negativ")
        reasons.push("Negatives Gesprächssentiment");

      // Regel 2: Keine nächsten Schritte
      if (!lead.next_steps || lead.next_steps.length === 0)
        reasons.push("Keine nächsten Schritte definiert");

      // Regel 3: Qualifiziert aber kein Termin seit 3+ Tagen
      if (
        lead.status === "qualified" &&
        !lead.appointment_booked &&
        daysSince >= 3
      )
        reasons.push(`Qualifiziert ohne Termin seit ${daysSince} Tagen`);

      // Regel 4: Inaktiv seit 5+ Tagen
      if (daysSince >= 5 && !["converted", "lost"].includes(lead.status))
        reasons.push(`Keine Aktivität seit ${daysSince} Tagen`);

      // Regel 5: Nicht zugewiesen
      if (!lead.assigned_to) reasons.push("Kein Teammitglied zugewiesen");

      // Regel 6: A-Lead noch nicht qualifiziert
      if (
        (lead.total_score ?? 0) >= 10 &&
        ["new", "contacted"].includes(lead.status)
      )
        reasons.push("A-Lead noch nicht qualifiziert");

      if (reasons.length === 0) return null;

      const riskLevel: AlertItem["riskLevel"] =
        reasons.length >= 3 ? "high" : reasons.length >= 2 ? "medium" : "low";

      return {
        id: lead.id,
        lead,
        riskLevel,
        reasons,
        daysSinceLastActivity: daysSince,
        suggestedAction:
          reasons.length >= 3
            ? "Sofort kontaktieren"
            : reasons.length >= 2
              ? "Zeitnah prüfen"
              : "Beobachten",
      };
    })
    .filter((a): a is AlertItem => a !== null)
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.riskLevel] - order[b.riskLevel];
    });
}

export default function AlertsPage() {
  const { leads, loading } = useLeads();
  const [activeSeverity, setActiveSeverity] = useState("all");

  const alerts = useMemo(() => computeAlerts(leads), [leads]);

  const counts = useMemo(() => {
    const high = alerts.filter((a) => a.riskLevel === "high").length;
    const medium = alerts.filter((a) => a.riskLevel === "medium").length;
    const low = alerts.filter((a) => a.riskLevel === "low").length;
    return { all: alerts.length, high, medium, low };
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
          {/* Summary badges */}
          <AlertSummary alerts={alerts} />

          {/* Severity tabs */}
          <AlertSeverityTabs
            activeSeverity={activeSeverity}
            onSeverityChange={setActiveSeverity}
            counts={counts}
          />

          {/* Alert list */}
          <AlertList alerts={filteredAlerts} />
        </>
      )}
    </div>
  );
}
