"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { getDropOffPhaseLabel } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface ObjectionsCardProps {
  objections: string[] | null;
  dropOffPoint: string | null;
}

const TAG_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export default function ObjectionsCard({
  objections,
  dropOffPoint,
}: ObjectionsCardProps) {
  const hasObjections = objections && objections.length > 0;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          <span>Einwände</span>
          {(hasObjections || dropOffPoint) && (
            <AlertTriangle size={14} className="text-amber-500" />
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4">
        {hasObjections ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {objections.map((objection, idx) => {
              const color = TAG_COLORS[idx % TAG_COLORS.length];
              return (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-md px-3 py-1.5 text-xs font-bold ring-1 ring-inset shadow-sm transition-all hover:brightness-110"
                  style={{
                    backgroundColor: `${color}15`,
                    color: color,
                    borderColor: `${color}30`,
                  }}
                >
                  {objection}
                </span>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center mb-4 p-4 bg-score-good-bg rounded-xl border border-score-good/20">
            <span className="text-sm font-medium text-score-good">
              Keine Einwände erhoben
            </span>
          </div>
        )}

        {dropOffPoint && (
          <div className="mt-2 p-3 bg-red-500/10 rounded-xl border border-red-500/20 flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-red-500 uppercase tracking-wider">
              Abbruchpunkt
            </span>
            <span className="text-sm font-medium text-red-400">
              {getDropOffPhaseLabel(dropOffPoint)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
