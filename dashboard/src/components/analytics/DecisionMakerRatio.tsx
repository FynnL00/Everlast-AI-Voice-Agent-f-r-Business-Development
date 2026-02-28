"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import Card from "@/components/ui/Card";
import type { Lead } from "@/lib/types";

interface DecisionMakerRatioProps {
  leads: Lead[];
}

const COLORS = {
  decisionMaker: "#42d77d",
  nonDecisionMaker: "#5e6278",
};

export default function DecisionMakerRatio({ leads }: DecisionMakerRatioProps) {
  const { data, percentage } = useMemo(() => {
    const total = leads.length;
    const dm = leads.filter((l) => l.is_decision_maker === true).length;
    const nonDm = total - dm;
    const pct = total > 0 ? (dm / total) * 100 : 0;

    return {
      data: [
        { name: "Entscheider", value: dm },
        { name: "Nicht-Entscheider", value: nonDm },
      ],
      percentage: pct,
    };
  }, [leads]);

  const total = data[0].value + data[1].value;

  return (
    <Card>
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">
        Entscheider-Quote
      </h3>
      <div className="h-[260px] relative">
        {total === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--text-secondary)] text-sm">
            Keine Daten vorhanden
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                >
                  <Cell fill={COLORS.decisionMaker} />
                  <Cell fill={COLORS.nonDecisionMaker} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-[var(--foreground)]">
                {percentage.toFixed(0)}%
              </span>
              <span className="text-xs text-[var(--text-secondary)]">Entscheider</span>
            </div>
          </>
        )}
      </div>
      {/* Legend */}
      {total > 0 && (
        <div className="flex items-center justify-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: COLORS.decisionMaker }} />
            <span className="text-xs text-[var(--text-secondary)]">Entscheider ({data[0].value})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ background: COLORS.nonDecisionMaker }} />
            <span className="text-xs text-[var(--text-secondary)]">Andere ({data[1].value})</span>
          </div>
        </div>
      )}
    </Card>
  );
}
