"use client";

import { useState, useRef, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  /** Accent color — border glow + subtle inner gradient (hex color) */
  accentColor?: string;
}

export default function Card({
  children,
  className,
  hover = false,
  accentColor,
}: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [glow, setGlow] = useState({ x: 50, y: 50, active: false });

  const handleMove = (e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setGlow({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      active: true,
    });
  };

  const handleLeave = () => setGlow((g) => ({ ...g, active: false }));

  const glowColor = accentColor ?? "#8b8fa3";

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn(
        "relative overflow-hidden rounded-xl bg-[var(--card)] p-6",
        "transition-all duration-200",
        !accentColor && "border border-[var(--card-border)]",
        hover && "hover:bg-[var(--card-hover)]",
        className
      )}
      style={{
        ...(accentColor
          ? {
              border: `1px solid ${accentColor}${glow.active ? "60" : "40"}`,
            }
          : {}),
        boxShadow: glow.active
          ? `0 0 20px ${glowColor}15, inset 0 0 30px ${glowColor}08, var(--card-shadow)`
          : accentColor
            ? `inset 0 0 20px ${accentColor}08, var(--card-shadow)`
            : "var(--card-shadow)",
        transform: glow.active ? "translateY(-1px)" : "translateY(0)",
      }}
    >
      {/* Mouse-follow glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
        style={{
          opacity: glow.active ? 1 : 0,
          background: `radial-gradient(circle 180px at ${glow.x}% ${glow.y}%, ${glowColor}12, transparent)`,
        }}
      />

      {/* Static left accent gradient */}
      {accentColor && (
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-10 transition-opacity duration-200"
          style={{
            background: `linear-gradient(to right, ${accentColor}15, transparent)`,
            opacity: glow.active ? 0.6 : 1,
          }}
        />
      )}

      <div className="relative">{children}</div>
    </div>
  );
}
