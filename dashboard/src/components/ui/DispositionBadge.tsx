import Badge from "@/components/ui/Badge";
import { DISPOSITION_LABELS, DISPOSITION_COLORS, type DispositionCode } from "@/lib/types";

interface DispositionBadgeProps {
  disposition: DispositionCode;
  size?: "sm" | "md";
}

export default function DispositionBadge({ disposition, size = "sm" }: DispositionBadgeProps) {
  const label = DISPOSITION_LABELS[disposition] || disposition;
  const color = DISPOSITION_COLORS[disposition] || "var(--muted-foreground)";

  return (
    <Badge
      className={`px-2.5 py-0.5 rounded-full font-bold tracking-wide ring-1 ring-inset ${size === "md" ? "text-sm" : "text-xs"}`}
      style={{
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}30`,
      }}
    >
      {label}
    </Badge>
  );
}
