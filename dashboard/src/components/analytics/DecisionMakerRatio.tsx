"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import type { Lead } from "@/lib/types";

interface DecisionMakerRatioProps {
  leads: Lead[];
}

export default function DecisionMakerRatio({ leads }: DecisionMakerRatioProps) {
  const { data, percentage } = useMemo(() => {
    const total = leads.length;
    const dm = leads.filter((l) => l.is_decision_maker === true).length;
    const nonDm = total - dm;
    const pct = total > 0 ? (dm / total) * 100 : 0;

    return {
      data: [
        { name: "Entscheider", value: dm, color: "var(--chart-4)" },
        { name: "Nicht-Entscheider", value: nonDm, color: "var(--muted)" },
      ],
      percentage: pct,
    };
  }, [leads]);

  const total = data[0].value + data[1].value;

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-0.5 w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Entscheider-Quote</CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="h-[280px] relative">
          {total === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Keine Daten vorhanden
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={90}
                    dataKey="value"
                    stroke="none"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {data.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-10%]">
                <span className="text-3xl font-bold text-foreground">
                  {percentage.toFixed(0)}%
                </span>
                <span className="text-xs text-muted-foreground mt-1">Entscheider</span>
              </div>
            </>
          )}
        </div>
        {/* Legend */}
        {total > 0 && (
          <div className="flex items-center justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: data[0].color }} />
              <span className="text-xs text-muted-foreground font-medium">Entscheider ({data[0].value})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: data[1].color }} />
              <span className="text-xs text-muted-foreground font-medium">Andere ({data[1].value})</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
