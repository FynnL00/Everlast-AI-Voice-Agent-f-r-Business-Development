import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login – n8n Voice Agent Dashboard",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
      {children}
    </div>
  );
}
