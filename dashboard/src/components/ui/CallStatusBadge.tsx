import { Loader2, PhoneCall, Check, X } from "lucide-react";
import Badge from "@/components/ui/Badge";

type CallStatus = "idle" | "initiating" | "ringing" | "in_progress" | "completed" | "failed";

interface CallStatusBadgeProps {
  status: CallStatus;
  duration?: number;
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const STATUS_CONFIG: Record<CallStatus, { label: string; color: string; icon: typeof PhoneCall; animate?: string }> = {
  idle: { label: "", color: "var(--muted-foreground)", icon: PhoneCall },
  initiating: { label: "Verbinde...", color: "var(--muted-foreground)", icon: Loader2, animate: "animate-spin" },
  ringing: { label: "Klingelt...", color: "var(--score-warning)", icon: PhoneCall, animate: "animate-pulse" },
  in_progress: { label: "Aktiv", color: "var(--score-danger)", icon: PhoneCall },
  completed: { label: "Beendet", color: "var(--score-good)", icon: Check },
  failed: { label: "Fehler", color: "var(--destructive)", icon: X },
};

export default function CallStatusBadge({ status, duration }: CallStatusBadgeProps) {
  if (status === "idle") return null;

  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const label = status === "in_progress" && duration != null
    ? `Aktiv ${formatTimer(duration)}`
    : config.label;

  return (
    <Badge
      className="px-2.5 py-0.5 rounded-full font-bold tracking-wide ring-1 ring-inset text-xs inline-flex items-center gap-1.5"
      style={{
        backgroundColor: `${config.color}15`,
        color: config.color,
        borderColor: `${config.color}30`,
      }}
    >
      <Icon size={12} className={config.animate} />
      {label}
    </Badge>
  );
}
