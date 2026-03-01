"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import type { Lead, TeamMember } from "@/lib/types";

interface TeamPerformanceChartProps {
  teamMembers: TeamMember[];
  leads: Lead[];
}

export default function TeamPerformanceChart({
  teamMembers,
  leads,
}: TeamPerformanceChartProps) {
  const data = useMemo(() => {
    return teamMembers
      .filter((m) => m.is_active)
      .map((member) => {
        const memberLeads = leads.filter((l) => l.assigned_to === member.id);
        const aLeads = memberLeads.filter((l) => l.lead_grade === "A").length;
        const converted = memberLeads.filter(
          (l) => l.status === "converted"
        ).length;
        const closedDeals = memberLeads.filter((l) =>
          ["converted", "lost"].includes(l.status)
        ).length;
        const winRate =
          closedDeals > 0 ? Math.round((converted / closedDeals) * 100) : 0;

        // Use first name for chart label
        const shortName = member.name.split(" ")[0];

        return {
          name: shortName,
          Leads: memberLeads.length,
          "A-Leads": aLeads,
          "Win Rate": winRate,
        };
      })
      .sort((a, b) => b.Leads - a.Leads);
  }, [teamMembers, leads]);

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Team-Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.5}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={false}
            />
            <YAxis
              yAxisId="count"
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="pct"
              orientation="right"
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [
                name === "Win Rate" ? `${value}%` : value,
                name,
              ]}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px" }}
            />
            <Bar
              yAxisId="count"
              dataKey="Leads"
              fill="var(--chart-1)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              yAxisId="count"
              dataKey="A-Leads"
              fill="var(--chart-2)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              yAxisId="pct"
              dataKey="Win Rate"
              fill="var(--chart-4)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
