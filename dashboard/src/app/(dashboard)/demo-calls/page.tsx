"use client";

import {
  FileText,
  User,
  Building2,
  Users,
  Clock,
  Target,
  CalendarCheck,
  CalendarX,
  Wrench,
  MessageSquare,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const DEMO_SCENARIOS = [
  {
    id: 1,
    title: "A-Lead: Happy Path",
    caller: "Thomas Weber",
    role: "Operations Manager",
    company: "Webshop Solutions GmbH",
    companySize: "80 Mitarbeiter",
    painPoint: "Manuelle Übertragung von Bestelldaten aus Shopify ins ERP (6h/Tag)",
    currentStack: "Zapier",
    timeline: "Innerhalb der nächsten 4 Wochen, Budget genehmigt",
    grade: "A" as const,
    score: "15/12",
    sentiment: "positiv" as const,
    appointmentBooked: true,
    objections: ["Nutze bereits Zapier"],
    duration: "~4 Min.",
    summary:
      "Im Gespräch erklärte Herr Weber, dass sein Unternehmen manuell Bestelldaten aus Shopify in ein ERP-System überträgt, was 6 Stunden täglich erfordert. Er nutzt bereits Zapier, hat aber mit steigenden Kosten zu kämpfen und ist an einer Automatisierung durch n8n interessiert. Zeitrahmen 4 Wochen, fünfstelliges Budget bereits freigegeben.",
    audioSrc: "/audio/demo-call-1.m4a",
  },
];

type Grade = "A" | "B" | "C";
type Sentiment = "positiv" | "neutral" | "negativ";

function gradeClasses(grade: Grade | null): string {
  if (grade === "A") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
  if (grade === "B") return "bg-amber-500/15 text-amber-400 border-amber-500/20";
  if (grade === "C") return "bg-red-500/15 text-red-400 border-red-500/20";
  return "bg-muted text-muted-foreground";
}

function sentimentClasses(sentiment: Sentiment): string {
  if (sentiment === "positiv") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
  if (sentiment === "neutral") return "bg-amber-500/15 text-amber-400 border-amber-500/20";
  return "bg-red-500/15 text-red-400 border-red-500/20";
}

export default function DemoCallsPage() {
  return (
    <div className="min-h-screen py-6 md:py-8 max-w-[1900px] mx-auto space-y-6">
      <PageHeader
        title="Demo-Calls"
        subtitle="Beispielgespräche mit Lisa"
        icon={FileText}
      />

      <div className="space-y-6">
        {DEMO_SCENARIOS.map((scenario) => (
          <Card key={scenario.id}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 text-sm font-bold">
                    {scenario.id}
                  </div>
                  <h2 className="text-lg font-semibold text-foreground truncate">
                    {scenario.title}
                  </h2>
                </div>
                <Badge
                  className={`${gradeClasses(scenario.grade)} border shrink-0 text-xs font-bold px-2.5 py-0.5`}
                >
                  {scenario.grade ? `Grade ${scenario.grade}` : "Kein Grade"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Audio Player */}
              <div>
                <audio
                  controls
                  className="w-full h-10 rounded-lg"
                  src={scenario.audioSrc}
                >
                  Ihr Browser unterstützt kein Audio-Element.
                </audio>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <User size={15} className="text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Person</p>
                    <p className="text-sm font-medium text-foreground truncate">{scenario.caller}</p>
                    <p className="text-xs text-muted-foreground truncate">{scenario.role}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <Building2 size={15} className="text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Firma</p>
                    <p className="text-sm font-medium text-foreground truncate">{scenario.company}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <Users size={15} className="text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Größe</p>
                    <p className="text-sm font-medium text-foreground truncate">{scenario.companySize}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <Wrench size={15} className="text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Tech Stack</p>
                    <p className="text-sm font-medium text-foreground truncate">{scenario.currentStack}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <Target size={15} className="text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Pain Point</p>
                    <p className="text-sm font-medium text-foreground truncate">{scenario.painPoint}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <Clock size={15} className="text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Timeline</p>
                    <p className="text-sm font-medium text-foreground truncate">{scenario.timeline}</p>
                  </div>
                </div>
              </div>

              {/* Footer row: Sentiment + Score + Appointment + Duration */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Badge
                  className={`${sentimentClasses(scenario.sentiment)} border text-xs font-medium px-2.5 py-0.5`}
                >
                  {scenario.sentiment.charAt(0).toUpperCase() + scenario.sentiment.slice(1)}
                </Badge>

                <span className="text-xs text-muted-foreground font-medium">
                  Score: <span className="text-foreground font-semibold">{scenario.score}</span>
                </span>

                <span className="flex items-center gap-1 text-xs font-medium">
                  {scenario.appointmentBooked ? (
                    <>
                      <CalendarCheck size={14} className="text-emerald-400" />
                      <span className="text-emerald-400">Termin gebucht</span>
                    </>
                  ) : (
                    <>
                      <CalendarX size={14} className="text-muted-foreground" />
                      <span className="text-muted-foreground">Kein Termin</span>
                    </>
                  )}
                </span>

                <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                  <Clock size={14} />
                  {scenario.duration}
                </span>
              </div>

              {/* Objections */}
              {scenario.objections.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <MessageSquare size={14} className="text-muted-foreground shrink-0" />
                  {scenario.objections.map((objection) => (
                    <span
                      key={objection}
                      className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                    >
                      {objection}
                    </span>
                  ))}
                </div>
              )}

              {/* Summary */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {scenario.summary}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
