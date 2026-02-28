import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "n8n Voice Agent Dashboard",
  description: "Real-time KPI dashboard for the n8n Voice Agent",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
