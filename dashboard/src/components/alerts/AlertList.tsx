"use client";

import type { AlertItem } from "@/lib/types";
import AlertCard from "./AlertCard";

interface AlertListProps {
  alerts: AlertItem[];
}

export default function AlertList({ alerts }: AlertListProps) {
  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <AlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  );
}
