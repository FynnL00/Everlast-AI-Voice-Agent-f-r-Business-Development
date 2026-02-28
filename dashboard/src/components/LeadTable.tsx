"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Lead } from "@/lib/types";
import { formatDuration, formatDate, getGradeColor } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { StatusBadge } from "./ui/status-badge";

interface LeadTableProps {
  leads: Lead[];
}

export default function LeadTable({ leads }: LeadTableProps) {
  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-0.5 w-full h-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Letzte Calls</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto px-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Name</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Firma</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-medium">Score</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-medium">Dauer</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-medium">Termin</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Zeit</th>
                <th className="w-8 py-3 px-2" />
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="cursor-pointer hover:bg-muted/80 hover:-translate-y-0.5 border-b border-border/50 transition-all duration-200 group"
                >
                  <td className="py-4 px-2 font-medium">
                    <Link href={`/leads/${lead.id}`} className="hover:text-primary transition-colors">
                      {lead.caller_name || "Unbekannt"}
                    </Link>
                  </td>
                  <td className="py-4 px-2 text-muted-foreground">
                    {lead.company || "-"}
                  </td>
                  <td className="py-4 px-2 text-center">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shadow-sm"
                      style={{
                        backgroundColor: getGradeColor(lead.lead_grade) + "20",
                        color: getGradeColor(lead.lead_grade),
                        border: `1px solid ${getGradeColor(lead.lead_grade)}40`
                      }}
                    >
                      {lead.lead_grade || "-"}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-center text-muted-foreground">
                    {lead.call_duration_seconds
                      ? formatDuration(lead.call_duration_seconds)
                      : "-"}
                  </td>
                  <td className="py-4 px-2 text-center">
                    {lead.appointment_booked ? (
                      <Badge className="bg-score-good-bg text-score-good hover:bg-score-good-bg">Gebucht</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-4 px-2 text-right text-muted-foreground">
                    {formatDate(lead.created_at)}
                  </td>
                  <td className="py-4 px-2 text-right">
                    <Link href={`/leads/${lead.id}`} className="text-muted-foreground group-hover:text-primary transition-colors">
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-muted-foreground"
                  >
                    Noch keine Calls. Der Voice Agent wartet auf Anrufe...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
