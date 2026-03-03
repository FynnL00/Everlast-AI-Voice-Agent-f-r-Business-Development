"use client";

import { useState, useMemo, useEffect } from "react";
import { useLeads } from "@/lib/leads-context";
import type { Lead, SortField, SortDirection } from "@/lib/types";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import LeadSearch from "@/components/leads/LeadSearch";
import LeadFilters from "@/components/leads/LeadFilters";
import EnhancedLeadTable from "@/components/leads/EnhancedLeadTable";
import Pagination from "@/components/leads/Pagination";
import ImportLeadsDialog from "@/components/leads/ImportLeadsDialog";
import { Users, Download, Upload, SlidersHorizontal, X, PhoneOutgoing, PhoneCall, Voicemail, CalendarCheck } from "lucide-react";
import { KPICard } from "@/components/ui/KPICard";
import { cn } from "@/lib/utils";
import { exportLeadsCSV } from "@/lib/export";

const PAGE_SIZE = 25;

const GRADE_OPTIONS: { value: "A" | "B" | "C"; color: string }[] = [
  { value: "A", color: "var(--score-good)" },
  { value: "B", color: "var(--score-warning)" },
  { value: "C", color: "var(--score-danger)" },
];

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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

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

  const totalPages = Math.ceil(sortedLeads.length / PAGE_SIZE);
  const paginatedLeads = sortedLeads.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE
  );

  // Count active filters (excluding grades, which are in the toolbar)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.statuses.length > 0) count++;
    if (filters.sentiments.length > 0) count++;
    if (filters.appointmentBooked !== null) count++;
    if (filters.assignedTo !== null) count++;
    if (filters.campaignId !== null) count++;
    if (filters.dateRange.from !== null || filters.dateRange.to !== null) count++;
    return count;
  }, [filters]);

  const { attempts, connectionRate, voicemailRate, demoBookingRate } = useMemo(() => {
    const outbound = filteredLeads.filter(l => l.call_direction === 'outbound');
    const attempts = outbound.reduce((sum, l) => sum + (l.call_attempts || 0), 0);

    const connectedCodes = ['connected', 'callback'];
    const connected = outbound.filter(l =>
      l.disposition_code && connectedCodes.includes(l.disposition_code)
    ).length;
    const connectionRate = attempts > 0 ? Math.round((connected / attempts) * 100) : 0;

    const voicemails = outbound.filter(l => l.disposition_code === 'voicemail').length;
    const voicemailRate = attempts > 0 ? Math.round((voicemails / attempts) * 100) : 0;

    const demosBooked = outbound.filter(l => l.appointment_booked).length;
    const demoBookingRate = connected > 0 ? Math.round((demosBooked / connected) * 100) : 0;

    return { attempts, connectionRate, voicemailRate, demoBookingRate };
  }, [filteredLeads]);

  const toggleGrade = (grade: "A" | "B" | "C") => {
    const grades = filters.grades.includes(grade)
      ? filters.grades.filter((g) => g !== grade)
      : [...filters.grades, grade];
    setFilters({ ...filters, grades });
  };

  return (
    <div className="min-h-screen py-6 md:py-8 max-w-[1900px] mx-auto space-y-4">
      <PageHeader
        title="Leads"
        subtitle="Alle erfassten Leads und ihre Details"
        icon={Users}
      />

      {/* KPI Cards */}
      <div className="glass p-6 rounded-2xl w-full transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-px">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard
            label="Anrufversuche"
            numericValue={attempts}
            suffix=""
            icon={PhoneOutgoing}
            colorClass="text-purple-400"
            bgClass="bg-purple-500/10"
            tooltip="Gesamtanzahl aller Outbound-Anrufversuche der gefilterten Leads."
          />
          <KPICard
            label="Conversion Rate"
            numericValue={demoBookingRate}
            suffix="%"
            icon={CalendarCheck}
            colorClass="text-emerald-400"
            bgClass="bg-emerald-500/10"
            tooltip="Anteil der erreichten Kontakte, die eine Demo gebucht haben."
            tooltipFormula="Conversion Rate = Demos gebucht ÷ Erreichte × 100"
          />
          <KPICard
            label="Connection Rate"
            numericValue={connectionRate}
            suffix="%"
            icon={PhoneCall}
            colorClass="text-green-400"
            bgClass="bg-green-500/10"
            tooltip="Anteil der Anrufversuche, bei denen der Kontakt erreicht wurde."
            tooltipFormula="Connection Rate = Erreichte ÷ Versuche × 100"
          />
          <KPICard
            label="Mailbox-Quote"
            numericValue={voicemailRate}
            suffix="%"
            icon={Voicemail}
            colorClass="text-amber-400"
            bgClass="bg-amber-500/10"
            tooltip="Anteil der Anrufversuche, die auf der Mailbox gelandet sind."
            tooltipFormula="Mailbox-Quote = Mailbox ÷ Versuche × 100"
          />
        </div>
      </div>

      {/* Unified Toolbar */}
      <div className="glass p-4 rounded-2xl w-full flex items-center gap-3 flex-wrap">
        {/* Search */}
        <LeadSearch
          value={searchQuery}
          onChange={setSearchQuery}
          className="flex-1 min-w-[200px] max-w-sm"
        />

        {/* Grade Toggles */}
        <div className="flex items-center gap-1">
          {GRADE_OPTIONS.map((opt) => {
            const active = filters.grades.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggleGrade(opt.value)}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-semibold border transition-colors duration-150",
                  active
                    ? "border-transparent text-white"
                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                style={
                  active
                    ? { backgroundColor: opt.color, color: "white" }
                    : undefined
                }
              >
                {opt.value}
              </button>
            );
          })}
        </div>

        {/* Filter Toggle Button */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors duration-150",
            filtersOpen || activeFilterCount > 0
              ? "bg-primary border-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {filtersOpen ? <X size={14} /> : <SlidersHorizontal size={14} />}
          {activeFilterCount > 0 ? `${activeFilterCount} Filter` : "Filter"}
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Lead Count */}
        <span className="text-sm text-muted-foreground tabular-nums">
          <span className="font-semibold text-foreground">{filteredLeads.length}</span> Leads
        </span>

        {/* Import */}
        <button
          onClick={() => setImportDialogOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border bg-card hover:bg-sidebar-accent transition-colors text-foreground"
        >
          <Upload className="h-3.5 w-3.5" />
          Import
        </button>

        {/* CSV Export */}
        <button
          onClick={() => exportLeadsCSV(filteredLeads)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border bg-card hover:bg-sidebar-accent transition-colors text-foreground"
        >
          <Download className="h-3.5 w-3.5" />
          CSV
        </button>
      </div>

      {/* Collapsible Filter Panel */}
      <LeadFilters
        filters={filters}
        onChange={setFilters}
        open={filtersOpen}
      />

      {/* Table */}
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
      />

      <ImportLeadsDialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} />
    </div>
  );
}
