import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  rightContent?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  rightContent,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 mb-6", className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0 hidden sm:block">
              <Icon size={24} />
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {Icon && <Icon size={24} className="sm:hidden text-primary shrink-0" />}
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {rightContent && (
          <div className="text-right flex flex-col items-end justify-center shrink-0">
            {rightContent}
          </div>
        )}
      </div>
      <div className="w-full h-px bg-border/60" />
    </div>
  );
}
