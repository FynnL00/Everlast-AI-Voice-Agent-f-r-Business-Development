"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import type { AlertItem } from "@/lib/types";

interface RiskDonutChartProps {
  alerts: AlertItem[];
}

const RISK_CONFIG: Record<string, { label: string; color: string }> = {
  high: { label: "Hoch", color: "var(--score-danger)" },
  medium: { label: "Mittel", color: "var(--score-warning)" },
  low: { label: "Niedrig", color: "var(--chart-4)" },
};

export default function RiskDonutChart({ alerts }: RiskDonutChartProps) {
  const data = useMemo(() => {
    const counts: Record<string, number> = { high: 0, medium: 0, low: 0 };
    alerts.forEach((a) => {
      counts[a.riskLevel]++;
    });

    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([key, count]) => ({
        name: RISK_CONFIG[key].label,
        value: count,
        color: RISK_CONFIG[key].color,
      }));
  }, [alerts]);

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Risikoverteilung
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [`${value} Alerts`, name]}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
