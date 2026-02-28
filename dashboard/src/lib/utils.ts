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
  if (grade === "A") return "#22c55e"; // var(--score-good) roughly
  if (grade === "B") return "#f59e0b"; // var(--score-warning) roughly
  if (grade === "C") return "#ef4444"; // var(--score-danger) roughly
  return "#6b7280"; // var(--muted-foreground) roughly
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

export function getSentimentColor(sentiment: string | null | undefined): string {
  if (!sentiment) return "var(--muted-foreground)";
  const s = sentiment.trim().toLowerCase();
  if (s === "positive" || s === "positiv") return "var(--score-good)";
  if (s === "negative" || s === "negativ") return "var(--score-danger)";
  if (s === "neutral") return "var(--score-warning)";
  return "var(--muted-foreground)";
}
