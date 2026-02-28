import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6",
        hover && "transition-colors duration-150 hover:bg-[var(--card-hover)]",
        className
      )}
    >
      {children}
    </div>
  );
}
