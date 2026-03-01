"use client";

import { useMemo } from "react";
import { MessageSquareWarning, TrendingUp, AlertTriangle, BarChart3 } from "lucide-react";
import { normalizeObjection } from "@/lib/utils";
import type { Lead } from "@/lib/types";
import { KPICard } from "@/components/ui/KPICard";

interface ObjectionsKPIsProps {
  leads: Lead[];
}

export default function ObjectionsKPIs({ leads }: ObjectionsKPIsProps) {
  const kpis = useMemo(() => {
    // Count all objections
    const objectionCounts: Record<string, number> = {};
    let totalObjections = 0;
    let leadsWithObjections = 0;

    leads.forEach((l) => {
      if (l.objections_raised && l.objections_raised.length > 0) {
        leadsWithObjections++;
        l.objections_raised.forEach((obj) => {
          const normalized = normalizeObjection(obj);
          if (normalized) {
            objectionCounts[normalized] = (objectionCounts[normalized] || 0) + 1;
            totalObjections++;
          }
        });
      }
    });

    // Unique objection types
    const uniqueTypes = Object.keys(objectionCounts).length;

    // Most frequent objection
    let mostFrequent = "-";
    let maxCount = 0;
    for (const [objection, count] of Object.entries(objectionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostFrequent = objection;
      }
    }

    // Loss correlation: % of leads with objections that have status=lost
    const leadsWithObjectionsList = leads.filter(
      (l) => l.objections_raised && l.objections_raised.length > 0
    );
    const lostWithObjections = leadsWithObjectionsList.filter(
      (l) => l.status === "lost"
    ).length;
    const lossCorrelation =
      leadsWithObjectionsList.length > 0
        ? Math.round((lostWithObjections / leadsWithObjectionsList.length) * 100)
        : 0;

    // Average objections per lead (all leads, not just those with objections)
    const avgPerLead =
      leads.length > 0
        ? Math.round((totalObjections / leads.length) * 10) / 10
        : 0;

    return { uniqueTypes, mostFrequent, lossCorrelation, avgPerLead };
  }, [leads]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        label="Einwand-Typen"
        numericValue={kpis.uniqueTypes}
        suffix=""
        icon={MessageSquareWarning}
        colorClass="text-orange-400"
        bgClass="bg-orange-500/10"
        tooltip="Anzahl unterschiedlicher Einwandkategorien, die in Gesprächen genannt wurden."
      />
      <KPICard
        label="Häufigster"
        value={kpis.mostFrequent}
        icon={TrendingUp}
        colorClass="text-blue-400"
        bgClass="bg-blue-500/10"
        tooltip="Der am häufigsten genannte Einwand über alle Gespräche."
      />
      <KPICard
        label="Verlust-Korrelation"
        numericValue={kpis.lossCorrelation}
        suffix="%"
        icon={AlertTriangle}
        colorClass="text-red-400"
        bgClass="bg-red-500/10"
        tooltip="Anteil der Leads mit Einwänden, die letztlich verloren gingen."
        tooltipFormula="Korrelation = Verlorene mit Einwänden ÷ Alle mit Einwänden × 100"
      />
      <KPICard
        label="Ø pro Gespräch"
        numericValue={kpis.avgPerLead}
        suffix=""
        icon={BarChart3}
        colorClass="text-purple-400"
        bgClass="bg-purple-500/10"
        tooltip="Durchschnittliche Anzahl genannter Einwände pro Lead."
        tooltipFormula="Ø = Gesamte Einwände ÷ Alle Leads"
      />
    </div>
  );
}
