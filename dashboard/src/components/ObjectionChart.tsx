"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";

interface ObjectionChartProps {
  data: { objection: string; count: number }[];
}

export default function ObjectionChart({ data }: ObjectionChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  // We use the chart tokens from our CSS system
  const getChartColor = (idx: number) => `var(--chart-${(idx % 5) + 1})`;

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-0.5 w-full h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Top Einwände</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-2">
          {data.map((item, i) => {
            const pct = total > 0 ? (item.count / total) * 100 : 0;
            return (
              <div key={item.objection}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-foreground">{item.objection}</span>
                  <span className="text-muted-foreground font-mono text-xs">{pct.toFixed(0)}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden flex">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.max(pct, 2)}%`,
                      backgroundColor: getChartColor(i),
                    }}
                  />
                </div>
              </div>
            );
          })}
          {data.length === 0 && (
            <p className="text-muted-foreground text-sm py-8 text-center">Noch keine Daten vorhanden</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
