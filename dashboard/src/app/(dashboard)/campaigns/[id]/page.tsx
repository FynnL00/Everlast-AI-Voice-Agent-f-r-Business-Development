"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCampaigns } from "@/lib/campaigns-context";
import { useLeads } from "@/lib/leads-context";
import type { Campaign, Lead, SortField, SortDirection } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import { KPICard } from "@/components/ui/KPICard";
import { Card, CardContent } from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import CampaignStatusBadge from "@/components/campaigns/CampaignStatusBadge";
import EnhancedLeadTable from "@/components/leads/EnhancedLeadTable";
import Pagination from "@/components/leads/Pagination";
import { supabase } from "@/lib/supabase";
import {
  Megaphone,
  Users,
  PhoneOutgoing,
  Signal,
  CalendarCheck,
  ArrowLeft,
  Play,
  Pause,
} from "lucide-react";

const PAGE_SIZE = 25;

function compareLead(a: Lead, b: Lead, field: SortField, dir: SortDirection): number {
  let valA: string | number | boolean | null;
  let valB: string | number | boolean | null;

  switch (field) {
    case "caller_name":
      valA = a.caller_name?.toLowerCase() ?? "";
      valB = b.caller_name?.toLowerCase() ?? "";
      break;
    case "total_score":
      valA = a.total_score ?? 0;
      valB = b.total_score ?? 0;
      break;
    case "status":
      valA = a.status;
      valB = b.status;
      break;
    case "call_attempts":
      valA = a.call_attempts ?? 0;
      valB = b.call_attempts ?? 0;
      break;
    case "disposition_code":
      valA = a.disposition_code ?? "";
      valB = b.disposition_code ?? "";
      break;
    case "appointment_booked":
      valA = a.appointment_booked ? 1 : 0;
      valB = b.appointment_booked ? 1 : 0;
      break;
    case "created_at":
      valA = new Date(a.created_at).getTime();
      valB = new Date(b.created_at).getTime();
      break;
    default:
      return 0;
  }

  if (valA < valB) return dir === "asc" ? -1 : 1;
  if (valA > valB) return dir === "asc" ? 1 : -1;
  return 0;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const { campaigns, fetchCampaign } = useCampaigns();
  const { leads } = useLeads();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [toggling, setToggling] = useState(false);

  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(0);

  // Try to find campaign in context first, then fetch
  useEffect(() => {
    const found = campaigns.find((c) => c.id === campaignId);
    if (found) {
      setCampaign(found);
      setLoadingCampaign(false);
    } else {
      fetchCampaign(campaignId).then((c) => {
        setCampaign(c);
        setLoadingCampaign(false);
      });
    }
  }, [campaignId, campaigns, fetchCampaign]);

  // Filter leads by campaign
  const campaignLeads = useMemo(
    () => leads.filter((l) => l.campaign_id === campaignId),
    [leads, campaignId]
  );

  const sortedLeads = useMemo(
    () => [...campaignLeads].sort((a, b) => compareLead(a, b, sortField, sortDirection)),
    [campaignLeads, sortField, sortDirection]
  );

  const totalPages = Math.ceil(sortedLeads.length / PAGE_SIZE);
  const paginatedLeads = sortedLeads.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(0);
  };

  const handleToggleStatus = async () => {
    if (!campaign) return;
    setToggling(true);
    const newStatus = campaign.status === "active" ? "paused" : "active";
    const { error } = await supabase
      .from("campaigns")
      .update({ status: newStatus })
      .eq("id", campaign.id);
    if (!error) {
      setCampaign({ ...campaign, status: newStatus });
    }
    setToggling(false);
  };

  const demosBooked = useMemo(
    () => campaignLeads.filter((l) => l.appointment_booked).length,
    [campaignLeads]
  );

  if (loadingCampaign) {
    return (
      <div className="min-h-screen py-6 md:py-8 max-w-[1900px] mx-auto flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen py-6 md:py-8 max-w-[1900px] mx-auto">
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="text-sm">Kampagne nicht gefunden</p>
          <button
            onClick={() => router.push("/campaigns")}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 md:py-8 max-w-[1900px] mx-auto space-y-4">
      {/* Back Button */}
      <button
        onClick={() => router.push("/campaigns")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <ArrowLeft size={14} />
        Kampagnen
      </button>

      <PageHeader
        title={campaign.name}
        icon={Megaphone}
        rightContent={
          <div className="flex items-center gap-3">
            <CampaignStatusBadge status={campaign.status} size="md" />
            {(campaign.status === "active" || campaign.status === "paused") && (
              <button
                onClick={handleToggleStatus}
                disabled={toggling}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl border border-border bg-card hover:bg-sidebar-accent transition-colors text-foreground disabled:opacity-50"
              >
                {campaign.status === "active" ? (
                  <>
                    <Pause size={14} />
                    Pausieren
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    Aktivieren
                  </>
                )}
              </button>
            )}
          </div>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          label="Total Leads"
          numericValue={campaign.total_leads}
          icon={Users}
          colorClass="text-chart-1"
          bgClass="bg-chart-1/10"
        />
        <KPICard
          label="Angerufen"
          numericValue={campaign.leads_called}
          icon={PhoneOutgoing}
          colorClass="text-chart-3"
          bgClass="bg-chart-3/10"
        />
        <KPICard
          label="Erreicht"
          numericValue={campaign.leads_connected}
          icon={Signal}
          colorClass="text-chart-2"
          bgClass="bg-chart-2/10"
        />
        <KPICard
          label="Demos"
          numericValue={demosBooked}
          icon={CalendarCheck}
          colorClass="text-green-500"
          bgClass="bg-green-500/10"
        />
      </div>

      {/* Progress */}
      <Card className="p-4">
        <ProgressBar
          value={campaign.leads_called}
          max={campaign.total_leads}
          label="Kampagnenfortschritt"
          showPercentage
        />
      </Card>

      {/* Leads Table */}
      <Card className="p-0 overflow-hidden w-full backdrop-blur-md bg-card/60">
        <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            Leads in dieser Kampagne
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {campaignLeads.length} Leads
          </span>
        </div>
        <CardContent className="p-0">
          <EnhancedLeadTable
            leads={paginatedLeads}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </CardContent>
      </Card>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={sortedLeads.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
