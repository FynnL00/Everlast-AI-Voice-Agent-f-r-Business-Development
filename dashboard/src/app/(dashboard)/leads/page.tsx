"use client";

import { useState, useMemo, useEffect } from "react";
import { useLeads } from "@/lib/leads-context";
import type { Lead, SortField, SortDirection } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import LeadSearch from "@/components/leads/LeadSearch";
import LeadFilters from "@/components/leads/LeadFilters";
import EnhancedLeadTable from "@/components/leads/EnhancedLeadTable";
import Pagination from "@/components/leads/Pagination";
import { Users, Download } from "lucide-react";
import { exportLeadsCSV } from "@/lib/export";

const PAGE_SIZE = 25;

function compareLead(a: Lead, b: Lead, field: SortField, dir: SortDirection): number {
  let valA: string | number | boolean | null;
  let valB: string | number | boolean | null;

  switch (field) {
    case "caller_name":
      valA = a.caller_name?.toLowerCase() ?? "";
      valB = b.caller_name?.toLowerCase() ?? "";
      break;
    case "company":
      valA = a.company?.toLowerCase() ?? "";
      valB = b.company?.toLowerCase() ?? "";
      break;
    case "total_score":
      valA = a.total_score ?? 0;
      valB = b.total_score ?? 0;
      break;
    case "status":
      valA = a.status;
      valB = b.status;
      break;
    case "sentiment":
      valA = a.sentiment ?? "";
      valB = b.sentiment ?? "";
      break;
    case "call_duration_seconds":
      valA = a.call_duration_seconds ?? 0;
      valB = b.call_duration_seconds ?? 0;
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

export default function LeadsPage() {
  const { filteredLeads, filters, setFilters, searchQuery, setSearchQuery, loading } = useLeads();

  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(0);

  // Reset to first page when filters, search, or sort changes
  useEffect(() => {
    setCurrentPage(0);
  }, [filters, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedLeads = useMemo(
    () => [...filteredLeads].sort((a, b) => compareLead(a, b, sortField, sortDirection)),
    [filteredLeads, sortField, sortDirection]
  );

  // Compact KPI summary
  const kpiSummary = useMemo(() => {
    const total = filteredLeads.length;
    const withAppointment = filteredLeads.filter((l) => l.appointment_booked).length;
    const aLeads = filteredLeads.filter((l) => l.lead_grade === "A").length;
    const bLeads = filteredLeads.filter((l) => l.lead_grade === "B").length;
    const cLeads = filteredLeads.filter((l) => l.lead_grade === "C").length;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = filteredLeads.filter((l) => new Date(l.created_at) >= weekAgo).length;
    return { total, withAppointment, aLeads, bLeads, cLeads, thisWeek };
  }, [filteredLeads]);

  const totalPages = Math.ceil(sortedLeads.length / PAGE_SIZE);
  const paginatedLeads = sortedLeads.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <PageHeader
        title="Leads"
        subtitle="Alle erfassten Leads und ihre Details"
        icon={Users}
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center justify-between">
        <LeadSearch
          value={searchQuery}
          onChange={setSearchQuery}
          className="sm:w-80"
        />
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-muted-foreground flex items-center">
            <Badge className="mr-2 bg-primary text-primary-foreground">{filteredLeads.length}</Badge> Gesamt
          </div>
          <button
            onClick={() => exportLeadsCSV(filteredLeads)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-sidebar-accent transition-colors text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
            CSV exportieren
          </button>
        </div>
      </div>

      <LeadFilters
        filters={filters}
        onChange={setFilters}
        leadCount={filteredLeads.length}
        className="mb-4"
      />

      {/* Compact KPI Summary Bar */}
      {!loading && filteredLeads.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-sidebar-accent/50 border border-border text-sm text-muted-foreground font-medium">
          <span className="text-foreground font-bold">{kpiSummary.total}</span> Leads
          <span className="text-border">|</span>
          <span className="text-foreground font-bold">{kpiSummary.withAppointment}</span> mit Termin
          <span className="text-border">|</span>
          <span className="text-green-500 font-bold">{kpiSummary.aLeads}</span><span> A</span>
          <span className="text-amber-500 font-bold">{kpiSummary.bLeads}</span><span> B</span>
          <span className="text-red-400 font-bold">{kpiSummary.cLeads}</span><span> C</span>
          <span className="text-border">|</span>
          <span className="text-foreground font-bold">{kpiSummary.thisWeek}</span> diese Woche
        </div>
      )}

      <Card className="p-0 overflow-hidden w-full backdrop-blur-md bg-card/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <EnhancedLeadTable
              leads={paginatedLeads}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          )}
        </CardContent>
      </Card>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={sortedLeads.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
        className="mt-4"
      />
    </div>
  );
}
