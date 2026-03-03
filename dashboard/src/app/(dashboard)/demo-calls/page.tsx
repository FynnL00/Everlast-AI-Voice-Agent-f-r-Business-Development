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
    company: "WebShop Solutions GmbH",
    companySize: "80 Mitarbeiter",
    painPoint: "6h/Tag manuelle Datenübertragung zwischen Shopify, Warehouse & CRM",
    currentStack: "Zapier (Power-User, 50+ Zaps)",
    timeline: "4 Wochen, Budget genehmigt",
    grade: "A" as const,
    score: "11-12/12",
    sentiment: "positiv" as const,
    appointmentBooked: true,
    objections: ["Wechselkosten von Zapier"],
    duration: "~8 Min.",
    summary:
      "Vollständiger Happy Path: Discovery \u2192 Qualifizierung \u2192 Einwandbehandlung \u2192 Terminbuchung. Thomas ist Zapier-Power-User mit konkretem Schmerzpunkt und genehmigtem Budget.",
    audioSrc: "/audio/demo-call-1.mp3",
  },
  {
    id: 2,
    title: "B-Lead: Moderate Interest",
    caller: "Sarah Müller",
    role: "Marketing Director",
    company: "Digital Spark Agentur GmbH",
    companySize: "25 Mitarbeiter",
    painPoint: "Reporting-Problem, nicht quantifiziert",
    currentStack: "Make (kurz getestet), hauptsächlich manuell",
    timeline: "Nächstes Quartal, Budget nicht genehmigt",
    grade: "B" as const,
    score: "8/12",
    sentiment: "neutral" as const,
    appointmentBooked: true,
    objections: ["Keine Entwickler im Team", "Muss intern abstimmen"],
    duration: "~6 Min.",
    summary:
      "Moderates Interesse mit zwei Einwänden. Sarah hat Make kurz ausprobiert, braucht aber interne Abstimmung. Termin trotzdem gebucht.",
    audioSrc: "/audio/demo-call-2.mp3",
  },
  {
    id: 3,
    title: "C-Lead: Graceful Exit",
    caller: "Lukas Vogel",
    role: "Freelance Web Developer",
    company: "\u2013",
    companySize: "1 Person (Freelancer)",
    painPoint: "Nur explorativ, kein konkreter Bedarf",
    currentStack: "Keine Automation-Erfahrung",
    timeline: "Kein Zeitrahmen",
    grade: "C" as const,
    score: "4/12",
    sentiment: "neutral" as const,
    appointmentBooked: false,
    objections: ["Brauche ich aktuell nicht", "Überdimensioniert für Ein-Mann-Betrieb"],
    duration: "~4 Min.",
    summary:
      "Graceful Exit ohne Terminbuchung. Lukas ist Freelancer ohne konkreten Bedarf \u2013 Lisa beendet das Gespräch freundlich mit Infomaterial-Angebot.",
    audioSrc: "/audio/demo-call-3.mp3",
  },
  {
    id: 4,
    title: "Sofortige Ablehnung (DSGVO)",
    caller: "Dr. Petra Hoffmann",
    role: "Datenschutzbeauftragte",
    company: "\u2013",
    companySize: "\u2013",
    painPoint: "\u2013",
    currentStack: "\u2013",
    timeline: "\u2013",
    grade: null,
    score: "\u2013/12",
    sentiment: "negativ" as const,
    appointmentBooked: false,
    objections: ["Lehnt Aufzeichnung ab"],
    duration: "~30 Sek.",
    summary:
      "Sofortige Ablehnung nach DSGVO-Hinweis zur Aufzeichnung. Testet Lisas Fähigkeit, Datenschutzbedenken respektvoll zu akzeptieren ohne nachzuhaken.",
    audioSrc: "/audio/demo-call-4.mp3",
  },
  {
    id: 5,
    title: "Fast-Track CTO",
    caller: "Michael Richter",
    role: "CTO",
    company: "FinStack GmbH",
    companySize: "120 Mitarbeiter",
    painPoint: "Skalierung + Datenschutzanforderungen, braucht Self-Hosting",
    currentStack: "Make (Power-User, sucht Self-Hosting)",
    timeline: "2 Wochen, Budget genehmigt",
    grade: "A" as const,
    score: "12/12",
    sentiment: "positiv" as const,
    appointmentBooked: true,
    objections: [],
    duration: "~90 Sek.",
    summary:
      "Perfekter Score \u2013 alle Qualifizierungsdaten in einem Satz geliefert. Michael ist CTO und Decision Maker, überspringt Discovery komplett und bucht direkt.",
    audioSrc: "/audio/demo-call-5.mp3",
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
