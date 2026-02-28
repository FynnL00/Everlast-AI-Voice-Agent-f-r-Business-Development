import { cn } from "@/lib/utils";

interface BadgeProps {
  label: string;
  color: string;
  size?: "sm" | "md";
  className?: string;
}

export default function Badge({ label, color, size = "sm", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      {label}
    </span>
  );
}
