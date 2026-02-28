import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getGradeColor(grade: string | null): string {
  switch (grade) {
    case "A":
      return "#42d77d";
    case "B":
      return "#f59e0b";
    case "C":
      return "#ef4444";
    default:
      return "#5e6278";
  }
}

export function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Berlin",
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: "#5e6278",
    contacted: "#3b82f6",
    qualified: "#8b5cf6",
    appointment_booked: "#f59e0b",
    converted: "#42d77d",
    lost: "#ef4444",
  };
  return colors[status] || "#5e6278";
}

export function getSentimentColor(sentiment: string | null): string {
  if (sentiment === "positiv") return "#42d77d";
  if (sentiment === "negativ") return "#ef4444";
  return "#f59e0b";
}

export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
