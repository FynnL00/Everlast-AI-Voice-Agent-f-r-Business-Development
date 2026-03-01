"use client";

import { useEffect, useState, useCallback } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useLeads } from "@/lib/leads-context";
import { createPortal } from "react-dom";

// Navigation items
const PAGES = [
  { name: "Dashboard", href: "/", icon: "🏠" },
  { name: "Leads", href: "/leads", icon: "👥" },
  { name: "Pipeline", href: "/pipeline", icon: "📊" },
  { name: "Analytics", href: "/analytics", icon: "📈" },
  { name: "Frühwarnsystem", href: "/alerts", icon: "⚠️" },
  { name: "Team", href: "/team", icon: "👤" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { leads } = useLeads();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      setOpen(false);
    },
    [router]
  );

  if (!mounted) return null;

  return createPortal(
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Suche"
      className="fixed inset-0 z-50"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg">
        <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
          <Command.Input
            placeholder="Suche nach Leads, Seiten..."
            className="w-full px-4 py-3 bg-transparent border-b border-border text-foreground placeholder:text-muted-foreground outline-none text-sm"
          />
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="p-4 text-sm text-muted-foreground text-center">
              Keine Ergebnisse gefunden.
            </Command.Empty>

            <Command.Group
              heading="Seiten"
              className="text-xs text-muted-foreground font-semibold px-2 py-1.5"
            >
              {PAGES.map((page) => (
                <Command.Item
                  key={page.href}
                  value={page.name}
                  onSelect={() => navigate(page.href)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-foreground cursor-pointer data-[selected=true]:bg-sidebar-accent"
                >
                  <span>{page.icon}</span>
                  {page.name}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group
              heading="Leads"
              className="text-xs text-muted-foreground font-semibold px-2 py-1.5"
            >
              {leads.slice(0, 10).map((lead) => (
                <Command.Item
                  key={lead.id}
                  value={`${lead.caller_name ?? ""} ${lead.company ?? ""} ${lead.email ?? ""}`}
                  onSelect={() => navigate(`/leads/${lead.id}`)}
                  className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-foreground cursor-pointer data-[selected=true]:bg-sidebar-accent"
                >
                  <span>{lead.caller_name ?? "Unbekannt"}</span>
                  <span className="text-xs text-muted-foreground">
                    {lead.company ?? ""}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </div>
      </div>
    </Command.Dialog>,
    document.body
  );
}
