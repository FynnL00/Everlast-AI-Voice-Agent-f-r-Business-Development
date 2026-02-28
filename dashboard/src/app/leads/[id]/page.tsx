"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { UserX } from "lucide-react";
import { useLeads } from "@/lib/leads-context";
import type { Lead, LeadUpdatePayload } from "@/lib/types";
import EmptyState from "@/components/ui/EmptyState";
import LeadDetailHeader from "@/components/lead-detail/LeadDetailHeader";
import ContactCard from "@/components/lead-detail/ContactCard";
import ConversationSummary from "@/components/lead-detail/ConversationSummary";
import ObjectionsCard from "@/components/lead-detail/ObjectionsCard";
import NotesEditor from "@/components/lead-detail/NotesEditor";
import TranscriptViewer from "@/components/lead-detail/TranscriptViewer";
import StatusTimeline from "@/components/lead-detail/StatusTimeline";
import QualificationScores from "@/components/lead-detail/QualificationScores";
import AppointmentCard from "@/components/lead-detail/AppointmentCard";
import BriefingCard from "@/components/lead-detail/BriefingCard";
import NextStepsCard from "@/components/lead-detail/NextStepsCard";

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const { fetchLeadDetail, updateLead, generateBriefing } = useLeads();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const result = await fetchLeadDetail(params.id);
      if (cancelled) return;

      if (!result) {
        setNotFound(true);
      } else {
        setLead(result);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.id, fetchLeadDetail]);

  const handleUpdate = useCallback(
    async (fields: Partial<LeadUpdatePayload>) => {
      const updated = await updateLead(params.id, fields);
      if (updated) {
        setLead((prev) => (prev ? { ...prev, ...updated } : prev));
      }
    },
    [params.id, updateLead]
  );

  const handleStatusChange = useCallback(
    async (status: Lead["status"]) => {
      await handleUpdate({ status });
    },
    [handleUpdate]
  );

  const handleNotesSave = useCallback(
    async (notes: string) => {
      await handleUpdate({ notes });
    },
    [handleUpdate]
  );

  const handleNextStepsUpdate = useCallback(
    async (nextSteps: string[]) => {
      await handleUpdate({ next_steps: nextSteps });
    },
    [handleUpdate]
  );

  const handleGenerateBriefing = useCallback(async () => {
    const briefing = await generateBriefing(params.id);
    if (briefing) {
      setLead((prev) =>
        prev
          ? {
              ...prev,
              briefing,
              briefing_generated_at: new Date().toISOString(),
            }
          : prev
      );
    }
  }, [params.id, generateBriefing]);

  if (loading) {
    return <LeadDetailSkeleton />;
  }

  if (notFound || !lead) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <EmptyState
          icon={UserX}
          title="Lead nicht gefunden"
          description="Der angeforderte Lead existiert nicht oder wurde geloescht."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <LeadDetailHeader lead={lead} />
          <ContactCard lead={lead} onUpdate={handleUpdate} />
          <ConversationSummary
            summary={lead.conversation_summary}
            sentiment={lead.sentiment}
          />
          <ObjectionsCard
            objections={lead.objections_raised}
            dropOffPoint={lead.drop_off_point}
          />
          <NotesEditor notes={lead.notes} onSave={handleNotesSave} />
          <TranscriptViewer transcript={lead.transcript} />
          <StatusTimeline
            currentStatus={lead.status}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* Right column */}
        <div className="lg:col-span-1 space-y-6">
          <QualificationScores lead={lead} />
          <AppointmentCard
            booked={lead.appointment_booked}
            datetime={lead.appointment_datetime}
            calBookingId={lead.cal_booking_id}
          />
          <BriefingCard lead={lead} onGenerate={handleGenerateBriefing} />
          <NextStepsCard
            steps={lead.next_steps}
            onUpdate={handleNextStepsUpdate}
          />
        </div>
      </div>
    </div>
  );
}

function LeadDetailSkeleton() {
  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header skeleton */}
          <div>
            <div className="h-4 w-32 bg-[var(--card-border)] rounded animate-pulse mb-4" />
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-48 bg-[var(--card-border)] rounded animate-pulse" />
              <div className="h-6 w-16 bg-[var(--card-border)] rounded-full animate-pulse" />
              <div className="h-6 w-20 bg-[var(--card-border)] rounded-full animate-pulse" />
            </div>
            <div className="flex gap-4">
              <div className="h-4 w-16 bg-[var(--card-border)] rounded animate-pulse" />
              <div className="h-4 w-24 bg-[var(--card-border)] rounded animate-pulse" />
              <div className="h-4 w-20 bg-[var(--card-border)] rounded animate-pulse" />
            </div>
          </div>

          {/* Cards skeleton */}
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
            >
              <div className="h-4 w-28 bg-[var(--card-border)] rounded animate-pulse mb-4" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-[var(--card-border)] rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-[var(--card-border)] rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-[var(--card-border)] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Right column skeleton */}
        <div className="lg:col-span-1 space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
            >
              <div className="h-4 w-36 bg-[var(--card-border)] rounded animate-pulse mb-4" />
              <div className="space-y-3">
                <div className="h-3 w-full bg-[var(--card-border)] rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-[var(--card-border)] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
