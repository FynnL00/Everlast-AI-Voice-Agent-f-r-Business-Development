"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Kanban,
  BarChart3,
  Menu,
  X,
  Search,
  User,
  ChevronRight,
  Command,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "ÜBERSICHT",
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "DATEN",
    items: [
      { href: "/leads", label: "Leads", icon: Users },
      { href: "/pipeline", label: "Pipeline", icon: Kanban },
    ],
  },
  {
    label: "ANALYSE",
    items: [{ href: "/analytics", label: "Analytik", icon: BarChart3 }],
  },
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
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">n8n</span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[var(--foreground)] truncate">
              n8n Voice Agent
            </div>
            <div className="text-xs text-[var(--muted)] truncate">
              Sales Dashboard
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />
          <input
            type="text"
            placeholder="Suche..."
            className="w-full pl-9 pr-12 py-2 text-sm rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-colors"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[var(--muted)]">
            <Command size={11} />
            <span className="text-[10px] font-medium">K</span>
          </div>
        </div>
      </div>

      {/* Navigation sections */}
      <nav className="flex-1 px-3 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-4">
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)] px-3 mb-1.5">
              {section.label}
            </span>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150",
                        active
                          ? "bg-[var(--accent)] text-white font-medium shadow-sm"
                          : "text-[var(--muted)] hover:bg-gray-100 hover:text-[var(--foreground)]"
                      )}
                    >
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-4 pb-4 space-y-3">
        {/* Live indicator */}
        <div className="flex items-center gap-2 px-1">
          <span
            className={cn(
              "w-2 h-2 rounded-full shrink-0",
              isLive ? "bg-[var(--success)] animate-pulse" : "bg-[var(--muted)]"
            )}
          />
          <span className="text-xs text-[var(--muted)]">
            {isLive ? "Live" : "Offline"}
          </span>
        </div>

        {/* User section */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[var(--background)] cursor-default">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
            <User size={14} className="text-[var(--accent)]" />
          </div>
          <span className="text-sm font-medium text-[var(--foreground)] flex-1">
            Mein Konto
          </span>
          <ChevronRight size={14} className="text-[var(--muted)]" />
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
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-white border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)] shadow-sm transition-colors duration-150"
        aria-label="Menü öffnen"
      >
        <Menu size={20} />
      </button>

      {/* Desktop sidebar - floating */}
      <aside className="hidden md:flex fixed inset-y-3 left-3 w-60 flex-col bg-white rounded-2xl shadow-lg z-40">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setMobileOpen(false);
            }}
            role="button"
            tabIndex={0}
            aria-label="Menü schließen"
          />
          {/* Slide-in panel */}
          <aside className="absolute inset-y-3 left-3 w-60 flex flex-col bg-white rounded-2xl shadow-2xl">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] transition-colors duration-150"
              aria-label="Menü schließen"
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
