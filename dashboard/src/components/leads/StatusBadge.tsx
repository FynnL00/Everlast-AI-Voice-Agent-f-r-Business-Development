import Badge from "@/components/ui/Badge";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/types";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const label = STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? STATUS_LABELS.new;
  const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS] ?? STATUS_COLORS.new;

  return (
    <Badge
      className={`px-2.5 py-0.5 rounded-full font-bold tracking-wide ring-1 ring-inset ${size === 'md' ? 'text-sm' : 'text-xs'}`}
      style={{
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}30`
      }}
    >
      {label}
    </Badge>
  );
}
