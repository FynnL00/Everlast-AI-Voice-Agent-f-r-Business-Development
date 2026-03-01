"use client";

import { useState, useMemo } from "react";
import { Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { normalizeObjection } from "@/lib/utils";
import type { Lead } from "@/lib/types";

interface ObjectionCounterArgumentsProps {
  leads: Lead[];
}

interface CounterArgument {
  objection: string;
  response: string;
}

const COUNTER_ARGUMENTS: CounterArgument[] = [
  {
    objection: "Kein Budget",
    response:
      "Fragen Sie nach dem ROI: \"Wie viel Zeit verbringt Ihr Team aktuell mit manuellen Prozessen? n8n kann diese Zeit um 80% reduzieren.\"",
  },
  {
    objection: "Keine Zeit",
    response:
      "Betonen Sie den schnellen Start: \"Die meisten Teams sind in unter einer Woche produktiv. Wir begleiten Sie beim Onboarding.\"",
  },
  {
    objection: "Nutze bereits Zapier",
    response:
      "Heben Sie Vorteile hervor: \"n8n bietet Self-Hosting, keine Datenlimits und komplexere Workflows bei niedrigeren Kosten.\"",
  },
  {
    objection: "Muss Team fragen",
    response:
      "Bieten Sie Unterstützung: \"Gerne bereite ich eine Zusammenfassung für Ihr Team vor. Wann wäre ein gemeinsamer Termin möglich?\"",
  },
  {
    objection: "Zu komplex",
    response:
      "Zeigen Sie Einfachheit: \"Unsere visuelle Oberfläche macht Automatisierung zugänglich \u2013 ohne Programmierkenntnisse.\"",
  },
];

export default function ObjectionCounterArguments({ leads }: ObjectionCounterArgumentsProps) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set([0]));

  const objectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      if (l.objections_raised) {
        l.objections_raised.forEach((obj) => {
          const normalized = normalizeObjection(obj);
          if (normalized) {
            counts[normalized] = (counts[normalized] || 0) + 1;
          }
        });
      }
    });
    return counts;
  }, [leads]);

  const toggleIndex = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-0.5 w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-400" />
          <CardTitle className="text-base font-semibold">Gegenargumente</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="space-y-2">
          {COUNTER_ARGUMENTS.map((item, index) => {
            const isOpen = openIndices.has(index);
            const count = objectionCounts[item.objection] || 0;

            return (
              <div
                key={item.objection}
                className="border border-border rounded-xl overflow-hidden transition-colors hover:border-foreground/20"
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(index)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-sidebar-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-semibold text-sm text-foreground">{item.objection}</span>
                    {count > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                        {count}x
                      </span>
                    )}
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.response}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
