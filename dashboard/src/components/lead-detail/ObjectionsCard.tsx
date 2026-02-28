"use client";

import Card from "@/components/ui/Card";

interface ObjectionsCardProps {
  objections: string[] | null;
  dropOffPoint: string | null;
}

const TAG_COLORS = [
  "var(--accent)",
  "var(--danger)",
  "var(--warning)",
  "var(--info)",
  "#8b5cf6",
];

export default function ObjectionsCard({
  objections,
  dropOffPoint,
}: ObjectionsCardProps) {
  const hasObjections = objections && objections.length > 0;

  return (
    <Card>
      <h3 className="text-sm font-medium text-[var(--muted)] mb-4">
        Einwaende
      </h3>

      {hasObjections ? (
        <div className="flex flex-wrap gap-2 mb-3">
          {objections.map((objection, idx) => {
            const color = TAG_COLORS[idx % TAG_COLORS.length];
            return (
              <span
                key={idx}
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: `${color}18`,
                  color: color,
                }}
              >
                {objection}
              </span>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)] italic mb-3">
          Keine Einwaende erhoben
        </p>
      )}

      {dropOffPoint && (
        <p className="text-xs text-[var(--text-secondary)] mt-2">
          Abbruch bei: <span className="font-medium">{dropOffPoint}</span>
        </p>
      )}
    </Card>
  );
}
