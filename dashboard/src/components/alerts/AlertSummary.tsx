"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import type { AlertItem } from "@/lib/types";

interface AlertSummaryProps {
  alerts: AlertItem[];
}

export default function AlertSummary({ alerts }: AlertSummaryProps) {
  const counts = useMemo(() => {
    const high = alerts.filter((a) => a.riskLevel === "high").length;
    const medium = alerts.filter((a) => a.riskLevel === "medium").length;
    const low = alerts.filter((a) => a.riskLevel === "low").length;
    return { high, medium, low, total: alerts.length };
  }, [alerts]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-muted-foreground font-medium">
        {counts.total} {counts.total === 1 ? "Alert" : "Alerts"} insgesamt
      </span>
      <div className="flex items-center gap-2">
        <Badge className="bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/10">
          {counts.high} Hoch
        </Badge>
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/10">
          {counts.medium} Mittel
        </Badge>
        <Badge className="bg-gray-500/10 text-gray-600 border-gray-200 hover:bg-gray-500/10">
          {counts.low} Niedrig
        </Badge>
      </div>
    </div>
  );
}
