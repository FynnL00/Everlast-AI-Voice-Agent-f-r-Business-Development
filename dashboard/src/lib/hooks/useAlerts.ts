import { useMemo } from "react";
import type { Lead, AlertItem } from "@/lib/types";

// Risk weight by lead grade: A-lead flags are worth more than C-lead flags
const GRADE_WEIGHT: Record<string, number> = {
  A: 3,
  B: 2,
  C: 1,
};

export function useAlerts(leads: Lead[]): AlertItem[] {
  return useMemo(() => {
    const alerts: AlertItem[] = [];
    const now = Date.now();

    leads.forEach((lead) => {
      const reasons: string[] = [];
      const lastActivity = new Date(
        lead.updated_at ?? lead.created_at
      ).getTime();
      const daysSince = Math.floor(
        (now - lastActivity) / (1000 * 60 * 60 * 24)
      );

      // Rule 1: Negative sentiment
      if (lead.sentiment === "negativ")
        reasons.push("Negatives Gesprächssentiment");

      // Rule 2: No next steps (only for qualified+ leads)
      if (
        (!lead.next_steps || lead.next_steps.length === 0) &&
        ["qualified", "appointment_booked"].includes(lead.status)
      )
        reasons.push("Keine nächsten Schritte definiert");

      // Rule 3: Qualified but no appointment for 3+ days
      if (
        lead.status === "qualified" &&
        !lead.appointment_booked &&
        daysSince >= 3
      )
        reasons.push(`Qualifiziert ohne Termin seit ${daysSince} Tagen`);

      // Rule 4: Inactive for 5+ days
      if (daysSince >= 5 && !["converted", "lost"].includes(lead.status))
        reasons.push(`Keine Aktivität seit ${daysSince} Tagen`);

      // Rule 5: Unassigned (only B+ leads or with appointment)
      if (
        !lead.assigned_to &&
        ((lead.total_score ?? 0) >= 7 || lead.appointment_booked)
      )
        reasons.push("Kein Teammitglied zugewiesen");

      // Rule 6: A-Lead not yet qualified
      if (
        (lead.total_score ?? 0) >= 10 &&
        ["new", "contacted"].includes(lead.status)
      )
        reasons.push("A-Lead noch nicht qualifiziert");

      // Rule 7: Appointment in < 24h but no briefing
      if (
        lead.appointment_booked &&
        lead.appointment_datetime &&
        !lead.briefing
      ) {
        const appointmentTime = new Date(lead.appointment_datetime).getTime();
        const hoursUntil = (appointmentTime - now) / (1000 * 60 * 60);
        if (hoursUntil > 0 && hoursUntil < 24) {
          reasons.push("Termin in < 24h ohne Briefing");
        }
      }

      // Rule 8: Call duration < 60s (indicates potential issue)
      if (
        lead.call_duration_seconds !== null &&
        lead.call_duration_seconds > 0 &&
        lead.call_duration_seconds < 60
      )
        reasons.push("Anrufdauer unter 60 Sekunden");

      // Rule 9: Decision maker without appointment (high-priority follow-up)
      if (
        lead.is_decision_maker === true &&
        !lead.appointment_booked &&
        !["converted", "lost"].includes(lead.status)
      )
        reasons.push("Entscheider ohne Termin");

      if (reasons.length === 0) return;

      // Risk-level weighting by lead grade
      const gradeWeight = GRADE_WEIGHT[lead.lead_grade ?? "C"] ?? 1;
      const weightedScore = reasons.length * gradeWeight;

      const riskLevel: AlertItem["riskLevel"] =
        weightedScore >= 6 ? "high" : weightedScore >= 3 ? "medium" : "low";

      alerts.push({
        id: lead.id,
        lead,
        riskLevel,
        reasons,
        daysSinceLastActivity: daysSince,
        suggestedAction:
          riskLevel === "high"
            ? "Sofort kontaktieren"
            : riskLevel === "medium"
              ? "Zeitnah prüfen"
              : "Beobachten",
      });
    });

    return alerts.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.riskLevel] - order[b.riskLevel];
    });
  }, [leads]);
}
