import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  /** Accent color — renders as a subtle left border */
  accentColor?: string;
}

export default function Card({
  children,
  className,
  hover = false,
  accentColor,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-[var(--card)] border border-[var(--card-border)] p-6 shadow-[var(--card-shadow)]",
        "transition-shadow duration-200",
        hover && "hover:shadow-[var(--card-shadow-hover)]",
        className
      )}
      style={accentColor ? { borderLeft: `3px solid ${accentColor}` } : undefined}
    >
      {children}
    </div>
  );
}
