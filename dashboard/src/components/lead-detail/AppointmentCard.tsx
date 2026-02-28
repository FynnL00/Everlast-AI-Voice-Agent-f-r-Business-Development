"use client";

import { CalendarCheck, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { formatFullDate } from "@/lib/utils";

interface AppointmentCardProps {
  booked: boolean;
  datetime: string | null;
  calBookingId: string | null;
}

export default function AppointmentCard({
  booked,
  datetime,
  calBookingId,
}: AppointmentCardProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground">
          Termin
        </CardTitle>
      </CardHeader>
      <CardContent>
        {booked ? (
          <div className="space-y-4">
            {/* Green success banner */}
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold bg-score-good-bg text-score-good border border-score-good/20 shadow-sm">
              <CalendarCheck size={18} className="shrink-0" />
              Termin erfolgreich gebucht
            </div>

            <div className="pl-2 border-l-2 border-score-good/30 space-y-1 py-1">
              {datetime && (
                <p className="text-base font-semibold text-foreground tracking-tight">
                  {formatFullDate(datetime)}
                </p>
              )}

              {calBookingId && (
                <p className="text-xs text-muted-foreground font-mono">
                  ID: {calBookingId}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-6 bg-muted/20 border border-dashed border-border/50 rounded-xl text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <Calendar size={24} className="opacity-50" />
              <span className="text-sm font-medium">Kein Termin gebucht</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
