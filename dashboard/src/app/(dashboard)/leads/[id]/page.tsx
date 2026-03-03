"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { UserX, FileText, Quote, StickyNote, ClipboardList } from "lucide-react";
import { useLeads } from "@/lib/leads-context";
import { useCampaigns } from "@/lib/campaigns-context";
import type { Lead, LeadUpdatePayload, LeadQuote, CallAttempt } from "@/lib/types";
import EmptyState from "@/components/ui/EmptyState";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LeadDetailHeader from "@/components/lead-detail/LeadDetailHeader";
import ContactCard from "@/components/lead-detail/ContactCard";
import ConversationSummary from "@/components/lead-detail/ConversationSummary";
import ObjectionsCard from "@/components/lead-detail/ObjectionsCard";
import NotesEditor from "@/components/lead-detail/NotesEditor";
import TranscriptViewer from "@/components/lead-detail/TranscriptViewer";
import QualificationScores from "@/components/lead-detail/QualificationScores";
import BriefingCard from "@/components/lead-detail/BriefingCard";
import AppointmentAssignmentCard from "@/components/lead-detail/AppointmentAssignmentCard";
import RecentCallAttemptsCard from "@/components/lead-detail/RecentCallAttemptsCard";
import FollowUpCadenceTimeline from "@/components/lead-detail/FollowUpCadenceTimeline";
import QuotesAccordion from "@/components/quotes/QuotesAccordion";
import { computeCadenceSteps, isEarlyStage, DEFAULT_MAX_ATTEMPTS } from "@/lib/cadence-utils";

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const { fetchLeadDetail, updateLead, generateBriefing } = useLeads();
  const { campaigns } = useCampaigns();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quotes, setQuotes] = useState<LeadQuote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [callAttempts, setCallAttempts] = useState<CallAttempt[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

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

  // Fetch quotes for this lead
  useEffect(() => {
    let cancelled = false;

    async function loadQuotes() {
      setQuotesLoading(true);
      try {
        const res = await fetch(`/api/quotes?leadId=${params.id}&limit=50`);
        if (!res.ok) {
          setQuotes([]);
          return;
        }
        const json = await res.json();
        if (!cancelled) {
          setQuotes(json.data ?? []);
        }
      } catch {
        if (!cancelled) setQuotes([]);
      } finally {
        if (!cancelled) setQuotesLoading(false);
      }
    }

    loadQuotes();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  // Fetch call attempts for this lead
  useEffect(() => {
    let cancelled = false;

    async function loadAttempts() {
      setAttemptsLoading(true);
      try {
        const res = await fetch(`/api/leads/${params.id}/attempts`);
        if (!res.ok) {
          setCallAttempts([]);
          return;
        }
        const json = await res.json();
        if (!cancelled) setCallAttempts(json.data ?? []);
      } catch {
        if (!cancelled) setCallAttempts([]);
      } finally {
        if (!cancelled) setAttemptsLoading(false);
      }
    }

    loadAttempts();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  // Compute cadence steps
  const campaign = lead?.campaign_id
    ? campaigns.find((c) => c.id === lead.campaign_id) ?? null
    : null;
  const cadenceConfig = campaign?.cadence_config ?? null;
  const maxAttempts = cadenceConfig?.max_attempts ?? DEFAULT_MAX_ATTEMPTS;

  const cadenceSteps = useMemo(() => {
    if (!lead) return [];
    return computeCadenceSteps(lead, callAttempts, cadenceConfig);
  }, [lead, callAttempts, cadenceConfig]);

  const earlyStage = lead ? isEarlyStage(lead) : false;
  const showCadence =
    callAttempts.length > 0 ||
    (lead?.call_direction === "outbound");

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

  const handleAssign = useCallback(
    async (teamMemberId: string | null) => {
      await handleUpdate({ assigned_to: teamMemberId });
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
          description="Der angeforderte Lead existiert nicht oder wurde gelöscht."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 md:py-8 max-w-[1700px] mx-auto">
      <div className="mb-6">
        <LeadDetailHeader lead={lead} />
      </div>

      {/* Top section: Conditional layout based on lead stage */}
      {earlyStage ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ContactCard lead={lead} onUpdate={handleUpdate} className="h-full" />
          <RecentCallAttemptsCard
            attempts={callAttempts}
            loading={attemptsLoading}
            className="h-full"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <AppointmentAssignmentCard
              lead={lead}
              onStatusChange={handleStatusChange}
              onAssign={handleAssign}
              className="h-full"
            />
          </div>
          <div className="lg:col-span-1">
            <ContactCard lead={lead} onUpdate={handleUpdate} className="h-full" />
          </div>
        </div>
      )}

      {/* Follow-Up Cadence Timeline */}
      {showCadence && (
        <div className="mb-6">
          <FollowUpCadenceTimeline
            steps={cadenceSteps}
            maxAttempts={maxAttempts}
            leadStatus={lead.status}
          />
        </div>
      )}

      {/* Call Briefing – full width */}
      <div className="mb-6">
        <BriefingCard lead={lead} onGenerate={handleGenerateBriefing} />
      </div>

      {/* Full-width tabs section */}
      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">
            <ClipboardList size={14} className="mr-1.5" />
            Zusammenfassung
          </TabsTrigger>
          <TabsTrigger value="transcript">
            <FileText size={14} className="mr-1.5" />
            Transcript
          </TabsTrigger>
          <TabsTrigger value="quotes">
            <Quote size={14} className="mr-1.5" />
            Zitate
            {quotes.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                {quotes.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="notes">
            <StickyNote size={14} className="mr-1.5" />
            Notizen
          </TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary">
          <div className="space-y-6">
            <ConversationSummary
              summary={lead.conversation_summary}
              sentiment={lead.sentiment}
              sentimentScore={lead.sentiment_score}
              sentimentReason={lead.sentiment_reason}
            />
            <QualificationScores lead={lead} />
            <ObjectionsCard
              objections={lead.objections_raised}
              dropOffPoint={lead.drop_off_point}
            />
          </div>
        </TabsContent>

        {/* Transcript Tab */}
        <TabsContent value="transcript">
          <TranscriptViewer transcript={lead.transcript} />
        </TabsContent>

        {/* Quotes Tab */}
        <TabsContent value="quotes">
          {quotesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground animate-pulse text-sm">
                Zitate laden...
              </div>
            </div>
          ) : quotes.length === 0 ? (
            <EmptyState
              icon={Quote}
              title="Keine Zitate"
              description="Für diesen Lead wurden noch keine Zitate extrahiert."
            />
          ) : (
            <QuotesAccordion quotes={quotes} />
          )}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <NotesEditor notes={lead.notes} onSave={handleNotesSave} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LeadDetailSkeleton() {
  return (
    <div className="min-h-screen py-6 md:py-8 max-w-[1700px] mx-auto">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-4 w-32 bg-border rounded animate-pulse mb-4" />
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-48 bg-border rounded animate-pulse" />
          <div className="h-6 w-16 bg-border rounded-full animate-pulse" />
          <div className="h-6 w-20 bg-border rounded-full animate-pulse" />
        </div>
        <div className="flex gap-4">
          <div className="h-4 w-16 bg-border rounded animate-pulse" />
          <div className="h-4 w-24 bg-border rounded animate-pulse" />
          <div className="h-4 w-20 bg-border rounded animate-pulse" />
        </div>
      </div>

      {/* Top section: 2/3 + 1/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="h-4 w-28 bg-border rounded animate-pulse mb-4" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-border rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-border rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-6 h-full">
            <div className="h-4 w-28 bg-border rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-4 w-full bg-border rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-28 bg-border rounded animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-border rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-border rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-border rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
