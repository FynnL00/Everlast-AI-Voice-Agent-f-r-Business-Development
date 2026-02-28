"use client";

import { useState } from "react";
import type { Lead } from "@/lib/types";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";

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
    <Card>
      <h3 className="text-sm font-medium text-[var(--muted)] mb-4">Status</h3>

      {/* Horizontal timeline */}
      <div className="mb-4">
        <div className="flex items-center justify-between relative">
          {/* Connecting line */}
          <div className="absolute top-3 left-3 right-3 h-0.5 bg-[var(--card-border)]" />

          {MAIN_STATUSES.map((status, idx) => {
            const isCompleted = !isLost && currentIndex >= 0 && idx < currentIndex;
            const isCurrent = !isLost && status === currentStatus;
            const isFuture = isLost || currentIndex < 0 || idx > currentIndex;
            const color = STATUS_COLORS[status];

            return (
              <div
                key={status}
                className="flex flex-col items-center z-10 relative"
              >
                {/* Circle */}
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    isCurrent && "animate-pulse"
                  )}
                  style={{
                    borderColor: isFuture ? "var(--card-border)" : color,
                    backgroundColor: isCompleted || isCurrent ? color : "var(--card)",
                  }}
                >
                  {isCompleted && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      className="text-white"
                    >
                      <path
                        d="M2 5L4 7L8 3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                {/* Label */}
                <span
                  className={cn(
                    "text-[10px] mt-1.5 text-center max-w-[60px] leading-tight",
                    isCurrent
                      ? "font-medium"
                      : isFuture
                        ? "text-[var(--muted)]"
                        : "text-[var(--text-secondary)]"
                  )}
                  style={isCurrent ? { color } : undefined}
                >
                  {STATUS_LABELS[status]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Lost branch */}
        <div className="flex items-center mt-3 ml-[50%] -translate-x-1/2">
          <div
            className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center",
              isLost && "animate-pulse"
            )}
            style={{
              borderColor: isLost ? STATUS_COLORS.lost : "var(--card-border)",
              backgroundColor: isLost ? STATUS_COLORS.lost : "var(--card)",
            }}
          />
          <span
            className={cn(
              "text-[10px] ml-2",
              isLost ? "font-medium" : "text-[var(--muted)]"
            )}
            style={isLost ? { color: STATUS_COLORS.lost } : undefined}
          >
            {STATUS_LABELS.lost}
          </span>
        </div>
      </div>

      {/* Status dropdown */}
      <div className="pt-3 border-t border-[var(--card-border)]">
        <label className="text-xs text-[var(--muted)] block mb-1.5">
          Status aendern
        </label>
        <select
          value={currentStatus}
          onChange={handleStatusChange}
          disabled={isSaving}
          className="w-full bg-[var(--background)] border border-[var(--card-border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-50 appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235e6278' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.5rem center",
            backgroundSize: "1rem",
          }}
        >
          {ALL_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>
    </Card>
  );
}
