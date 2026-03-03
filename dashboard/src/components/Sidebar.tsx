"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Kanban,
  Menu,
  X,
  ChevronRight,
  Sun,
  Moon,
  UserCog,
  Megaphone,
  ShieldBan,
  Heart,
  ShieldAlert,
  FileText,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

interface SidebarProps {
  isLive?: boolean;
  isMockMode?: boolean;
  onToggleMockMode?: (on: boolean) => void;
}

export default function Sidebar({ isLive = false, isMockMode = false, onToggleMockMode }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const NAV_SECTIONS: NavSection[] = useMemo(
    () => [
      {
        label: "DISCOVER",
        items: [
          { href: "/", label: "Dashboard", icon: LayoutDashboard },
          { href: "/leads", label: "Leads", icon: Users },
          { href: "/pipeline", label: "Pipeline", icon: Kanban },
        ],
      },
      {
        label: "ANALYSE",
        items: [
          { href: "/sentiment", label: "Sentiment", icon: Heart },
          { href: "/objections", label: "Einwände", icon: ShieldAlert },
        ],
      },
      {
        label: "EINSTELLUNGEN",
        items: [
          { href: "/campaigns", label: "Kampagnen", icon: Megaphone },
          { href: "/dnc", label: "DNC-Liste", icon: ShieldBan },
          { href: "/team", label: "Teamverwaltung", icon: UserCog },
        ],
      },
    ],
    []
  );

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center shrink-0 shadow-lg shadow-sidebar-primary/20">
            <span className="text-white font-bold text-sm">n8n</span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-sidebar-foreground truncate tracking-tight">
              n8n Voice Agent
            </div>
            <div className="text-xs text-muted-foreground truncate">
              Sales Dashboard
            </div>
          </div>
        </div>
      </div>

      {/* Navigation sections */}
      <nav className="flex-1 px-3 overflow-y-auto scrollbar-none space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-2">
              {section.label}
            </span>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm"
                          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon size={18} className={cn("shrink-0", active ? "text-sidebar-primary" : "")} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-4 pb-6 pt-4 space-y-4">
        {/* Demo/Live toggle + theme */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/50 border border-border/50">
            <button
              onClick={() => onToggleMockMode?.(true)}
              className={cn(
                "px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all duration-200",
                isMockMode
                  ? "bg-chart-5 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Demo
            </button>
            <button
              onClick={() => onToggleMockMode?.(false)}
              className={cn(
                "px-2.5 py-1 text-[10px] font-semibold rounded-md transition-all duration-200 flex items-center gap-1.5",
                !isMockMode
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {!isMockMode && (
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    isLive ? "bg-status-completed animate-pulse" : "bg-muted-foreground"
                  )}
                />
              )}
              Live
            </button>
          </div>

          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
              aria-label="Design wechseln"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          )}
        </div>

        {/* Unterlagen section */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-background/50 border border-sidebar-border cursor-pointer hover:bg-background/80 transition-colors group" role="button" tabIndex={0}>
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                <Image src="/kiberatung-icon.png" alt="Unterlagen" width={32} height={32} className="object-cover" />
              </div>
              <span className="text-sm font-semibold text-foreground flex-1 truncate">
                Unterlagen
              </span>
              <ChevronRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" sideOffset={8} className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/demo-calls" className="flex items-center gap-2 cursor-pointer">
                <FileText size={16} />
                <span>Demo-Calls</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/loom-video" className="flex items-center gap-2 cursor-pointer">
                <Video size={16} />
                <span>Loom-Video</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground shadow-sm transition-colors duration-200"
        aria-label="Menü öffnen"
      >
        <Menu size={20} />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex glass-sidebar rounded-3xl w-64 flex-col z-40 transition-all duration-300 ease-in-out shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setMobileOpen(false);
            }}
            role="button"
            tabIndex={0}
            aria-label="Menü schließen"
          />
          {/* Slide-in panel */}
          <aside className="absolute inset-y-0 left-0 w-64 flex flex-col glass-sidebar shadow-2xl transition-transform duration-300">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors duration-200"
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
