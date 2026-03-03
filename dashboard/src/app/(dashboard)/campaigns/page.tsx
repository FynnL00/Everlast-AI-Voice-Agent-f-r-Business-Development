"use client";

import { useState, useMemo } from "react";
import { useCampaigns } from "@/lib/campaigns-context";
import PageHeader from "@/components/ui/PageHeader";
import { KPICard } from "@/components/ui/KPICard";
import { Card, CardContent } from "@/components/ui/Card";
import CampaignTable from "@/components/campaigns/CampaignTable";
import CreateCampaignDialog from "@/components/campaigns/CreateCampaignDialog";
import { Megaphone, Activity, Users, Signal, Plus } from "lucide-react";

export default function CampaignsPage() {
  const { campaigns, loading } = useCampaigns();
  const [dialogOpen, setDialogOpen] = useState(false);

  const stats = useMemo(() => {
    const total = campaigns.length;
    const active = campaigns.filter((c) => c.status === "active").length;
    const totalLeads = campaigns.reduce((sum, c) => sum + c.total_leads, 0);
    const totalCalled = campaigns.reduce((sum, c) => sum + c.leads_called, 0);
    const totalConnected = campaigns.reduce((sum, c) => sum + c.leads_connected, 0);
    const avgConnectionRate = totalCalled > 0 ? (totalConnected / totalCalled) * 100 : 0;
    return { total, active, totalLeads, avgConnectionRate };
  }, [campaigns]);

  return (
    <div className="min-h-screen py-6 md:py-8 max-w-[1900px] mx-auto space-y-4">
      <PageHeader
        title="Kampagnen"
        subtitle="Outbound-Kampagnen verwalten"
        icon={Megaphone}
        rightContent={
          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Neue Kampagne
          </button>
        }
      />

      {/* KPI Row */}
      <div className="glass p-6 rounded-2xl w-full transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-px">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 block">
          Kampagnen KPIs
        </span>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Gesamt"
            numericValue={stats.total}
            icon={Megaphone}
            colorClass="text-chart-1"
            bgClass="bg-chart-1/10"
            tooltip="Gesamtanzahl aller Kampagnen"
          />
          <KPICard
            label="Aktive"
            numericValue={stats.active}
            icon={Activity}
            colorClass="text-green-500"
            bgClass="bg-green-500/10"
            tooltip="Aktuell laufende Kampagnen"
          />
          <KPICard
            label="Leads total"
            numericValue={stats.totalLeads}
            icon={Users}
            colorClass="text-chart-3"
            bgClass="bg-chart-3/10"
            tooltip="Gesamtzahl aller Leads in Kampagnen"
          />
          <KPICard
            label="Ø Connection Rate"
            numericValue={Math.round(stats.avgConnectionRate * 10) / 10}
            suffix="%"
            icon={Signal}
            colorClass="text-chart-5"
            bgClass="bg-chart-5/10"
            tooltip="Durchschnittliche Erreichbarkeit"
            tooltipFormula="Erreicht / Angerufen"
          />
        </div>
      </div>

      {/* Campaign Table */}
      <Card className="p-0 overflow-hidden w-full backdrop-blur-md bg-card/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <CampaignTable campaigns={campaigns} />
          )}
        </CardContent>
      </Card>

      <CreateCampaignDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
