import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
