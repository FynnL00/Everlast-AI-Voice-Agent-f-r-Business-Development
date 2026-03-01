import Badge from "@/components/ui/Badge";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: "Neu", color: "var(--muted-foreground)" },
  contacted: { label: "Kontaktiert", color: "var(--chart-1)" },
  qualified: { label: "Qualifiziert", color: "var(--chart-5)" },
  appointment_booked: { label: "Termin gebucht", color: "var(--score-warning)" },
  converted: { label: "Konvertiert", color: "var(--score-good)" },
  lost: { label: "Verloren", color: "var(--score-danger)" },
  not_reached: { label: "Nicht erreicht", color: "var(--chart-3)" },
  rejected: { label: "Abgelehnt", color: "var(--destructive)" },
};

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return (
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
  );
}
