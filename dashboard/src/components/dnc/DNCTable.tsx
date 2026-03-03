"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { Trash2, Loader2 } from "lucide-react";

interface DNCEntry {
  id: string;
  created_at: string;
  phone: string | null;
  email: string | null;
  reason: string;
  notes: string | null;
  is_active: boolean;
}

interface DNCTableProps {
  entries: DNCEntry[];
  onRemoved: (id: string) => void;
}

const REASON_LABELS: Record<string, string> = {
  manual: "Manuell",
  ai_detected: "KI-erkannt",
  customer_request: "Kundenanfrage",
  legal: "Rechtlich",
  wrong_number: "Falsche Nr.",
  competitor: "Wettbewerber",
};

const REASON_COLORS: Record<string, string> = {
  manual: "var(--chart-1)",
  ai_detected: "var(--chart-5)",
  customer_request: "var(--score-warning)",
  legal: "var(--destructive)",
  wrong_number: "var(--muted-foreground)",
  competitor: "var(--chart-3)",
};

export type { DNCEntry };

export default function DNCTable({ entries, onRemoved }: DNCTableProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    const { error } = await supabase
      .from("dnc_list")
      .update({ is_active: false })
      .eq("id", id);
    if (!error) {
      onRemoved(id);
    }
    setRemovingId(null);
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">Keine DNC-Einträge vorhanden</p>
        <p className="text-xs mt-1">Die DNC-Liste ist aktuell leer.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Telefon
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              E-Mail
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Grund
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Hinzugefügt am
            </th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Aktionen
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const reasonLabel = REASON_LABELS[entry.reason] || entry.reason;
            const reasonColor = REASON_COLORS[entry.reason] || "var(--muted-foreground)";

            return (
              <tr
                key={entry.id}
                className="border-b border-border/30 hover:bg-sidebar-accent/50 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-foreground text-xs">
                  {entry.phone || "-"}
                </td>
                <td className="px-4 py-3 text-foreground">
                  {entry.email || "-"}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    className="px-2.5 py-0.5 rounded-full font-bold tracking-wide ring-1 ring-inset text-xs"
                    style={{
                      backgroundColor: `${reasonColor}15`,
                      color: reasonColor,
                      borderColor: `${reasonColor}30`,
                    }}
                  >
                    {reasonLabel}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {formatDate(entry.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleRemove(entry.id)}
                    disabled={removingId === entry.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                    title="Von DNC-Liste entfernen"
                  >
                    {removingId === entry.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                    Entfernen
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
