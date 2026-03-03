"use client";

import { useMemo, useState } from "react";
import { useLeads } from "@/lib/leads-context";
import type { Lead } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { TrendingDown, PhoneOff, XCircle } from "lucide-react";

const FUNNEL_STAGES: Lead["status"][] = [
  "new",
  "contacted",
  "qualified",
  "appointment_booked",
  "converted",
];

const GRADIENTS = [
  { from: "#475569", to: "#94a3b8" },
  { from: "#4f46e5", to: "#818cf8" },
  { from: "#9333ea", to: "#c084fc" },
  { from: "#d97706", to: "#fbbf24" },
  { from: "#16a34a", to: "#4ade80" },
];

export default function PipelineSummary() {
  const { filteredLeads } = useLeads();
  const [hovered, setHovered] = useState<number | null>(null);

  const { stages, lostCount, notReachedCount, rejectedCount } = useMemo(() => {
    const counts: Record<Lead["status"], number> = {
      new: 0,
      contacted: 0,
      qualified: 0,
      appointment_booked: 0,
      converted: 0,
      lost: 0,
      not_reached: 0,
      rejected: 0,
      queued: 0,
      attempting: 0,
      exhausted: 0,
      callback_scheduled: 0,
      dnc: 0,
    };
    for (const lead of filteredLeads) counts[lead.status]++;

    const cumulative: number[] = [];
    let sum = 0;
    for (let i = FUNNEL_STAGES.length - 1; i >= 0; i--) {
      sum += counts[FUNNEL_STAGES[i]];
      cumulative[i] = sum;
    }

    const max = cumulative[0] || 1;

    return {
      stages: FUNNEL_STAGES.map((status, i) => {
        const left = cumulative[i] / max;
        const right =
          i < FUNNEL_STAGES.length - 1
            ? cumulative[i + 1] / max
            : left * 0.5;

        return {
          label: STATUS_LABELS[status],
          count: cumulative[i],
          leftH: Math.max(left, 0.15),
          rightH: Math.max(right, 0.08),
          conv:
            i < FUNNEL_STAGES.length - 1 && cumulative[i] > 0
              ? Math.round((cumulative[i + 1] / cumulative[i]) * 100)
              : null,
        };
      }),
      lostCount: counts.lost,
      notReachedCount: counts.not_reached,
      rejectedCount: counts.rejected,
    };
  }, [filteredLeads]);

  if (filteredLeads.length === 0) return null;

  const W = 960;
  const H = 280;
  const fTop = 48;
  const fBot = H - 36;
  const ch = fBot - fTop;
  const cy = fTop + ch / 2;
  const padX = 14;
  const cw = W - padX * 2;
  const sw = cw / stages.length;
  const gap = 4;

  return (
    <Card className="mb-6 w-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">Funnel-Übersicht</CardTitle>
        <CardDescription>Kumulierte Pipeline-Stufen</CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full h-auto select-none"
            role="img"
            aria-label="Pipeline-Funnel"
          >
            <defs>
              {GRADIENTS.map(({ from, to }, i) => (
                <linearGradient
                  key={i}
                  id={`fg${i}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0.2"
                >
                  <stop offset="0%" stopColor={from} />
                  <stop offset="100%" stopColor={to} />
                </linearGradient>
              ))}
              <filter id="fsh">
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="3"
                  floodColor="#000"
                  floodOpacity="0.15"
                />
              </filter>
            </defs>

            <style>
              {`@keyframes fReveal{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}@keyframes fFade{from{opacity:0}}`}
            </style>

            {stages.map(({ label, count, leftH, rightH, conv }, i) => {
              const x0 = padX + i * sw + gap / 2;
              const x1 = padX + (i + 1) * sw - gap / 2;
              const hL = (ch / 2) * leftH;
              const hR = (ch / 2) * rightH;
              const mx = (x0 + x1) / 2;
              const d = i * 0.1;
              const isH = hovered === i;
              const minH = Math.min(hL, hR) * 2;
              const fontSize = minH < 30 ? 12 : minH < 50 ? 15 : 20;

              return (
                <g
                  key={i}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    cursor: "pointer",
                    opacity: isH ? 1 : 0.92,
                    transition: "opacity 0.2s, filter 0.25s",
                    filter: isH
                      ? `drop-shadow(0 0 14px ${GRADIENTS[i].to}55)`
                      : "none",
                  }}
                >
                  {/* Stage label above funnel */}
                  <text
                    x={mx}
                    y={fTop - 14}
                    textAnchor="middle"
                    fontSize="11.5"
                    fontWeight="600"
                    style={{
                      fill: "currentColor",
                      opacity: isH ? 0.9 : 0.5,
                      transition: "opacity 0.2s",
                      animation: `fFade 0.3s ease-out ${d + 0.4}s backwards`,
                    }}
                  >
                    {label}
                  </text>

                  {/* Trapezoid shape */}
                  <polygon
                    points={`${x0},${cy - hL} ${x1},${cy - hR} ${x1},${cy + hR} ${x0},${cy + hL}`}
                    fill={`url(#fg${i})`}
                    filter="url(#fsh)"
                    style={{
                      animation: `fReveal 0.65s cubic-bezier(0.16,1,0.3,1) ${d}s both`,
                    }}
                  />

                  {/* Count centered in trapezoid */}
                  <text
                    x={mx}
                    y={cy + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#fff"
                    fontSize={fontSize}
                    fontWeight="700"
                    style={{
                      animation: `fFade 0.35s ease-out ${d + 0.3}s backwards`,
                    }}
                  >
                    {count}
                  </text>

                  {/* Conversion rate at stage boundary */}
                  {conv !== null && (
                    <text
                      x={x1}
                      y={fBot + 22}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="600"
                      style={{
                        fill: "currentColor",
                        opacity: 0.35,
                        animation: `fFade 0.3s ease-out ${d + 0.55}s backwards`,
                      }}
                    >
                      {"\u2192"} {conv}%
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {(lostCount > 0 || notReachedCount > 0 || rejectedCount > 0) && (
          <div className="flex items-center gap-4 mt-2 pt-4 border-t border-border/50 flex-wrap">
            {lostCount > 0 && (
              <>
                <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground text-right">
                  Verloren
                </span>
                <div className="flex items-center gap-2.5 bg-red-500/10 px-3 py-1.5 rounded-md border border-red-500/20">
                  <TrendingDown size={14} className="text-red-400" />
                  <span className="text-sm font-bold text-red-400">
                    {lostCount}
                  </span>
                  {filteredLeads.length > 0 && (
                    <span className="text-xs font-medium text-red-400/70 ml-1">
                      ({Math.round((lostCount / filteredLeads.length) * 100)}%
                      Verlustrate)
                    </span>
                  )}
                </div>
              </>
            )}
            {notReachedCount > 0 && (
              <>
                <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground text-right">
                  Nicht erreicht
                </span>
                <div className="flex items-center gap-2.5 bg-orange-500/10 px-3 py-1.5 rounded-md border border-orange-500/20">
                  <PhoneOff size={14} className="text-orange-400" />
                  <span className="text-sm font-bold text-orange-400">
                    {notReachedCount}
                  </span>
                </div>
              </>
            )}
            {rejectedCount > 0 && (
              <>
                <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground text-right">
                  Abgelehnt
                </span>
                <div className="flex items-center gap-2.5 bg-red-500/10 px-3 py-1.5 rounded-md border border-red-500/20">
                  <XCircle size={14} className="text-red-400" />
                  <span className="text-sm font-bold text-red-400">
                    {rejectedCount}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
