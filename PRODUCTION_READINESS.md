# Production Readiness Audit & Implementierungsplan

> Erstellt von einem 9-köpfigen Experten-Team (3 Review-Runden)
> v1: UI/UX Architect, Data/Backend Architect, Senior VP of Sales
> v2: UI/Recharts Expert, Security/Backend Architect, Implementation Strategist
> v3: UI/Charts Review Agent, Security/Backend Review Agent, Implementation Review Agent
> Datum: 2026-03-01 (v3: finale Verifizierung gegen Codebase)

## Zusammenfassung

Sechs Experten-Agenten haben das gesamte Dashboard analysiert und **gegen den tatsächlichen Code verifiziert**: 10 Seiten, 60+ Komponenten, 5 API-Routes, 3 Supabase-Tabellen, das OKLCH-Farbsystem und alle KPI-Berechnungen.

**Ergebnis:** Das Dashboard ist ein starkes MVP mit hoher Code-Qualität, aber es hat **14 Berechnungs-/Daten-Bugs**, **Security-Lücken** (keine Auth, Error-Message-Leaks), **UI-Inkonsistenzen** (5x duplizierte KPICard, hardcoded Hex-Farben, Charts ohne Gradients) und **Feature-Gaps** (kein Export, kein Error Boundary, keine Cmd+K-Suche). Dieser Plan macht es 100% production-ready.

---

## Teil 1: Seiten-Konsolidierung (10 → 7 Seiten)

### Aktuelle Struktur
```
/               Dashboard (KPIs + Charts + LeadTable)
/leads          Lead-Liste (Filter + Sortierung + Pagination)
/leads/[id]     Lead-Detail (Editierbar + Transcript + Briefing)
/pipeline       Pipeline (Kanban + Funnel)
/analytics      Analytics (6 Charts)
/sentiment      Sentiment (4 KPIs + 3 Charts)
/objections     Einwände (4 KPIs + 4 Charts + Gegenargumente)
/quotes         Zitate (Liste + Filter + Pagination)
/alerts         Frühwarnsystem (Severity-Tabs + Karten)
/team           Team (CRUD + KPIs)
```

### Neue Struktur (7 Seiten)
```
/               Dashboard (KPIs + Alert-Banner + Charts + LeadTable)
/leads          Lead-Liste (Filter + Sortierung + Pagination)
/leads/[id]     Lead-Detail (+ Zitate-Tab integriert)
/pipeline       Pipeline (Kanban + Funnel + Stage-Metriken)
/analytics      Analytics (Tabs: Überblick | Sentiment | Einwände)
/alerts         Frühwarnsystem (+ KPI-Karten + Risk-Chart)
/team           Team (CRUD + Leaderboard-Chart + KPIs)
```

### Konsolidierungs-Details

**1. /sentiment → Tab in /analytics**
- `SentimentKPIs`, `SentimentOverTime`, `SentimentByGrade`, `SentimentConversionMatrix` werden in einen "Sentiment"-Tab innerhalb der Analytics-Seite verschoben
- Die 3 redundanten KPIs (Positiv-%, Neutral-%, Negativ-%) werden durch eine Stacked Progress Bar + 2 nützlichere KPIs ersetzt
- Datei `app/sentiment/page.tsx` wird gelöscht

**2. /objections → Tab in /analytics**
- `ObjectionsKPIs`, `ObjectionRanking`, `ObjectionConversionCorrelation`, `ObjectionTrend`, `ObjectionCounterArguments` werden in einen "Einwände"-Tab verschoben
- Datei `app/objections/page.tsx` wird gelöscht

**3. /quotes → Tab in /leads/[id]**
- Zitate werden kontextuell zur Lead-Detail-Seite als neuer Tab neben dem Transcript-Viewer angezeigt
- Die QuoteFilters und QuoteList-Komponenten bleiben, werden aber innerhalb des Lead-Detail-Layouts gerendert
- Datei `app/quotes/page.tsx` wird gelöscht
- API-Route `/api/quotes` bleibt (unterstützt bereits `leadId`-Filter-Parameter)
- `ContactCard` bleibt **oberhalb** der Tabs (immer sichtbar, nicht in einem Tab)
- `StatusTimeline` verschiebt sich in die rechte Spalte oder Tab "Zusammenfassung"
- Quotes-Fetch im Tab: `/api/quotes?leadId=${lead.id}` (Endpoint existiert und funktioniert)
- **Hinweis:** Lead-Detail hat aktuell KEIN Tab-System → muss eingebaut werden (Aufwand: 3-3.5h statt 2h)

**4. Alert-Badge im Sidebar**
- Sidebar erhält ein Alert-Count-Badge neben dem "Frühwarnsystem" Link
- /alerts bleibt als eigene Seite, bekommt aber KPI-Karten und ein Risk-Verteilungs-Chart
- **Implementierung:** Neuer Hook `useAlerts(leads)` in `lib/hooks/useAlerts.ts` — extrahiert die Alert-Logik aus `alerts/page.tsx` als wiederverwendbar. Sidebar importiert nur `totalCount` für das Badge.

**5. Analytics-Seite mit Tabs**
- **Dependency:** `@radix-ui/react-tabs` muss installiert werden (aktuell nicht im Projekt)
- Neue `ui/tabs.tsx` Datei nach shadcn-Pattern erstellen (mit `TabsList`, `TabsTrigger`, `TabsContent`)
- Tab-Inhalte: "Überblick" (bisherige /analytics), "Sentiment" (bisherige /sentiment), "Einwände" (bisherige /objections)
- `TabsContent` Default `forceMount={false}` → nur aktiver Tab wird gerendert (Performance)
- URL-State: `/analytics?tab=sentiment` für Deep-Links via `useSearchParams()` + `router.replace()`
- **WICHTIG:** `<Suspense>` Boundary für `useSearchParams()` erforderlich (Next.js 15 Requirement)

```typescript
// URL-State Implementierung in analytics/page.tsx
const searchParams = useSearchParams();
const router = useRouter();
const pathname = usePathname();
const activeTab = searchParams.get("tab") ?? "overview";

const handleTabChange = (tab: string) => {
  const params = new URLSearchParams(searchParams.toString());
  if (tab === "overview") params.delete("tab");
  else params.set("tab", tab);
  router.replace(`${pathname}?${params.toString()}`, { scroll: false });
};
```

**6. 404-Redirects für gelöschte Seiten**
- `/sentiment`, `/objections`, `/quotes` müssen nach Löschung sauber behandelt werden
- Optionen: `redirect("/analytics")` in einer minimalen `page.tsx` oder `not-found.tsx`
- Wichtig für bestehende Bookmarks und SEO

### Sidebar-Navigation (neu)
```
ÜBERSICHT
  └─ Dashboard (/)

DATEN
  ├─ Leads (/leads)
  └─ Pipeline (/pipeline)

ANALYSE
  └─ Analytics (/analytics)     ← mit internen Tabs

TOOLS
  └─ Frühwarnsystem (/alerts)   ← mit Badge-Count

TEAM
  └─ Team-Verwaltung (/team)
```

### Zu löschende Dateien
- `dashboard/src/app/sentiment/page.tsx` → Redirect zu `/analytics?tab=sentiment`
- `dashboard/src/app/objections/page.tsx` → Redirect zu `/analytics?tab=objections`
- `dashboard/src/app/quotes/page.tsx` → Redirect zu `/leads`

### Neue Dateien
- `dashboard/src/components/ui/tabs.tsx` → Generische Tab-Komponente (Radix-basiert)
- `dashboard/src/lib/hooks/useAlerts.ts` → Wiederverwendbare Alert-Logik für Sidebar-Badge

### Zu ändernde Dateien
- `dashboard/src/app/analytics/page.tsx` → Tab-System mit 3 Tabs + `<Suspense>` + URL-State
- `dashboard/src/app/leads/[id]/page.tsx` → Zitate-Tab + Tab-System für linke Spalte
- `dashboard/src/app/alerts/page.tsx` → KPI-Karten + Chart hinzufügen
- `dashboard/src/components/Sidebar.tsx` → Nav-Sektionen reduzieren + Alert-Badge (via `useAlerts`)
- Sentiment/Objections/Quotes-Komponenten bleiben in ihren Ordnern (werden von Analytics bzw. Lead-Detail importiert)

---

## Teil 2: KPI-Berechnungs- & Daten-Bugs (14 Findings)

### BUG 1: Avg Duration zählt Leads ohne Call (MEDIUM)
**Datei:** `dashboard/src/app/page.tsx:33-36`
```typescript
// AKTUELL: Alle Leads im Nenner, auch ohne Call-Dauer
const duration = total > 0
  ? leads.reduce((sum, l) => sum + (l.call_duration_seconds || 0), 0) / total : 0;

// FIX: Nur Leads mit Call-Dauer zählen
const leadsWithDuration = leads.filter(l => l.call_duration_seconds != null && l.call_duration_seconds > 0);
const duration = leadsWithDuration.length > 0
  ? leadsWithDuration.reduce((sum, l) => sum + l.call_duration_seconds!, 0) / leadsWithDuration.length : 0;
```

### BUG 2: "Conversion Rate" ist eigentlich "Appointment Booking Rate" (HIGH)
**Datei:** `dashboard/src/app/page.tsx:31-32`
```typescript
// AKTUELL: appointment_booked / total → heißt "Conversion Rate"
const booked = leads.filter((l) => l.appointment_booked).length;
const conversion = total > 0 ? (booked / total) * 100 : 0;

// FIX: Echte Win Rate berechnen + Label ändern
const converted = leads.filter(l => l.status === "converted").length;
const closedDeals = leads.filter(l => ["converted", "lost"].includes(l.status)).length;
const winRate = closedDeals > 0 ? (converted / closedDeals) * 100 : 0;
// KPICards.tsx: Label "Conversion Rate" → "Win Rate"
// Zusätzlich: "Termin-Quote" als 5. KPI hinzufügen
// EDGE CASE: Wenn closedDeals === 0 (frühes Deployment, keine abgeschlossenen Deals),
// zeige "n/a" oder "--" statt 0%, mit Tooltip "Noch keine abgeschlossenen Deals"
```
**Hinweis:** `KPIData` Interface in `types.ts` muss aktualisiert werden:
```typescript
export interface KPIData {
  totalCalls: number;      // → "Anrufe heute" (gefiltert auf Berlin-Datum)
  winRate: number;         // NEU: converted / closedDeals (statt conversionRate)
  appointmentRate: number; // NEU: "Termin-Quote" (appointment_booked / total)
  avgDuration: number;
  aLeadsToday: number;
}
```

### BUG 3: Decision-Maker % zählt NULL als "Nein" (MEDIUM)
**Datei:** `dashboard/src/components/analytics/AnalyticsKPIs.tsx:56-57`
```typescript
// AKTUELL: null wird als "kein Entscheider" gezählt
const decisionMakerPct = total > 0 ? (decisionMakers / total) * 100 : 0;

// FIX: Nur bekannte Werte im Nenner
const knowns = leads.filter(l => l.is_decision_maker !== null).length;
const decisionMakerPct = knowns > 0 ? (decisionMakers / knowns) * 100 : 0;
```

### BUG 4: Avg Score filtert total_score=0 nicht korrekt (MEDIUM)
**Datei:** `dashboard/src/components/analytics/AnalyticsKPIs.tsx:60-64`
```typescript
// PROBLEM: total_score ist GENERATED ALWAYS AS (...), nie NULL
// Leads ohne Scores haben total_score=0, nicht NULL
// Der Filter total_score !== null greift nie

// FIX: Prüfen ob mindestens ein Score-Feld gesetzt ist
const leadsWithScore = leads.filter(l =>
  l.score_company_size !== null || l.score_tech_stack !== null ||
  l.score_pain_point !== null || l.score_timeline !== null
);
```

### BUG 5: Sentiment-Prozente summieren nicht zu 100% (LOW)
**Datei:** `dashboard/src/components/sentiment/SentimentKPIs.tsx:60-62`
```typescript
// PROBLEM: Math.round auf jede Rate → 33+33+33=99%
// FIX: Letzten Wert als Rest berechnen
const negativePct = total > 0 ? 100 - positivePct - neutralPct : 0;
```

### BUG 6: Sentiment-Trend irreführend bei fehlenden Vergleichsdaten (LOW)
**Datei:** `dashboard/src/components/sentiment/SentimentKPIs.tsx:64-87`
```typescript
// PROBLEM: Wenn previousLeads.length === 0, zeigt Trend "+60% Verbesserung"
// FIX: Wenn keine Vergleichsdaten IN BEIDEN RICHTUNGEN, "n/a" anzeigen
const trendDelta = (previousLeads.length > 0 && recentLeads.length > 0)
  ? recentPositivePct - previousPositivePct
  : null;
// UI: trendDelta === null → "Keine Vergleichsdaten" statt Pfeil
// EDGE CASE: Auch recentLeads.length === 0 prüfen (sonst zeigt es Rückgang bei leerer Periode)
```

### BUG 7: Timezone-Bug in SentimentOverTime (HIGH)
**Datei:** `dashboard/src/components/sentiment/SentimentOverTime.tsx:64-74`
```typescript
// PROBLEM: toLocaleDateString OHNE timeZone → Server-Timezone (UTC auf Vercel)
const key = d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });

// FIX: timeZone explizit setzen
const key = d.toLocaleDateString("de-DE", {
  day: "2-digit", month: "2-digit", timeZone: "Europe/Berlin"
});
```
**Auch betroffen:** `ObjectionTrend.tsx` — aber mit LOW Severity (Wochen-Granularität maskiert off-by-one-day-Fehler). Die `getISOWeek()` Funktion in ObjectionTrend nutzt `Date.UTC()` korrekt für die Week-Berechnung, aber die Tages-Zuordnung in Zeile 100 (`new Date(l.created_at)`) nutzt lokale TZ. Bei wöchentlicher Aggregation ist der Impact minimal.

### BUG 8: Alert-System nutzt created_at statt updated_at (HIGH)
**Datei:** `dashboard/src/app/alerts/page.tsx:18`
```typescript
// PROBLEM: "Inaktivität" basiert auf created_at, nicht letzter Aktivität
const lastActivity = new Date(lead.created_at).getTime();

// FIX: updated_at nutzen
const lastActivity = new Date(lead.updated_at ?? lead.created_at).getTime();
```
**Hinweis:** `updated_at` muss zu `CONTEXT_FIELDS` in `leads-context.tsx` hinzugefügt und zum `Lead` Interface in `types.ts` ergänzt werden.

### BUG 9: Alert-Regel 2 zu aggressiv (MEDIUM)
**Datei:** `dashboard/src/app/alerts/page.tsx:28-29`
```typescript
// PROBLEM: Neue Leads haben legitim keine Next Steps
if (!lead.next_steps || lead.next_steps.length === 0)

// FIX: Nur für qualifizierte+ Leads
if ((!lead.next_steps || lead.next_steps.length === 0) &&
    ["qualified", "appointment_booked"].includes(lead.status))
```

### BUG 10: Alert-Regel 5 zu aggressiv (LOW)
**Datei:** `dashboard/src/app/alerts/page.tsx:44`
```typescript
// PROBLEM: Alle Leads ohne Zuweisung lösen Alert aus
if (!lead.assigned_to)

// FIX: Nur für B+ Leads oder Leads mit Termin
if (!lead.assigned_to && ((lead.total_score ?? 0) >= 7 || lead.appointment_booked))
```

### BUG 11: Objection-Normalisierung inkonsistent — 2 Varianten in 6 Dateien (MEDIUM)
**Dateien (verifiziert):**
- **Variante A** (1 Datei): `page.tsx:22` → `trim().toLowerCase().replace(/\s+/g, " ")` — NUR lowercase, keine Kapitalisierung
- **Variante B** (5 Dateien): `ObjectionsKPIs.tsx:52`, `ObjectionRanking.tsx:35`, `ObjectionConversionCorrelation.tsx:28`, `ObjectionTrend.tsx:30`, `ObjectionCounterArguments.tsx:46` → `trim().replace(/\s+/g, " ").toLowerCase().replace(/^./, c => c.toUpperCase())` — Title-Case

**Problem:** Variante A auf dem Dashboard zählt anders als Variante B in den Analyse-Seiten. "Kein Budget" vs "kein budget" → werden als verschiedene Einwände gezählt.

**FIX:** Eine einzige `normalizeObjection()` Funktion in `lib/utils.ts` extrahieren (Title-Case Variante B ist korrekt für Display) und in allen 6 Dateien importieren.

### BUG 12: Conversion Trend Performance O(7n) (LOW)
**Datei:** `dashboard/src/app/page.tsx:76-92`
```typescript
// PROBLEM: 7 Tage × n Leads × toBerlinDate() = 7n teure Intl-Aufrufe
// FIX 1: Vorher eine Map bauen
const leadsByDate = new Map<string, Lead[]>();
leads.forEach(l => {
  const key = toBerlinDate(l.created_at);
  if (!leadsByDate.has(key)) leadsByDate.set(key, []);
  leadsByDate.get(key)!.push(l);
});
// Dann pro Tag nur Map-Lookup statt Filter

// FIX 2 (zusätzlich): Intl.DateTimeFormat Instanz wiederverwenden
// AKTUELL: toBerlinDate() erstellt pro Aufruf neue Intl-Instanz
const berlinFormatter = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" });
function toBerlinDate(iso: string): string {
  return berlinFormatter.format(new Date(iso));
}
// → Einmal instanziieren, bei allen Aufrufen wiederverwenden
```
**Hinweis:** Die `leadsByDate`-Map wird auch für die Sparkline-Berechnungen (Teil 3) benötigt.

### BUG 13: "Anrufe heute" vs "Total Calls" — Feature-Change (LOW)
**Datei:** `dashboard/src/app/page.tsx:30`
```typescript
// AKTUELL: total = leads.length → zählt ALLE Leads (All-Time)
// Das Label "Total Calls" ist technisch korrekt, aber eine Vanity-Metrik

// EMPFEHLUNG: Beides anzeigen
// KPI 1: "Anrufe heute" → leads.filter(l => toBerlinDate(l.created_at) === berlinToday).length
// Subtitle: "Gesamt: {total}"
```
**Hinweis:** Dies ist KEIN Bug-Fix, sondern ein Feature-Change. Sollte in den KPI-Label-Task (#7) integriert werden.

### BUG 14: API Error Messages leaken Supabase-Details (MEDIUM)
**Dateien:** Alle API-Routes (`leads/[id]/route.ts`, `team/route.ts`, `team/[id]/route.ts`, `quotes/route.ts`, `leads/[id]/briefing/route.ts`)
```typescript
// PROBLEM: Supabase-Fehlermeldungen werden direkt an den Client zurückgegeben
return NextResponse.json({ error: error.message }, { status: 500 });
// error.message kann Tabellennamen, Constraint-Namen, Schema-Details enthalten

// FIX: Generische Fehlermeldungen + server-seitiges Logging
console.error("API Error:", error);
return NextResponse.json({ error: "Ein Fehler ist aufgetreten" }, { status: 500 });
```

---

## Teil 3: UI Grid-Layout & Premium-Visualisierungen

### 3.1 Shared KPICard-Komponente extrahieren

**Problem:** Die `KPICard`-Komponente ist 5x dupliziert:
- `KPICards.tsx` (Dashboard)
- `AnalyticsKPIs.tsx`
- `SentimentKPIs.tsx`
- `ObjectionsKPIs.tsx`
- `TeamKPIs.tsx`

**Fix:** Neue Datei `dashboard/src/components/ui/KPICard.tsx`:
```typescript
interface KPICardProps {
  label: string;
  value?: string;
  numericValue?: number;
  suffix?: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  subtitle?: string;
  sparklineData?: number[]; // NEU: 7-Tage Mini-Trend
  trend?: { delta: number; improving: boolean } | null; // NEU: Trend-Indikator
}
```
Features:
- Einheitliches Design mit `AnimatedNumber` (existiert in `ui/animated-number.tsx`)
- `value?: string` muss optional bleiben (wird für formatierte Duration "3:45" gebraucht)
- `trend === null` → Trend-Bereich nicht rendern; `trend.delta === 0` → neutraler Zustand
- Optional: 7-Tage Sparkline (Recharts `<Line>` ohne Achsen)
- Optional: Trend-Pfeil mit Delta-Prozent
- Hover-Effekt mit glass-Glow

**Sparkline-Berechnungslogik** (neue Utility-Funktion in `lib/utils.ts`):
```typescript
function computeSparklineData(
  leadsByDate: Map<string, Lead[]>, // aus BUG 12 Fix
  metric: (dayLeads: Lead[]) => number,
  days: number = 7
): number[] {
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    const key = toBerlinDate(d.toISOString());
    return metric(leadsByDate.get(key) ?? []);
  });
}
```
4 Metriken:
- **Anrufe/Tag**: `dayLeads => dayLeads.length`
- **Win Rate/Tag**: `dayLeads => { const closed = dayLeads.filter(...); return closed.length > 0 ? ... : 0; }` (kumulativ sinnvoller bei wenig Daten)
- **Termin-Quote/Tag**: `dayLeads => { return dayLeads.length > 0 ? dayLeads.filter(l => l.appointment_booked).length / dayLeads.length * 100 : 0; }`
- **A-Leads/Tag**: `dayLeads => dayLeads.filter(l => l.lead_grade === "A").length`

### 3.2 Dashboard (/) — Layout-Optimierung

**Aktuelles Layout:**
```
[PageHeader                                          ]
[         MAIN KPIS (glass container)                ]
[  KPI1  |  KPI2  |  KPI3  |  KPI4                  ]
[ConversionChart (2/3)    | LeadScoreDistrib (1/3)   ]
[LeadTable (2/3)          | ObjectionChart (1/3)     ]
```

**Optimiertes Layout:**
```
[PageHeader                               | Live + Count]
[Alert-Banner (Top 3 kritische Alerts, klappbar)        ]
[         KPI-KARTEN (glass container)                   ]
[  Anrufe  |  Win Rate  |  Termin-Quote  | A-Leads heute]
[  heute   |  (30 Tage) |  (30 Tage)    | (Berlin TZ)  ]
[  +Spark  |  +Spark    |  +Spark       | +Spark       ]
[ConversionChart (2/3)     | LeadScoreDistrib (1/3)     ]
[  AreaChart + RefLine     | 3D BarChart (bestehend)    ]
[TerminKalender (2/3)      | ObjectionChart (1/3)       ]
[  Wochenansicht Glass-Card| Recharts HorizontalBar     ]
[LeadTable (full width, letzte 10 Calls)                ]
```

**Änderungen:**
1. Alert-Banner oben: Top 3 kritische Alerts als kompakte Zeile, klappbar
2. KPI-Labels auf Deutsch: "Total Calls" → "Anrufe heute", "Conversion Rate" → "Win Rate"
3. Sparklines in jeder KPI-Karte: 7-Tage-Trend als Mini-Linie
4. ObjectionChart → Recharts BarChart mit Gradient-Fills
5. "Anrufe heute" statt "Total Calls" (All-Time ist eine Vanity-Metrik)
6. Win Rate statt Appointment Booking Rate (echte Conversion)
7. Neuer KPI: "Termin-Quote" → appointment_booked / total

### 3.3 Analytics (/analytics) — Tab-Layout

**Tab-System:**
```
[ Überblick | Sentiment | Einwände ]
```

**Tab "Überblick":**
```
[  KPI1  |  KPI2  |  KPI3  |  KPI4                  ]
[SentimentDistrib (1/2)  | ScoreBreakdown (1/2)       ]
[  PieChart + Glow       | RadarChart + Gradient       ]
[DropOffAnalysis (1/2)   | DecisionMakerRatio (1/2)   ]
[  → FunnelChart         | Donut + Gauge-Needle        ]
[CallDurationDistribution (full width)                 ]
[  BarChart + Gradient Bars                            ]
```

**Chart-Upgrades:**
- DropOffAnalysis → Gestylter BarChart mit abnehmender Breite + Gradient-Fills (Recharts `<Funnel>` existiert aber ist schlecht dokumentiert; BarChart-Ansatz ist stabiler und konsistenter mit dem Design-System)
- ScoreBreakdown RadarChart → Gradient-Fill + Glow-Effekt
- CallDurationDistribution → Gradient Bars
- DecisionMakerRatio → Gauge-Nadel-Animation (SVG-basiert, Details unten)
- Alle BarCharts: `linearGradient` Fills statt flache Farben (Pattern existiert bereits in `ConversionChart.tsx`)
- **Alle neuen Charts:** `isAnimationActive={true}`, `animationDuration={800}`, `animationEasing="ease-out"`

**Gauge-Needle Implementierung** (für DecisionMakerRatio):
```typescript
// SVG-basiert innerhalb des PieChart customized Render-Props
const needleAngle = 90 - (percentage / 100) * 360;
// <line> Element mit transform: rotate(needleAngle) + CSS transition: 1.2s ease-out
// Oder: framer-motion motion.line für smooth Animation
// Aktueller PieChart hat innerRadius={70}, outerRadius={90} — Nadel bis innerRadius-10
```

**Tab "Sentiment":**
```
[Stacked Progress Bar (Positiv/Neutral/Negativ)          ]
[  KPI: Ø Duration/Sentiment | KPI: Conversion/Sentiment ]
[SentimentOverTime (full width, 320px)                    ]
[  StackedAreaChart + Weekend-ReferenceAreas              ]
[SentimentByGrade (1/2)     | ConversionMatrix (1/2)     ]
```

**Änderungen:**
- 3 redundante Rate-KPIs → 1 Stacked Progress Bar + 2 nützlichere KPIs
- SentimentOverTime: Weekend-Highlights mit `<ReferenceArea>`
- Timezone-Bug fixen

**Tab "Einwände":**
```
[  KPI1  |  KPI2  |  KPI3  |  KPI4                  ]
[ObjectionRanking (1/2)  | ConvCorrelation (1/2)      ]
[  HorizontalBar + Toggle Treemap | GroupedBar        ]
[ObjectionTrend (full width, 320px)                    ]
[ObjectionCounterArguments (full width)                 ]
[  → Datengetrieben statt statisch                     ]
```

**Änderungen:**
- ObjectionRanking: Treemap-Toggle (Recharts `<Treemap>`)
- Chart-Höhen normalisieren: beide auf 320px
- CounterArguments: Dynamisch basierend auf tatsächlichen Top-Einwänden

### 3.4 Leads (/leads) — KPI-Leiste

**Neu:** Kompakte Inline-KPIs:
```
"127 Leads | 34 mit Termin | Ø Score 8.2 | 12 diese Woche"
```

### 3.5 Lead Detail (/leads/[id]) — Zitate-Tab

**Tab-System für Hauptinhalt:**
```
[Zusammenfassung | Transcript | Zitate | Notizen]
```
- Grade-Badge in den Header verschieben
- Max-Width auf 1600px angleichen (aktuell 1400px → inkonsistent)

### 3.6 Pipeline (/pipeline) — Stage-Metriken

**Neu:**
```
[KPI-Karten: Pipeline-Gesamt | Win Rate | Lost Rate | Ø Tage/Stage]
[PipelineSummary → Recharts ComposedChart statt divs              ]
[PipelineBoard (Spaltenbreite 260px statt 280px)                  ]
```

### 3.7 Alerts (/alerts) — KPIs + Chart

**Neu:**
```
[KPI-Karten: Warnungen | Hohes Risiko | Ø Inaktive Tage | Nicht zugewiesen %]
[Risk-Donut (1/3)        | AlertList (2/3)                                   ]
```

### 3.8 Team (/team) — Leaderboard-Chart

**Neu:**
```
[KPI-Karten: Aktive | Zugewiesene Leads | Ø Win Rate | Top Performer       ]
[Team Performance GroupedBarChart (full width)                               ]
[TeamMemberGrid mit Mini-Sparklines (7-Tage Trend)                          ]
```

### 3.9 Chart-Upgrade-Matrix

| Seite | Komponente | Aktuell | Upgrade |
|-------|-----------|---------|---------|
| Dashboard | ObjectionChart | div-Progress-Bars | Recharts HorizontalBarChart + Gradient |
| Dashboard | KPICards | Nur Zahlen | + Sparklines (7-Tage) |
| Analytics | DropOffAnalysis | BarChart | FunnelChart |
| Analytics | DecisionMakerRatio | Plain Donut | + Gauge-Nadel-Animation |
| Analytics | ScoreBreakdown | RadarChart | + Gradient-Fill + Glow |
| Analytics | CallDurationDistrib | Plain BarChart | + Gradient Bars |
| Sentiment | KPIs | 3 redundante Rates | Stacked Progress Bar |
| Einwände | ObjectionRanking | BarChart | + Treemap-Toggle |
| Pipeline | PipelineSummary | div-Bars | Recharts ComposedChart |
| Alerts | (fehlt) | Keine Charts | + DonutChart |
| Team | (fehlt) | Keine Charts | + GroupedBarChart |
| Team | MemberCards | Nur Zahlen | + Mini-Sparklines |

### 3.10 Visual Consistency Fixes

1. **Chart-Höhen standardisieren:** 280px für Inline-Charts, 320px für Full-Width (verifiziert: bestehendes Pattern stimmt)
2. **Spacing:** `mt-4` innerhalb `space-y-6` entfernen (verifiziert in `page.tsx:140+148`, `analytics/page.tsx:36+44`). Fix: `mt-4` entfernen — es ist in jedem Fall redundant neben `space-y-6` und potenziell verwirrend (Tailwind v4 CSS Layers können zu unerwartetem Verhalten führen).
3. **Hardcoded Hex-Farben → CSS-Tokens** (MUSS VOR Gradient-Fills passieren! **8-10 Dateien betroffen**):
   - `ObjectionConversionCorrelation.tsx`: `"#42d77d"`, `"#ef4444"` → `var(--chart-4)`, `var(--score-danger)`
   - `SentimentDistribution.tsx`: 6 hardcoded Hex-Farben → `var(--chart-*)` Tokens
   - `page.tsx` (gradeDistribution): `"#22c55e"`, `"#f59e0b"`, `"#ef4444"` → CSS-Tokens
   - `Custom3DBar.tsx`: Mix aus Hex + var() → konsistent var()
   - `LeadFilters.tsx`: Grade-Farben → CSS-Tokens
   - `SentimentIndicator.tsx`: 3 Sentiment-Farben → CSS-Tokens
   - `StatusBadge.tsx`: Status-Farben → CSS-Tokens
   - `lib/utils.ts:26-30`: Fallback-Farben → CSS-Tokens
4. **Gradient Bars:** Alle BarCharts bekommen `<defs><linearGradient>` Fills (Pattern existiert in `ConversionChart.tsx:79-87`)
5. **Glow-Effekte:** SentimentDistribution-Pattern auf alle PieCharts übertragen
6. **KPI Labels auf Deutsch:** "Total Calls" → "Anrufe heute", "Conversion Rate" → "Win Rate"
7. **`normalizeObjection()`** in `lib/utils.ts` zentralisieren (2 Varianten in 6 Dateien)
8. **ObjectionChart Props-Kompatibilität:** Nach Recharts-Upgrade bleibt das Props-Interface identisch (`{ data: { objection: string; count: number }[] }`)
9. **Chart Loading Skeletons:** Neue `ChartSkeleton` Komponente mit animate-pulse (Pattern: `LeadDetailSkeleton`)

### 3.11 Team GroupedBarChart — Datenstruktur

```typescript
interface TeamPerformanceEntry {
  name: string;        // Team-Member Name
  leads: number;       // zugewiesene Leads (chart-1)
  aLeads: number;      // A-grade Leads (chart-4)
  conversion: number;  // Win Rate in % (chart-2, separate Y-Achse)
}

// Berechnung in team/page.tsx:
const data = teamMembers.filter(m => m.is_active).map(member => {
  const memberLeads = leads.filter(l => l.assigned_to === member.id);
  const aLeads = memberLeads.filter(l => l.lead_grade === "A").length;
  const closedDeals = memberLeads.filter(l => ["converted", "lost"].includes(l.status));
  const converted = closedDeals.filter(l => l.status === "converted").length;
  return {
    name: member.name,
    leads: memberLeads.length,
    aLeads,
    conversion: closedDeals.length > 0 ? Math.round(converted / closedDeals.length * 100) : 0,
  };
});
```

---

## Teil 4: Security & Backend

### 4.1 Authentifizierung (P1 — High Priority)

**Problem:** Keine einzige API-Route hat Auth. Alle nutzen `supabaseAdmin` (Service Role Key, korrekt server-only in `supabase-server.ts`). Die RLS SELECT-Policy ist `USING(true)` — jeder mit dem Anon Key (im Client-Bundle) kann alle Daten lesen. Write-Policies sind bereits korrekt auf `service_role` eingeschränkt (Migration 002).

**Empfehlung: Einfaches Password-Gate** (statt Supabase Auth — Overkill für internes Sales-Dashboard/Demo):

| Ansatz | Aufwand | Komplexität | Empfehlung |
|--------|---------|-------------|------------|
| Password-Gate (Env-Var) | ~2h | Niedrig | **MVP/Demo** |
| Supabase Auth | ~10h | Hoch | Production mit Multi-User |
| NextAuth.js v5 | ~4h | Mittel | OAuth-Provider nötig |

**Password-Gate Implementierung:**

**Neue Dateien:**
- `dashboard/src/app/login/page.tsx` — Login-Seite mit Passwort-Feld
- `dashboard/src/middleware.ts` — Cookie-basierter Auth-Check

**Zu ändernde Dateien:**
- `dashboard/src/app/layout.tsx` — Login-Redirect bei fehlendem Cookie
- Alle API-Routes: Cookie-Check hinzufügen

**Env-Var:** `DASHBOARD_PASSWORD` auf Vercel setzen

```typescript
// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("dashboard_session");
  if (!session && !request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|api|favicon).*)"] };
```

**Hinweis:** RLS-Policies bleiben wie sie sind (SELECT offen, Write auf service_role). Das Password-Gate schützt nur den Dashboard-Zugang, nicht die Supabase-Direktverbindung. Für echte Multi-User-Sicherheit → Supabase Auth als P2 Upgrade.

### 4.2 Rate Limiting (P2)

**Problem:** `/api/leads/[id]/briefing` triggert OpenRouter API Calls ($$$). Kein Schutz vor Spam.

**Lösung (MVP):** Edge Middleware mit In-Memory `Map` (Upstash ist Overkill für MVP):
```typescript
const rateLimits = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || now > entry.resetAt) { rateLimits.set(key, { count: 1, resetAt: now + windowMs }); return true; }
  if (entry.count >= max) return false;
  entry.count++; return true;
}
```
**Hinweis:** Nicht verteilt (jede Vercel-Edge-Region eigener Counter), aber für Single-Team ausreichend. Briefing-Route hat zudem 1h Cache-TTL als natürliche Rate-Limitierung.

**Betroffene Routes:**
- `/api/leads/[id]/briefing` — max 5/min (OpenRouter API Kosten!)
- `/api/team` POST — max 10/min
- `/api/leads/[id]` PATCH — max 30/min

### 4.3 UUID-Validation (P1)

**Fix:** UUID-Regex-Check in jeder API-Route:
```typescript
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!UUID_REGEX.test(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
```
**Auch betroffen:** `/api/quotes?leadId=...` — `leadId` Query-Parameter muss ebenfalls UUID-validiert werden.

### 4.4 Server-side Pagination (P3 — Backlog)

**Problem:** Alle Leads client-seitig geladen. Bei 10.000+ Leads: ~70MB JSON.

**Lösung:** Neue API-Route `GET /api/leads?page=1&limit=25&sort=created_at&dir=desc`

**Aufwand-Warnung:** Realistisch 15-20h (nicht 4h), weil:
1. KPIs brauchen ALLE Leads → separate SQL-Aggregat-Route `/api/kpis` mit `COUNT`, `AVG`, `SUM`, `FILTER`
2. Charts brauchen aggregierte Daten → weitere SQL-Routes
3. `leads-context.tsx` muss komplett refactored werden (Realtime + Pagination = komplex)
4. Aktueller Ansatz reicht problemlos bis ~5000 Leads

**Empfehlung:** Für MVP client-seitig beibehalten. Server-Pagination erst bei Bedarf (>1000 Leads).

### 4.5 Fehlende Indizes (Migration)

```sql
-- Sinnvolle Indizes (verifiziert gegen Query-Patterns):
CREATE INDEX IF NOT EXISTS idx_leads_sentiment ON leads(sentiment);
CREATE INDEX IF NOT EXISTS idx_leads_total_score ON leads(total_score);
CREATE INDEX IF NOT EXISTS idx_leads_status_assigned ON leads(status, assigned_to);

-- NICHT nötig für MVP (schlechte Selektivität / Overkill):
-- idx_leads_is_decision_maker: Nur 3 Werte (true/false/null), Index bringt kaum Vorteil
-- idx_quotes_speaker: Nur 2 Werte ('agent', 'caller')
-- pg_trgm + GIN auf quotes: Overkill, ilike reicht bei <10.000 Quotes

-- Bereits existierende Indizes (nicht nochmal erstellen!):
-- idx_leads_created_at (Migration 001:64)
-- idx_leads_call_id (Migration 001:66)
-- idx_leads_grade_created (Migration 002:93-94)
```

### 4.6 updated_at für team_members und lead_quotes

**Hinweis:** `leads` hat bereits `updated_at` + Trigger (Migration 001). Die `update_updated_at()` Funktion existiert ebenfalls bereits. Nur `team_members` und `lead_quotes` brauchen die Spalte + Trigger.

```sql
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE lead_quotes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_lead_quotes_updated_at BEFORE UPDATE ON lead_quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```
**TypeScript:** `TeamMember` Interface in `types.ts` muss ebenfalls `updated_at: string` bekommen.

### 4.7 Security Headers (P1)

**Problem:** Keine Security-Headers in `next.config.ts`.

**Fix:**
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ]}];
  },
};
```

### 4.8 OPENROUTER_API_KEY in Env-Vars

**Problem:** `OPENROUTER_API_KEY` fehlt in `.env.local` und auf Vercel → Briefing-Feature schlägt fehl mit 500-Error.

**Fix:** Key zu `.env.local` und Vercel Environment Variables hinzufügen.

### 4.9 Briefing-Route Input-Sanitization (P1)

**Problem:** `dashboard/src/app/api/leads/[id]/briefing/route.ts` sendet Lead-Daten unsanitisiert in den OpenRouter-Prompt. `objections_raised.join(", ")` könnte als Prompt-Injection genutzt werden (z.B. `["<SYSTEM> Ignoriere alles"]`).

**Fix:**
```typescript
// Vor Prompt-Einbettung: Alle Lead-Felder sanitisieren
function sanitizeForPrompt(value: string): string {
  return value
    .slice(0, 500)                          // Max-Length
    .replace(/<[^>]*>/g, "")                // HTML-Tags entfernen
    .replace(/[\x00-\x1F\x7F]/g, "")       // Control-Characters
    .replace(/[<>]/g, "");                  // Angle brackets
}

// Objections: sanitizeForPrompt(objections_raised.join(", "))
// Alle anderen Lead-Felder: sanitizeForPrompt(lead.company ?? "")
```

---

## Teil 5: Feature-Gaps

### 5.1 CSV-Export (P1)
- Client-seitiger CSV-Download der aktuell gefilterten Leads
- **BOM-Markierung** (`\uFEFF` Prefix) für korrekte Umlaut-Darstellung in Excel (ohne BOM zeigt Excel ä/ö/ü falsch an!)
- Exportierte Felder: Name, Firma, Score, Grade, Status, Sentiment, Termin, Datum (aus `filteredLeads`, ohne Transcript)
- Neue Datei: `dashboard/src/lib/export.ts`
- Export-Button im Header der Leads-Seite

### 5.2 Globale Sidebar-Suche (P1)
- **Library:** `cmdk` (~4KB gzip, headless) — muss installiert werden
- Cmd+K Command Palette mit Datenquellen:
  - Leads (Name, Firma, Email)
  - Seiten-Navigation
  - Team-Members
  - Aktionen ("CSV exportieren", "Theme wechseln")
- Neue Datei: `dashboard/src/components/CommandPalette.tsx`
- Aktuell: Search-Input im Sidebar (Zeile 112-128) ist rein dekorativ mit Cmd+K Hinweis

### 5.3 Pipeline Drag-and-Drop (P2)
- `@dnd-kit/core` + `@dnd-kit/sortable` für Status-Änderung per Drag zwischen Kanban-Spalten — muss installiert werden
- Aktuell: Status-Änderung nur über Lead-Detail
- API: Bestehende `PATCH /api/leads/[id]` Route reicht (akzeptiert `status` als erlaubtes Feld, validiert gegen `VALID_STATUSES`)
- **Optimistic Update mit Rollback:** `updateLead` in `leads-context.tsx` setzt bereits optimistisch den State, aber es fehlt ein Rollback bei API-Fehler → muss implementiert werden

### 5.4 Custom Date Range Picker (P2)
- **MVP:** Zwei native `<input type="date">` Felder im bestehenden `LeadFilters`-Pattern (kein neues Package nötig)
- **Upgrade:** shadcn/ui DatePicker (braucht `react-day-picker` + `date-fns` + `@radix-ui/react-popover` — alle NICHT installiert)
- Aktuell: Nur Presets (7d, 30d, Alle)

### 5.5 Alert-Regeln erweitern (P2)
- Termin in < 24h aber kein Briefing → Warnung
- Call-Dauer < 60 Sekunden → Review nötig
- Decision-Maker ohne Termin → High-Priority Follow-up
- Risk-Level-Gewichtung nach Lead-Grade (A-Lead mit 1 Flag > C-Lead mit 3 Flags)

### 5.6 Error Boundary (P1 — KRITISCH FEHLEND)

**Problem:** Kein einziger Error Boundary im gesamten Dashboard. Ein Chart-Crash (z.B. ungültige Daten in Recharts) nimmt die gesamte Seite mit — White Screen.

**Lösung:** `error.tsx` in `app/` (Next.js App Router Error Boundary) + React Error Boundary um Chart-Bereiche in `AppShell.tsx`.

**Neue Dateien:**
- `dashboard/src/app/error.tsx` — Globaler Error Boundary mit "Seite neu laden" Button
- Optional: `dashboard/src/components/ui/ChartErrorBoundary.tsx` — Granularer Fallback für einzelne Charts

### 5.7 Termin-Kalender (P1)

**Problem:** Gebuchte Demo-Termine (`appointment_datetime`) werden nur als Text in der Lead-Tabelle und auf der Lead-Detail-Seite angezeigt. Es gibt keine Kalender-Übersicht, die alle anstehenden Termine auf einen Blick zeigt.

**Lösung:** Interaktive Kalender-Komponente im gleichen Glassmorphism-Design wie die anderen Dashboard-Elemente.

**Platzierung — Dashboard-Startseite (/):**
Der Kalender wird auf der Dashboard-Startseite platziert, da er als tägliches Tool für Sales Manager den größten Wert hat:

```
[PageHeader                               | Live + Count]
[Alert-Banner (klappbar)                                 ]
[KPI-KARTEN (4 Cards + Sparklines)                       ]
[ConversionChart (2/3)    | LeadScoreDistrib (1/3)       ]
[NEW: TerminKalender (2/3)| ObjectionChart (1/3)         ]
[LeadTable (full width, letzte 10 Calls)                 ]
```

**Alternative Platzierung:** Falls der Dashboard zu voll wird, eigene Route `/calendar` als Unterseite von "DATEN" im Sidebar (neben Leads, Pipeline).

**Komponente:** `dashboard/src/components/dashboard/AppointmentCalendar.tsx`

**Design-Spezifikation:**
```typescript
interface CalendarEvent {
  id: string;          // lead.id
  title: string;       // lead.caller_name + " — " + lead.company
  datetime: string;    // lead.appointment_datetime (ISO 8601)
  grade: string | null;// lead.lead_grade (für Farb-Kodierung)
  assignedTo: string | null; // lead.assigned_to
}
```

**Ansichten:**
- **Wochenansicht** (Default): 7 Tage horizontal, Stunden vertikal (8:00-18:00)
- **Monatsansicht** (Toggle): Klassisches Monats-Grid mit Termin-Dots
- Wechsel über Icon-Toggle (ähnlich Treemap-Toggle bei ObjectionRanking)

**Visuelles Design:**
- Glass-Card Container (`rounded-2xl border bg-card/50 backdrop-blur-sm`)
- Termin-Blöcke als kleine Chips mit Lead-Grade-Farbkodierung:
  - A-Leads: `var(--chart-4)` (Grün) mit Glow
  - B-Leads: `var(--chart-5)` (Gelb/Amber)
  - C-Leads: `var(--chart-3)` (Purple/Neutral)
- Hover: Tooltip mit Lead-Name, Firma, Uhrzeit, zugewiesener Mitarbeiter
- Click: Navigation zu `/leads/${id}` (Lead-Detail)
- Heute-Marker: Vertikale Linie mit Puls-Animation (wie der Live-Indikator)
- Leere Tage: Subtle gepunktetes Grid-Pattern

**Daten-Quelle:**
```typescript
// In page.tsx (Dashboard)
const calendarEvents = useMemo(() =>
  leads
    .filter(l => l.appointment_booked && l.appointment_datetime)
    .map(l => ({
      id: l.id,
      title: `${l.caller_name ?? "Unbekannt"} — ${l.company ?? "Firma"}`,
      datetime: l.appointment_datetime!,
      grade: l.lead_grade,
      assignedTo: l.assigned_to,
    })),
  [leads]
);
```

**Implementierung:**
- **Keine externe Library** nötig — Custom SVG/CSS Grid (wie PipelineSummary-Pattern)
- Wochenansicht: CSS Grid mit `grid-template-columns: 60px repeat(7, 1fr)` (Stundenspalte + 7 Tage)
- Zeitslots: 30min-Intervalle als Grid-Rows
- Termin-Positionierung: `gridRowStart` berechnet aus `appointment_datetime` Stunde/Minute
- Responsive: Auf Mobile wird Wochenansicht zu Tagesansicht (nur heute + morgen)

**Neue Dateien:**
- `dashboard/src/components/dashboard/AppointmentCalendar.tsx` — Hauptkomponente
- Optional: `dashboard/src/components/dashboard/CalendarEvent.tsx` — Event-Chip-Komponente

**Zu ändernde Dateien:**
- `dashboard/src/app/page.tsx` — Calendar zwischen Charts und LeadTable einbinden

**Aufwand:** 3-4h (Custom CSS Grid + Event-Positionierung + Tooltip + Navigation)

### 5.8 Accessibility Basics (P2)

**Problem:** Keine `aria-labels` auf Pipeline-Cards, Alert-Cards. Keine Focus-States auf Custom-Buttons im Alert-System. Keine `tabIndex` auf interaktiven Elementen.

**Lösung:** Mindestens basic Tab-Order und aria-labels für:
- Pipeline-Cards (Kanban-Board)
- Alert-Cards (Severity-Tabs)
- KPI-Cards (Click-to-Detail wenn zutreffend)
- Command Palette (Keyboard-Navigation via `cmdk` automatisch)

---

## Teil 6: Priorisierter Implementierungsplan (v2 — verifiziert)

### Abhängigkeits-Graph

```
P0 Foundation:
  0.1 (Tabs install) ──→ 9 (Analytics-Tabs) ──→ 10 (Quotes-Tab) ──→ 11 (Sidebar)
  0.2 (Hex→Tokens) ──→ 14 (Gradient Bars)
  1 (Shared KPICard) ──→ 13 (Sparklines)
  5 (updated_at) ──→ 6 (Alert-Regeln)

P1 Auth:
  19 (Auth) ──→ 20 (API Middleware)

P2 Dependencies:
  #11 (Sidebar) ──→ 21 (Cmd+K, cmdk installieren)
  @dnd-kit installieren ──→ 31 (Pipeline DnD)
```

### File-Ownership-Konflikte (SEQUENTIELL!)

- `alerts/page.tsx`: Tasks 5, 6, 15, 36, 37
- `page.tsx` (Dashboard): Tasks 3, 7, 8, 37
- `Sidebar.tsx`: Tasks 11, 21
- `analytics/page.tsx`: Tasks 8, 9

### P0 — Must Have (vor Deployment)

| # | Task | Dateien | Aufwand | Dep |
|---|------|---------|---------|-----|
| 0.1 | `@radix-ui/react-tabs` installieren + `ui/tabs.tsx` | Neue: `ui/tabs.tsx` | 30min | — |
| 0.2 | Hardcoded Hex-Farben → CSS-Tokens | 8-10 Dateien (Charts, Leads, utils) | 1h | — |
| 1 | Shared KPICard (5 Varianten → 1) | Neue: `ui/KPICard.tsx`. Ändern: 5 Dateien | 4h | — |
| 2 | `normalizeObjection()` zentralisieren | `utils.ts` + 6 Dateien | 30min | — |
| 3 | Bug-Fixes #1-#4 | `page.tsx`, `AnalyticsKPIs.tsx` | 1h | — |
| 4 | Bug-Fix #7 (Timezone) | `SentimentOverTime.tsx`, `ObjectionTrend.tsx` | 30min | — |
| 5 | Bug-Fix #8 (updated_at) + Lead Interface | `alerts/page.tsx`, `types.ts`, `leads-context.tsx` | 30min | — |
| 6 | Bug-Fix #9-#10 (Alert-Regeln) | `alerts/page.tsx` | 15min | #5 |
| 7 | KPI-Labels Deutsch + Anrufe heute | `KPICards.tsx`, `page.tsx` | 30min | — |
| 8 | Spacing-Fixes (mt-4) | `page.tsx`, `analytics/page.tsx` | 15min | — |

**P0 Parallelisierung (3 Stränge → ~5.5h statt 8h):**

| Strang | Tasks | Dauer |
|--------|-------|-------|
| A: Foundation | 0.1 + 0.2 + 1 + 7 | 5h |
| B: Bug-Fixes | 3 + 4 + 5 → 6 | 2h 15min |
| C: Cleanup | 2 + 8 | 45min |

### P1 — High Impact (erste Woche)

| # | Task | Dateien | Aufwand | Dep |
|---|------|---------|---------|-----|
| 9 | Analytics-Tabs + URL-State + Suspense | `analytics/page.tsx` + Delete 2 | 3.5h | #0.1, #8 |
| 10 | Quotes → Lead-Detail-Tab | `leads/[id]/page.tsx` + Delete 1 | 3.5h | #0.1 |
| 11 | Sidebar vereinfachen + Alert-Badge | `Sidebar.tsx`, Neue: `useAlerts.ts` | 1h | #9, #5 |
| 12 | ObjectionChart → Recharts BarChart | `ObjectionChart.tsx` | 1h | — |
| 13 | Sparklines + `computeSparklineData` | `ui/KPICard.tsx`, `utils.ts` | 2h | #1 |
| 14 | Gradient Bars alle BarCharts | 6 Chart-Dateien | 2h | #0.2 |
| 15 | Alerts: KPIs + DonutChart | `alerts/page.tsx` + 2 neue | 2h | #5, #6 |
| 16 | Team: Leaderboard-Chart | Neue: `TeamPerformanceChart.tsx` | 2h | — |
| 17 | Pipeline: KPIs + Recharts ComposedChart | `PipelineSummary.tsx`, `pipeline/page.tsx` | 2h | — |
| 18 | CSV-Export (mit BOM) | Neue: `lib/export.ts` + `leads/page.tsx` | 1h | — |
| 19 | Auth: Password-Gate + Login | Neue: `login/page.tsx`, `middleware.ts` | 2h | — |
| 20 | Auth: API-Route Cookie-Check | 5 API-Routes | 1h | #19 |
| 21 | Cmd+K Suche (`cmdk` installieren) | Neue: `CommandPalette.tsx` | 3h | #11 |
| 22 | Error Boundary + `error.tsx` | Neue: `app/error.tsx` + `AppShell.tsx` | 30min | — |
| 23 | ChartSkeleton Komponente | Neue: `ui/ChartSkeleton.tsx` | 15min | — |
| 24 | Security Headers | `next.config.ts` | 15min | — |
| 25 | API Error Messages sanitieren (#14) | 5 API-Routes | 30min | — |
| 25b | Briefing-Route Prompt-Injection Schutz | `briefing/route.ts` | 15min | — |
| 26 | 404-Redirects gelöschte Seiten | 3 Page-Dateien | 15min | #9 |
| 27 | Termin-Kalender (Woche/Monat) | Neue: `AppointmentCalendar.tsx`. Ändern: `page.tsx` | 4.5h | — |

### P2 — Premium (zweite Woche)

| # | Task | Dateien | Aufwand | Dep |
|---|------|---------|---------|-----|
| 28 | DropOff → Funnel-Stil BarChart | `DropOffAnalysis.tsx` | 1h | #14 |
| 29 | DecisionMaker → Gauge-Nadel (SVG) | `DecisionMakerRatio.tsx` | 2h | — |
| 30 | ScoreBreakdown → Gradient + Glow | `ScoreBreakdown.tsx` | 1h | #14 |
| 31 | Objection Treemap-Toggle | `ObjectionRanking.tsx` | 2h | — |
| 32 | Pipeline DnD + Rollback (`@dnd-kit`) | 3 Pipeline-Komponenten | 4h | — |
| 33 | Date Range Picker (native inputs) | `LeadFilters.tsx` | 1h | — |
| 34 | Rate Limiting (Edge Map) | `middleware.ts` + API-Routes | 2h | #19 |
| 35 | Fehlende DB-Indizes | Migration SQL | 15min | — |
| 36 | updated_at team_members + lead_quotes | Migration SQL + `types.ts` | 30min | — |
| 37 | Alert-Regeln erweitern | `alerts/page.tsx` | 1h | #15 |
| 38 | Alert Dashboard-Banner | `page.tsx` | 1h | #11 |
| 39 | Leads: Kompakte KPI-Leiste | `leads/page.tsx` | 30min | — |
| 40 | Team Sparklines in MemberCards | `TeamMemberCard.tsx` | 1h | #13 |
| 41 | Accessibility: aria + keyboard | Pipeline/Alert/KPI-Cards | 2h | — |

### Aufwand-Zusammenfassung (v2)

| Phase | Tasks | Sequentiell | Parallel (4 Agents) |
|-------|-------|-------------|---------------------|
| P0 (Foundation + Bugs) | 10 Tasks | ~8h | **~5.5h** |
| P1 (Konsolidierung + Features) | 20 Tasks | ~32h | **~17h** |
| P2 (Premium) | 14 Tasks | ~19h | **~10h** |
| **Gesamt** | **44 Tasks** | **~59h** | **~32.5h** |

### Agent-Team-Zuordnung (für parallele Implementierung)

| Agent | Tasks | Fokus |
|-------|-------|-------|
| **UI-Agent A** (Components) | 0.2, 1, 7, 12, 13, 14, 23, 27, 28, 29, 30, 39 | UI/Component-Arbeit |
| **UI-Agent B** (Pages) | 0.1, 8, 9, 10, 11, 15, 16, 17, 21, 26, 37, 38 | Seiten-Konsolidierung |
| **Backend-Agent** | 5, 6, 19, 20, 24, 25, 33, 34, 35 | Auth, APIs, Migrations |
| **Utility-Agent** | 2, 3, 4, 18, 22, 31, 32, 36, 40 | Bug-Fixes, Features |

---

## Teil 7: Kritische Dateien-Referenz (35+ Dateien)

### Kern-Dateien (höchste Änderungsdichte)

| Datei | Tasks | Relevanz |
|-------|-------|----------|
| `dashboard/src/app/page.tsx` | #3, #7, #8, #37 | Dashboard-KPIs, Bug #1/#2/#12/#13, Alert-Banner |
| `dashboard/src/app/alerts/page.tsx` | #5, #6, #15, #36, #37 | Bug #8/#9/#10, KPIs, DonutChart, erweiterte Regeln |
| `dashboard/src/app/analytics/page.tsx` | #8, #9 | Tab-System (3 Tabs), URL-State, Konsolidierung |
| `dashboard/src/lib/types.ts` | #5, #35 | Lead + TeamMember Interface (updated_at) |
| `dashboard/src/lib/leads-context.tsx` | #5 | CONTEXT_FIELDS (updated_at hinzufügen) |
| `dashboard/src/components/Sidebar.tsx` | #11, #21 | Nav-Konsolidierung, Alert-Badge, Cmd+K |
| `dashboard/src/components/AppShell.tsx` | #21, #22 | CommandPalette, Error Boundary, Provider |

### UI/Chart-Dateien

| Datei | Tasks | Relevanz |
|-------|-------|----------|
| `dashboard/src/components/KPICards.tsx` | #1, #7 | KPI-Card Extraktion, Label-Fix |
| `dashboard/src/components/ObjectionChart.tsx` | #12 | Recharts-Upgrade (div→BarChart) |
| `dashboard/src/components/ui/animated-number.tsx` | #1 | Wird in allen 5 KPICard-Varianten verwendet |
| `dashboard/src/components/dashboard/Custom3DBar.tsx` | #14 | Konsistenz-Check für Gradient-Upgrade |
| `dashboard/src/components/analytics/AnalyticsKPIs.tsx` | #1, #3 | Bug #3/#4, KPICard-Migration |
| `dashboard/src/components/sentiment/SentimentKPIs.tsx` | #1, #3 | Bug #5/#6, KPICard-Migration |
| `dashboard/src/components/sentiment/SentimentOverTime.tsx` | #4 | Bug #7 (Timezone, HIGH) |
| `dashboard/src/components/objections/ObjectionTrend.tsx` | #4 | Bug #7 (Timezone, LOW) |
| `dashboard/src/components/objections/ObjectionConversionCorrelation.tsx` | #0.2, #2 | Hex→Tokens + normalizeObjection |
| `dashboard/src/components/objections/ObjectionCounterArguments.tsx` | #2 | normalizeObjection |
| `dashboard/src/components/pipeline/PipelineSummary.tsx` | #17 | Recharts ComposedChart Upgrade |
| `dashboard/src/components/sentiment/SentimentDistribution.tsx` | #0.2, #14 | Hex→Tokens, Gradient |
| `dashboard/src/components/analytics/DropOffAnalysis.tsx` | #28 | Funnel-Stil BarChart |
| `dashboard/src/components/analytics/CallDurationDistribution.tsx` | #14 | Gradient Bars |
| `dashboard/src/components/sentiment/SentimentConversionMatrix.tsx` | #9 | Tab "Sentiment" |
| `dashboard/src/components/leads/SentimentIndicator.tsx` | #0.2 | Hex→Tokens |
| `dashboard/src/components/leads/StatusBadge.tsx` | #0.2 | Hex→Tokens |
| `dashboard/src/components/lead-detail/LeadDetailSkeleton.tsx` | #23 | Pattern für ChartSkeleton |
| `dashboard/src/components/objections/ObjectionRanking.tsx` | #2, #31 | normalizeObjection, Treemap |

### Seiten-Dateien

| Datei | Tasks | Relevanz |
|-------|-------|----------|
| `dashboard/src/app/leads/[id]/page.tsx` | #10 | Zitate-Tab, Tab-System, max-width |
| `dashboard/src/app/leads/page.tsx` | #18, #39 | CSV-Export, KPI-Leiste |
| `dashboard/src/components/leads/LeadFilters.tsx` | #33 | Date Range Picker |
| `dashboard/src/components/dashboard/AppointmentCalendar.tsx` | #27 | Termin-Kalender (Neue Datei) |

### Backend/Auth-Dateien

| Datei | Tasks | Relevanz |
|-------|-------|----------|
| `dashboard/src/lib/supabase-server.ts` | #19, #20 | Auth-Integration, Service-Role-Client |
| `dashboard/src/app/layout.tsx` | #19 | AuthGuard einbinden |
| `dashboard/src/lib/utils.ts` | #2, #13 | normalizeObjection, computeSparklineData, toBerlinDate |
| `dashboard/src/lib/team-context.tsx` | #16 | Team-Chart Datenzugriff |
| `dashboard/src/app/globals.css` | #0.2, #14 | Chart-Tokens, Gradients |
| `dashboard/next.config.ts` | #24 | Security Headers |

### Pipeline/DnD-Dateien (P2)

| Datei | Tasks | Relevanz |
|-------|-------|----------|
| `dashboard/src/components/pipeline/PipelineBoard.tsx` | #31 | DnD-Integration Hauptdatei |
| `dashboard/src/components/pipeline/PipelineColumn.tsx` | #31 | Drop-Zone Wrapper |
| `dashboard/src/components/pipeline/PipelineCard.tsx` | #31 | Draggable Wrapper |

---

## Verifikation (23 Punkte)

### Build & Code-Qualität
1. `npm run build` → Keine Fehler
2. `npm run lint` → Keine ESLint-Fehler
3. `npx tsc --noEmit` → Keine TypeScript-Fehler
4. Alle neuen Packages in `package.json` vorhanden (`@radix-ui/react-tabs`, `cmdk`, `@dnd-kit/*`)

### Funktionalität
5. Alle 7 Seiten laden korrekt
6. 404-Redirects: `/sentiment` → `/analytics?tab=sentiment`, `/objections` → `/analytics?tab=objections`, `/quotes` → `/leads`
7. KPIs: Win Rate statt Booking Rate, "Anrufe heute", korrekte Timezone-Werte
8. Charts: Gradients auf allen BarCharts, Sparklines in KPI-Cards
9. Analytics: 3 Tabs funktional, URL-State (`?tab=sentiment`) korrekt, Deep-Links funktionieren
10. Alerts: KPI-Karten, DonutChart, updated_at-basierte Inaktivität
11. CSV-Export: Download mit korrekten Umlauten (BOM)
12. Termin-Kalender: Wochenansicht zeigt gebuchte Termine, Click navigiert zu Lead-Detail

### Auth & Security
13. Auth: Login-Page, geschützte Routes, Cookie-Session
14. API Error Messages: Keine Supabase-Details in Client-Responses
15. Security Headers: X-Frame-Options, X-Content-Type-Options vorhanden
16. Supabase RLS-Test: Anon-Key kann nicht schreiben (INSERT/UPDATE/DELETE)

### Visuals & UX
17. Dark/Light Mode: Alle neuen Charts + Gradients in beiden Themes korrekt
18. Mobile: Responsive Layout für alle Seiten, Tabs scrollbar
19. Error Boundary: Chart-Crash zeigt Fallback-UI statt White Screen

### Daten & Realtime
20. Realtime-Test: Lead in Supabase einfügen → Dashboard zeigt innerhalb 2s
21. `updated_at` Trigger: Lead updaten → Wert ändert sich korrekt

### Code-Hygiene
22. Briefing-Route: Prompt-Injection mit manipulierten objections_raised → keine Daten-Exfiltration
23. Hex-Farben-Audit: `grep -r "#[0-9a-f]\{6\}" dashboard/src/` → 0 Treffer (alle via CSS-Tokens)
