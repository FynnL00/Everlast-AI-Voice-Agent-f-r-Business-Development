"use client";

import { LeadsProvider, useLeads } from "@/lib/leads-context";
import Sidebar from "@/components/Sidebar";

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { isLive } = useLeads();

  return (
    <div className="flex min-h-screen">
      <Sidebar isLive={isLive} />
      {/* Main content offset by sidebar width on desktop */}
      <main className="flex-1 md:ml-60 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LeadsProvider>
      <AppShellInner>{children}</AppShellInner>
    </LeadsProvider>
  );
}
