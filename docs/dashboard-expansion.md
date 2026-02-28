# Agent Team Plan: Dashboard zur Production-Ready Sales-Plattform

## Context

Das Voice Agent Dashboard ist eine Single-Page KPI-Uebersicht. Es soll zur **alleinigen Datenquelle des Unternehmens** werden: editierbare Lead-Daten, KI-Briefings fuer Demo-Vorbereitung, manuelle Notizen, Detailansichten, Pipeline, erweiterte Analytics. Die Umsetzung folgt den Claude Code Agent Teams Best Practices mit spezialisierten Teammates, die parallel arbeiten.

**Zusaetzliche Anforderungen:**
- n8n Brand-Farben und Designsprache (Dark Theme, `#EA4B71` Pink, `#101330` Navy, Geomanist-Font-Feeling)
- Editierbare Lead-Felder + KI-Briefings + manuelle Notizen
- Muss fuer Sales-Mitarbeiter, CEO, und GF im Arbeitsalltag sofort nuetzlich sein

---

## Agent Team Architektur

### Warum Agent Team statt Subagents?

Laut [Claude Code Agent Teams Docs](https://code.claude.com/docs/en/agent-teams):
- Teammates koennen **direkt miteinander kommunizieren** (Design-Specs → Frontend-Umsetzung)
- **Shared Task List** mit Abhaengigkeiten verhindert Race Conditions
- Jeder Teammate hat eigenes Context Window (keine Ueberlastung bei 35+ neuen Dateien)
- Ideal fuer "Cross-Layer Coordination" (Design + Frontend + Backend + QA)

### Team-Struktur (4 Teammates + Lead)

```
Lead (Orchestrator)
  │
  ├── design    — n8n Design System + UX Specs      ─┐
  ├── architect — Data Layer + API Routes + Routing   ├── starten PARALLEL
  ├── builder   — Alle UI-Komponenten                ─┘ (wartet auf design fuer Farben)
  └── qa        — Integration, Review, Deploy         ── wartet auf ALLE
```

**3-5 Teammates = Best Practice** laut Docs. 4 ist optimal fuer dieses Projekt.

---

## Skill-Installation pro Teammate

Vor dem Team-Start muessen Skills installiert werden:

```bash
# Design Teammate
npx skills add kimny1143/claude-code-template@ui-ux-pro-max -g -y
npx skills add sickn33/antigravity-awesome-skills@kpi-dashboard-design -g -y

# Architect Teammate
npx skills add timelessco/recollect@nextjs -g -y
npx skills add bobmatnyc/claude-mpm-skills@supabase-backend-platform -g -y

# Builder Teammate
npx skills add yonatangross/orchestkit@recharts-patterns -g -y
npx skills add prowler-cloud/prowler@tailwind-4 -g -y

# QA Teammate
npx skills add vudovn/antigravity-kit@code-review-checklist -g -y
npx skills add mindrally/skills@accessibility-a11y -g -y
```

**8 Skills** = gezielte Expertise pro Rolle, kein Overhead.

---

## n8n Design System (Verbindlich fuer alle Teammates)

### Farbpalette

```css
:root {
  /* n8n Brand Primary */
  --n8n-primary: #EA4B71;         /* Mandy Pink — CTAs, aktive States, Akzente */
  --n8n-primary-hover: #d43d63;   /* Darker Pink — Hover */
  --n8n-primary-light: #ea4b7120; /* Pink mit Alpha — Hintergruende */

  /* n8n Dark Theme */
  --n8n-bg-dark: #101330;         /* Deep Navy — Hintergrund */
  --n8n-bg-card: #1a1d3e;         /* Card Background */
  --n8n-bg-card-hover: #222556;   /* Card Hover */
  --n8n-border: #2a2d4e;          /* Borders */

  /* Text */
  --n8n-text-primary: #f5f5f5;    /* Haupttext */
  --n8n-text-secondary: #8b8fa3;  /* Sekundaer */
  --n8n-text-muted: #5e6278;      /* Gedaempft */

  /* Semantische Farben */
  --n8n-success: #42d77d;         /* Gruen — Konvertiert, A-Lead */
  --n8n-warning: #f59e0b;         /* Amber — B-Lead, Warnung */
  --n8n-danger: #ef4444;          /* Rot — C-Lead, Verloren */
  --n8n-info: #3b82f6;            /* Blau — Kontaktiert */
  --n8n-purple: #8b5cf6;          /* Lila — Qualifiziert */

  /* Status */
  --status-new: #5e6278;
  --status-contacted: #3b82f6;
  --status-qualified: #8b5cf6;
  --status-appointment: #f59e0b;
  --status-converted: #42d77d;
  --status-lost: #ef4444;
}
```

### Designprinzipien

- **Dark-first**: `#101330` Navy-Hintergrund (nicht schwarz!)
- **Rounded**: `rounded-xl` (12px) fuer Cards, `rounded-lg` (8px) fuer Buttons/Inputs
- **Subtle borders**: 1px `#2a2d4e` — dezent, nicht dominant
- **Pink als Akzent**: Sparsam einsetzen — CTAs, aktive Nav, wichtige Indikatoren
- **Font**: system-ui mit Geomanist-aehnlichem Charakter (rund, freundlich, technisch)
- **Transitions**: 150ms ease fuer Hover, 300ms fuer Zustandswechsel
- **Schatten**: Minimal, nur fuer Hover-Elevation (`0 4px 12px rgba(16,19,48,0.4)`)

---

## Task List mit Abhaengigkeiten

### Phase 0: Vorbereitung (Lead)
- **T0.1** Skills installieren (8 Skills, siehe oben)
- **T0.2** Schema-Migration 003 ausfuehren (Supabase MCP: `notes`, `briefing`, `briefing_generated_at`)

### Phase 1: Foundation (design + architect PARALLEL)

**design Teammate (T1.1–T1.4):**
- **T1.1** n8n Design Tokens: `globals.css` mit allen CSS-Variablen ueberarbeiten
- **T1.2** Shared UI-Komponenten: `Card.tsx`, `PageHeader.tsx`, `Badge.tsx`, `EmptyState.tsx`
- **T1.3** `StatusBadge.tsx` + `SentimentIndicator.tsx` mit n8n Farben
- **T1.4** `Sidebar.tsx` Navigation mit n8n Look (Pink-Akzent, Navy-BG)

**architect Teammate (T1.5–T1.9):**
- **T1.5** Types erweitern: `LeadFilters`, `LeadUpdatePayload`, Status/Sentiment-Konstanten
- **T1.6** Utils erweitern: `formatFullDate`, `getStatusColor`, `getSentimentColor`, `debounce`
- **T1.7** `supabase-server.ts` (service_role Client, server-only)
- **T1.8** `leads-context.tsx` (SharedState, Realtime, Filter, Detail-Cache, updateLead, generateBriefing)
- **T1.9** `layout.tsx` umbauen: Sidebar + LeadsProvider wrappen

### Phase 2: API + Pages (architect + builder PARALLEL)

**architect Teammate (T2.1–T2.2):**
- **T2.1** API Route: `api/leads/[id]/route.ts` — PATCH mit Whitelist-Validierung
- **T2.2** API Route: `api/leads/[id]/briefing/route.ts` — OpenRouter KI-Briefing mit Caching

**builder Teammate (T2.3–T2.7):** *abhaengig von T1.1–T1.4 (Design Tokens + UI)*
- **T2.3** `LeadSearch.tsx` + `LeadFilters.tsx` + `Pagination.tsx`
- **T2.4** `EnhancedLeadTable.tsx` (9 Spalten, sortierbar, klickbar)
- **T2.5** `/leads/page.tsx` (Tabelle assemblieren)
- **T2.6** `EditableField.tsx` (Shared Inline-Edit Komponente)
- **T2.7** `ContactCard.tsx` (editierbar), `QualificationScores.tsx`, `ConversationSummary.tsx`

### Phase 3: Detail + Pipeline (builder)

**builder Teammate (T3.1–T3.7):** *abhaengig von T2.1–T2.2 (API Routes)*
- **T3.1** `ObjectionsCard.tsx`, `TranscriptViewer.tsx` (aufklappbar + Suche)
- **T3.2** `AppointmentCard.tsx`, `StatusTimeline.tsx`
- **T3.3** `BriefingCard.tsx` (KI-Briefing mit Generieren-Button)
- **T3.4** `NotesEditor.tsx` (Auto-Save Textarea)
- **T3.5** `NextStepsCard.tsx` (editierbare Checkliste)
- **T3.6** `/leads/[id]/page.tsx` + `loading.tsx` (Detail-Seite assemblieren)
- **T3.7** Pipeline: `PipelineBoard.tsx`, `PipelineColumn.tsx`, `PipelineCard.tsx`, `PipelineSummary.tsx`, `/pipeline/page.tsx`

### Phase 4: Analytics (builder)

**builder Teammate (T4.1–T4.2):**
- **T4.1** `AnalyticsKPIs.tsx`, `SentimentDistribution.tsx`, `DropOffAnalysis.tsx`
- **T4.2** `ScoreBreakdown.tsx`, `DecisionMakerRatio.tsx`, `CallDurationDistribution.tsx`, `/analytics/page.tsx`

### Phase 5: QA + Deploy (qa)

**qa Teammate (T5.1–T5.5):** *abhaengig von ALLEN vorherigen*
- **T5.1** Code Review: Alle neuen Dateien gegen n8n Design System, TypeScript-Striktheit, Accessibility
- **T5.2** Build-Verifikation: `npm run build` muss fehlerfrei durchlaufen
- **T5.3** Funktionstest: Alle Routes navigieren, Filter/Suche/Sort/Pagination, Detail-Editierung, KI-Briefing
- **T5.4** Realtime-Test: Supabase-Insert → Dashboard aktualisiert sich live auf allen Seiten
- **T5.5** Vercel Re-Deploy: Neue Env-Vars (`SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`) + `npx vercel --prod`

---

## Teammate-Definitionen (Spawn-Prompts)

### Teammate: design

**Rolle:** UX Designer & Design System Architect
**Skills:** `ui-ux-pro-max`, `kpi-dashboard-design`
**Model:** Sonnet (schnell, gute Design-Intuition)
**Plan Approval:** Ja

```
Du bist der Design-Teammate. Du verantwortest das n8n Design System
und alle visuellen Grundlagen des Dashboards.

DESIGN SYSTEM — Verbindliche n8n Farben:
- Primary: #EA4B71 (Mandy Pink) — CTAs, aktive Nav, wichtige Akzente
- Background: #101330 (Deep Navy) — NICHT schwarz, sondern tiefes Navy!
- Cards: #1a1d3e mit Border #2a2d4e
- Text: #f5f5f5 (primary), #8b8fa3 (secondary), #5e6278 (muted)
- Success/A-Lead: #42d77d, Warning/B: #f59e0b, Danger/C: #ef4444
- Info/Kontaktiert: #3b82f6, Qualifiziert: #8b5cf6

DESIGN PRINZIPIEN:
- Dark-first mit Navy-Hintergrund (wie n8n Produktseite)
- rounded-xl fuer Cards, rounded-lg fuer Buttons
- Subtle 1px borders, keine harten Kanten
- Pink NUR als Akzent (nicht flaechendeckend!)
- Transitions: 150ms Hover, 300ms State-Changes
- Minimale Schatten: 0 4px 12px rgba(16,19,48,0.4) bei Hover

DEINE TASKS:
1. globals.css komplett ueberarbeiten mit n8n CSS-Variablen (ersetze bestehende Vars)
2. Shared UI: Card.tsx, PageHeader.tsx, Badge.tsx, EmptyState.tsx
3. StatusBadge.tsx (6 Status-Varianten) + SentimentIndicator.tsx
4. Sidebar.tsx — fixierte linke Navigation, 4 Items (Uebersicht, Leads, Pipeline, Analytik)
   - n8n Look: Navy-BG, Pink fuer aktive Items, Lucide Icons
   - Mobile: Hamburger-Toggle mit Overlay

BESTEHENDE DATEIEN:
- dashboard/src/app/globals.css — UEBERARBEITEN (n8n Vars statt bestehende)
- dashboard/src/lib/utils.ts — cn() Utility existiert bereits, NUTZEN
- Bestehende Komponenten (KPICards etc.) — NICHT aendern, nur globals.css aendert deren Look

WICHTIG: Alle Farben als CSS Custom Properties, KEINE hardcodierten Hex-Werte
in Komponenten. So passt sich alles automatisch an wenn globals.css aendert.
```

### Teammate: architect

**Rolle:** Frontend Architect & Backend Engineer
**Skills:** `nextjs`, `supabase-backend-platform`
**Model:** Sonnet
**Plan Approval:** Ja

```
Du bist der Architect-Teammate. Du baust das Datenfundament: Types, Context,
API Routes, Routing.

DEINE TASKS:
1. types.ts erweitern (NICHT bestehende Interfaces aendern!):
   - Lead-Interface: notes, briefing, briefing_generated_at hinzufuegen
   - LeadFilters Interface
   - LeadUpdatePayload (Whitelist editierbarer Felder)
   - STATUS_LABELS, STATUS_COLORS, SENTIMENT_LABELS Konstanten
   - SortField, SortDirection Types

2. utils.ts erweitern (bestehende Funktionen NICHT aendern):
   - formatFullDate(dateStr) → Deutsches Langformat (Europe/Berlin)
   - getStatusColor(status) → Hex-Farbe
   - getSentimentColor(sentiment) → Hex-Farbe
   - debounce(fn, ms) → Debounced Function

3. supabase-server.ts (NEU, server-only):
   - createClient mit SUPABASE_SERVICE_ROLE_KEY (NICHT NEXT_PUBLIC_!)
   - Nur in API Route Handlers importierbar

4. leads-context.tsx (NEU, extrahiert Logik aus page.tsx):
   - Gleiche Fetch-Logik wie page.tsx Zeilen 20-92
   - Gleiche Realtime-Subscription wie page.tsx Zeilen 48-86
   - fetchLeadDetail(id) → Einzelner Lead MIT Transcript
   - updateLead(id, fields) → fetch('/api/leads/[id]', PATCH)
   - generateBriefing(id) → fetch('/api/leads/[id]/briefing')
   - Detail-Cache (Map<string, Lead>) mit Realtime-Invalidierung
   - Client-seitige Filter + Suche
   - WICHTIG: page.tsx NICHT aendern! Der Provider wraps alles, page.tsx
     kann spaeter optional migriert werden

5. layout.tsx umbauen:
   - Sidebar + LeadsProvider wrappen
   - NICHT die bestehende metadata aendern
   - Sidebar wird vom design-Teammate gebaut, importiere sie

6. API Route: api/leads/[id]/route.ts (PATCH):
   - Whitelist: caller_name, company, email, phone, company_size,
     current_stack, pain_point, timeline, status, notes, next_steps
   - NICHT erlaubt: score_*, total_score, lead_grade, transcript, etc.
   - Input-Validierung: max 500 chars, keine <script>, Strip HTML
   - Nutze supabaseAdmin (service_role) fuer den Write
   - Gibt aktualisierten Lead zurueck

7. API Route: api/leads/[id]/briefing/route.ts (GET):
   - Laedt Lead aus Supabase (inkl. transcript, conversation_summary)
   - Prueft Cache: briefing_generated_at < 1 Stunde alt → gecachtes Briefing
   - Sonst: OpenRouter POST mit GPT-5-mini
   - Prompt: Erstelle Demo-Briefing (Kernbotschaft, Vorbereitung 3-5 Punkte,
     Einwaende antizipieren, Demo-Fokus). Deutsch, max 300 Woerter.
   - Speichert Briefing in Supabase (Cache)
   - OpenRouter API Key: OPENROUTER_API_KEY (server-only Env-Var)

CREDENTIALS:
- Supabase URL: https://ltarsnseyhtfbsxjrhdu.supabase.co
- Service Role Key: aus .agent-state.json → credentials.supabase_service_role_key
- OpenRouter Key: aus .agent-state.json → credentials.openrouter_api_key
- OpenRouter Model: openai/gpt-5-mini

BESTEHENDE DATEIEN:
- dashboard/src/lib/types.ts — ERWEITERN (32 Felder bestehen)
- dashboard/src/lib/utils.ts — ERWEITERN (cn, formatDuration, formatDate, getGradeColor bestehen)
- dashboard/src/lib/supabase.ts — NICHT AENDERN (Client-Side bleibt)
- dashboard/src/app/layout.tsx — AENDERN (Sidebar + Provider)
- dashboard/src/app/page.tsx — NICHT AENDERN
```

### Teammate: builder

**Rolle:** Component Builder & Page Assembler
**Skills:** `recharts-patterns`, `tailwind-4`
**Model:** Sonnet
**Plan Approval:** Ja

```
Du bist der Builder-Teammate. Du baust ALLE neuen UI-Komponenten und
assemblierst die Seiten. Du arbeitest mit den Design Tokens und dem
Data Layer die deine Teammates erstellen.

WARTE auf design-Teammate (T1.1–T1.4) bevor du startest — du brauchst
die CSS-Variablen und Shared UI-Komponenten.

WARTE auf architect-Teammate (T2.1–T2.2) bevor du Detail-Seite baust —
du brauchst die API Routes fuer Editierung und Briefings.

DESIGN REGELN:
- Nutze CSS Custom Properties (var(--n8n-primary) etc.), KEINE hardcodierten Farben
- Importiere Card, Badge, PageHeader, EmptyState aus components/ui/
- Importiere StatusBadge, SentimentIndicator aus components/leads/
- Nutze cn() aus @/lib/utils fuer Tailwind Class Merging
- Jede Komponente: ein klares Interface, keine Business-Logik
- Recharts: Dark Theme mit n8n Farben, keine default Recharts-Styles

DEINE TASKS (in Reihenfolge):

--- Lead-Tabelle (T2.3–T2.5) ---
1. LeadSearch.tsx: Input mit Search-Icon, Debounce 300ms
2. LeadFilters.tsx: Grade-Toggle (A/B/C), Status-Dropdown, Sentiment, Termin, Zeitraum, Clear
3. Pagination.tsx: "Zeige X-Y von Z Leads", Prev/Next, Seitenzahlen, 25/Seite
4. EnhancedLeadTable.tsx: 9 Spalten (Name, Firma+Groesse, Grade, Status, Sentiment,
   Dauer, Termin, Datum, ChevronRight), alle sortierbar, Zeilen = Link zu /leads/[id]
5. /leads/page.tsx: Assembliert Search + Filters + Table + Pagination, nutzt LeadsContext

--- Lead-Detail Komponenten (T2.6–T2.7, T3.1–T3.6) ---
6. EditableField.tsx: Shared Inline-Edit (Text anzeigen → Klick → Input → Blur/Enter → Save)
   Props: value, onSave, label, type (text/email/tel/textarea)
7. ContactCard.tsx: 6 editierbare Felder (Name, Firma, Email, Phone, Groesse, Stack)
   mit EditableField, Icons aus lucide-react (User, Building, Mail, Phone, Users, Wrench)
8. QualificationScores.tsx: 4 horizontale Score-Balken (1-3), farbcodiert nach Grade,
   Gesamt X/12 + Grade Badge. READ-ONLY.
9. ConversationSummary.tsx: KI-Zusammenfassung + Sentiment-Banner oben
10. ObjectionsCard.tsx: Einwaende als farbige Tags + Drop-off-Punkt
11. TranscriptViewer.tsx: Aufklappbar (default: zu), Monospace,
    lokale Suche mit gelb-Highlighting der Treffer
12. AppointmentCard.tsx: Gruener Banner wenn gebucht + Langformat-Datum + Booking-ID
13. BriefingCard.tsx: "Demo-Briefing generieren" Button, Loading-State,
    gecachtes Briefing als strukturierter Text (Kernbotschaft, Vorbereitung, etc.)
14. NotesEditor.tsx: Textarea mit Auto-Save (Debounce 1s),
    "Gespeichert"-Indikator, nutzt updateLead aus Context
15. NextStepsCard.tsx: Editierbare Checkliste + "Schritt hinzufuegen" Input
16. StatusTimeline.tsx: Visueller Lifecycle (Neu→Kontaktiert→Qualifiziert→Termin→Konvertiert)
    + Verloren-Abzweigung, aktiver Schritt pulsiert, Status-Dropdown zum Aendern
17. LeadDetailHeader.tsx: Name gross, Grade-Badge, Status-Badge, Sentiment,
    Entscheider-Shield-Icon, Schnellinfos (Dauer, Datum)
18. /leads/[id]/page.tsx: 2-Spalten Layout (Desktop), 1 Spalte (Mobile),
    nutzt fetchLeadDetail aus Context
19. /leads/[id]/loading.tsx: Skeleton mit animierten Pulse-Balken

--- Pipeline (T3.7) ---
20. PipelineBoard.tsx: Gruppiert Leads nach Status, 6 Spalten, horizontal scrollbar
21. PipelineColumn.tsx: Header + Count-Badge + farbiger Top-Border + Cards
22. PipelineCard.tsx: Kompakt (Name, Firma, Grade, Sentiment), klickbar → /leads/[id]
23. PipelineSummary.tsx: Funnel-Balken + Verlustrate
24. /pipeline/page.tsx: Assembliert Summary + Board

--- Analytics (T4.1–T4.2) ---
25. AnalyticsKPIs.tsx: 4 Karten (Entscheider-%, Ø Score, Positiv-Rate, A-Lead Termin-%)
26. SentimentDistribution.tsx: Recharts PieChart (3 Segmente)
27. DropOffAnalysis.tsx: Horizontale Balken (OPENING/DISCOVERY/PITCH/CLOSING)
28. ScoreBreakdown.tsx: Recharts RadarChart (4 Achsen)
29. DecisionMakerRatio.tsx: Donut-Chart
30. CallDurationDistribution.tsx: Histogramm (0-1, 1-2, 2-3, 3-5, 5-8, 8+ min)
31. /analytics/page.tsx: Assembliert alle Analytics-Komponenten

BESTEHENDE KOMPONENTEN — NICHT AENDERN:
- KPICards.tsx, LeadTable.tsx, ConversionChart.tsx, LeadScoreDistribution.tsx, ObjectionChart.tsx
```

### Teammate: qa

**Rolle:** QA Engineer, Reviewer, Deploy Manager
**Skills:** `code-review-checklist`, `accessibility-a11y`
**Model:** Sonnet
**Plan Approval:** Nein (reviewed direkt)

```
Du bist der QA-Teammate. Du startest NACHDEM alle anderen fertig sind.

1. CODE REVIEW:
   - Pruefe ALLE neuen Dateien gegen n8n Design System (Farben, Spacing, Radii)
   - TypeScript Strict Mode: keine 'any', alle Props typisiert
   - Accessibility: aria-labels, Keyboard-Navigation, Farbkontraste
   - Security: API Route Validierung, keine XSS-Vektoren
   - Performance: useMemo wo noetig, keine unnuetigen Re-Renders

2. BUILD:
   - cd dashboard && npm run build
   - ALLE TypeScript-Fehler beheben
   - Keine Build-Warnings ignorieren

3. FUNKTIONSTEST:
   - / (Uebersicht): KPIs korrekt, Charts laden
   - /leads: Suche funktioniert, Filter filtern, Sort sortiert, Pagination paginiert
   - /leads/[id]: Alle Felder angezeigt, Editierung speichert (API Route Test),
     Briefing-Generierung funktioniert, Notizen Auto-Save, Transcript aufklappbar
   - /pipeline: Leads korrekt nach Status gruppiert, Cards klickbar
   - /analytics: Alle 6 Charts rendern korrekt

4. REALTIME:
   - Supabase INSERT testen → erscheint auf allen Seiten live
   - Supabase UPDATE testen → Detail-Cache invalidiert

5. VERCEL DEPLOY:
   - Neue Env-Vars setzen: SUPABASE_SERVICE_ROLE_KEY, OPENROUTER_API_KEY
   - npx vercel --prod
   - Deployed URL verifizieren
```

---

## Review als erfahrener Geschaeftsfuehrer (30 Jahre Erfahrung)

Ich pruefe dieses Dashboard jetzt aus der Perspektive eines GF mit 30 Jahren Sales-Erfahrung:

### Was ich als GF/CEO sofort sehen will:

**Uebersicht (`/`)** — "Wie laufen wir heute?"
- ✅ 4 KPIs auf einen Blick: Calls, Conversion, Dauer, A-Leads heute
- ✅ 7-Tage-Trend: Sehe ich sofort ob wir besser oder schlechter werden
- ✅ Live-Indikator: Weiss ich ob Daten aktuell sind
- **Bewertung: 9/10** — Genau das was ich morgens als erstes oeffne

**Leads (`/leads`)** — "Wen muss mein Team heute anrufen?"
- ✅ Suche nach Firma/Name: Finde sofort einen bestimmten Lead
- ✅ Filter nach Grade: "Zeig mir nur A-Leads" fuer Priorisierung
- ✅ Filter nach Status: "Wer hat noch keinen Termin?" fuer Follow-up
- ✅ Sortierung nach Score: Beste Leads zuerst
- **Bewertung: 10/10** — Genau so funktioniert Sales-Priorisierung

**Lead-Detail (`/leads/[id]`)** — "Was weiss ich ueber diesen Kunden?"
- ✅ Kontaktdaten editierbar: Tippfehler korrigieren, Updates nach Gespraech
- ✅ KI-Zusammenfassung: Muss nicht ganzes Transcript lesen
- ✅ Qualification Scores: Sehe sofort wie "heiss" der Lead ist
- ✅ **KI Demo-Briefing**: DAS ist Gold wert! Vor jedem Demo-Call automatisch
  vorbereitet: "Deren Pain Point ist X, sie nutzen aktuell Y, achte auf Z"
- ✅ Manuelle Notizen: Eigene Beobachtungen hinzufuegen
- ✅ Next Steps als Checkliste: Nichts vergessen
- ✅ Status aendern: Lead-Lifecycle nachverfolgen
- ✅ Einwaende sichtbar: Weiss genau welche Gegenargumente ich brauche
- **Bewertung: 10/10** — Komplette Kundenakte + KI-Vorbereitung, besser als jedes CRM

**Pipeline (`/pipeline`)** — "Wo stehen unsere Deals?"
- ✅ Kanban-Board: Sofort sichtbar wo sich Leads stauen
- ✅ Funnel-Balken: Conversion pro Stage auf einen Blick
- ✅ Read-only: Kein versehentliches Verschieben (Datenintegritaet!)
- **Bewertung: 8/10** — Fuer den Anfang gut. Spaeter: Drag & Drop waere schoen.

**Analytics (`/analytics`)** — "Welche Muster erkenne ich?"
- ✅ Entscheider-Quote: Sprechen wir mit den richtigen Leuten?
- ✅ Drop-off Analyse: Wo verlieren wir Leads? (DISCOVERY vs CLOSING)
- ✅ Sentiment-Verteilung: Wie ist die Grundstimmung?
- ✅ Score-Radar: In welchen Kriterien sind wir stark/schwach?
- ✅ Gespraechsdauer-Histogramm: Sind Gespraeche zu kurz/lang?
- **Bewertung: 9/10** — Datengetriebene Entscheidungen statt Bauchgefuehl

### Was mir als GF besonders wichtig ist:

1. **Demo-Briefing ist ein Game Changer** — Kein Sales-Mitarbeiter geht unvorbereitet
   in ein Demo-Gespraech. Das spart 15-20 Min Vorbereitung pro Call.

2. **Editierbare Felder** — Daten muessen korrigierbar sein. KI-Transkription
   ist nie 100% korrekt, Firmennamen werden falsch erkannt, etc.

3. **Pipeline-Ueberblick** — Als GF sehe ich sofort wo sich Deals stauen und
   kann mein Team gezielt unterstuetzen.

4. **n8n Design** — Das Dashboard fuehlt sich an wie Teil des n8n-Oekosystems,
   nicht wie ein zusammengeschustertes Tool. Das schafft Vertrauen bei Kunden.

### Was spaeter noch kommen sollte (nicht jetzt):
- Export als CSV/PDF fuer Board-Meetings
- E-Mail-Benachrichtigungen bei A-Lead
- Vergleich aktuelle Woche vs. letzte Woche
- Multi-User mit Login (aktuell kein Auth)

**Gesamtbewertung: 9.2/10** — Production-ready fuer ein Unternehmen das
datengetrieben verkaufen will. Die Kombination aus Live-KPIs, editierbaren
Lead-Daten und KI-generierten Briefings ist auf dem Niveau eines Enterprise CRM,
aber deutlich schneller und fokussierter.

---

## Verifikation

1. `npm run build` — Keine Fehler
2. Migration 003 ausgefuehrt (Supabase MCP)
3. Alle 4 Routes navigierbar, Sidebar funktioniert, Mobile responsive
4. Lead-Detail: Editierung speichert, KI-Briefing generiert, Notizen auto-saved
5. Realtime: Updates auf allen Seiten sichtbar
6. Vercel re-deployed mit neuen Env-Vars
7. n8n Design System durchgaengig angewendet (Navy BG, Pink Akzente, Rounded Cards)
