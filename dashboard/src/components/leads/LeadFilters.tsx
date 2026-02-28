"use client";

import { X, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeadFilters as LeadFiltersType, Lead } from "@/lib/types";
import { STATUS_LABELS, SENTIMENT_LABELS } from "@/lib/types";

interface LeadFiltersProps {
  filters: LeadFiltersType;
  onChange: (filters: LeadFiltersType) => void;
  leadCount: number;
  className?: string;
}

const GRADE_OPTIONS: { value: "A" | "B" | "C"; color: string }[] = [
  { value: "A", color: "#42d77d" },
  { value: "B", color: "#f59e0b" },
  { value: "C", color: "#ef4444" },
];

const STATUS_OPTIONS: { value: Lead["status"]; label: string }[] = (
  Object.entries(STATUS_LABELS) as [Lead["status"], string][]
).map(([value, label]) => ({ value, label }));

const SENTIMENT_OPTIONS: { value: NonNullable<Lead["sentiment"]>; label: string }[] = (
  Object.entries(SENTIMENT_LABELS) as [NonNullable<Lead["sentiment"]>, string][]
).map(([value, label]) => ({ value, label }));

type DatePreset = "7d" | "30d" | "all";

function getDatePreset(filters: LeadFiltersType): DatePreset {
  if (!filters.dateRange.from) return "all";
  const from = new Date(filters.dateRange.from);
  const now = new Date();
  const diffDays = Math.round((now.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 8) return "7d";
  if (diffDays <= 31) return "30d";
  return "all";
}

function hasActiveFilters(filters: LeadFiltersType): boolean {
  return (
    filters.grades.length > 0 ||
    filters.statuses.length > 0 ||
    filters.sentiments.length > 0 ||
    filters.appointmentBooked !== null ||
    filters.dateRange.from !== null ||
    filters.dateRange.to !== null
  );
}

export default function LeadFilters({ filters, onChange, leadCount, className }: LeadFiltersProps) {
  const toggleGrade = (grade: "A" | "B" | "C") => {
    const grades = filters.grades.includes(grade)
      ? filters.grades.filter((g) => g !== grade)
      : [...filters.grades, grade];
    onChange({ ...filters, grades });
  };

  const setStatus = (status: string) => {
    const statuses = status === ""
      ? []
      : [status as Lead["status"]];
    onChange({ ...filters, statuses });
  };

  const setSentiment = (sentiment: string) => {
    const sentiments = sentiment === ""
      ? []
      : [sentiment as NonNullable<Lead["sentiment"]>];
    onChange({ ...filters, sentiments });
  };

  const toggleAppointment = () => {
    onChange({
      ...filters,
      appointmentBooked: filters.appointmentBooked === true ? null : true,
    });
  };

  const setDatePreset = (preset: DatePreset) => {
    if (preset === "all") {
      onChange({ ...filters, dateRange: { from: null, to: null } });
      return;
    }
    const now = new Date();
    const days = preset === "7d" ? 7 : 30;
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    onChange({
      ...filters,
      dateRange: { from: from.toISOString(), to: null },
    });
  };

  const resetFilters = () => {
    onChange({
      grades: [],
      statuses: [],
      sentiments: [],
      appointmentBooked: null,
      dateRange: { from: null, to: null },
    });
  };

  const activePreset = getDatePreset(filters);
  const selectClasses = cn(
    "bg-card border border-border rounded-lg",
    "px-3 py-2 text-sm text-foreground",
    "focus:outline-none focus:ring-2 focus:ring-ring/50",
    "cursor-pointer appearance-none"
  );

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Lead count badge */}
      <span className="text-sm font-medium text-muted-foreground shrink-0">
        {leadCount} Leads
      </span>

      {/* Grade toggles */}
      <div className="flex items-center gap-1">
        {GRADE_OPTIONS.map((opt) => {
          const active = filters.grades.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => toggleGrade(opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors duration-150",
                active
                  ? "border-transparent text-white"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              style={
                active
                  ? { backgroundColor: opt.color, color: "#ffffff" }
                  : undefined
              }
            >
              {opt.value}
            </button>
          );
        })}
      </div>

      {/* Status dropdown */}
      <select
        value={filters.statuses[0] ?? ""}
        onChange={(e) => setStatus(e.target.value)}
        className={selectClasses}
      >
        <option value="">Alle Status</option>
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Sentiment dropdown */}
      <select
        value={filters.sentiments[0] ?? ""}
        onChange={(e) => setSentiment(e.target.value)}
        className={selectClasses}
      >
        <option value="">Alle Sentiments</option>
        {SENTIMENT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Appointment toggle */}
      <button
        onClick={toggleAppointment}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-150",
          filters.appointmentBooked === true
            ? "bg-primary border-primary text-primary-foreground"
            : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <CalendarCheck size={14} />
        Nur mit Termin
      </button>

      {/* Date range presets */}
      <div className="flex items-center gap-1">
        {([
          { label: "7 Tage", value: "7d" as DatePreset },
          { label: "30 Tage", value: "30d" as DatePreset },
          { label: "Alle", value: "all" as DatePreset },
        ]).map((preset) => (
          <button
            key={preset.value}
            onClick={() => setDatePreset(preset.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-150",
              activePreset === preset.value
                ? "bg-primary border-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Reset filters */}
      {hasActiveFilters(filters) && (
        <button
          onClick={resetFilters}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors duration-150"
        >
          <X size={14} />
          Filter zurücksetzen
        </button>
      )}
    </div>
  );
}
