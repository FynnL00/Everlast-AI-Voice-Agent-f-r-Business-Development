"use client";

import { useMemo } from "react";
import { useLeads } from "@/lib/leads-context";
import type { Lead } from "@/lib/types";
import PipelineColumn from "./PipelineColumn";
import EmptyState from "@/components/ui/EmptyState";
import { Kanban } from "lucide-react";

const PIPELINE_STAGES: Lead["status"][] = [
  "new",
  "contacted",
  "qualified",
  "appointment_booked",
  "converted",
  "lost",
];

export default function PipelineBoard() {
  const { filteredLeads } = useLeads();

  const grouped = useMemo(() => {
    const map: Record<Lead["status"], Lead[]> = {
      new: [],
      contacted: [],
      qualified: [],
      appointment_booked: [],
      converted: [],
      lost: [],
    };
    for (const lead of filteredLeads) {
      if (map[lead.status]) {
        map[lead.status].push(lead);
      }
    }
    return map;
  }, [filteredLeads]);

  if (filteredLeads.length === 0) {
    return (
      <EmptyState
        icon={Kanban}
        title="Keine Leads vorhanden"
        description="Sobald Leads erfasst werden, erscheinen sie hier in der Pipeline."
      />
    );
  }

  return (
    <div className="overflow-x-auto pb-4 -mx-2">
      <div className="flex gap-3 px-2 min-w-max">
        {PIPELINE_STAGES.map((status) => (
          <PipelineColumn
            key={status}
            status={status}
            leads={grouped[status]}
          />
        ))}
      </div>
    </div>
  );
}
