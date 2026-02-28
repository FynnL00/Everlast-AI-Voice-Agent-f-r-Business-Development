"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function LeadSearch({ value, onChange, className }: LeadSearchProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Leads durchsuchen..."
        className={cn(
          "w-full bg-card border border-border rounded-lg",
          "pl-10 pr-4 py-2.5 text-sm text-foreground",
          "placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring/50",
          "transition-colors duration-150"
        )}
      />
    </div>
  );
}
