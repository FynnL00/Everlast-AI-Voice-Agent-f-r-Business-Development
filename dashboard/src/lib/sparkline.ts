import type { Lead } from "@/lib/types";

const berlinFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Berlin",
});

export function toBerlinDate(iso: string): string {
  return berlinFormatter.format(new Date(iso));
}

export function computeSparklineData(
  leads: Lead[],
  metric: (dayLeads: Lead[]) => number,
  days: number = 7
): number[] {
  const leadsByDate = new Map<string, Lead[]>();
  leads.forEach((l) => {
    const key = toBerlinDate(l.created_at);
    if (!leadsByDate.has(key)) leadsByDate.set(key, []);
    leadsByDate.get(key)!.push(l);
  });

  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    const key = toBerlinDate(d.toISOString());
    return metric(leadsByDate.get(key) ?? []);
  });
}
