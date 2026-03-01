"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useAlerts } from "@/lib/hooks/useAlerts";
import type { Lead } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AlertBannerProps {
  leads: Lead[];
}

export default function AlertBanner({ leads }: AlertBannerProps) {
  const alerts = useAlerts(leads);
  const [expanded, setExpanded] = useState(false);

  const criticalAlerts = alerts.filter((a) => a.riskLevel === "high");
  if (criticalAlerts.length === 0) return null;

  const topAlerts = criticalAlerts.slice(0, 3);

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/50 dark:bg-red-950/10 dark:border-red-900/30 backdrop-blur-md overflow-hidden transition-all duration-300">
      {/* Compact row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-red-50/80 dark:hover:bg-red-950/20 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <AlertTriangle size={16} className="text-red-500 shrink-0" />
          <span className="text-sm font-semibold text-red-700 dark:text-red-400">
            {criticalAlerts.length} kritische {criticalAlerts.length === 1 ? "Warnung" : "Warnungen"}
          </span>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-red-500" />
        ) : (
          <ChevronDown size={16} className="text-red-500" />
        )}
      </button>

      {/* Expanded content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          expanded ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pb-3 space-y-2 border-t border-red-200 dark:border-red-900/30 pt-2">
          {topAlerts.map((alert) => (
            <Link
              key={alert.id}
              href={`/leads/${alert.lead.id}`}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-red-100/50 dark:hover:bg-red-950/20 transition-colors group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {alert.lead.caller_name ?? "Unbekannt"}
                </span>
                {alert.lead.company && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {alert.lead.company}
                  </span>
                )}
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {alert.reasons.join(" · ")}
                </p>
              </div>
            </Link>
          ))}
          {criticalAlerts.length > 3 && (
            <Link
              href="/alerts"
              className="block text-xs text-red-600 dark:text-red-400 font-medium px-2 py-1 hover:underline"
            >
              Alle {criticalAlerts.length} Warnungen anzeigen
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
