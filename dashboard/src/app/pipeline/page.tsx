"use client";

import { useLeads } from "@/lib/leads-context";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import PipelineSummary from "@/components/pipeline/PipelineSummary";
import PipelineBoard from "@/components/pipeline/PipelineBoard";
import { KanbanSquare } from "lucide-react";

export default function PipelinePage() {
  const { filteredLeads, loading } = useLeads();

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
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
          <PipelineSummary />
          <PipelineBoard />
        </>
      )}
    </div>
  );
}
