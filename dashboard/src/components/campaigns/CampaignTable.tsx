"use client";

import { useRouter } from "next/navigation";
import type { Campaign } from "@/lib/types";
import CampaignStatusBadge from "@/components/campaigns/CampaignStatusBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import { formatDate } from "@/lib/utils";

interface CampaignTableProps {
  campaigns: Campaign[];
}

export default function CampaignTable({ campaigns }: CampaignTableProps) {
  const router = useRouter();

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">Noch keine Kampagnen vorhanden</p>
        <p className="text-xs mt-1">Erstelle deine erste Kampagne, um loszulegen.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Name
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Status
            </th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Leads
            </th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Connection Rate
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[140px]">
              Fortschritt
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Erstellt
            </th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => {
            const connectionRate =
              campaign.leads_called > 0
                ? ((campaign.leads_connected / campaign.leads_called) * 100).toFixed(1)
                : "0.0";

            return (
              <tr
                key={campaign.id}
                onClick={() => router.push(`/campaigns/${campaign.id}`)}
                className="border-b border-border/30 hover:bg-sidebar-accent/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {campaign.name}
                  {campaign.description && (
                    <span className="block text-xs text-muted-foreground truncate max-w-[250px]">
                      {campaign.description}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <CampaignStatusBadge status={campaign.status} />
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-foreground">
                  {campaign.total_leads}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-foreground">
                  {connectionRate}%
                </td>
                <td className="px-4 py-3">
                  <ProgressBar
                    value={campaign.leads_called}
                    max={campaign.total_leads}
                    showPercentage={true}
                  />
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {formatDate(campaign.created_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
