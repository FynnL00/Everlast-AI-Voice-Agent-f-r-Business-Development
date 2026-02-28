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
import { Users } from "lucide-react";

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
        <div className="text-sm font-medium text-muted-foreground flex items-center">
          <Badge className="mr-2 bg-primary text-primary-foreground">{filteredLeads.length}</Badge> Gesamt
        </div>
      </div>

      <LeadFilters
        filters={filters}
        onChange={setFilters}
        leadCount={filteredLeads.length}
        className="mb-4"
      />

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
