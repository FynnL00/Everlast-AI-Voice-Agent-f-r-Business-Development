"use client";

import { useMemo, useCallback, useState } from "react";
import { useLeads } from "@/lib/leads-context";
import type { Lead } from "@/lib/types";
import PipelineColumn from "./PipelineColumn";
import EmptyState from "@/components/ui/EmptyState";
import { Kanban } from "lucide-react";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import PipelineCard from "./PipelineCard";

const PIPELINE_STAGES: Lead["status"][] = [
  "new",
  "contacted",
  "qualified",
  "appointment_booked",
  "converted",
  "lost",
];

export default function PipelineBoard() {
  const { filteredLeads, updateLead } = useLeads();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

  const activeLead = useMemo(
    () => (activeId ? filteredLeads.find((l) => l.id === activeId) ?? null : null),
    [activeId, filteredLeads]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const leadId = active.id as string;
      const newStatus = over.id as Lead["status"];

      // Find the current lead
      const lead = filteredLeads.find((l) => l.id === leadId);
      if (!lead || lead.status === newStatus) return;

      // Optimistic update is handled by updateLead in context
      await updateLead(leadId, { status: newStatus });
    },
    [filteredLeads, updateLead]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
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
      <DragOverlay>
        {activeLead ? (
          <div className="opacity-90 rotate-2 scale-105">
            <PipelineCard lead={activeLead} isDragOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
