import Badge from "@/components/ui/Badge";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: "Neu", color: "#5e6278" },
  contacted: { label: "Kontaktiert", color: "#3b82f6" },
  qualified: { label: "Qualifiziert", color: "#8b5cf6" },
  appointment_booked: { label: "Termin gebucht", color: "#f59e0b" },
  converted: { label: "Konvertiert", color: "#42d77d" },
  lost: { label: "Verloren", color: "#ef4444" },
};

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return <Badge label={config.label} color={config.color} size={size} />;
}
