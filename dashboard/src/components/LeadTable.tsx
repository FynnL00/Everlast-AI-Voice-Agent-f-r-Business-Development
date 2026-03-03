"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Lead } from "@/lib/types";
import { formatDuration, formatDate, getGradeColor } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Badge } from "./ui/Badge";


interface LeadTableProps {
  leads: Lead[];
}

export default function LeadTable({ leads }: LeadTableProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (open && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [open, leads]);

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-px w-full">
      <CardHeader
        className="!flex-row !items-center !justify-between !py-4 cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
      >
        <CardTitle className="text-base font-semibold">Letzte Calls</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">
            {leads.length} Call{leads.length !== 1 ? "s" : ""}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </CardHeader>
      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: open ? `${height}px` : "0px" }}
      >
        <div ref={contentRef}>
          <div className="border-t border-border" />
          <CardContent
            className="px-0 pb-4 pt-3"
            style={{ boxShadow: "inset 0 6px 10px -4px rgba(0,0,0,0.1), inset 6px 0 10px -4px rgba(0,0,0,0.06), inset -6px 0 10px -4px rgba(0,0,0,0.06), inset 0 -6px 10px -4px rgba(0,0,0,0.06)" }}
          >
            <div className="overflow-x-auto px-6">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
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
                      className="cursor-pointer even:bg-muted/20 hover:bg-muted/40 border-b border-border/50 transition-colors duration-150 group"
                      onClick={() => router.push(`/leads/${lead.id}`)}
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
        </div>
      </div>
    </Card>
  );
}
