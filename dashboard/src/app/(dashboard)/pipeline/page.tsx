"use client";

import { useMemo } from "react";
import {
  KanbanSquare,
  ListTodo,
  PhoneCall,
  CalendarCheck,
  Repeat,
} from "lucide-react";
import { useLeads } from "@/lib/leads-context";
import PageHeader from "@/components/ui/PageHeader";
import { KPICard } from "@/components/ui/KPICard";
import PipelineSummary from "@/components/pipeline/PipelineSummary";
import PipelineBoard from "@/components/pipeline/PipelineBoard";

export default function PipelinePage() {
  const { filteredLeads, loading } = useLeads();

  const kpis = useMemo(() => {
    const queued = filteredLeads.filter((l) => l.status === "queued").length;

    const outbound = filteredLeads.filter((l) => l.call_direction === "outbound");
    const attempts = outbound.reduce((sum, l) => sum + (l.call_attempts || 0), 0);
    const connected = outbound.filter(
      (l) => l.disposition_code && ["connected", "qualified", "demo_booked", "callback"].includes(l.disposition_code)
    ).length;
    const connectionRate = attempts > 0 ? Math.round((connected / attempts) * 100) : 0;

    const demosBooked = outbound.filter((l) => l.disposition_code === "demo_booked").length;
    const demoRate = connected > 0 ? Math.round((demosBooked / connected) * 100) : 0;

    const leadsWithAttempts = outbound.filter((l) => l.call_attempts > 0);
    const avgAttempts = leadsWithAttempts.length > 0
      ? Math.round(
          (leadsWithAttempts.reduce((sum, l) => sum + l.call_attempts, 0) / leadsWithAttempts.length) * 10
        ) / 10
      : 0;

    return { queued, connectionRate, demoRate, avgAttempts };
  }, [filteredLeads]);

  return (
    <div className="min-h-screen py-6 md:py-8 max-w-[1900px] mx-auto space-y-6">
      <PageHeader
        title="Pipeline"
        subtitle="Leads nach Status in der Vertriebspipeline"
        icon={KanbanSquare}
      />

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="glass p-6 rounded-2xl w-full transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 block">
              Pipeline KPIs
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                label="Warteschlange"
                numericValue={kpis.queued}
                icon={ListTodo}
                colorClass="text-blue-400"
                bgClass="bg-blue-500/10"
                tooltip="Anzahl der Leads, die in der Warteschlange auf einen Anruf warten."
              />
              <KPICard
                label="Connection Rate"
                numericValue={kpis.connectionRate}
                suffix="%"
                icon={PhoneCall}
                colorClass="text-green-400"
                bgClass="bg-green-500/10"
                tooltip="Anteil der Anrufversuche, bei denen der Kontakt erreicht wurde."
                tooltipFormula="Connection Rate = Erreichte ÷ Versuche × 100"
              />
              <KPICard
                label="Demo-Rate"
                numericValue={kpis.demoRate}
                suffix="%"
                icon={CalendarCheck}
                colorClass="text-emerald-400"
                bgClass="bg-emerald-500/10"
                tooltip="Anteil der erreichten Kontakte, die eine Demo gebucht haben."
                tooltipFormula="Demo-Rate = Demos gebucht ÷ Erreichte × 100"
              />
              <KPICard
                label="Ø Versuche"
                value={kpis.avgAttempts.toFixed(1)}
                icon={Repeat}
                colorClass="text-purple-400"
                bgClass="bg-purple-500/10"
                tooltip="Durchschnittliche Anzahl der Anrufversuche pro Lead."
                tooltipFormula="Ø Versuche = Summe Versuche ÷ Leads mit Versuchen"
              />
            </div>
          </div>

          <PipelineSummary />
          <PipelineBoard />
        </>
      )}
    </div>
  );
}
