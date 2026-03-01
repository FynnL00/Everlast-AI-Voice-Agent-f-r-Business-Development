export function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div
      className="w-full rounded-2xl bg-sidebar-accent/30 border border-border animate-pulse"
      style={{ height }}
    />
  );
}
