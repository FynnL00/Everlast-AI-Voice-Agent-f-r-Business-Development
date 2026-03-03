import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDate(dateString: string): string {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  });
}

export function getGradeColor(grade: string | null | undefined): string {
  if (grade === "A") return "var(--score-good)";
  if (grade === "B") return "var(--score-warning)";
  if (grade === "C") return "var(--score-danger)";
  return "var(--muted-foreground)";
}

export function formatFullDate(dateString: string): string {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  });
}

const OBJECTION_SYNONYM_MAP: Record<string, string> = {
  "kein budget": "Kein Budget",
  "zu teuer": "Kein Budget",
  "kosten zu hoch": "Kein Budget",
  "budget nicht vorhanden": "Kein Budget",
  "preislich schwierig": "Kein Budget",
  "keine zeit": "Keine Zeit",
  "gerade nicht": "Keine Zeit",
  "passt zeitlich nicht": "Keine Zeit",
  "nutze bereits zapier": "Nutze bereits Zapier",
  "nutze zapier": "Nutze bereits Zapier",
  "kosten für zapier sind zu hoch": "Nutze bereits Zapier",
  "nutze make": "Nutze bereits Zapier",
  "nutze integromat": "Nutze bereits Zapier",
  "nutze bereits make": "Nutze bereits Zapier",
  "lohnt sich der wechsel?": "Nutze bereits Zapier",
  "lohnt sich der wechsel": "Nutze bereits Zapier",
  "muss team fragen": "Muss Team fragen",
  "muss chef fragen": "Muss Team fragen",
  "brauche genehmigung": "Muss Team fragen",
  "muss intern abstimmen": "Muss Team fragen",
  "nicht der entscheider": "Muss Team fragen",
  "it muss zustimmen": "Muss Team fragen",
  "zu komplex": "Zu komplex",
  "zu kompliziert": "Zu komplex",
  "zu aufwändig": "Zu komplex",
  "sorge um die umstellung": "Zu komplex",
  "ist für einmannbetrieb oversized": "Zu komplex",
  "kein konkreter bedarf": "Kein konkreter Bedarf",
  "kein bedarf aktuell": "Kein konkreter Bedarf",
  "kein bedarf": "Kein konkreter Bedarf",
  "brauche ich gerade nicht": "Kein konkreter Bedarf",
  "datenschutzbedenken": "Datenschutzbedenken",
  "datenschutz": "Datenschutzbedenken",
  "dsgvo-bedenken": "Datenschutzbedenken",
  "vertrag mit wettbewerber": "Vertrag mit Wettbewerber",
  "brauche mehr infos": "Brauche mehr Infos",
  "kein klarer termin vereinbart": "Keine Zeit",
};

export function normalizeObjection(obj: string): string {
  const trimmed = obj.trim().replace(/\s+/g, " ");
  if (!trimmed) return trimmed;
  const lower = trimmed.toLowerCase();

  const exact = OBJECTION_SYNONYM_MAP[lower];
  if (exact) return exact;

  for (const [key, canonical] of Object.entries(OBJECTION_SYNONYM_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return canonical;
  }

  return lower.replace(/(?:^|\s)\S/g, c => c.toUpperCase());
}

export const DROP_OFF_PHASE_LABELS: Record<string, string> = {
  OPENING: "Begrüßung",
  DISCOVERY: "Bedarfsermittlung",
  QUALIFICATION: "Qualifizierung",
  DEMO_OFFER: "Demo-Angebot",
  CLOSING: "Abschluss",
  PAIN_VALIDATION: "Bedarfsermittlung",
  SOLUTION: "Demo-Angebot",
};

export function getDropOffPhaseLabel(phase: string): string {
  return DROP_OFF_PHASE_LABELS[phase] || phase;
}

export function getSentimentColor(sentiment: string | null | undefined): string {
  if (!sentiment) return "var(--muted-foreground)";
  const s = sentiment.trim().toLowerCase();
  if (s === "positiv") return "var(--score-good)";
  if (s === "negativ") return "var(--score-danger)";
  if (s === "neutral") return "var(--score-warning)";
  return "var(--muted-foreground)";
}

export function getSentimentScoreColor(score: number): string {
  if (score >= 0.67) return "var(--score-good)";
  if (score <= 0.33) return "var(--score-danger)";
  return "var(--score-warning)";
}
