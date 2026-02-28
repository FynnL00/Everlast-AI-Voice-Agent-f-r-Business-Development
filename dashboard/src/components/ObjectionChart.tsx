"use client";

interface ObjectionChartProps {
  data: { objection: string; count: number }[];
}

export default function ObjectionChart({ data }: ObjectionChartProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const colors = ["#8b5cf6", "#ff6d5a", "#f59e0b", "#22c55e", "#06b6d4"];

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-[var(--card-shadow)]">
      <h3 className="text-sm font-medium text-[var(--muted)] mb-4">
        Top Einwände
      </h3>
      <div className="space-y-3">
        {data.map((item, i) => {
          const pct = total > 0 ? (item.count / total) * 100 : 0;
          return (
            <div key={item.objection}>
              <div className="flex justify-between text-sm mb-1">
                <span>{item.objection}</span>
                <span className="text-[var(--muted)]">{pct.toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: colors[i % colors.length],
                  }}
                />
              </div>
            </div>
          );
        })}
        {data.length === 0 && (
          <p className="text-[var(--muted)] text-sm">Noch keine Daten</p>
        )}
      </div>
    </div>
  );
}
