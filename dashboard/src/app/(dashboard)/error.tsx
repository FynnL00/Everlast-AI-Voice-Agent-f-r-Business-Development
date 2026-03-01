"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-xl font-semibold text-foreground">
        Etwas ist schiefgelaufen
      </h2>
      <p className="text-muted-foreground text-sm">
        Ein unerwarteter Fehler ist aufgetreten.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity text-sm font-medium"
      >
        Seite neu laden
      </button>
    </div>
  );
}
