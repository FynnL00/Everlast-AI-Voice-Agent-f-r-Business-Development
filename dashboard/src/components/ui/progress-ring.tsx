import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressRingProps extends React.SVGAttributes<SVGSVGElement> {
    value: number;       // 0-100
    size?: number;       // px diameter (default: 80)
    strokeWidth?: number; // (default: 6)
    label?: string;
}

const ProgressRing = React.forwardRef<SVGSVGElement, ProgressRingProps>(
    ({ value, size = 80, strokeWidth = 6, label, className, ...props }, ref) => {
        const clamped = Math.max(0, Math.min(100, value));
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (clamped / 100) * circumference;

        const colorClass =
            clamped >= 70 ? "text-status-completed"
                : clamped >= 40 ? "text-status-analyzing"
                    : "text-status-error";

        return (
            <div className="inline-flex flex-col items-center gap-1">
                <svg ref={ref} data-slot="progress-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={cn(colorClass, className)} {...props}>
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="opacity-20" />
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-[stroke-dashoffset] duration-500 ease-out" style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }} />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="currentColor" className="text-sm font-semibold" style={{ fontSize: size * 0.22 }}>{Math.round(clamped)}%</text>
                </svg>
                {label && <span className="text-muted-foreground text-xs">{label}</span>}
            </div>
        );
    }
);
ProgressRing.displayName = "ProgressRing";

export { ProgressRing };
