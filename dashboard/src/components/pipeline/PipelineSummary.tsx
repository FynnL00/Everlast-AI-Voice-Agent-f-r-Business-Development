"use client";

import { useMemo, useState } from "react";
import { useLeads } from "@/lib/leads-context";
import type { Lead } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

const FUNNEL_STAGES: Lead["status"][] = [
  "new",
  "not_reached",
  "contacted",
  "qualified",
  "appointment_booked",
  "converted",
  "lost",
];

const GRADIENTS = [
  { from: "#475569", to: "#94a3b8" },   // new - slate
  { from: "#ea580c", to: "#fb923c" },   // not_reached - orange
  { from: "#4f46e5", to: "#818cf8" },   // contacted - indigo
  { from: "#9333ea", to: "#c084fc" },   // qualified - purple
  { from: "#d97706", to: "#fbbf24" },   // appointment_booked - amber
  { from: "#16a34a", to: "#4ade80" },   // converted - green
  { from: "#dc2626", to: "#f87171" },   // lost - red
];

export default function PipelineSummary() {
  const { filteredLeads } = useLeads();
  const [hovered, setHovered] = useState<number | null>(null);

  const stages = useMemo(() => {
    const counts: Record<Lead["status"], number> = {
      new: 0,
      not_reached: 0,
      contacted: 0,
      qualified: 0,
      appointment_booked: 0,
      converted: 0,
      lost: 0,
    };
    for (const lead of filteredLeads) counts[lead.status]++;

    const n = FUNNEL_STAGES.length;
    const minH = 0.18;

    return FUNNEL_STAGES.map((status, i) => {
      const count = counts[status];
      const next = i < n - 1 ? counts[FUNNEL_STAGES[i + 1]] : 0;

      // Fixed taper: always decreases left-to-right for funnel shape
      const leftH = 1 - (i / n) * (1 - minH);
      const rightH = 1 - ((i + 1) / n) * (1 - minH);

      return {
        label: STATUS_LABELS[status],
        count,
        leftH,
        rightH,
        conv:
          i < n - 1 && count > 0
            ? Math.round((next / count) * 100)
            : null,
      };
    });
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
        <CardDescription>Leads nach Pipeline-Status</CardDescription>
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

      </CardContent>
    </Card>
  );
}
