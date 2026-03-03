"use client";

import type { Lead } from "@/lib/types";
import Dialog from "@/components/ui/dialog";
import { ShieldBan } from "lucide-react";

interface DNCConfirmDialogProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function DNCConfirmDialog({
  lead,
  open,
  onOpenChange,
  onConfirm,
}: DNCConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      title="Lead auf DNC-Liste setzen?"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
          <ShieldBan size={20} className="text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Dieser Lead wird nicht mehr angerufen
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Der Lead wird zur DNC-Liste (Do-Not-Call) hinzugefügt und
              automatisch von allen Kampagnen ausgeschlossen.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border p-3 space-y-1">
          <p className="text-sm font-medium text-foreground">
            {lead.caller_name || "Unbekannt"}
          </p>
          {lead.company && (
            <p className="text-xs text-muted-foreground">{lead.company}</p>
          )}
          {lead.phone && (
            <p className="text-xs text-muted-foreground font-mono">{lead.phone}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-border bg-card hover:bg-sidebar-accent transition-colors text-foreground"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-destructive text-white hover:bg-destructive/90 transition-colors"
          >
            Bestätigen
          </button>
        </div>
      </div>
    </Dialog>
  );
}
