"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import PageHeader from "@/components/ui/PageHeader";
import { KPICard } from "@/components/ui/KPICard";
import { Card, CardContent } from "@/components/ui/Card";
import DNCTable, { type DNCEntry } from "@/components/dnc/DNCTable";
import AddDNCDialog from "@/components/dnc/AddDNCDialog";
import { ShieldBan, Plus, CalendarPlus, Bot } from "lucide-react";

export default function DNCPage() {
  const [entries, setEntries] = useState<DNCEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("dnc_list")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch DNC list:", error.message);
    }
    if (data) {
      setEntries(data as DNCEntry[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleRemoved = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAdded = () => {
    fetchEntries();
  };

  const stats = useMemo(() => {
    const total = entries.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const addedToday = entries.filter(
      (e) => new Date(e.created_at) >= today
    ).length;
    const aiDetected = entries.filter((e) => e.reason === "ai_detected").length;
    return { total, addedToday, aiDetected };
  }, [entries]);

  return (
    <div className="min-h-screen py-6 md:py-8 max-w-[1900px] mx-auto space-y-4">
      <PageHeader
        title="DNC-Liste"
        subtitle="Do-Not-Call Verwaltung"
        icon={ShieldBan}
        rightContent={
          <button
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Manuell hinzufügen
          </button>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-3">
        <KPICard
          label="Gesamt DNC"
          numericValue={stats.total}
          icon={ShieldBan}
          colorClass="text-destructive"
          bgClass="bg-destructive/10"
          tooltip="Gesamtanzahl aktiver DNC-Einträge"
        />
        <KPICard
          label="Heute hinzugefügt"
          numericValue={stats.addedToday}
          icon={CalendarPlus}
          colorClass="text-chart-1"
          bgClass="bg-chart-1/10"
          tooltip="Heute neu hinzugefügte Einträge"
        />
        <KPICard
          label="Automatisch erkannt"
          numericValue={stats.aiDetected}
          icon={Bot}
          colorClass="text-chart-5"
          bgClass="bg-chart-5/10"
          tooltip="Vom KI-Agenten erkannte DNC-Anfragen"
        />
      </div>

      {/* DNC Table */}
      <Card className="p-0 overflow-hidden w-full backdrop-blur-md bg-card/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <DNCTable entries={entries} onRemoved={handleRemoved} />
          )}
        </CardContent>
      </Card>

      <AddDNCDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdded={handleAdded}
      />
    </div>
  );
}
