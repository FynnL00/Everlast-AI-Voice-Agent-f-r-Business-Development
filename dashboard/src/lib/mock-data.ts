import type { Lead, DispositionCode } from "./types";

// ---------- Seeded PRNG (deterministic across renders) ----------
function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickN<T>(rng: () => number, arr: readonly T[], min: number, max: number): T[] {
  const count = min + Math.floor(rng() * (max - min + 1));
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, count);
}

function between(rng: () => number, lo: number, hi: number): number {
  return Math.round(lo + rng() * (hi - lo));
}

function uuid(rng: () => number): string {
  const hex = () => Math.floor(rng() * 16).toString(16);
  const seg = (n: number) => Array.from({ length: n }, hex).join("");
  return `${seg(8)}-${seg(4)}-4${seg(3)}-${(8 + Math.floor(rng() * 4)).toString(16)}${seg(3)}-${seg(12)}`;
}

// ---------- Data pools ----------
const FIRST_NAMES = [
  "Thomas", "Stefan", "Julia", "Markus", "Sandra", "Michael", "Andrea",
  "Christian", "Sabine", "Daniel", "Petra", "Florian", "Katharina", "Martin",
  "Claudia", "Jan", "Lisa", "Alexander", "Nina", "Robert",
] as const;

const LAST_NAMES = [
  "Müller", "Schmidt", "Weber", "Fischer", "Wagner", "Becker", "Hoffmann",
  "Schäfer", "Koch", "Richter", "Klein", "Wolf", "Schröder", "Neumann",
  "Schwarz", "Braun", "Zimmermann", "Hartmann", "Krause", "Lehmann",
] as const;

const COMPANIES = [
  "DataFlow GmbH", "Nexus Solutions AG", "CloudBridge Technologies", "SynergieSoft GmbH",
  "AutomateNow GmbH", "DigiVentures AG", "TechForge Solutions", "ByteWerk GmbH",
  "InnovateTech AG", "SmartProcess GmbH", "CodeCraft Solutions", "FlowConnect GmbH",
  "ScaleUp Digital AG", "ProzessHeld GmbH", "IntegrationHub AG", "Werkflow GmbH",
  "DataPipe Solutions", "Synapse Digital GmbH", "LogiTech Consulting", "CloudNative AG",
] as const;

const COMPANY_SIZES = [
  "5 Mitarbeiter", "12 Mitarbeiter", "25 Mitarbeiter", "45 Mitarbeiter",
  "80 Mitarbeiter", "120 Mitarbeiter", "250 Mitarbeiter", "500 Mitarbeiter",
  "15 Mitarbeiter", "60 Mitarbeiter", "200 Mitarbeiter", "350 Mitarbeiter",
] as const;

const PAIN_POINTS = [
  "Manuelle Dateneingabe kostet zu viel Zeit",
  "Fehlende Integration zwischen CRM und E-Mail",
  "Lead-Nachverfolgung geht verloren",
  "Kein Überblick über Sales-Pipeline",
  "Zu viele manuelle Schritte im Onboarding",
  "Datensilos zwischen Abteilungen",
  "Reporting dauert zu lange",
  "Kundenanfragen werden zu spät beantwortet",
  "Rechnungsstellung ist fehleranfällig",
  "Keine automatisierte Lead-Qualifizierung",
] as const;

const CURRENT_STACKS = [
  "Zapier + HubSpot", "Make.com + Salesforce", "Nur Excel", "Power Automate + Dynamics",
  "Keine Automation", "Zapier + Pipedrive", "Eigenentwicklung", "Make.com + Notion",
  "Integromat + Airtable", "Noch nichts im Einsatz",
] as const;

const TIMELINES = [
  "Sofort", "Innerhalb 2 Wochen", "Diesen Monat", "In 1-2 Monaten",
  "Nächstes Quartal", "Kein konkreter Zeitrahmen", "So schnell wie möglich",
] as const;

const OBJECTIONS = [
  "Kein Budget", "Keine Zeit", "Nutze bereits Zapier", "Muss Team fragen",
  "Kein Bedarf aktuell", "Zu komplex", "Vertrag mit Wettbewerber",
  "IT muss zustimmen", "Zu teuer", "Brauche mehr Infos",
  "Nicht der Entscheider", "Datenschutzbedenken",
] as const;

const DROP_OFF_POINTS = [
  "OPENING", "DISCOVERY", "QUALIFICATION", "DEMO_OFFER", "CLOSING", null,
] as const;

const EMAILS_DOMAINS = [
  "gmail.com", "outlook.de", "firma.de", "company.com", "mail.de",
] as const;

// ---------- Summaries by grade ----------
const SUMMARIES_A = [
  "Sehr interessiertes Gespräch. Der Anrufer hat einen konkreten Use Case für Workflow-Automatisierung und möchte zeitnah starten. Budget ist vorhanden, Entscheidung fällt diese Woche.",
  "Produktives Telefonat mit dem IT-Leiter. Das Unternehmen sucht aktiv nach einer Zapier-Alternative mit besserer Enterprise-Unterstützung. Demo-Termin wurde direkt vereinbart.",
  "Hervorragendes Gespräch. Der Geschäftsführer hat klare Pain Points bei der CRM-Integration identifiziert. Team von 80+ Mitarbeitern, sofortiger Handlungsbedarf.",
  "Sehr engagierter Kontakt. Nutzt aktuell Make.com, stößt aber an Grenzen bei komplexen Workflows. Möchte n8n als Self-Hosted-Lösung evaluieren. Termin nächste Woche.",
  "Der COO hat konkretes Budget für Q1 eingeplant. Hauptproblem: Datensilos zwischen 5 Abteilungen. Sieht n8n als zentrale Integrationsplattform.",
] as const;

const SUMMARIES_B = [
  "Gutes Gespräch mit dem Marketing-Manager. Interesse an E-Mail-Automatisierung vorhanden, aber Entscheidung liegt beim IT-Leiter. Folge-Call geplant.",
  "Der Anrufer kennt n8n bereits und möchte die Enterprise-Features verstehen. Aktuell in der Evaluierungsphase, Zeitrahmen 1-2 Monate.",
  "Mittleres Interesse. Das Unternehmen hat gerade ein Automation-Projekt gestartet, aber die Prioritäten sind noch unklar. Infomaterial zugeschickt.",
  "Angenehmes Gespräch mit der Teamleiterin. Sie sieht Potenzial für n8n, muss aber erst intern Budget freigeben. Rückruf in 2 Wochen vereinbart.",
  "Grundsätzliches Interesse an Workflow-Automatisierung. Der Kontakt nutzt aktuell Zapier und ist mit den Kosten unzufrieden. Noch keine konkreten Pläne für einen Wechsel.",
  "Informativer Call. Der Anrufer sammelt Informationen für eine Evaluation im nächsten Quartal. Hat bereits 3 Tools verglichen.",
  "Freundliches Gespräch mit dem Operations Manager. Sieht Bedarf bei der Auftragsabwicklung, aber Investition muss vom Vorstand genehmigt werden.",
] as const;

const SUMMARIES_C = [
  "Kurzes Gespräch. Der Anrufer wollte sich nur allgemein über n8n informieren, hat keinen konkreten Bedarf geäußert.",
  "Schwieriges Telefonat. Der Kontakt hat kein Budget und keinen Zeitrahmen. Wurde als Lead für spätere Nachverfolgung gespeichert.",
  "Nur kurz gesprochen. Die Person ist nicht der Entscheider und konnte keinen weiteren Ansprechpartner nennen.",
  "Minimales Interesse. Das Unternehmen hat gerade erst einen Vertrag mit einem Wettbewerber abgeschlossen. Eventuell in 12 Monaten wieder relevant.",
  "Unproduktives Gespräch. Der Anrufer hat mehrere Einwände vorgebracht und kein Interesse an einer Demo gezeigt.",
] as const;

const SAMPLE_TRANSCRIPTS = [
  `Lisa: Hallo, hier ist Lisa von n8n! Kurzer Hinweis vorab: Dieses Gespräch wird zur Qualitätssicherung aufgezeichnet. Ist das für Sie in Ordnung?
Anrufer: Ja, kein Problem.
Lisa: Wunderbar! Wie kann ich Ihnen heute helfen?
Anrufer: Ich habe von n8n gehört und möchte mehr über die Möglichkeiten für Workflow-Automatisierung erfahren. Wir haben gerade ein großes Problem mit manueller Dateneingabe.
Lisa: Das klingt nach einem typischen Use Case, den wir sehr gut lösen können. Darf ich fragen, wie groß Ihr Team ist?
Anrufer: Wir sind etwa 80 Mitarbeiter, davon arbeiten 15 direkt mit den betroffenen Prozessen.
Lisa: Verstehe. Nutzen Sie aktuell bereits Automatisierungstools?
Anrufer: Wir haben Zapier im Einsatz, stoßen aber an die Grenzen bei komplexeren Abläufen.
Lisa: Das höre ich oft. n8n bietet da deutlich mehr Flexibilität, besonders bei Self-Hosted-Deployments. Hätten Sie Interesse an einer persönlichen Demo mit unserem Solutions Team?
Anrufer: Ja, sehr gerne. Am besten nächste Woche.
Lisa: Perfekt! Ich prüfe kurz die verfügbaren Termine.`,

  `Lisa: Hallo, hier ist Lisa von n8n! Dieses Gespräch wird zur Qualitätssicherung aufgezeichnet. Ist das in Ordnung für Sie?
Anrufer: Ja, passt.
Lisa: Super! Was führt Sie zu uns?
Anrufer: Wir evaluieren gerade verschiedene Integrationsplattformen. Mein Name ist Stefan Hoffmann, ich bin IT-Leiter bei DataFlow GmbH.
Lisa: Freut mich, Herr Hoffmann! Was sind denn die Hauptanforderungen, die Sie an eine Integrationsplattform haben?
Anrufer: Wir brauchen vor allem eine Lösung, die on-premise laufen kann. Datenschutz ist bei uns ein großes Thema.
Lisa: Das verstehe ich absolut. n8n kann komplett self-hosted betrieben werden, mit voller Kontrolle über Ihre Daten. Wie viele Integrationen brauchen Sie ungefähr?
Anrufer: Aktuell haben wir etwa 20 verschiedene Tools im Einsatz. Die müssen alle miteinander kommunizieren können.
Lisa: Mit über 400 Integrationen und der Möglichkeit, eigene Nodes zu entwickeln, decken wir das sehr gut ab. Soll ich einen Demo-Termin für Sie arrangieren?
Anrufer: Gerne, aber erst nächsten Monat. Wir sind gerade mitten in einem anderen Projekt.`,

  `Lisa: Hallo, hier ist Lisa von n8n! Kurzer Hinweis: Dieses Gespräch wird aufgezeichnet. Ist das okay?
Anrufer: Hmm, na gut.
Lisa: Danke! Wie kann ich Ihnen helfen?
Anrufer: Ich wollte mich nur mal erkundigen, was n8n so kostet.
Lisa: Gerne! Darf ich vorher kurz fragen, was Sie mit n8n vorhaben? Dann kann ich besser einschätzen, welches Paket für Sie passt.
Anrufer: Naja, wir haben eigentlich noch gar keinen konkreten Plan. Ein Kollege hat es erwähnt.
Lisa: Verstehe. Haben Sie denn aktuell Prozesse, die Sie gerne automatisieren würden?
Anrufer: Nicht wirklich. Wir sind ein kleines Team und machen das meiste noch manuell.
Lisa: Das ist völlig in Ordnung. n8n hat auch eine kostenlose Community-Edition, mit der Sie erstmal experimentieren können. Soll ich Ihnen die Infos zuschicken?
Anrufer: Ja, schicken Sie mir mal eine E-Mail.`,

  `Lisa: Hallo, hier ist Lisa von n8n! Dieses Gespräch wird zur Qualitätssicherung aufgezeichnet. Sind Sie damit einverstanden?
Anrufer: Ja, klar.
Lisa: Toll! Was kann ich für Sie tun?
Anrufer: Mein Name ist Julia Klein, ich bin COO bei InnovateTech AG. Wir haben ein akutes Problem mit unseren Geschäftsprozessen und brauchen dringend eine Automatisierungslösung.
Lisa: Das klingt dringend, Frau Klein. Können Sie mir mehr über die Situation erzählen?
Anrufer: Wir haben fünf Abteilungen, die alle mit verschiedenen Tools arbeiten. Die Daten fließen nicht zusammen, und wir verbringen Stunden damit, Reports manuell zusammenzustellen.
Lisa: Das ist ein klassischer Fall für n8n. Wir können diese Datensilos aufbrechen und automatisierte Workflows erstellen, die alles verbinden.
Anrufer: Genau das brauchen wir. Wir haben auch schon Budget für Q1 eingeplant.
Lisa: Hervorragend! Dann würde ich vorschlagen, dass wir einen Demo-Termin mit unserem Solutions Team vereinbaren. Die können Ihnen genau zeigen, wie die Integration aussehen würde.
Anrufer: Perfekt, am liebsten diese Woche noch.
Lisa: Ich schaue gleich nach verfügbaren Terminen!`,

  `Lisa: Hallo, hier ist Lisa von n8n! Dieses Gespräch wird aufgezeichnet. Einverstanden?
Anrufer: Ja.
Lisa: Wie kann ich helfen?
Anrufer: Ich bin Martin Braun von ByteWerk GmbH. Wir nutzen aktuell Make.com, aber die Kosten sind mittlerweile explodiert.
Lisa: Das Problem kennen viele unserer Kunden. Wie viele aktive Workflows haben Sie denn bei Make.com?
Anrufer: Etwa 50 Workflows, und die Operations kosten uns mittlerweile über 500 Euro im Monat.
Lisa: Bei n8n zahlen Sie eine fixe Lizenzgebühr, unabhängig von der Anzahl der Ausführungen. Das kann bei Ihrem Volumen eine erhebliche Ersparnis bedeuten.
Anrufer: Das klingt gut. Wie aufwändig wäre die Migration?
Lisa: Wir haben ein Migrationstool und unser Team unterstützt Sie beim Umzug. Die meisten Kunden sind innerhalb von 2-3 Wochen komplett migriert.
Anrufer: Interessant. Können wir einen Termin machen, um das im Detail zu besprechen?
Lisa: Selbstverständlich! Wann passt es Ihnen am besten?`,
] as const;

// ---------- Disposition codes with weights ----------
const OUTBOUND_DISPOSITIONS: { code: DispositionCode; weight: number }[] = [
  { code: "connected", weight: 35 },
  { code: "no_answer", weight: 20 },
  { code: "voicemail", weight: 15 },
  { code: "callback", weight: 10 },
  { code: "not_interested", weight: 8 },
  { code: "gatekeeper", weight: 7 },
  { code: "busy", weight: 3 },
  { code: "wrong_number", weight: 2 },
];

const INBOUND_DISPOSITIONS: { code: DispositionCode; weight: number }[] = [
  { code: "connected", weight: 65 },
  { code: "not_interested", weight: 20 },
  { code: "callback", weight: 10 },
  { code: "technical_error", weight: 5 },
];

function weightedPick(rng: () => number, items: { code: DispositionCode; weight: number }[]): DispositionCode {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = rng() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.code;
  }
  return items[items.length - 1].code;
}

// ---------- Grade-aware lead generation ----------
interface GradeSpec {
  grade: "A" | "B" | "C";
  scoreRanges: [number, number][]; // [min, max] for each of the 5 scoring dimensions
  sentimentWeights: { positiv: number; neutral: number; negativ: number };
  appointmentChance: number;
  summaries: readonly string[];
}

const GRADE_SPECS: GradeSpec[] = [
  {
    grade: "A",
    scoreRanges: [[2, 3], [2, 3], [3, 3], [2, 3], [2, 3]],
    sentimentWeights: { positiv: 70, neutral: 25, negativ: 5 },
    appointmentChance: 0.8,
    summaries: SUMMARIES_A,
  },
  {
    grade: "B",
    scoreRanges: [[1, 3], [1, 3], [2, 3], [1, 2], [1, 3]],
    sentimentWeights: { positiv: 30, neutral: 50, negativ: 20 },
    appointmentChance: 0.3,
    summaries: SUMMARIES_B,
  },
  {
    grade: "C",
    scoreRanges: [[1, 2], [1, 2], [1, 2], [1, 2], [1, 2]],
    sentimentWeights: { positiv: 10, neutral: 45, negativ: 45 },
    appointmentChance: 0,
    summaries: SUMMARIES_C,
  },
] as const;

function pickWeightedSentiment(
  rng: () => number,
  weights: { positiv: number; neutral: number; negativ: number },
): "positiv" | "neutral" | "negativ" {
  const total = weights.positiv + weights.neutral + weights.negativ;
  let r = rng() * total;
  if ((r -= weights.positiv) <= 0) return "positiv";
  if ((r -= weights.neutral) <= 0) return "neutral";
  return "negativ";
}

function deriveStatus(
  rng: () => number,
  grade: "A" | "B" | "C",
  callDuration: number,
  disposition: DispositionCode,
  hasAppointment: boolean,
  sentiment: "positiv" | "neutral" | "negativ",
  objections: string[] | null,
  dropOff: string | null,
): Lead["status"] {
  // No conversation happened
  if (callDuration === 0) return "new";

  // Disposition-based overrides — not reached
  if (disposition === "no_answer" || disposition === "voicemail" || disposition === "busy") return "not_reached";
  if (disposition === "not_interested") return "lost";
  if (disposition === "gatekeeper" || disposition === "technical_error") return "contacted";

  // Appointment booked → appointment_booked or converted
  if (hasAppointment) {
    if (grade === "A" && sentiment === "positiv" && rng() < 0.35) return "converted";
    return "appointment_booked";
  }

  // Strong lost signals
  if (sentiment === "negativ" && objections !== null && objections.length >= 2) return "lost";
  if (dropOff !== null && sentiment === "negativ") return "lost";

  // Grade-aware derivation for connected calls without appointment
  if (grade === "A") return rng() < 0.8 ? "qualified" : "contacted";

  if (grade === "B") {
    const r = rng();
    if (r < 0.35) return "qualified";
    if (r < 0.85) return "contacted";
    return objections !== null || dropOff !== null ? "lost" : "contacted";
  }

  // Grade C
  const r = rng();
  if (r < 0.45) return "contacted";
  if (r < 0.80) return "lost";
  return "qualified";
}

function sentimentToScore(sentiment: "positiv" | "neutral" | "negativ", rng: () => number): number {
  switch (sentiment) {
    case "positiv": return 0.67 + rng() * 0.33;
    case "neutral": return 0.33 + rng() * 0.34;
    case "negativ": return rng() * 0.33;
  }
}

// ---------- Date generation (7 days, evenly spread, weekday-weighted) ----------
function generateDates(rng: () => number, count: number): Date[] {
  const now = new Date();
  const days = 7;
  const dates: Date[] = [];
  // Distribute leads evenly across days using round-robin, then jitter
  for (let i = 0; i < count; i++) {
    const baseDaysAgo = i % days;
    // Small jitter: occasionally shift ±1 day for natural feel
    const jitter = rng() < 0.15 ? -1 : rng() < 0.15 ? 1 : 0;
    const daysAgo = Math.max(0, Math.min(days - 1, baseDaysAgo + jitter));
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    // Random time during business hours (8-18)
    date.setHours(8 + Math.floor(rng() * 10), Math.floor(rng() * 60), Math.floor(rng() * 60), 0);
    dates.push(date);
  }
  // Sort descending (newest first)
  dates.sort((a, b) => b.getTime() - a.getTime());
  return dates;
}

// ---------- Main generator ----------
export function generateMockLeads(): Lead[] {
  const rng = createRng(42);
  const totalLeads = 65;

  // Distribute grades: ~15 A, ~25 B, ~25 C
  const gradeAssignments: GradeSpec[] = [];
  for (let i = 0; i < 15; i++) gradeAssignments.push(GRADE_SPECS[0]); // A
  for (let i = 0; i < 25; i++) gradeAssignments.push(GRADE_SPECS[1]); // B
  for (let i = 0; i < 25; i++) gradeAssignments.push(GRADE_SPECS[2]); // C
  // Shuffle
  gradeAssignments.sort(() => rng() - 0.5);

  const dates = generateDates(rng, totalLeads);
  const leads: Lead[] = [];
  let transcriptIdx = 0;

  for (let i = 0; i < totalLeads; i++) {
    const spec = gradeAssignments[i];
    const id = uuid(rng);
    const callId = uuid(rng);
    const createdAt = dates[i];

    const firstName = pick(rng, FIRST_NAMES);
    const lastName = pick(rng, LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const company = pick(rng, COMPANIES);
    const emailDomain = pick(rng, EMAILS_DOMAINS);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[äöüß]/g, c => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" })[c] ?? c)}@${emailDomain}`;
    const phone = `+49 ${between(rng, 151, 179)} ${between(rng, 1000000, 9999999)}`;

    // Scores
    const scores = spec.scoreRanges.map(([lo, hi]) => between(rng, lo, hi));
    let totalScore = scores.reduce((a, b) => a + b, 0);

    // Ensure total_score matches grade range
    if (spec.grade === "A" && totalScore < 13) totalScore = 13;
    if (spec.grade === "B" && (totalScore < 9 || totalScore > 12)) {
      totalScore = between(rng, 9, 12);
    }
    if (spec.grade === "C" && totalScore > 8) totalScore = 8;

    // Recalculate individual scores to match total if needed
    const [s1, s2, s3, s4, s5] = scores;

    const sentiment = pickWeightedSentiment(rng, spec.sentimentWeights);
    const sentimentScore = Math.round(sentimentToScore(sentiment, rng) * 100) / 100;

    const isOutbound = rng() < 0.7;
    const callDirection = isOutbound ? "outbound" as const : "inbound" as const;
    const disposition = isOutbound
      ? weightedPick(rng, OUTBOUND_DISPOSITIONS)
      : weightedPick(rng, INBOUND_DISPOSITIONS);

    const callAttempts = isOutbound ? between(rng, 1, 5) : 1;
    const callDuration = disposition === "no_answer" || disposition === "busy" || disposition === "wrong_number"
      ? 0
      : between(rng, 120, 480);

    const isConnected = callDuration > 0 && disposition !== "gatekeeper" && disposition !== "not_interested";
    const hasAppointment = isConnected && rng() < spec.appointmentChance;
    const appointmentDatetime = hasAppointment
      ? (() => {
          const d = new Date();
          d.setDate(d.getDate() + between(rng, 1, 7));
          d.setHours(between(rng, 9, 17), rng() < 0.5 ? 0 : 30, 0, 0);
          return d.toISOString();
        })()
      : null;

    const objections = spec.grade === "A"
      ? (rng() < 0.3 ? pickN(rng, OBJECTIONS, 1, 1) : null)
      : spec.grade === "B"
        ? (rng() < 0.6 ? pickN(rng, OBJECTIONS, 1, 3) : null)
        : (rng() < 0.8 ? pickN(rng, OBJECTIONS, 2, 4) : null);

    const dropOff = spec.grade === "C"
      ? pick(rng, DROP_OFF_POINTS)
      : spec.grade === "B" && rng() < 0.3
        ? pick(rng, DROP_OFF_POINTS)
        : null;

    // Assign transcript to first 5 A/B leads that have call duration
    const hasTranscript = callDuration > 0 && transcriptIdx < SAMPLE_TRANSCRIPTS.length && (spec.grade === "A" || spec.grade === "B");
    const transcript = hasTranscript ? SAMPLE_TRANSCRIPTS[transcriptIdx] : null;
    if (hasTranscript) transcriptIdx++;

    const status = deriveStatus(
      rng, spec.grade, callDuration, disposition,
      hasAppointment, sentiment, objections, dropOff,
    );

    const callStartedAt = new Date(createdAt.getTime() - callDuration * 1000).toISOString();

    const lead: Lead = {
      id,
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
      caller_name: name,
      company,
      email,
      phone,
      company_size: pick(rng, COMPANY_SIZES),
      current_stack: pick(rng, CURRENT_STACKS),
      pain_point: pick(rng, PAIN_POINTS),
      timeline: pick(rng, TIMELINES),
      budget: pick(rng, ["€500+/Monat genehmigt", "Ca. €100/Monat geplant", "Noch kein Budget", "Enterprise-Budget vorhanden", "Wird noch intern geklärt"]),
      score_company_size: s1,
      score_tech_stack: s2,
      score_pain_point: s3,
      score_timeline: s4,
      score_budget: s5,
      score_engagement: null,
      total_score: totalScore,
      lead_grade: spec.grade,
      call_id: callId,
      call_duration_seconds: callDuration,
      transcript,
      conversation_summary: pick(rng, spec.summaries),
      sentiment,
      sentiment_score: sentimentScore,
      sentiment_reason: null,
      objections_raised: objections,
      drop_off_point: dropOff,
      appointment_booked: hasAppointment,
      appointment_datetime: appointmentDatetime,
      cal_booking_id: hasAppointment ? uuid(rng) : null,
      call_started_at: callStartedAt,
      is_decision_maker: spec.grade === "A" ? true : rng() < 0.4,
      status,
      next_steps: spec.grade !== "C" ? pickN(rng, [
        "Demo-Termin abwarten",
        "Infomaterial zusenden",
        "Follow-up in 1 Woche",
        "Technisches Gespräch planen",
        "Angebot erstellen",
        "Rückruf vereinbart",
      ], 1, 2) : null,
      notes: null,
      briefing: null,
      briefing_generated_at: null,
      assigned_to: null,
      campaign_id: null,
      call_direction: callDirection,
      disposition_code: disposition,
      call_attempts: callAttempts,
      last_call_attempt_at: createdAt.toISOString(),
      next_call_scheduled_at: null,
      voicemail_left: disposition === "voicemail",
      gatekeeper_name: disposition === "gatekeeper" ? pick(rng, FIRST_NAMES) + " (Empfang)" : null,
      callback_datetime: disposition === "callback"
        ? (() => {
            const d = new Date();
            d.setDate(d.getDate() + between(rng, 1, 5));
            d.setHours(between(rng, 9, 17), 0, 0, 0);
            return d.toISOString();
          })()
        : null,
      time_to_connect_seconds: callDuration > 0 ? between(rng, 5, 30) : null,
      is_dnc: disposition === "dnc_request",
      dnc_reason: disposition === "dnc_request" ? "Auf Wunsch des Kontakts" : null,
      recording_url: null,
      legal_basis: "Berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO)",
      lead_source: isOutbound ? "csv_import" : "inbound_call",
      follow_up_reason: null,
    };

    leads.push(lead);
  }

  return leads;
}
