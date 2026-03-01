"use client";

import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface CalendarEvent {
  id: string;
  title: string;
  datetime: string;
  grade: string | null;
  assignedTo: string | null;
}

interface AppointmentCalendarProps {
  events: CalendarEvent[];
}

function getGradeStyle(grade: string | null): {
  bg: string;
  border: string;
  text: string;
} {
  if (grade === "A")
    return {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-700 dark:text-emerald-400",
    };
  if (grade === "B")
    return {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-700 dark:text-amber-400",
    };
  return {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-700 dark:text-red-400",
  };
}

const HOURS = Array.from({ length: 21 }, (_, i) => 8 * 60 + i * 30);

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

function getWeekDays(): { date: Date; label: string; key: string; isToday: boolean }[] {
  const now = new Date();
  const berlin = new Date(
    now.toLocaleString("en-US", { timeZone: "Europe/Berlin" })
  );
  const dayOfWeek = berlin.getDay();
  const monday = new Date(berlin);
  monday.setDate(berlin.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const todayStr = berlin.toISOString().slice(0, 10);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    return {
      date: d,
      label: d.toLocaleDateString("de-DE", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        timeZone: "Europe/Berlin",
      }),
      key,
      isToday: key === todayStr,
    };
  });
}

export default function AppointmentCalendar({
  events,
}: AppointmentCalendarProps) {
  const weekDays = useMemo(() => getWeekDays(), []);

  const eventsByDay = useMemo(() => {
    const map = new Map<
      string,
      (CalendarEvent & { minuteOfDay: number })[]
    >();
    events.forEach((ev) => {
      const d = new Date(ev.datetime);
      const berlinStr = d.toLocaleDateString("en-CA", {
        timeZone: "Europe/Berlin",
      });
      const berlinTime = new Date(
        d.toLocaleString("en-US", { timeZone: "Europe/Berlin" })
      );
      const minuteOfDay =
        berlinTime.getHours() * 60 + berlinTime.getMinutes();
      if (!map.has(berlinStr)) map.set(berlinStr, []);
      map.get(berlinStr)!.push({ ...ev, minuteOfDay });
    });
    return map;
  }, [events]);

  const totalThisWeek = useMemo(() => {
    const keys = new Set(weekDays.map((d) => d.key));
    return events.filter((ev) => {
      const d = new Date(ev.datetime);
      const berlinStr = d.toLocaleDateString("en-CA", {
        timeZone: "Europe/Berlin",
      });
      return keys.has(berlinStr);
    }).length;
  }, [events, weekDays]);

  return (
    <Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-0.5 w-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">
          Termine diese Woche
        </CardTitle>
        <span className="text-xs text-muted-foreground font-medium">
          {totalThisWeek} Termin{totalThisWeek !== 1 ? "e" : ""}
        </span>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="overflow-x-auto -mx-2 px-2">
          <div
            className="grid min-w-[700px]"
            style={{
              gridTemplateColumns: "60px repeat(7, 1fr)",
              gridTemplateRows: `auto repeat(${HOURS.length}, 28px)`,
            }}
          >
            {/* Header row */}
            <div className="sticky top-0 z-10" />
            {weekDays.map((day) => (
              <div
                key={day.key}
                className={`text-center text-[11px] font-semibold py-1.5 border-b border-border sticky top-0 z-10 ${
                  day.isToday
                    ? "text-primary bg-primary/5 rounded-t-lg"
                    : "text-muted-foreground"
                }`}
              >
                {day.label}
              </div>
            ))}

            {/* Time slots */}
            {HOURS.map((minutes, rowIdx) => (
              <>
                <div
                  key={`time-${minutes}`}
                  className="text-[10px] text-muted-foreground font-mono pr-2 text-right leading-[28px] border-r border-border"
                  style={{ gridRow: rowIdx + 2 }}
                >
                  {minutes % 60 === 0 ? formatTime(minutes) : ""}
                </div>
                {weekDays.map((day, colIdx) => {
                  const dayEvents = eventsByDay.get(day.key) ?? [];
                  const slotEvents = dayEvents.filter(
                    (ev) =>
                      ev.minuteOfDay >= minutes &&
                      ev.minuteOfDay < minutes + 30
                  );
                  return (
                    <div
                      key={`${day.key}-${minutes}`}
                      className={`relative border-b border-r border-border/50 ${
                        day.isToday ? "bg-primary/[0.02]" : ""
                      } ${minutes % 60 === 0 ? "border-b-border" : ""}`}
                      style={{
                        gridRow: rowIdx + 2,
                        gridColumn: colIdx + 2,
                      }}
                    >
                      {slotEvents.map((ev) => {
                        const style = getGradeStyle(ev.grade);
                        return (
                          <a
                            key={ev.id}
                            href={`/leads/${ev.id}`}
                            className={`absolute inset-x-0.5 top-0.5 bottom-0.5 rounded-md px-1 text-[9px] leading-tight truncate border ${style.bg} ${style.border} ${style.text} hover:opacity-80 transition-opacity flex items-center cursor-pointer`}
                            title={ev.title}
                          >
                            <span className="truncate">{ev.title}</span>
                          </a>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
