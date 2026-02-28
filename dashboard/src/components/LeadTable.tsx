"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Lead } from "@/lib/types";
import { formatDuration, formatDate, getGradeColor } from "@/lib/utils";

interface LeadTableProps {
  leads: Lead[];
}

export default function LeadTable({ leads }: LeadTableProps) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-[var(--card-shadow)]">
      <h3 className="text-sm font-medium text-[var(--muted)] mb-4">
        Letzte Calls
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--card-border)]">
              <th className="text-left py-3 px-2 text-[var(--muted)] font-medium">
                Name
              </th>
              <th className="text-left py-3 px-2 text-[var(--muted)] font-medium">
                Firma
              </th>
              <th className="text-center py-3 px-2 text-[var(--muted)] font-medium">
                Score
              </th>
              <th className="text-center py-3 px-2 text-[var(--muted)] font-medium">
                Dauer
              </th>
              <th className="text-center py-3 px-2 text-[var(--muted)] font-medium">
                Termin
              </th>
              <th className="text-right py-3 px-2 text-[var(--muted)] font-medium">
                Zeit
              </th>
              <th className="w-8 py-3 px-2" />
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-[var(--card-border)] last:border-0 hover:bg-gray-50 transition-colors group"
              >
                <td className="py-3 px-2 font-medium">
                  <Link href={`/leads/${lead.id}`} className="hover:text-[var(--accent)] transition-colors">
                    {lead.caller_name || "Unbekannt"}
                  </Link>
                </td>
                <td className="py-3 px-2 text-[var(--muted)]">
                  {lead.company || "-"}
                </td>
                <td className="py-3 px-2 text-center">
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                    style={{
                      backgroundColor: getGradeColor(lead.lead_grade) + "20",
                      color: getGradeColor(lead.lead_grade),
                    }}
                  >
                    {lead.lead_grade || "-"}
                  </span>
                </td>
                <td className="py-3 px-2 text-center text-[var(--muted)]">
                  {lead.call_duration_seconds
                    ? formatDuration(lead.call_duration_seconds)
                    : "-"}
                </td>
                <td className="py-3 px-2 text-center">
                  {lead.appointment_booked ? (
                    <span className="text-[var(--success)]">Gebucht</span>
                  ) : (
                    <span className="text-[var(--muted)]">-</span>
                  )}
                </td>
                <td className="py-3 px-2 text-right text-[var(--muted)]">
                  {formatDate(lead.created_at)}
                </td>
                <td className="py-3 px-2 text-right">
                  <Link href={`/leads/${lead.id}`} className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors">
                    <ChevronRight size={16} />
                  </Link>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-[var(--muted)]"
                >
                  Noch keine Calls. Der Voice Agent wartet auf Anrufe...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
