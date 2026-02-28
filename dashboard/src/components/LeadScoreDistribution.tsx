"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/Card";
import { Custom3DBar } from "@/components/dashboard/Custom3DBar";

interface LeadScoreDistributionProps {
  data: { grade: string; count: number; color: string }[];
}

export default function LeadScoreDistribution({
  data,
}: LeadScoreDistributionProps) {
  // Map provided colors conceptually or just use standard chart tokens:
  // Since grade has a specific color semantics we keep the prop, but format it carefully.
  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5 w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Lead-Score Verteilung</CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 60, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="grade"
                stroke="var(--muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={15}
                height={60}
              />
              <YAxis hide stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
                  color: "var(--foreground)"
                }}
                itemStyle={{ color: "var(--foreground)" }}
                cursor={{ fill: "transparent" }}
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-border/50 bg-background/95 backdrop-blur-md shadow-xl p-3 text-xs pointer-events-none">
                        <p className="font-medium mb-2 text-foreground">{d.grade}</p>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-muted-foreground">Anzahl:</span>
                          <span className="font-bold text-foreground">{d.count}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" shape={<Custom3DBar />} cursor="pointer">
                <LabelList
                  dataKey="count"
                  position="top"
                  offset={30}
                  fill="var(--foreground)"
                  fontSize={16}
                  fontWeight="bold"
                />
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
