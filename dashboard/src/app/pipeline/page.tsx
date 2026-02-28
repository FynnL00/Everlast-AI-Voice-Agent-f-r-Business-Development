"use client";

import { useLeads } from "@/lib/leads-context";
import PageHeader from "@/components/ui/PageHeader";
import Badge from "@/components/ui/Badge";
import PipelineSummary from "@/components/pipeline/PipelineSummary";
import PipelineBoard from "@/components/pipeline/PipelineBoard";

export default function PipelinePage() {
  const { filteredLeads, loading } = useLeads();

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Pipeline"
        subtitle="Leads nach Status in der Vertriebspipeline"
        badge={
          <Badge
            label={`${filteredLeads.length} Leads`}
            color="var(--accent)"
            size="md"
          />
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
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
