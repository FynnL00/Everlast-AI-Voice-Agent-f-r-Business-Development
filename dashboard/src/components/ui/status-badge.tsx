import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
    {
        variants: {
            status: {
                pending: "bg-status-pending/15 text-status-pending",
                discovered: "bg-status-pending/15 text-status-pending",
                crawling: "bg-status-crawling/15 text-status-crawling",
                analyzing: "bg-status-analyzing/15 text-status-analyzing",
                completed: "bg-status-completed/15 text-status-completed",
                error: "bg-status-error/15 text-status-error",
            },
        },
        defaultVariants: { status: "pending" },
    }
);

const statusLabels: Record<string, string> = {
    pending: "Ausstehend",
    discovered: "Entdeckt",
    crawling: "Crawling",
    analyzing: "Analyse",
    completed: "Abgeschlossen",
    error: "Fehler",
};

type StatusBadgeProps = React.ComponentProps<"span"> &
    VariantProps<typeof statusBadgeVariants>;

function StatusBadge({ status = "pending", className, children, ...props }: StatusBadgeProps) {
    const isPulsing = status === "crawling" || status === "analyzing";
    return (
        <span
            data-slot="status-badge"
            data-status={status}
            className={cn(statusBadgeVariants({ status, className }))}
            {...props}
        >
            <span
                className={cn(
                    "inline-block size-1.5 rounded-full bg-current",
                    isPulsing && "animate-pulse"
                )}
            />
            {children ?? statusLabels[status!]}
        </span>
    );
}

export { StatusBadge, statusBadgeVariants };
