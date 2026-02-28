"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Kanban, BarChart3, Menu, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Uebersicht", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/analytics", label: "Analytik", icon: BarChart3 },
];

interface SidebarProps {
  isLive?: boolean;
}

export default function Sidebar({ isLive = false }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-6">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-6 rounded-full bg-[var(--accent)]" />
          <span className="text-base font-semibold tracking-tight">
            n8n Voice Agent
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150",
                    active
                      ? "bg-white/5 text-white border-l-[3px] border-[var(--accent)] pl-[9px]"
                      : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Live indicator */}
      <div className="px-5 py-4 border-t border-[var(--card-border)]">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "w-2 h-2 rounded-full shrink-0",
              isLive ? "bg-[var(--success)] animate-pulse" : "bg-[var(--muted)]"
            )}
          />
          <span className="text-xs text-[var(--text-secondary)]">
            {isLive ? "Live" : "Offline"}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-[var(--text-secondary)] hover:text-white transition-colors duration-150"
        aria-label="Menue oeffnen"
      >
        <Menu size={20} />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col bg-[#151845] border-r border-[var(--card-border)] z-40">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setMobileOpen(false);
            }}
            role="button"
            tabIndex={0}
            aria-label="Menue schliessen"
          />
          {/* Slide-in panel */}
          <aside className="absolute inset-y-0 left-0 w-60 flex flex-col bg-[#151845] border-r border-[var(--card-border)] shadow-2xl">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-white transition-colors duration-150"
              aria-label="Menue schliessen"
            >
              <X size={18} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
