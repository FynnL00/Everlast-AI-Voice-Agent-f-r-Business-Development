"use client";

import { cn } from "@/lib/utils";

interface AlertSeverityTabsProps {
  activeSeverity: string;
  onSeverityChange: (s: string) => void;
  counts: Record<string, number>;
}

const TABS = [
  { key: "all", label: "Alle" },
  { key: "high", label: "Hoch" },
  { key: "medium", label: "Mittel" },
  { key: "low", label: "Niedrig" },
];

export default function AlertSeverityTabs({
  activeSeverity,
  onSeverityChange,
  counts,
}: AlertSeverityTabsProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg bg-sidebar-accent/30 p-1 border border-border w-fit">
      {TABS.map((tab) => {
        const isActive = activeSeverity === tab.key;
        const count = counts[tab.key] ?? 0;
        return (
          <button
            key={tab.key}
            onClick={() => onSeverityChange(tab.key)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              isActive
                ? "bg-sidebar-accent text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
            )}
          >
            {tab.label} ({count})
          </button>
        );
      })}
    </div>
  );
}
