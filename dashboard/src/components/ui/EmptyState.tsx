import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-6 text-center rounded-xl border border-dashed border-border/60", className)}>
      <div className="p-3 rounded-full bg-muted/50 mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">{title}</h3>
      {description && <p className="text-xs text-muted-foreground max-w-[280px]">{description}</p>}
      {action && <Button variant="outline" size="sm" className="mt-4" onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}

export default EmptyState;
