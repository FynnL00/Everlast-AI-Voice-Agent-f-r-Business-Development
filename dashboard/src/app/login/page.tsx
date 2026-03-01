"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Anmeldung fehlgeschlagen");
      }
    } catch {
      setError("Netzwerkfehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm p-4">
      <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-xl p-8 shadow-xl">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="p-3 rounded-full bg-accent/10">
            <Lock className="h-6 w-6 text-accent" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-foreground">
              Voice Agent Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Bitte melden Sie sich an
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
              Passwort
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              placeholder="Passwort eingeben"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Wird geprüft..." : "Anmelden"}
          </button>
        </form>
      </div>

      <p className="text-xs text-muted-foreground/50 text-center mt-6">
        n8n Voice Agent &middot; Everlast AI
      </p>
    </div>
  );
}
