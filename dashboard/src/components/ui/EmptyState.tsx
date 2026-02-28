import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon size={48} className="text-[var(--muted)] mb-4" />
      <h3 className="text-lg font-medium text-[var(--text-secondary)] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--muted)] max-w-sm">{description}</p>
      )}
    </div>
  );
}
