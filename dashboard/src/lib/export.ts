import type { Lead } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function exportLeadsCSV(leads: Lead[]) {
  const headers = [
    "Name",
    "Firma",
    "Score",
    "Grade",
    "Status",
    "Sentiment",
    "Termin",
    "Datum",
  ];
  const rows = leads.map((l) => [
    l.caller_name ?? "",
    l.company ?? "",
    String(l.total_score ?? ""),
    l.lead_grade ?? "",
    l.status,
    l.sentiment ?? "",
    l.appointment_booked ? "Ja" : "Nein",
    l.created_at ? formatDate(l.created_at) : "",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
