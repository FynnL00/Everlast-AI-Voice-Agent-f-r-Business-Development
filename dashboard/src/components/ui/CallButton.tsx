"use client";

import { useState, useCallback } from "react";
import { PhoneOutgoing, Loader2, PhoneCall, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lead } from "@/lib/types";

type CallStatus = "idle" | "confirming" | "initiating" | "ringing" | "in_progress" | "completed" | "failed";

interface CallButtonProps {
  lead: Lead;
  size?: "sm" | "md" | "lg";
  variant?: "icon" | "full";
  onCallStarted?: (callId: string) => void;
}

export default function CallButton({
  lead,
  size = "md",
  variant = "icon",
  onCallStarted,
}: CallButtonProps) {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const disabled = lead.is_dnc || !lead.phone || status === "initiating" || status === "in_progress";

  const tooltip = lead.is_dnc
    ? "Lead ist auf DNC-Liste"
    : !lead.phone
      ? "Keine Telefonnummer"
      : status === "in_progress"
        ? "Anruf läuft"
        : "Anrufen";

  const handleClick = useCallback(() => {
    if (disabled) return;
    if (status === "idle" || status === "completed" || status === "failed") {
      setStatus("confirming");
      setError(null);
    }
  }, [disabled, status]);

  const handleConfirm = useCallback(async () => {
    setStatus("initiating");
    try {
      const res = await fetch("/api/calls/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Anruf fehlgeschlagen");
        setStatus("failed");
        setTimeout(() => setStatus("idle"), 5000);
        return;
      }

      const data = await res.json();
      setStatus("ringing");
      onCallStarted?.(data.callId);

      // Simulate progression (real updates come via Realtime)
      setTimeout(() => {
        setStatus((prev) => (prev === "ringing" ? "in_progress" : prev));
      }, 5000);
    } catch {
      setError("Netzwerkfehler");
      setStatus("failed");
      setTimeout(() => setStatus("idle"), 5000);
    }
  }, [lead.id, onCallStarted]);

  const handleCancel = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 min-w-[120px] px-4",
  };

  const iconSize = size === "sm" ? 14 : size === "md" ? 16 : 18;

  // Confirming state: show confirm/cancel
  if (status === "confirming") {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleConfirm}
          className="flex items-center gap-1.5 rounded-lg bg-green-500/15 text-green-500 border border-green-500/30 px-2.5 py-1 text-xs font-medium hover:bg-green-500/25 transition-colors"
        >
          <PhoneOutgoing size={14} />
          {lead.caller_name || lead.phone}
        </button>
        <button
          onClick={handleCancel}
          className="rounded-lg bg-muted/50 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  const statusConfig: Record<CallStatus, { icon: typeof PhoneOutgoing; color: string; animate?: string }> = {
    idle: { icon: PhoneOutgoing, color: "text-green-500 hover:bg-green-500/15 border-green-500/30" },
    confirming: { icon: PhoneOutgoing, color: "text-green-500" },
    initiating: { icon: Loader2, color: "text-muted-foreground bg-muted/30 border-muted", animate: "animate-spin" },
    ringing: { icon: PhoneCall, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30", animate: "animate-pulse" },
    in_progress: { icon: PhoneCall, color: "text-red-500 bg-red-500/10 border-red-500/30" },
    completed: { icon: Check, color: "text-green-500 bg-green-500/10 border-green-500/30" },
    failed: { icon: X, color: "text-red-500 bg-red-500/10 border-red-500/30" },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      title={error || tooltip}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border transition-all duration-200 gap-1.5 font-medium",
        disabled ? "opacity-40 cursor-not-allowed border-muted" : "cursor-pointer",
        variant === "icon" ? sizeClasses[size] : sizeClasses.lg,
        !disabled && config.color
      )}
    >
      <Icon size={iconSize} className={config.animate} />
      {variant === "full" && size === "lg" && (
        <span className="text-sm">
          {status === "idle" && "Anrufen"}
          {status === "initiating" && "Verbinde..."}
          {status === "ringing" && "Klingelt..."}
          {status === "in_progress" && "Aktiv"}
          {status === "completed" && "Beendet"}
          {status === "failed" && "Fehler"}
        </span>
      )}
    </button>
  );
}
