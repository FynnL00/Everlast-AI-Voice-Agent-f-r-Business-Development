import Badge from "@/components/ui/Badge";
import { CAMPAIGN_STATUS_LABELS, CAMPAIGN_STATUS_COLORS, type CampaignStatus } from "@/lib/types";

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
  size?: "sm" | "md";
}

export default function CampaignStatusBadge({ status, size = "sm" }: CampaignStatusBadgeProps) {
  const label = CAMPAIGN_STATUS_LABELS[status] || status;
  const color = CAMPAIGN_STATUS_COLORS[status] || "var(--muted-foreground)";

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
