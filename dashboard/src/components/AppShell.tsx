"use client";

import { LeadsProvider, useLeads } from "@/lib/leads-context";
import { TeamProvider } from "@/lib/team-context";
import { CampaignProvider } from "@/lib/campaigns-context";
import { ObjectionCategoriesProvider } from "@/lib/objection-categories-context";
import Sidebar from "@/components/Sidebar";
import { DynamicBackground } from "./layout/DynamicBackground";
import { CommandPalette } from "@/components/CommandPalette";

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { isLive, isMockMode, setMockMode } = useLeads();

  return (
    <div className="flex h-screen overflow-hidden font-sans p-4 gap-4">
      <DynamicBackground />
      <Sidebar isLive={isLive} isMockMode={isMockMode} onToggleMockMode={setMockMode} />
      <main className="flex-1 overflow-y-auto rounded-2xl border border-sidebar-border shadow-md bg-background/60 backdrop-blur-sm z-10 relative">
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
      <CommandPalette />
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TeamProvider>
      <LeadsProvider>
        <CampaignProvider>
          <ObjectionCategoriesProvider>
            <AppShellInner>{children}</AppShellInner>
          </ObjectionCategoriesProvider>
        </CampaignProvider>
      </LeadsProvider>
    </TeamProvider>
  );
}
