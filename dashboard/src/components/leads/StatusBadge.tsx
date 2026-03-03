import Badge from "@/components/ui/Badge";
import { OUTBOUND_STATE_LABELS, OUTBOUND_STATE_COLORS } from "@/lib/types";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: "Neu", color: "var(--muted-foreground)" },
  contacted: { label: "Kontaktiert", color: "var(--chart-1)" },
  qualified: { label: "Qualifiziert", color: "var(--chart-5)" },
  appointment_booked: { label: "Termin gebucht", color: "var(--score-warning)" },
  converted: { label: "Konvertiert", color: "var(--score-good)" },
  lost: { label: "Verloren", color: "var(--score-danger)" },
};

interface StatusBadgeProps {
  status: string;
  outboundState?: string | null;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, outboundState, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  const obLabel = outboundState ? OUTBOUND_STATE_LABELS[outboundState as keyof typeof OUTBOUND_STATE_LABELS] : null;
  const obColor = outboundState ? OUTBOUND_STATE_COLORS[outboundState as keyof typeof OUTBOUND_STATE_COLORS] : null;

  return (
    <span className="inline-flex items-center gap-1.5">
      <Badge
        className={`px-2.5 py-0.5 rounded-full font-bold tracking-wide ring-1 ring-inset ${size === 'md' ? 'text-sm' : 'text-xs'}`}
        style={{
          backgroundColor: `${config.color}15`,
          color: config.color,
          borderColor: `${config.color}30`
        }}
      >
        {config.label}
      </Badge>
      {obLabel && obColor && (
        <Badge
          className="px-1.5 py-0.5 rounded-full font-medium tracking-wide ring-1 ring-inset text-[10px]"
          style={{
            backgroundColor: `${obColor}15`,
            color: obColor,
            borderColor: `${obColor}30`
          }}
        >
          {obLabel}
        </Badge>
      )}
    </span>
  );
}
