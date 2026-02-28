"use client";

import { CalendarCheck, Calendar } from "lucide-react";
import Card from "@/components/ui/Card";
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
    <Card>
      <h3 className="text-sm font-medium text-[var(--muted)] mb-4">
        Termin
      </h3>

      {booked ? (
        <>
          {/* Green success banner */}
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 mb-3 text-sm font-medium bg-[var(--success)]/15 text-[var(--success)]">
            <CalendarCheck size={16} />
            Termin gebucht
          </div>

          {datetime && (
            <p className="text-sm text-[var(--foreground)] mb-1">
              {formatFullDate(datetime)}
            </p>
          )}

          {calBookingId && (
            <p className="text-xs text-[var(--muted)]">
              Booking-ID: {calBookingId}
            </p>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Calendar size={16} />
          Kein Termin gebucht
        </div>
      )}
    </Card>
  );
}
