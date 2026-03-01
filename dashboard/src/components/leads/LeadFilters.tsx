"use client";

import { X, CalendarCheck, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeadFilters as LeadFiltersType, Lead } from "@/lib/types";
import { STATUS_LABELS, SENTIMENT_LABELS } from "@/lib/types";
import { useTeam } from "@/lib/team-context";
import { AnimatePresence, motion } from "framer-motion";

interface LeadFiltersProps {
  filters: LeadFiltersType;
  onChange: (filters: LeadFiltersType) => void;
  open: boolean;
  className?: string;
}

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
    filters.statuses.length > 0 ||
    filters.sentiments.length > 0 ||
    filters.appointmentBooked !== null ||
    filters.assignedTo !== null ||
    filters.dateRange.from !== null ||
    filters.dateRange.to !== null
  );
}

function toDateInputValue(isoString: string | null): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toISOString().slice(0, 10);
}

export default function LeadFilters({ filters, onChange, open, className }: LeadFiltersProps) {
  const { teamMembers } = useTeam();

  const customDateFrom = toDateInputValue(filters.dateRange.from);
  const customDateTo = toDateInputValue(filters.dateRange.to);
  const isCustomDateRange = filters.dateRange.to !== null;

  const handleCustomDateChange = (from: string, to: string) => {
    onChange({
      ...filters,
      dateRange: {
        from: from ? new Date(from + "T00:00:00").toISOString() : null,
        to: to ? new Date(to + "T23:59:59").toISOString() : null,
      },
    });
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
      grades: filters.grades, // Keep grades (they're in the toolbar)
      statuses: [],
      sentiments: [],
      appointmentBooked: null,
      assignedTo: null,
      dateRange: { from: null, to: null },
    });
  };

  const activePreset = getDatePreset(filters);

  const selectClasses = cn(
    "w-full bg-card border border-border rounded-lg",
    "pl-3 pr-8 py-2 text-sm text-foreground",
    "focus:outline-none focus:ring-2 focus:ring-ring/50",
    "cursor-pointer appearance-none"
  );

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={cn("overflow-hidden", className)}
        >
          <div className="bg-card/40 backdrop-blur-sm border border-border rounded-xl p-4 space-y-4">
            {/* Row 1: Dropdowns in grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <div className="relative">
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
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Sentiment */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Sentiment</label>
                <div className="relative">
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
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Team */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Team</label>
                <div className="relative">
                  <select
                    value={filters.assignedTo ?? ""}
                    onChange={(e) => onChange({ ...filters, assignedTo: e.target.value || null })}
                    className={selectClasses}
                  >
                    <option value="">Alle Mitarbeiter</option>
                    {teamMembers.filter((m) => m.is_active).map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Date Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Zeitraum</label>
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
                        "flex-1 px-2 py-2 rounded-lg text-xs font-medium border transition-colors duration-150",
                        activePreset === preset.value && !isCustomDateRange
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Appointment toggle + Date range + Reset */}
            <div className="flex flex-wrap items-center gap-3">
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

              {/* Custom date range */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-muted-foreground font-medium shrink-0">Von</label>
                <input
                  type="date"
                  value={customDateFrom}
                  onChange={(e) => handleCustomDateChange(e.target.value, customDateTo)}
                  className={cn(
                    "bg-card border border-border rounded-lg px-2 py-1.5 text-xs text-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring/50",
                    "w-[130px]"
                  )}
                />
                <label className="text-xs text-muted-foreground font-medium shrink-0">Bis</label>
                <input
                  type="date"
                  value={customDateTo}
                  onChange={(e) => handleCustomDateChange(customDateFrom, e.target.value)}
                  className={cn(
                    "bg-card border border-border rounded-lg px-2 py-1.5 text-xs text-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring/50",
                    "w-[130px]"
                  )}
                />
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Reset */}
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
