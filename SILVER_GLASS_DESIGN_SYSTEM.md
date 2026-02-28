# Silver Glass Design System

> Complete reference for recreating the "Silver Glass" (Tahoe Dark) design system.
> This document contains every design token, component, utility, and pattern needed to build 1:1 identical UI.

---

## 1. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.x |
| Language | TypeScript | 5.9 |
| Styling | Tailwind CSS | v4.1 (`@tailwindcss/vite` plugin, NOT PostCSS) |
| Component Library | shadcn/ui | `new-york` style, `rsc: false` |
| UI Primitives | Radix UI | Multiple packages (dialog, dropdown, select, tabs, tooltip, popover, switch, separator) |
| Variant System | class-variance-authority (CVA) | 0.7.x |
| Class Merging | clsx + tailwind-merge | via `cn()` utility |
| Icons | lucide-react | 0.563.x |
| Charts | Recharts | 3.7.x |
| Animation | Framer Motion | 12.x |
| CSS Animation | tw-animate-css | (import in index.css) |
| Build | Vite | 7.x with `@vitejs/plugin-react` |

### Key Dependencies (package.json)

```json
{
  "@radix-ui/react-dialog": "^1.x",
  "@radix-ui/react-dropdown-menu": "^2.x",
  "@radix-ui/react-popover": "^1.x",
  "@radix-ui/react-select": "^2.x",
  "@radix-ui/react-separator": "^1.x",
  "@radix-ui/react-slot": "^1.x",
  "@radix-ui/react-switch": "^1.x",
  "@radix-ui/react-tabs": "^1.x",
  "@radix-ui/react-tooltip": "^1.x",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.4.0",
  "framer-motion": "^12.33.0",
  "lucide-react": "^0.563.0",
  "recharts": "^3.7.0",
  "tailwindcss": "^4.1.18",
  "@tailwindcss/vite": "^4.1.18"
}
```

### Path Aliases (vite.config.ts)

```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
}
```

### shadcn Config (components.json)

```json
{
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## 2. Complete CSS (index.css)

Copy this file verbatim as `src/index.css`:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-status-pending: var(--status-pending);
  --color-status-crawling: var(--status-crawling);
  --color-status-analyzing: var(--status-analyzing);
  --color-status-completed: var(--status-completed);
  --color-status-error: var(--status-error);
  --color-score-good: var(--score-good);
  --color-score-good-bg: var(--score-good-bg);
  --color-score-warning: var(--score-warning);
  --color-score-warning-bg: var(--score-warning-bg);
  --color-score-danger: var(--score-danger);
  --color-score-danger-bg: var(--score-danger-bg);
  --color-glow-good: var(--glow-good);
  --color-glow-warning: var(--glow-warning);
  --color-glow-danger: var(--glow-danger);
  --color-glow-neutral: var(--glow-neutral);

  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}

/* ─── Dark Mode (Default) ─────────────────────────────────────────────── */

:root {
  --radius: 1.25rem; /* 20px - generous border-radius */

  /* Deep Blue / Gray Base */
  --background: oklch(0.245 0.035 270);
  --foreground: oklch(0.985 0 0);

  /* Glass / Overlay */
  --card: oklch(0.28 0.05 265 / 0.6);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.28 0.05 265 / 0.9);
  --popover-foreground: oklch(0.985 0 0);

  /* Accent Blue (macOS Blue) */
  --primary: oklch(0.55 0.22 260);
  --primary-foreground: oklch(0.985 0 0);

  --secondary: oklch(0.35 0.05 265);
  --secondary-foreground: oklch(0.985 0 0);

  --muted: oklch(0.35 0.05 265);
  --muted-foreground: oklch(0.70 0.02 265);

  --accent: oklch(0.35 0.05 265);
  --accent-foreground: oklch(0.985 0 0);

  --destructive: oklch(0.577 0.245 27.325);

  --border: oklch(0.985 0 0 / 0.1);
  --input: oklch(0.985 0 0 / 0.1);
  --ring: oklch(0.55 0.22 260);

  /* Chart Colors */
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);

  /* Sidebar (Translucent) */
  --sidebar: oklch(0.16 0.04 265 / 0.40);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.55 0.22 260);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.985 0 0 / 0.1);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(0.985 0 0 / 0.13);
  --sidebar-ring: oklch(0.55 0.22 260);

  /* Status Colors */
  --status-pending: oklch(0.55 0.02 265);
  --status-crawling: oklch(0.55 0.22 260);
  --status-analyzing: oklch(0.55 0.20 300);
  --status-completed: oklch(0.55 0.20 145);
  --status-error: oklch(0.577 0.245 27.325);

  /* Score Semantic Colors */
  --score-good: oklch(0.72 0.17 155);
  --score-good-bg: oklch(0.72 0.17 155 / 0.15);
  --score-warning: oklch(0.75 0.15 85);
  --score-warning-bg: oklch(0.75 0.15 85 / 0.15);
  --score-danger: oklch(0.65 0.20 25);
  --score-danger-bg: oklch(0.65 0.20 25 / 0.15);

  /* Glow Colors */
  --glow-good: oklch(0.72 0.17 155 / 0.35);
  --glow-warning: oklch(0.75 0.15 85 / 0.35);
  --glow-danger: oklch(0.65 0.20 25 / 0.35);
  --glow-neutral: oklch(0.55 0.02 265 / 0.3);

  /* Ambient Background Orbs */
  --ambient-orb-1: oklch(0.40 0.22 260 / 0.35);
  --ambient-orb-2: oklch(0.35 0.20 300 / 0.28);
  --ambient-orb-3: oklch(0.38 0.16 220 / 0.25);
  --ambient-orb-4: oklch(0.33 0.14 145 / 0.20);

  /* Visualizer Component Tokens */
  --vis-canvas-1: oklch(0.26 0.06 270);
  --vis-canvas-2: oklch(0.20 0.04 265);
  --vis-canvas-3: oklch(0.18 0.03 260);
  --vis-canvas-glow: oklch(0.26 0.05 270 / 0.4);
  --vis-root-from: oklch(0.22 0.08 265);
  --vis-root-to: oklch(0.18 0.06 260);
  --vis-root-shadow: inset 0 1px 0 oklch(0.985 0 0 / 0.15), 0 8px 24px oklch(0 0 0 / 0.5);
  --vis-root-accent: oklch(0.60 0.20 260);
  --vis-panel-from: oklch(0.32 0.07 265 / 0.95);
  --vis-panel-to: oklch(0.28 0.05 265 / 0.6);
  --vis-glass-bg: oklch(0.28 0.05 265 / 0.5);
  --vis-glass-shadow: inset 0 1px 0 oklch(0.985 0 0 / 0.08), 0 4px 16px oklch(0 0 0 / 0.2);
  --vis-pill-from: oklch(0.38 0.06 265);
  --vis-pill-to: oklch(0.32 0.05 265);
  --vis-section-from: oklch(0.30 0.06 265 / 0.6);
  --vis-section-to: oklch(0.28 0.05 265 / 0.3);
  --vis-section-border: oklch(0.985 0 0 / 0.08);
  --vis-group-bg: oklch(0.28 0.05 265 / 0.7);
  --vis-group-shadow: inset 0 1px 0 oklch(0.985 0 0 / 0.10), 0 8px 24px oklch(0 0 0 / 0.4);
}

/* ─── Light Mode ──────────────────────────────────────────────────────── */

.light {
  --background: oklch(0.985 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0 / 0.7);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0 / 0.9);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.55 0.22 260);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.96 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.96 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.96 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0 0 0 / 0.1);
  --input: oklch(0 0 0 / 0.1);
  --ring: oklch(0.55 0.22 260);
  --sidebar: oklch(0.955 0.012 245 / 0.65);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.55 0.22 260);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0 0 0 / 0.05);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0 0 0 / 0.10);
  --sidebar-ring: oklch(0.55 0.22 260);

  --status-pending: oklch(0.55 0.02 265);
  --status-crawling: oklch(0.55 0.22 260);
  --status-analyzing: oklch(0.55 0.20 300);
  --status-completed: oklch(0.55 0.20 145);
  --status-error: oklch(0.577 0.245 27.325);

  --score-good: oklch(0.55 0.20 155);
  --score-good-bg: oklch(0.55 0.20 155 / 0.12);
  --score-warning: oklch(0.55 0.18 85);
  --score-warning-bg: oklch(0.55 0.18 85 / 0.12);
  --score-danger: oklch(0.55 0.22 25);
  --score-danger-bg: oklch(0.55 0.22 25 / 0.12);

  --glow-good: oklch(0.55 0.20 155 / 0.25);
  --glow-warning: oklch(0.55 0.18 85 / 0.25);
  --glow-danger: oklch(0.55 0.22 25 / 0.25);
  --glow-neutral: oklch(0.55 0.02 265 / 0.2);

  --ambient-orb-1: oklch(0.70 0.18 260 / 0.28);
  --ambient-orb-2: oklch(0.75 0.16 300 / 0.22);
  --ambient-orb-3: oklch(0.72 0.14 220 / 0.20);
  --ambient-orb-4: oklch(0.78 0.12 145 / 0.16);

  --vis-canvas-1: oklch(0.965 0.012 260);
  --vis-canvas-2: oklch(0.975 0.008 258);
  --vis-canvas-3: oklch(0.98 0.005 255);
  --vis-canvas-glow: oklch(0.55 0.22 260 / 0.04);
  --vis-root-from: oklch(0.38 0.14 260);
  --vis-root-to: oklch(0.32 0.12 265);
  --vis-root-shadow: inset 0 1px 0 oklch(0.985 0 0 / 0.25), 0 8px 24px oklch(0 0 0 / 0.15);
  --vis-root-accent: oklch(0.55 0.22 260);
  --vis-panel-from: oklch(0.97 0.008 265 / 0.95);
  --vis-panel-to: oklch(0.985 0.003 260 / 0.8);
  --vis-glass-bg: oklch(0.97 0.005 265 / 0.6);
  --vis-glass-shadow: inset 0 1px 0 oklch(0.985 0 0 / 0.5), 0 4px 16px oklch(0 0 0 / 0.06);
  --vis-pill-from: oklch(0.985 0.005 265);
  --vis-pill-to: oklch(0.96 0.008 265);
  --vis-section-from: oklch(0.96 0.008 265 / 0.8);
  --vis-section-to: oklch(0.975 0.004 265 / 0.5);
  --vis-section-border: oklch(0 0 0 / 0.06);
  --vis-group-bg: oklch(0.97 0.008 265 / 0.8);
  --vis-group-shadow: inset 0 1px 0 oklch(0.985 0 0 / 0.6), 0 4px 16px oklch(0 0 0 / 0.08);
}

/* ─── Base Layer ──────────────────────────────────────────────────────── */

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased text-base selection:bg-primary/30 selection:text-primary-foreground;
  }

  .light body {
    background: linear-gradient(135deg, oklch(0.955 0.015 245) 0%, oklch(0.975 0.007 230) 50%, oklch(0.968 0.012 250) 100%);
    background-attachment: fixed;
  }
}

/* ─── Utility Classes ─────────────────────────────────────────────────── */

@layer utilities {
  .glass {
    @apply bg-card border border-border;
    backdrop-filter: blur(24px) saturate(160%);
    -webkit-backdrop-filter: blur(24px) saturate(160%);
    box-shadow:
      inset 0 1px 0 oklch(0.985 0 0 / 0.10),
      0 8px 32px oklch(0 0 0 / 0.35);
  }

  .light .glass {
    box-shadow:
      inset 0 1px 0 oklch(0.985 0 0 / 0.6),
      0 4px 20px oklch(0 0 0 / 0.06);
  }

  .glow-good    { box-shadow: 0 0 16px var(--glow-good); }
  .glow-warning { box-shadow: 0 0 16px var(--glow-warning); }
  .glow-danger  { box-shadow: 0 0 16px var(--glow-danger); }
  .glow-neutral { box-shadow: 0 0 8px var(--glow-neutral); }

  .glass-sidebar {
    background: var(--sidebar);
    background-image: linear-gradient(
      180deg,
      oklch(0.985 0 0 / 0.06) 0%,
      oklch(0.985 0 0 / 0.01) 35%,
      transparent 60%
    );
    backdrop-filter: blur(40px) saturate(180%) brightness(0.95);
    -webkit-backdrop-filter: blur(40px) saturate(180%) brightness(0.95);
    border-right: 1px solid var(--sidebar-border);
    box-shadow:
      inset 0 1px 0 oklch(0.985 0 0 / 0.20),
      inset 1px 0 0 oklch(0.985 0 0 / 0.10),
      inset 0 -1px 0 oklch(0 0 0 / 0.12),
      4px 0 32px oklch(0 0 0 / 0.40),
      0 8px 32px oklch(0 0 0 / 0.25);
  }

  .light .glass-sidebar {
    background: var(--sidebar);
    background-image: linear-gradient(
      180deg,
      oklch(0.985 0 0 / 0.50) 0%,
      oklch(0.985 0 0 / 0.10) 35%,
      transparent 60%
    );
    backdrop-filter: blur(40px) saturate(200%) brightness(1.02);
    -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.02);
    border-right: 1px solid var(--sidebar-border);
    box-shadow:
      inset 0 1px 0 oklch(0.985 0 0 / 0.80),
      inset 1px 0 0 oklch(0.985 0 0 / 0.50),
      inset 0 -1px 0 oklch(0 0 0 / 0.06),
      4px 0 32px oklch(0 0 0 / 0.10),
      0 8px 32px oklch(0 0 0 / 0.08);
  }
}

/* ─── Animations ──────────────────────────────────────────────────────── */

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--accent) 25%,
    oklch(0.42 0.05 265) 50%,
    var(--accent) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.light .skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--accent) 25%,
    oklch(0.92 0 0) 50%,
    var(--accent) 75%
  );
  background-size: 200% 100%;
}

@keyframes radar-dot-color {
  0%, 100% { fill: #3b82f6; }
  50% { fill: #a855f7; }
}

.radar-dot-animate {
  fill: #3b82f6;
  animation: radar-dot-color 4s ease-in-out infinite;
}

@keyframes annotation-flash {
  0%, 100% { outline: 2px solid transparent; outline-offset: 2px; }
  25%, 75% { outline: 2px solid currentColor; outline-offset: 3px; }
}

.annotation-flash {
  animation: annotation-flash 1.5s ease-in-out;
}

@keyframes dash-rotate {
  to { stroke-dashoffset: -20; }
}

.animate-dash {
  animation: dash-rotate 6s linear infinite;
}

@keyframes radial-pulse {
  0%, 100% { opacity: 0.06; transform: scale(1); }
  50% { opacity: 0.12; transform: scale(1.08); }
}

.animate-radial-pulse {
  animation: radial-pulse 4s ease-in-out infinite;
}

@keyframes chatBounce {
  0%, 80%, 100% { opacity: 0.3; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-4px); }
}

.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

@property --chat-border-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

@keyframes chat-border-spin {
  to { --chat-border-angle: 360deg; }
}

.chat-rainbow-border {
  background: conic-gradient(
    from var(--chat-border-angle),
    #ff0040, #ff6600, #ffcc00, #00ff88, #00ccff, #6600ff, #ff00cc, #ff0040
  );
  animation: chat-border-spin 5s linear infinite;
}

/* Ambient Background Orb Drift */

@keyframes ambient-drift-1 {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  25%  { transform: translate3d(8vw, -12vh, 0) scale(1.05); }
  50%  { transform: translate3d(-5vw, 8vh, 0) scale(0.95); }
  75%  { transform: translate3d(12vw, 5vh, 0) scale(1.02); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
}

@keyframes ambient-drift-2 {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  33%  { transform: translate3d(-10vw, -8vh, 0) scale(1.08); }
  66%  { transform: translate3d(7vw, 12vh, 0) scale(0.93); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
}

@keyframes ambient-drift-3 {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  20%  { transform: translate3d(6vw, 10vh, 0) scale(0.97); }
  40%  { transform: translate3d(-8vw, -5vh, 0) scale(1.04); }
  60%  { transform: translate3d(10vw, -8vh, 0) scale(1.01); }
  80%  { transform: translate3d(-4vw, 6vh, 0) scale(0.96); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
}

@keyframes ambient-drift-4 {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  50%  { transform: translate3d(-12vw, 10vh, 0) scale(1.06); }
  100% { transform: translate3d(0, 0, 0) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .ambient-orb {
    animation: none !important;
  }
}
```

---

## 3. Core Utility Function

### `lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## 4. Score Color Utilities

### `lib/scoreColors.ts`

```typescript
/** Tailwind text color class based on score threshold */
export function getScoreColor(score: number): string {
  if (score >= 60) return "text-score-good";
  if (score >= 40) return "text-score-warning";
  return "text-score-danger";
}

/** Tailwind bg + text color class for badges/chips */
export function getScoreBg(score: number): string {
  if (score >= 60) return "bg-score-good-bg text-score-good";
  if (score >= 40) return "bg-score-warning-bg text-score-warning";
  return "bg-score-danger-bg text-score-danger";
}

/** CSS variable reference for inline styles (charts, SVGs) */
export function getScoreVar(score: number): string {
  if (score >= 60) return "var(--score-good)";
  if (score >= 40) return "var(--score-warning)";
  return "var(--score-danger)";
}

/** CSS glow variable reference for hover/accent effects */
export function getScoreGlowVar(score: number | null): string {
  if (score === null) return "var(--glow-neutral)";
  if (score >= 60) return "var(--glow-good)";
  if (score >= 45) return "var(--glow-warning)";
  return "var(--glow-danger)";
}

/** CSS score color variable for inline styles (border-left, accents) */
export function getScoreAccentVar(score: number | null): string {
  if (score === null) return "var(--glow-neutral)";
  if (score >= 60) return "var(--score-good)";
  if (score >= 45) return "var(--score-warning)";
  return "var(--score-danger)";
}

/** SoV color: >= 1.5x fair share = good, >= 1x = warning, < 1x = danger */
export function getSoVColor(sov: number, totalCompanies: number): string {
  const fairShare = totalCompanies > 0 ? 100 / totalCompanies : 20;
  if (sov >= fairShare * 1.5) return "text-score-good";
  if (sov >= fairShare) return "text-score-warning";
  return "text-score-danger";
}

/** SoV color as CSS variable for inline styles */
export function getSoVVar(sov: number, totalCompanies: number): string {
  const fairShare = totalCompanies > 0 ? 100 / totalCompanies : 20;
  if (sov >= fairShare * 1.5) return "var(--score-good)";
  if (sov >= fairShare) return "var(--score-warning)";
  return "var(--score-danger)";
}
```

---

## 5. Components

### 5.1 Card (Core Building Block)

The Card is the most important component. It features:
- Semi-transparent glass background (`bg-card/60`)
- Heavy backdrop blur
- Mouse-tracking radial glow effect on hover
- Smooth hover transitions (shadow + opacity)

```tsx
// components/ui/card.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const internalRef = React.useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!internalRef.current) return;
      const rect = internalRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      internalRef.current.style.setProperty("--mouse-x", `${x}px`);
      internalRef.current.style.setProperty("--mouse-y", `${y}px`);
    };

    return (
      <div
        ref={(node) => {
          internalRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        onMouseMove={handleMouseMove}
        data-slot="card"
        className={cn(
          "group relative bg-card/60 backdrop-blur-xl text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm transition-[background-color,border-color,box-shadow,transform] duration-200 hover:bg-card/80 hover:shadow-md overflow-hidden",
          className
        )}
        {...props}
      >
        {/* Hidden radial glow following mouse position */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255, 255, 255, 0.03), transparent 40%)",
          }}
        />
        {props.children}
      </div>
    );
  }
);
Card.displayName = "Card";

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("px-6", className)} {...props} />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
```

**Standard hover classes to add on interactive cards:**
```
transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5
```

---

### 5.2 Button

```tsx
// components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
```

---

### 5.3 Badge

```tsx
// components/ui/badge.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
```

---

### 5.4 StatusBadge

Domain-specific badge with pulsing dot indicator and semantic status colors:

```tsx
// components/ui/status-badge.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      status: {
        pending: "bg-status-pending/15 text-status-pending",
        discovered: "bg-status-pending/15 text-status-pending",
        crawling: "bg-status-crawling/15 text-status-crawling",
        analyzing: "bg-status-analyzing/15 text-status-analyzing",
        completed: "bg-status-completed/15 text-status-completed",
        error: "bg-status-error/15 text-status-error",
      },
    },
    defaultVariants: { status: "pending" },
  }
);

const statusLabels: Record<string, string> = {
  pending: "Ausstehend",
  discovered: "Entdeckt",
  crawling: "Crawling",
  analyzing: "Analyse",
  completed: "Abgeschlossen",
  error: "Fehler",
};

type StatusBadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof statusBadgeVariants>;

function StatusBadge({ status = "pending", className, children, ...props }: StatusBadgeProps) {
  const isPulsing = status === "crawling" || status === "analyzing";
  return (
    <span
      data-slot="status-badge"
      data-status={status}
      className={cn(statusBadgeVariants({ status, className }))}
      {...props}
    >
      <span
        className={cn(
          "inline-block size-1.5 rounded-full bg-current",
          isPulsing && "animate-pulse"
        )}
      />
      {children ?? statusLabels[status!]}
    </span>
  );
}

export { StatusBadge, statusBadgeVariants };
```

---

### 5.5 Tooltip (Glass-Styled)

```tsx
// components/ui/tooltip.tsx
import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

function TooltipProvider({ delayDuration = 0, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />;
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({ className, sideOffset = 6, children, ...props }: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-card/95 text-card-foreground backdrop-blur-xl border border-border",
          "shadow-[0_6px_20px_rgba(0,0,0,0.35)]",
          "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          "z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-lg px-3 py-1.5 text-xs text-balance",
          className
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
```

---

### 5.6 TiltCard (3D Perspective Effect)

```tsx
// components/ui/tilt-card.tsx
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxRotation?: number;  // degrees (default: 3)
  speed?: number;        // transition ms (default: 400)
}

export function TiltCard({ children, className, maxRotation = 3, speed = 400, ...props }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rectRef = useRef<DOMRect | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = rectRef.current;
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * maxRotation;
    const rotateX = ((centerY - y) / centerY) * maxRotation;
    setRotation({ x: rotateX, y: rotateY });
  };

  return (
    <div
      ref={ref}
      className={cn("perspective-1000 transform-style-3d will-change-transform", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        if (ref.current) rectRef.current = ref.current.getBoundingClientRect();
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setRotation({ x: 0, y: 0 });
        rectRef.current = null;
      }}
      {...props}
    >
      <div
        className={cn(
          "w-full h-full transition-transform ease-out",
          isHovered ? "duration-100" : `duration-${speed}`
        )}
        style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
      >
        {children}
      </div>
    </div>
  );
}
```

---

### 5.7 DynamicBackground (Ambient Orbs)

Renders behind all content at z-0. Four floating, blurred color orbs that slowly drift:

```tsx
// components/layout/DynamicBackground.tsx
export function DynamicBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Orb 1 - top-left, blue-purple, largest */}
      <div
        className="ambient-orb absolute -top-[20%] -left-[10%] h-[60vh] w-[60vh] rounded-full"
        style={{
          background: "radial-gradient(circle, var(--ambient-orb-1) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "ambient-drift-1 22s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      {/* Orb 2 - top-right, violet */}
      <div
        className="ambient-orb absolute -top-[10%] -right-[15%] h-[50vh] w-[50vh] rounded-full"
        style={{
          background: "radial-gradient(circle, var(--ambient-orb-2) 0%, transparent 70%)",
          filter: "blur(90px)",
          animation: "ambient-drift-2 26s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      {/* Orb 3 - bottom-left, teal-blue */}
      <div
        className="ambient-orb absolute -bottom-[15%] -left-[10%] h-[55vh] w-[55vh] rounded-full"
        style={{
          background: "radial-gradient(circle, var(--ambient-orb-3) 0%, transparent 70%)",
          filter: "blur(100px)",
          animation: "ambient-drift-3 30s ease-in-out infinite",
          willChange: "transform",
        }}
      />
      {/* Orb 4 - bottom-right, green accent */}
      <div
        className="ambient-orb absolute -bottom-[20%] -right-[5%] h-[45vh] w-[45vh] rounded-full"
        style={{
          background: "radial-gradient(circle, var(--ambient-orb-4) 0%, transparent 70%)",
          filter: "blur(70px)",
          animation: "ambient-drift-4 34s ease-in-out infinite",
          willChange: "transform",
        }}
      />
    </div>
  );
}
```

---

### 5.8 ProgressRing (SVG Circular Progress)

```tsx
// components/ui/progress-ring.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressRingProps extends React.SVGAttributes<SVGSVGElement> {
  value: number;       // 0-100
  size?: number;       // px diameter (default: 80)
  strokeWidth?: number; // (default: 6)
  label?: string;
}

const ProgressRing = React.forwardRef<SVGSVGElement, ProgressRingProps>(
  ({ value, size = 80, strokeWidth = 6, label, className, ...props }, ref) => {
    const clamped = Math.max(0, Math.min(100, value));
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clamped / 100) * circumference;

    const colorClass =
      clamped >= 70 ? "text-status-completed"
        : clamped >= 40 ? "text-status-analyzing"
          : "text-status-error";

    return (
      <div className="inline-flex flex-col items-center gap-1">
        <svg ref={ref} data-slot="progress-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={cn(colorClass, className)} {...props}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="opacity-20" />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-[stroke-dashoffset] duration-500 ease-out" style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }} />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill="currentColor" className="text-sm font-semibold" style={{ fontSize: size * 0.22 }}>{Math.round(clamped)}%</text>
        </svg>
        {label && <span className="text-muted-foreground text-xs">{label}</span>}
      </div>
    );
  }
);
ProgressRing.displayName = "ProgressRing";

export { ProgressRing };
```

---

### 5.9 AnimatedNumber

```tsx
// components/ui/animated-number.tsx
import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  suffix?: string;    // default: "%"
  duration?: number;  // default: 600ms
  className?: string;
}

export function AnimatedNumber({ value, suffix = "%", duration = 600, className }: AnimatedNumberProps) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    fromRef.current = displayed;
    startRef.current = null;

    function animate(timestamp: number) {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(fromRef.current + (value - fromRef.current) * eased);
      setDisplayed(current);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span className={className}>{displayed}{suffix}</span>;
}
```

---

### 5.10 EmptyState

```tsx
// components/ui/empty-state.tsx
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-6 text-center rounded-xl border border-dashed border-border/60", className)}>
      <div className="p-3 rounded-full bg-muted/50 mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium text-foreground mb-1">{title}</h3>
      {description && <p className="text-xs text-muted-foreground max-w-[280px]">{description}</p>}
      {action && <Button variant="outline" size="sm" className="mt-4" onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
```

---

## 6. Layout Patterns

### 6.1 App Root Structure

```tsx
<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
  <DynamicBackground />        {/* z-0, behind everything */}
  <RouterProvider router={router} />
</ThemeProvider>
```

### 6.2 Main Layout (Sidebar + Content)

```tsx
<div className="flex h-screen overflow-hidden font-sans p-4 gap-4">
  {/* Sidebar */}
  <aside className="glass-sidebar rounded-3xl w-64 flex flex-col transition-all duration-300 ease-in-out">
    {/* Logo, Navigation, User Menu */}
  </aside>

  {/* Main Content */}
  <main className="flex-1 overflow-y-auto rounded-2xl border border-sidebar-border shadow-md bg-background/60 backdrop-blur-sm">
    <div className="p-6 md:p-8">
      {/* Page content */}
    </div>
  </main>
</div>
```

### 6.3 Page Header Pattern

```tsx
<div className="flex flex-col gap-1 mb-6">
  {/* Breadcrumbs */}
  <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
    <span>Home</span>
    <ChevronRight className="size-3" />
    <span className="text-foreground">Current Page</span>
  </nav>

  {/* Title row */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Icon className="size-6 text-primary" />
      <h1 className="text-2xl font-bold">Page Title</h1>
    </div>
    <div className="flex items-center gap-2">
      {/* Action buttons */}
    </div>
  </div>
</div>
```

### 6.4 Responsive Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id} className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-0.5">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{item.title}</CardTitle>
      </CardHeader>
      <CardContent>{/* ... */}</CardContent>
    </Card>
  ))}
</div>
```

### 6.5 KPI Row Pattern

```tsx
<div className="flex items-center p-4 rounded-2xl bg-sidebar-accent/50 border border-border relative group hover:bg-sidebar-accent transition-colors gap-4">
  <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 shrink-0">
    <Eye className="h-6 w-6" />
  </div>
  <div className="flex flex-col min-w-0">
    <span className="text-xs text-muted-foreground">Label</span>
    <span className="text-2xl font-bold tabular-nums">
      <AnimatedNumber value={42} />
    </span>
  </div>
</div>
```

---

## 7. Chart Styling (Recharts)

### 7.1 Standard Chart Container

```tsx
<Card className="transition-all duration-200 hover:border-foreground/20 hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5">
  <CardHeader>
    <CardTitle className="text-base font-semibold">Chart Title</CardTitle>
  </CardHeader>
  <CardContent className="pb-8">
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontSize: "12px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
          }}
        />
        <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
      </AreaChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
```

### 7.2 Chart Color Palette

| Token | OKLCH | Approx Hex | Usage |
|-------|-------|-----------|-------|
| `--chart-1` | `oklch(0.646 0.222 41.116)` | Orange/Gold | Primary data series |
| `--chart-2` | `oklch(0.6 0.118 184.704)` | Cyan/Teal | Secondary series |
| `--chart-3` | `oklch(0.398 0.07 227.392)` | Deep Blue | Tertiary series |
| `--chart-4` | `oklch(0.828 0.189 84.429)` | Yellow/Lime | Fourth series |
| `--chart-5` | `oklch(0.769 0.188 70.08)` | Amber | Fifth series |

### 7.3 Common Hex Colors Used in Charts

- Blue: `#3b82f6`
- Purple: `#a855f7`
- Green: `#22c55e`
- Amber: `#f59e0b`
- Red: `#ef4444`

---

## 8. Interaction & Animation Patterns

### 8.1 Card Hover Lift (Signature Effect)

```
hover:-translate-y-0.5 hover:shadow-lg hover:border-foreground/20
transition-all duration-200
```

### 8.2 Table Row Hover

```tsx
className="cursor-pointer hover:bg-muted/80 hover:-translate-y-0.5 border-b border-border/50 transition-all duration-200"
```

### 8.3 Framer Motion Stagger (Table Rows)

```tsx
<motion.tr
  initial={{ opacity: 0, y: 6 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.15, delay: Math.min(index * 0.03, 0.75) }}
>
```

### 8.4 Icon in Colored Circle

```tsx
<div className="p-3 rounded-full bg-primary/10 text-primary shrink-0">
  <Icon className="h-6 w-6" />
</div>
```

### 8.5 Section Labels

```tsx
<span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
  Section Title
</span>
```

---

## 9. Theme System

### ThemeContext

```tsx
type Theme = "dark" | "light" | "system";

const ThemeProvider = ({ children, defaultTheme = "system", storageKey = "vite-ui-theme" }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
};
```

**Mechanism:** Theme class (`dark` or `light`) is set on `<html>`. CSS uses `.light` selector for light-mode overrides. Dark mode is the default (`:root`).

---

## 10. Design Principles Summary

### Glassmorphism
- `backdrop-filter: blur(24px) saturate(160%)` for standard glass
- `backdrop-filter: blur(40px) saturate(180%)` for sidebar glass
- Semi-transparent backgrounds: `bg-card/60`, `bg-card/80` on hover
- Inset highlight shadow (`inset 0 1px 0 white/10`) + outer depth shadow

### Interactive Depth
- Cards lift on hover: `hover:-translate-y-0.5`
- Shadow strengthens: `hover:shadow-lg`
- Background becomes more opaque: `hover:bg-card/80`
- Mouse-tracking radial glow on Card component

### OKLCH Color Space
- Format: `oklch(Lightness Chroma Hue / Alpha)` where L=0-1, C=0-0.4, H=0-360
- Perceptually uniform lightness across all hues
- All colors defined as CSS custom properties, never hardcoded hex in components

### Semantic Color System
- **Primary Blue** `oklch(0.55 0.22 260)`: CTAs, active states, links
- **Score Good** (green): >= 60 threshold
- **Score Warning** (yellow): 40-59 threshold
- **Score Danger** (red): < 40 threshold
- **Status colors**: Unique hues per workflow state (pending, crawling, analyzing, completed, error)

### Typography
- Font: Inter (with system fallbacks)
- Base: `text-base` (16px), `antialiased`
- Headings: `font-semibold` or `font-bold`
- Labels: `text-xs text-muted-foreground`
- Section headers: `text-xs font-bold uppercase tracking-widest text-muted-foreground`

### Spacing
- Page padding: `p-6 md:p-8`
- Section gaps: `space-y-6` or `gap-6`
- Card grid gaps: `gap-4`
- Card internal padding: `px-6` (horizontal), `gap-6` (vertical between card slots)
- App padding: `p-4` (outer shell), `gap-4` (sidebar to content)

### Border Radius Scale
- Cards: `rounded-xl` (20px, default `--radius`)
- Sidebar: `rounded-3xl` (32px)
- Main content: `rounded-2xl` (28px)
- Buttons: `rounded-md` (18px)
- Badges: `rounded-full`
- Tooltips: `rounded-lg`

### Accessibility
- `data-slot` attributes on all components
- `focus-visible` rings (`ring-ring/50, ring-[3px]`)
- `aria-invalid` states for form validation
- `prefers-reduced-motion` disables ambient animations
- Color is never the sole indicator (always paired with icons or text)
- Selection styling: `selection:bg-primary/30 selection:text-primary-foreground`
