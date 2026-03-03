"use client";

import { useState } from "react";
import type { Lead } from "@/lib/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StatusTimelineProps {
  currentStatus: Lead["status"];
  onStatusChange: (status: Lead["status"]) => Promise<void>;
}

const MAIN_STATUSES: Lead["status"][] = [
  "new",
  "contacted",
  "qualified",
  "appointment_booked",
  "converted",
];

const ALL_STATUSES: Lead["status"][] = [
  "new",
  "not_reached",
  "contacted",
  "qualified",
  "appointment_booked",
  "converted",
  "lost",
];

export default function StatusTimeline({
  currentStatus,
  onStatusChange,
}: StatusTimelineProps) {
  const [isSaving, setIsSaving] = useState(false);

  const currentIndex = MAIN_STATUSES.indexOf(currentStatus);
  const isLost = currentStatus === "lost";
  const isNotReached = currentStatus === "not_reached";

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as Lead["status"];
    if (newStatus === currentStatus) return;
    setIsSaving(true);
    try {
      await onStatusChange(newStatus);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-sm overflow-visible">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold text-muted-foreground">
          Status & Verlauf
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Horizontal timeline */}
        <div className="mb-6 px-4">
          <div className="flex items-start justify-between relative mt-2">
            {/* Connecting line background */}
            <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-border/50 rounded-full" />
            {/* Connecting line active */}
            {!isLost && !isNotReached && currentIndex > 0 && (
              <div
                className="absolute top-3.5 left-4 h-0.5 bg-primary rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `calc(${((currentIndex) / (MAIN_STATUSES.length - 1)) * 100}% - ${currentIndex === MAIN_STATUSES.length - 1 ? 32 : 16}px)`,
                  backgroundColor: STATUS_COLORS[currentStatus]
                }}
              />
            )}

            {MAIN_STATUSES.map((status, idx) => {
              const isSideState = isLost || isNotReached;
              const isCompleted = !isSideState && currentIndex >= 0 && idx < currentIndex;
              const isCurrent = !isSideState && status === currentStatus;
              const isFuture = isSideState || currentIndex < 0 || idx > currentIndex;
              const color = STATUS_COLORS[status];

              return (
                <div
                  key={status}
                  className="flex flex-col items-center z-10 relative group"
                >
                  {/* Circle */}
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-sm",
                      isCurrent && "ring-4 ring-opacity-20",
                      isCurrent && "scale-110",
                      (!isCurrent && !isFuture) && "hover:scale-110"
                    )}
                    style={{
                      borderColor: isFuture ? "var(--border)" : color,
                      backgroundColor: isCompleted || isCurrent ? color : "var(--card)",
                      ...(isCurrent ? { "--tw-ring-color": color } : {})
                    } as React.CSSProperties}
                  >
                    {isCompleted && (
                      <Check size={14} className="text-white" strokeWidth={3} />
                    )}
                    {isCurrent && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                    )}
                  </div>
                  {/* Label */}
                  <span
                    className={cn(
                      "text-[11px] mt-2.5 text-center max-w-[70px] leading-tight transition-colors",
                      isCurrent
                        ? "font-bold text-foreground"
                        : isFuture
                          ? "text-muted-foreground/60 font-medium"
                          : "text-muted-foreground font-semibold"
                    )}
                    style={isCurrent ? { color } : undefined}
                  >
                    {STATUS_LABELS[status]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Side-state branches (lost / not_reached) */}
          {(isLost || isNotReached) && (
            <div className="flex flex-col items-center mt-6 relative mx-auto w-fit">
              <div className="absolute -top-6 left-1/2 w-0.5 h-6 bg-border/50 -translate-x-1/2" />
              <div
                className={cn(
                  "w-7 h-7 rounded-full border-2 flex items-center justify-center scale-110 ring-4 ring-opacity-20 shadow-sm"
                )}
                style={{
                  borderColor: STATUS_COLORS[currentStatus],
                  backgroundColor: STATUS_COLORS[currentStatus],
                  "--tw-ring-color": STATUS_COLORS[currentStatus]
                } as React.CSSProperties}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
              </div>
              <span
                className="text-[11px] mt-2.5 font-bold text-center"
                style={{ color: STATUS_COLORS[currentStatus] }}
              >
                {STATUS_LABELS[currentStatus]}
              </span>
            </div>
          )}
        </div>

        {/* Status dropdown */}
        <div className="pt-4 border-t border-border/40 mt-2">
          <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wider">
            Status manuell ändern
          </label>
          <div className="relative">
            <select
              value={currentStatus}
              onChange={handleStatusChange}
              disabled={isSaving}
              className="w-full bg-card/50 border border-border/80 rounded-xl px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50 appearance-none cursor-pointer hover:bg-card hover:border-border"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 1rem center",
                backgroundSize: "1rem",
              }}
            >
              {ALL_STATUSES.map((status) => (
                <option key={status} value={status} className="bg-card text-foreground">
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
