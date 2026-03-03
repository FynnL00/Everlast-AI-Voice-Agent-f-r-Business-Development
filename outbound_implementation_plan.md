# Outbound (Cold Calling) Implementation Plan

> Voice Agent SaaS -- Everlast AI Developer Challenge
> Erstellt: 2026-03-03 | Status: Plan

---

## Inhaltsverzeichnis

1. [Executive Summary](#1-executive-summary)
2. [Architektonische Änderungen (Datenbank)](#2-architektonische-änderungen-datenbank)
3. [Status-Modell & Disposition Codes](#3-status-modell--disposition-codes)
4. [Lead-Scoring Anpassung](#4-lead-scoring-anpassung)
5. [Kampagnen-Management](#5-kampagnen-management)
6. [DNC (Do Not Call) Management](#6-dnc-do-not-call-management)
7. [n8n Workflow-Änderungen](#7-n8n-workflow-änderungen)
8. [Frontend-Komponenten (Neu & Angepasst)](#8-frontend-komponenten-neu--angepasst)
9. [Step-by-Step Roadmap](#9-step-by-step-roadmap)
10. [Compliance & DSGVO](#10-compliance--dsgvo)
11. [Edge Cases & Risiken](#11-edge-cases--risiken)
12. [KPI-Definitionen & Benchmarks](#12-kpi-definitionen--benchmarks)
13. [CSV-Upload & Lead-Ingestion](#13-csv-upload--lead-ingestion)
14. [Click-to-Call VAPI Integration](#14-click-to-call-vapi-integration)
15. [Smart Follow-Up Cadence Engine](#15-smart-follow-up-cadence-engine)

---

## 1. Executive Summary

### Ist-Zustand
- **Inbound-Fokus**: Voice Agent "Lisa" empfängt eingehende Anrufe
- **Single `leads` Table** mit 37 Feldern, UPSERT auf `call_id`
- **8 Pipeline-Stufen**: new → contacted → qualified → appointment_booked → converted → lost → not_reached → rejected
- **4 Dashboard-KPIs**: Anrufe, Conversion-Rate, Gesprächsdauer, Sentiment
- **Analytics**: Sentiment-Analyse, Einwand-Tracking, Drop-Off-Analyse

### Soll-Zustand (Outbound Cold Calling)
- **Outbound-Fokus**: Lisa ruft aktiv Leads aus Kampagnen an
- **3 neue Tabellen**: `campaigns`, `call_attempts`, `dnc_list`
- **11 Pipeline-Stufen**: queued → attempting → no_answer → voicemail → callback_scheduled → connected → qualified → demo_booked → converted → lost → dnc
- **6 Dashboard-KPIs**: Anrufversuche, Connection Rate, Mailbox-Quote, Gesprächsdauer, Demo-Buchungsrate, Calls/Stunde
- **Analytics**: Erreichbarkeits-Analyse, Einwandbehandlungs-Effektivität, Best Time to Call, Agent Performance

### Kern-Änderungen
| Bereich | Inbound (aktuell) | Outbound (Ziel) |
|---------|-------------------|------------------|
| Call-Initiierung | Kunde ruft an | System ruft Leads aus Kampagnen an |
| Lead-Quelle | Entsteht während/nach Anruf | CSV-Import vor Anruf |
| Multi-Attempt | 1 Call = 1 Lead (call_id UNIQUE) | N Versuche pro Lead (call_attempts Tabelle) |
| Disposition | Nicht vorhanden | 12 Disposition Codes pro Versuch |
| Kampagnen | Nicht vorhanden | Kampagnen mit Cadence-Logik |
| DNC | Nicht vorhanden | Automatische + manuelle DNC-Liste |
| Scoring-Fokus | Reines Post-Call Scoring | Pre-Call ICP Score + Post-Call Engagement |

---

## 2. Architektonische Änderungen (Datenbank)

### 2.1 Neue Tabelle: `campaigns`

```sql
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Identität
  name TEXT NOT NULL,
  description TEXT,

  -- Lifecycle: draft → active → paused → completed → archived
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),

  -- Ownership
  created_by UUID REFERENCES team_members(id),
  assigned_agent_id TEXT,  -- Vapi Assistant ID

  -- Zeitplanung
  start_date DATE,
  end_date DATE,
  calling_window_start TIME DEFAULT '09:00',
  calling_window_end TIME DEFAULT '18:00',
  calling_timezone TEXT DEFAULT 'Europe/Berlin',
  calling_days INT[] DEFAULT '{1,2,3,4,5}',  -- ISO: 1=Mo..5=Fr

  -- Cadence (JSONB für Flexibilität)
  cadence_config JSONB NOT NULL DEFAULT '{
    "max_attempts": 5,
    "intervals_minutes": [60, 240, 1440, 4320, 10080],
    "voicemail_action": "skip",
    "leave_voicemail_after_attempt": 3
  }'::jsonb,

  -- Zielgruppen-Filter (optional)
  target_filter JSONB,

  -- Denormalisierte Metriken (für schnelle Reads, per Trigger/Cron aktualisiert)
  total_leads INT DEFAULT 0,
  leads_called INT DEFAULT 0,
  leads_connected INT DEFAULT 0,
  leads_converted INT DEFAULT 0,

  -- System Prompt Override (null = Standard-Lisa-Prompt)
  system_prompt_override TEXT,
  first_message_override TEXT
);

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaigns_read" ON campaigns FOR SELECT USING (true);
CREATE POLICY "campaigns_service_write" ON campaigns FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "campaigns_service_update" ON campaigns FOR UPDATE
  USING (auth.role() = 'service_role');
CREATE POLICY "campaigns_service_delete" ON campaigns FOR DELETE
  USING (auth.role() = 'service_role');

ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;
```

**Cadence-Logik Erklärung:**
- Versuch 1: Sofort (Kampagnenstart oder Lead hinzugefügt)
- Versuch 2: 60 min nach Versuch 1
- Versuch 3: 4 Stunden nach Versuch 2
- Versuch 4: 1 Tag nach Versuch 3
- Versuch 5: 3 Tage nach Versuch 4
- Nach Versuch 5: Lead als `exhausted` markiert

**Campaign-Lead Beziehung: 1:N** (ein Lead gehört zu max. einer aktiven Kampagne). FK `campaign_id` liegt auf der `leads`-Tabelle. Einfacher als M:N und ausreichend für Cold Calling, wo ein Lead sequentiell durch eine Kampagne läuft.

### 2.2 Neue Tabelle: `call_attempts`

Trackt jeden einzelnen Anrufversuch (N Versuche pro Lead):

```sql
CREATE TABLE call_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),

  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id),
  call_id TEXT,  -- Vapi Call ID

  attempt_number INT NOT NULL,
  disposition_code TEXT NOT NULL CHECK (disposition_code IN (
    'connected', 'no_answer', 'voicemail', 'busy', 'wrong_number',
    'gatekeeper', 'callback', 'not_interested', 'dnc_request',
    'demo_booked', 'qualified', 'technical_error'
  )),

  duration_seconds INT,
  direction TEXT NOT NULL DEFAULT 'outbound'
    CHECK (direction IN ('inbound', 'outbound')),

  -- Outcome-Details
  gatekeeper_name TEXT,
  callback_datetime TIMESTAMPTZ,
  notes TEXT,

  -- Vapi Metadata
  ended_reason TEXT,
  recording_url TEXT
);

CREATE INDEX idx_call_attempts_lead_id ON call_attempts(lead_id, created_at DESC);
CREATE INDEX idx_call_attempts_campaign_id ON call_attempts(campaign_id);
CREATE INDEX idx_call_attempts_disposition ON call_attempts(disposition_code);

ALTER TABLE call_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "call_attempts_read" ON call_attempts FOR SELECT USING (true);
CREATE POLICY "call_attempts_service_write" ON call_attempts FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

ALTER PUBLICATION supabase_realtime ADD TABLE call_attempts;
```

### 2.3 Neue Tabelle: `dnc_list`

```sql
CREATE TABLE dnc_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Identifikation (mindestens eines muss gesetzt sein)
  phone TEXT,
  email TEXT,

  -- Grund
  reason TEXT NOT NULL CHECK (reason IN (
    'manual',          -- Manuell vom Team hinzugefügt
    'ai_detected',     -- KI hat "Rufen Sie mich nicht mehr an" erkannt
    'customer_request', -- Kunde hat über anderen Kanal angefragt
    'legal',           -- Rechtliche Anforderung
    'wrong_number',    -- Nummer bestätigt falsch
    'competitor'       -- Als Wettbewerber identifiziert
  )),

  -- Nachverfolgung
  source_call_id TEXT,
  source_lead_id UUID REFERENCES leads(id),
  added_by UUID REFERENCES team_members(id),

  -- Compliance
  notes TEXT,
  expires_at TIMESTAMPTZ,         -- Optionales Ablaufdatum
  is_active BOOLEAN DEFAULT true, -- Soft Delete für Audit Trail

  CONSTRAINT dnc_phone_or_email CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

CREATE UNIQUE INDEX idx_dnc_phone ON dnc_list(phone)
  WHERE phone IS NOT NULL AND is_active = true;
CREATE UNIQUE INDEX idx_dnc_email ON dnc_list(email)
  WHERE email IS NOT NULL AND is_active = true;
CREATE INDEX idx_dnc_created_at ON dnc_list(created_at DESC);

CREATE TRIGGER dnc_list_updated_at
  BEFORE UPDATE ON dnc_list FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE dnc_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dnc_read" ON dnc_list FOR SELECT USING (true);
CREATE POLICY "dnc_service_write" ON dnc_list FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "dnc_service_update" ON dnc_list FOR UPDATE
  USING (auth.role() = 'service_role');
```

**DNC-Prüffunktion:**

```sql
CREATE OR REPLACE FUNCTION is_dnc(p_phone TEXT, p_email TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM dnc_list
    WHERE is_active = true
      AND (expires_at IS NULL OR expires_at > now())
      AND (
        (phone IS NOT NULL AND phone = p_phone)
        OR (email IS NOT NULL AND p_email IS NOT NULL AND email = p_email)
      )
  );
END;
$$ LANGUAGE plpgsql STABLE;
```

### 2.4 Neue Spalten auf `leads`

```sql
-- Kampagnen-Zuordnung
ALTER TABLE leads ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id);

-- Call-Richtung (Abwärtskompatibel: bestehende Leads = 'inbound')
ALTER TABLE leads ADD COLUMN IF NOT EXISTS call_direction TEXT
  DEFAULT 'inbound' CHECK (call_direction IN ('inbound', 'outbound'));

-- Letzte Disposition
ALTER TABLE leads ADD COLUMN IF NOT EXISTS disposition_code TEXT
  CHECK (disposition_code IN (
    'connected', 'no_answer', 'voicemail', 'busy', 'wrong_number',
    'gatekeeper', 'callback', 'not_interested', 'dnc_request',
    'demo_booked', 'qualified', 'technical_error'
  ));

-- Outbound Cadence Tracking
ALTER TABLE leads ADD COLUMN IF NOT EXISTS call_attempts INT DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_call_attempt_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_call_scheduled_at TIMESTAMPTZ;

-- Voicemail
ALTER TABLE leads ADD COLUMN IF NOT EXISTS voicemail_left BOOLEAN DEFAULT false;

-- Gatekeeper
ALTER TABLE leads ADD COLUMN IF NOT EXISTS gatekeeper_name TEXT;

-- Callback
ALTER TABLE leads ADD COLUMN IF NOT EXISTS callback_datetime TIMESTAMPTZ;

-- Connection-Qualität
ALTER TABLE leads ADD COLUMN IF NOT EXISTS time_to_connect_seconds INT;

-- DNC
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_dnc BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS dnc_reason TEXT;

-- Recording
ALTER TABLE leads ADD COLUMN IF NOT EXISTS recording_url TEXT;

-- Engagement Score (neue 5. Scoring-Dimension)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_engagement INT
  CHECK (score_engagement BETWEEN 1 AND 3);

-- Compliance
ALTER TABLE leads ADD COLUMN IF NOT EXISTS legal_basis TEXT;

-- Lead-Quelle (für CSV-Import Tracking)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_source TEXT
  DEFAULT 'inbound_call'
  CHECK (lead_source IN ('csv_import', 'manual', 'inbound_call', 'api'));

-- Smart Cadence: Grund für nächsten Anruf
ALTER TABLE leads ADD COLUMN IF NOT EXISTS follow_up_reason TEXT;

-- Status-Constraint erweitern
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check CHECK (
  status IN (
    'new', 'contacted', 'qualified', 'appointment_booked',
    'converted', 'lost', 'not_reached', 'rejected',
    'queued', 'attempting', 'exhausted', 'callback_scheduled', 'dnc'
  )
);

-- Neue Indizes für Outbound-Queries
CREATE INDEX idx_leads_campaign_id ON leads(campaign_id);
CREATE INDEX idx_leads_next_call ON leads(next_call_scheduled_at ASC)
  WHERE next_call_scheduled_at IS NOT NULL AND is_dnc = false;
CREATE INDEX idx_leads_disposition ON leads(disposition_code);
CREATE INDEX idx_leads_call_direction ON leads(call_direction);
```

**Abwärtskompatibilität:** Alle neuen Spalten sind nullable mit sicheren Defaults. Bestehende Inbound-Leads behalten ihre Werte. `call_direction` defaultet auf `'inbound'`.

---

## 3. Status-Modell & Disposition Codes

### 3.1 Status vs. Disposition: Zwei separate Dimensionen

| Dimension | Bedeutung | Beispiel |
|-----------|-----------|---------|
| **Status** | Position im Sales-Funnel (wo ist der Lead?) | `qualified` |
| **Disposition** | Ergebnis des letzten Anrufversuchs (was ist passiert?) | `voicemail` |

Ein Lead kann `status = 'qualified'` haben mit `disposition_code = 'callback'` vom letzten Versuch.

### 3.2 Outbound Status-Werte (Pipeline-Stufen)

| Status | Label (DE) | Farbe | Beschreibung |
|--------|-----------|-------|-------------|
| `queued` | Warteschlange | muted | In Kampagnen-Queue, noch nicht angerufen |
| `attempting` | Wird angerufen | chart-1 | Aktuell im Wählvorgang |
| `no_answer` | Nicht erreicht | chart-3 | Versucht, keine Antwort |
| `voicemail` | Mailbox | score-warning | Mailbox erreicht |
| `callback_scheduled` | Rückruf geplant | chart-5 | Rückruf vereinbart |
| `connected` | Erreicht | chart-2 | Person erreicht, Gespräch geführt |
| `qualified` | Qualifiziert | chart-4 | Qualifiziert, aber noch kein Demo-Termin |
| `demo_booked` | Demo gebucht | score-good | Demo-Termin gebucht |
| `converted` | Konvertiert | green-600 | Deal gewonnen |
| `lost` | Verloren | score-danger | Kein Interesse / verloren |
| `dnc` | DNC | destructive | Do Not Call |

### 3.3 Disposition Codes (12 Werte)

| Code | Label (DE) | Bedeutung |
|------|-----------|-----------|
| `connected` | Erreicht | Person hat abgenommen, Gespräch fand statt |
| `no_answer` | Keine Antwort | Telefon klingelte, niemand abgehoben |
| `voicemail` | Mailbox | Mailbox/Anrufbeantworter erreicht |
| `busy` | Besetzt | Leitung besetzt |
| `wrong_number` | Falsche Nummer | Nummer ungültig oder gehört jemand anderem |
| `gatekeeper` | Gatekeeper | Empfang/Assistenz erreicht, nicht durchgestellt |
| `callback` | Rückruf gewünscht | Person bat um Rückruf zu bestimmter Zeit |
| `dnc_request` | DNC-Anfrage | Person will nicht mehr angerufen werden |
| `not_interested` | Kein Interesse | Erreicht, aber explizit kein Interesse |
| `qualified` | Qualifiziert | Gespräch geführt, Lead qualifiziert |
| `demo_booked` | Demo gebucht | Demo-Termin im Gespräch gebucht |
| `technical_error` | Technischer Fehler | Anruf wegen technischem Problem gescheitert |

---

## 4. Lead-Scoring Anpassung

### 4.1 Neue 5. Dimension: `score_engagement`

| Score | Label | Kriterien |
|-------|-------|----------|
| 1 | Niedrig | Einsilbige Antworten, will schnell auflegen, keine Fragen |
| 2 | Mittel | Höfliches Gespräch, grundlegendes Interesse, stellt Basisfragen |
| 3 | Hoch | Aktiver Dialog, detaillierte Fragen, teilt konkrete Probleme |

### 4.2 Angepasste Grade-Grenzen (Dual-Mode für Abwärtskompatibilität)

Da bestehende Inbound-Leads kein `score_engagement` haben, verwendet der Trigger duale Grenzen:

```sql
CREATE OR REPLACE FUNCTION compute_lead_grade()
RETURNS TRIGGER AS $$
DECLARE
  computed_score INT;
  has_any_score BOOLEAN;
BEGIN
  computed_score := COALESCE(NEW.score_company_size, 0) +
                    COALESCE(NEW.score_tech_stack, 0) +
                    COALESCE(NEW.score_pain_point, 0) +
                    COALESCE(NEW.score_timeline, 0) +
                    COALESCE(NEW.score_engagement, 0);

  has_any_score := NEW.score_company_size IS NOT NULL OR
                   NEW.score_tech_stack IS NOT NULL OR
                   NEW.score_pain_point IS NOT NULL OR
                   NEW.score_timeline IS NOT NULL OR
                   NEW.score_engagement IS NOT NULL;

  IF has_any_score THEN
    -- Legacy Inbound (ohne Engagement): alte Grenzen
    IF NEW.score_engagement IS NULL THEN
      IF computed_score >= 10 THEN NEW.lead_grade := 'A';
      ELSIF computed_score >= 7 THEN NEW.lead_grade := 'B';
      ELSE NEW.lead_grade := 'C';
      END IF;
    -- Outbound (mit Engagement): neue Grenzen (max 15 statt 12)
    ELSE
      IF computed_score >= 12 THEN NEW.lead_grade := 'A';
      ELSIF computed_score >= 8 THEN NEW.lead_grade := 'B';
      ELSE NEW.lead_grade := 'C';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

| Modus | Max Punkte | A-Lead | B-Lead | C-Lead |
|-------|-----------|--------|--------|--------|
| Inbound (4 Dim.) | 12 | 10-12 | 7-9 | 4-6 |
| Outbound (5 Dim.) | 15 | 12-15 | 8-11 | 5-7 |

### 4.3 `total_score` Neuberechnung

```sql
ALTER TABLE leads DROP COLUMN total_score;
ALTER TABLE leads ADD COLUMN total_score INT GENERATED ALWAYS AS (
  COALESCE(score_company_size, 0) +
  COALESCE(score_tech_stack, 0) +
  COALESCE(score_pain_point, 0) +
  COALESCE(score_timeline, 0) +
  COALESCE(score_engagement, 0)
) STORED;
```

### 4.4 Post-Call GPT Prompt Erweiterung

Zum bestehenden OpenRouter-Scoring-Prompt hinzufügen:

```
- score_engagement (1-3): 1=minimale Beteiligung, einsilbige Antworten, will schnell auflegen.
  2=höfliches Gespräch, grundlegendes Interesse.
  3=aktiver Dialog, stellt detaillierte Fragen, teilt konkrete Probleme.
- dnc_requested (boolean): Hat der Gesprächspartner explizit darum gebeten, NICHT mehr
  angerufen zu werden? Phrasen: "Rufen Sie mich nicht mehr an", "Bitte keine Anrufe mehr",
  "Nehmen Sie mich von der Liste". Nur true bei eindeutiger Ablehnung.
- disposition_code: Eines von connected, not_interested, callback, dnc_request,
  qualified, demo_booked. Basierend auf dem Gesprächsverlauf.
```

---

## 5. Kampagnen-Management

### 5.1 Campaign-Lead Beziehung

**1:N** über `campaign_id` FK auf `leads`. Ein Lead gehört zu maximal einer aktiven Kampagne. Wird ein Lead erneut kontaktiert, wird er in eine neue Kampagne verschoben.

### 5.2 Cadence-Konfiguration (JSONB)

```json
{
  "max_attempts": 5,
  "intervals_minutes": [60, 240, 1440, 4320, 10080],
  "voicemail_action": "skip",
  "leave_voicemail_after_attempt": 3
}
```

- `intervals_minutes`: Wartezeiten zwischen Versuchen [1h, 4h, 1d, 3d, 7d]
- `voicemail_action`: `"skip"` (kein VM hinterlassen) oder `"leave_message"`
- `leave_voicemail_after_attempt`: Ab welchem Versuch eine Voicemail hinterlassen wird

### 5.3 Campaign Status Lifecycle

```
draft ──→ active ──→ paused ──→ active ──→ completed
                                        └──→ archived
```

### 5.4 Calling Window Enforcement

Jede Kampagne definiert erlaubte Anrufzeiten:
- `calling_window_start` / `calling_window_end`: z.B. 09:00 - 18:00
- `calling_days`: Wochentage als Array `{1,2,3,4,5}` (Mo-Fr)
- `calling_timezone`: Standard `Europe/Berlin`

Der Campaign Orchestrator Workflow prüft vor jedem Anruf, ob die aktuelle Zeit im Fenster liegt.

---

## 6. DNC (Do Not Call) Management

### 6.1 Automatische DNC-Erkennung

Der Post-Call Processing Workflow (WF2) wird um DNC-Erkennung erweitert:
1. GPT analysiert Transcript auf DNC-Phrasen ("Rufen Sie mich nicht mehr an", etc.)
2. Bei `dnc_requested === true`: INSERT in `dnc_list` mit `reason = 'ai_detected'`
3. Lead-Feld `is_dnc = true` setzen
4. Status auf `'dnc'` ändern

### 6.2 DNC-Check vor jedem Anruf

Im Campaign Orchestrator Workflow:
1. `SELECT is_dnc(lead.phone, lead.email)` aufrufen
2. Bei `true`: Lead überspringen, `disposition_code = 'dnc'` setzen
3. Weiter zum nächsten Lead

### 6.3 Manuelle DNC-Verwaltung (Dashboard)

- Eigene Seite `/dnc` mit Suchfunktion und DNC-Tabelle
- "Manuell hinzufügen" Button mit Telefonnummer + Grund
- "Von DNC entfernen" mit Bestätigungsdialog
- Automatisch erkannte DNC-Requests werden hervorgehoben

---

## 7. n8n Workflow-Änderungen

### 7.1 Übersicht

| Workflow | Typ | Beschreibung |
|----------|-----|-------------|
| **WF1** (bestehend) | Modifiziert | Tool-Call Handler: `save_lead_info` bekommt optionales `call_direction` Feld |
| **WF2** (bestehend) | Modifiziert | Post-Call: + `score_engagement`, + DNC-Erkennung, + Disposition-Inferenz, + Cadence-Progression |
| **WF3** (neu) | Neu | Campaign Orchestrator: Cron → nächsten Lead holen → DNC-Check → Vapi Call starten |
| **WF4** (neu) | Neu | Campaign CRUD API: Webhooks für Dashboard (create/update/pause/activate) |

### 7.2 WF2: Post-Call Processing Modifikationen

**A) GPT-Prompt erweitern** um `score_engagement`, `dnc_requested`, `disposition_code`

**B) Disposition-Inferenz** (nach GPT-Analyse):
| Vapi `endedReason` | → Disposition |
|---------------------|---------------|
| `no-answer` | `no_answer` |
| `voicemail` / `machine-detected` | `voicemail` |
| `busy` | `busy` |
| Connected + `appointment_booked` | `demo_booked` |
| Connected + `dnc_requested` | `dnc_request` |
| Connected + niedriges Engagement | `not_interested` |
| Connected + Callback erwähnt | `callback` |
| Default Connected | `connected` |

**C) Cadence-Progression** (neuer Code-Node nach Supabase UPSERT):
- Wenn `call_direction === 'outbound'` UND Disposition kein Terminal-Status:
  - `call_attempts` inkrementieren
  - `next_call_scheduled_at` aus Cadence-Config berechnen
  - Bei `call_attempts >= max_attempts`: `status = 'exhausted'`
  - Lead updaten

**D) INSERT in `call_attempts`** (neuer Node):
- Jeden Anrufversuch mit Disposition, Dauer, Recording URL protokollieren

### 7.3 WF3: Campaign Scheduling Engine (Neu — KEIN Auto-Dialer!)

> **WICHTIG:** In der Demo-Phase führt WF3 **keine Anrufe aus**. Er berechnet nur `next_call_scheduled_at` und `follow_up_reason` für Leads, die noch keinen geplanten nächsten Anruf haben. Anrufe werden ausschließlich manuell über den Click-to-Call Button im Dashboard ausgelöst (siehe Abschnitt 14).

```
Trigger: Cron (täglich um 06:00 Europe/Berlin)
  │
  ▼
Code Node: Aktive Kampagnen laden
  │
  ▼
Loop: Für jede aktive Kampagne
  │
  ▼
  Supabase Query: Leads ohne geplanten nächsten Anruf holen WHERE:
    - campaign_id = aktuelle Kampagne
    - is_dnc = false
    - next_call_scheduled_at IS NULL
    - call_attempts = 0
    - status = 'queued'
    LIMIT 50
  │
  ▼
  Code Node: Für jeden Lead:
    - Initiales next_call_scheduled_at setzen (Kampagnen-Startzeit)
    - follow_up_reason = 'Erstanruf — Kampagne gestartet'
    - UPDATE leads SET next_call_scheduled_at, follow_up_reason
  │
  ▼
  Code Node: Campaign-Metriken aktualisieren
    - total_leads, leads_called zählen
    - UPDATE campaigns SET total_leads, leads_called
```

**Hinweis:** Die intelligente Cadence-Berechnung nach jedem Anruf (basierend auf Disposition) erfolgt in **WF2 Post-Call Processing** (Abschnitt 15.4), NICHT in WF3. WF3 ist nur für die initiale Scheduling-Zuweisung bei Kampagnenstart zuständig.

### 7.4 WF4: Campaign CRUD API (Neu)

| Endpoint | Methode | Beschreibung |
|----------|---------|-------------|
| `/webhook/campaign-create` | POST | Neue Kampagne erstellen |
| `/webhook/campaign-update` | PATCH | Kampagne aktualisieren |
| `/webhook/campaign-pause` | POST | Kampagne pausieren |
| `/webhook/campaign-activate` | POST | Kampagne aktivieren |
| `/webhook/campaign-add-leads` | POST | Leads zu Kampagne hinzufügen |

Alle Endpoints nutzen `X-Webhook-Secret` Header-Authentifizierung.

---

## 8. Frontend-Komponenten (Neu & Angepasst)

### 8.1 Neue Komponenten (~23)

| Komponente | Pfad | Beschreibung |
|------------|------|-------------|
| **Kampagnen** | | |
| `CampaignTable` | `src/components/campaigns/CampaignTable.tsx` | Kampagnen-Liste: Name, Status, Leads, Connection Rate, Fortschritt |
| `CampaignCard` | `src/components/campaigns/CampaignCard.tsx` | Kompakte Kampagnen-Karte (Mobile) |
| `CreateCampaignDialog` | `src/components/campaigns/CreateCampaignDialog.tsx` | Dialog: Name, Max Versuche, Intervall, Zeitfenster |
| `CampaignStatusBadge` | `src/components/campaigns/CampaignStatusBadge.tsx` | Status-Badge (Entwurf/Aktiv/Pausiert/Abgeschlossen) |
| **Click-to-Call** | | |
| `CallButton` | `src/components/ui/CallButton.tsx` | Anruf-Button mit Bestätigungsdialog + Status-Handling |
| `CallStatusBadge` | `src/components/ui/CallStatusBadge.tsx` | Live-Status Badge (Initiating/Ringing/In Progress/Completed) |
| `ActiveCallBanner` | `src/components/dashboard/ActiveCallBanner.tsx` | Sticky Banner bei aktivem Anruf mit Timer + Lead-Info |
| **Smart Cadence** | | |
| `ToCallTodayList` | `src/components/dashboard/ToCallTodayList.tsx` | "Heute anrufen" Liste mit fälligen Leads + Call-Buttons |
| `CadenceTimeline` | `src/components/lead-detail/CadenceTimeline.tsx` | Visuelle Timeline: vergangene + geplante Anrufe |
| **Lead Import** | | |
| `ImportLeadsDialog` | `src/components/leads/ImportLeadsDialog.tsx` | 3-Step Wizard: Upload → Mapping → Import mit Summary |
| **Shared UI** | | |
| `DispositionBadge` | `src/components/ui/DispositionBadge.tsx` | Farbiges Badge für Disposition Codes |
| `AudioPlayer` | `src/components/ui/AudioPlayer.tsx` | Play/Pause, Seekbar, Speed (0.5x-2x), Download |
| `ProgressBar` | `src/components/ui/ProgressBar.tsx` | Horizontaler Fortschrittsbalken |
| **Lead Detail** | | |
| `CallAttemptTimeline` | `src/components/lead-detail/CallAttemptTimeline.tsx` | Vertikale Timeline aller Anrufversuche (Call Log) |
| `DNCConfirmDialog` | `src/components/lead-detail/DNCConfirmDialog.tsx` | Bestätigungsdialog für DNC-Setzung |
| `DispositionSelect` | `src/components/lead-detail/DispositionSelect.tsx` | Dropdown für Disposition-Auswahl |
| **DNC** | | |
| `DNCTable` | `src/components/dnc/DNCTable.tsx` | DNC-Liste: Name, Telefon, Grund, Datum, Aktionen |
| `AddDNCDialog` | `src/components/dnc/AddDNCDialog.tsx` | Dialog zum manuellen DNC-Eintrag |
| **Analytics/Charts** | | |
| `DispositionDonutChart` | `src/components/dashboard/DispositionDonutChart.tsx` | Donut: Verteilung der Disposition Codes |
| `BestTimeHeatmap` | `src/components/dashboard/BestTimeHeatmap.tsx` | 7x24 Heatmap: Connection Rate nach Tag+Stunde |
| `OutboundFunnel` | `src/components/analytics/OutboundFunnel.tsx` | Funnel: Attempts → Connected → Qualified → Demo → Converted |
| `AgentComparisonChart` | `src/components/analytics/AgentComparisonChart.tsx` | Grouped Bar: Calls, Connection Rate, Demo Rate pro Agent |
| **Bulk-Aktionen** | | |
| `BulkActions` | `src/components/leads/BulkActions.tsx` | Toolbar: Zu Kampagne hinzufügen, DNC setzen, Anruf planen |

### 8.2 Anzupassende Komponenten (~15)

| Komponente | Datei | Änderungen |
|------------|-------|-----------|
| **KPICards** | `src/components/KPICards.tsx` | 6 statt 4 KPIs: Anrufversuche, Connection Rate, Mailbox-Quote, Gesprächsdauer, Demo-Buchungsrate, Calls/h |
| **PipelineBoard** | `src/components/pipeline/PipelineBoard.tsx` | 11 Spalten statt 8, neue PIPELINE_STAGES |
| **PipelineCard** | `src/components/pipeline/PipelineCard.tsx` | + Versuche-Counter, + letzter Anruf (relativ), + DispositionBadge |
| **PipelineColumn** | `src/components/pipeline/PipelineColumn.tsx` | Breite: 220px statt 280px (11 Spalten) |
| **PipelineSummary** | `src/components/pipeline/PipelineSummary.tsx` | Funnel-Stages: queued → connected → qualified → demo_booked → converted |
| **EnhancedLeadTable** | `src/components/leads/EnhancedLeadTable.tsx` | + Spalten: Versuche, Disposition, Recording (Mini-Player) |
| **LeadFilters** | `src/components/leads/LeadFilters.tsx` | + Filter: Kampagne, Disposition, DNC-Status, Versuche-Bereich |
| **LeadDetailHeader** | `src/components/lead-detail/LeadDetailHeader.tsx` | + Buttons: "Rückruf planen", "DNC setzen" |
| **ContactCard** | `src/components/lead-detail/ContactCard.tsx` | + Kampagne, Versuche, DNC-Banner |
| **Sidebar** | `src/components/Sidebar.tsx` | Neue Sektionen: OUTBOUND (Kampagnen, Pipeline), DATEN (Leads, DNC-Liste) |
| **ConversionChart** | `src/components/ConversionChart.tsx` | → OutboundActivityChart: Attempts (Bar) + Connection Rate (Line) + Demos (Line) |
| **Analytics Page** | `src/app/(dashboard)/analytics/page.tsx` | 4 Tabs statt 3: + Erreichbarkeit, + Agenten |
| **Dashboard Page** | `src/app/(dashboard)/page.tsx` | Neue KPI-Berechnung, DispositionDonut statt ObjectionDonut |
| **Pipeline Page** | `src/app/(dashboard)/pipeline/page.tsx` | Neue Pipeline-KPIs: Warteschlange, Connection Rate, Demo-Rate, Ø Versuche |
| **Alert Rules** | `src/lib/hooks/useAlerts.ts` | Outbound-Regeln: Max Versuche, Überfällige Rückrufe, A-Lead nicht kontaktiert |
| **types.ts** | `src/lib/types.ts` | + Campaign, CallAttempt, DispositionCode, erweiterte Lead-Felder, neue Status-Labels |
| **leads-context.tsx** | `src/lib/leads-context.tsx` | + campaign/disposition Filter, erweiterte CONTEXT_FIELDS |

### 8.3 Neue Seiten (3)

| Seite | Pfad | Inhalt |
|-------|------|--------|
| **Kampagnen** | `src/app/(dashboard)/campaigns/page.tsx` | KPIs, CampaignTable, CreateCampaignDialog |
| **Kampagnen-Detail** | `src/app/(dashboard)/campaigns/[id]/page.tsx` | Campaign-KPIs, Fortschrittsbalken, gefilterte LeadTable |
| **DNC-Liste** | `src/app/(dashboard)/dnc/page.tsx` | DNC-KPIs (Gesamt, Heute, Automatisch), DNCTable, AddDNCDialog |

### 8.4 Neuer Context (1)

| Context | Datei | Inhalte |
|---------|-------|---------|
| **CampaignProvider** | `src/lib/campaigns-context.tsx` | campaigns, loading, CRUD ops, Realtime Subscription |

### 8.5 Sidebar-Navigation (Neu)

```
ÜBERSICHT
  └─ Dashboard          (LayoutDashboard)

OUTBOUND
  ├─ Kampagnen          (Megaphone)        ← NEU
  └─ Pipeline           (Kanban)

DATEN
  ├─ Leads              (Users)
  └─ DNC-Liste          (ShieldBan)        ← NEU

ANALYSE
  └─ Analytik           (BarChart3)

TOOLS
  └─ Frühwarnsystem     (AlertTriangle)    [Badge: count]

TEAM
  └─ Team-Verwaltung    (UserCog)
```

### 8.6 Dashboard-KPIs (Outbound)

| KPI | Icon | Farbe | Tooltip-Formel |
|-----|------|-------|---------------|
| Anrufversuche | `PhoneOutgoing` | purple | Gesamtzahl der Anrufversuche im Zeitraum |
| Connection Rate | `PhoneCall` | green | Erreichte Kontakte / Alle Versuche × 100 |
| Mailbox-Quote | `Voicemail` | amber | Mailbox-Ergebnisse / Alle Versuche × 100 |
| Ø Gesprächsdauer | `Clock` | cyan | Summe Gesprächszeiten / Erreichte Kontakte |
| Demo-Buchungsrate | `CalendarCheck` | emerald | Gebuchte Demos / Erreichte Kontakte × 100 |
| Calls/Stunde | `Gauge` | indigo | Anrufe heute / Aktive Stunden heute |

### 8.7 Lead Detail: Anrufhistorie Tab (Neu)

Neuer 5. Tab "Anrufhistorie" mit `CallAttemptTimeline`:
- Vertikale Timeline mit farbigen Dots pro Disposition
- Jeder Eintrag: Zeitstempel, DispositionBadge, Dauer, Agent, Mini-Play-Button
- Visuell wie bestehende `StatusTimeline` Komponente

### 8.8 Audio Player

**Vollversion** (Lead Detail, in Card oberhalb der Tabs):
- Play/Pause, Seekbar, Zeitanzeige, Playback Speed (0.5x/1x/1.5x/2x), Download

**Kompaktversion** (LeadTable):
- Nur Play/Pause Icon + Dauer-Label, 32px Höhe

---

## 9. Step-by-Step Roadmap

### Phase 1: Datenbank-Migration
**Dateien:** `supabase/migrations/003_outbound_transformation.sql`

1. Tabelle `campaigns` erstellen (inkl. RLS, Realtime, Trigger)
2. Tabelle `call_attempts` erstellen (inkl. RLS, Realtime)
3. Tabelle `dnc_list` erstellen (inkl. RLS, Unique-Indizes)
4. `leads`-Tabelle um 15 neue Spalten erweitern (ALTER TABLE)
5. Status-CHECK-Constraint erweitern (neue Outbound-Werte)
6. `total_score` GENERATED ALWAYS Spalte neu berechnen (Drop + Add mit 5 Dimensionen)
7. `compute_lead_grade()` Trigger-Funktion aktualisieren (Dual-Mode)
8. `is_dnc()` Prüffunktion erstellen
9. Neue Indizes erstellen (campaign_id, next_call, disposition, call_direction)
10. Migration testen auf Supabase Branch

### Phase 2: TypeScript Types & State Management
**Dateien:** `dashboard/src/lib/types.ts`, `dashboard/src/lib/leads-context.tsx`, `dashboard/src/lib/campaigns-context.tsx`

1. `types.ts`: DispositionCode Type + Labels + Colors
2. `types.ts`: Campaign Interface + CadenceConfig
3. `types.ts`: CallAttempt Interface
4. `types.ts`: Lead Interface um neue Felder erweitern
5. `types.ts`: Status-Type und Labels erweitern (queued, attempting, etc.)
6. `types.ts`: SortField Type erweitern (call_attempts, disposition_code)
7. `leads-context.tsx`: CONTEXT_FIELDS um neue Spalten erweitern
8. `leads-context.tsx`: Filter-Logik für Kampagne, Disposition, DNC erweitern
9. `campaigns-context.tsx`: Neuen CampaignProvider erstellen (Fetch, Realtime, CRUD)
10. `AppShell.tsx`: CampaignProvider in Provider-Tree einhängen

### Phase 3: Shared UI Components
**Dateien:** `dashboard/src/components/ui/`

1. `DispositionBadge.tsx` erstellen (Pattern von StatusBadge)
2. `CampaignStatusBadge.tsx` erstellen
3. `ProgressBar.tsx` erstellen
4. `AudioPlayer.tsx` erstellen (Full + Compact Mode)
5. Bestehende `StatusBadge` um neue Status-Werte erweitern

### Phase 4: Bestehende Seiten anpassen + Click-to-Call
**Dateien:** Dashboard, Pipeline, Leads, Lead Detail, API Routes

1. **Sidebar.tsx**: Neue Navigation (OUTBOUND Sektion, DNC-Liste)
2. **KPICards.tsx**: 6 Outbound-KPIs (Connection Rate, Mailbox, Demo-Rate, Calls/h)
3. **Dashboard page.tsx**: Neue KPI-Berechnung, DispositionDonutChart, **ToCallTodayList**
4. **ConversionChart.tsx**: → OutboundActivityChart (Attempts Bar + Rate Lines)
5. **PipelineBoard.tsx**: 11 Spalten, neue PIPELINE_STAGES
6. **PipelineCard.tsx**: + Versuche-Counter, + DispositionBadge, + **CallButton (icon)**
7. **PipelineColumn.tsx**: Breite auf 220px reduzieren
8. **PipelineSummary.tsx**: Funnel-Stages auf Outbound-Happy-Path
9. **Pipeline page.tsx**: Neue KPIs (Warteschlange, Connection Rate, Demo-Rate, Ø Versuche)
10. **EnhancedLeadTable.tsx**: + **CallButton-Spalte**, + Versuche, + Disposition, + Mini-Player
11. **LeadFilters.tsx**: + Kampagne, Disposition, DNC, Versuche-Range Filter
12. **Lead Detail page.tsx**: + Audio Player Card, + "Anrufhistorie" Tab, + **CadenceTimeline**, + **CallButton (prominent)**
13. **LeadDetailHeader.tsx**: + "Rückruf planen" / "DNC setzen" / **"Anrufen"** Buttons
14. **ContactCard.tsx**: + Kampagne, Versuche, DNC-Banner
15. **useAlerts.ts**: Outbound-spezifische Alert-Regeln
16. **API Route**: `POST /api/calls/initiate` für Click-to-Call (VAPI Integration)
17. **API Route**: `POST /api/leads/import` für CSV-Upload
18. **ActiveCallBanner**: In AppShell/Layout einbinden

### Phase 5: Neue Seiten + Import
**Dateien:** Campaigns, DNC, Import

1. `/campaigns/page.tsx`: Kampagnen-KPIs, CampaignTable, Create-Dialog
2. `CampaignTable.tsx`: Tabelle mit Status, Leads, Connection Rate, Fortschritt
3. `CreateCampaignDialog.tsx`: Formular für neue Kampagne
4. `/campaigns/[id]/page.tsx`: Detail mit KPIs, ProgressBar, gefilterter LeadTable
5. `/dnc/page.tsx`: DNC-KPIs, Suche, DNCTable
6. `DNCTable.tsx`: Name, Telefon, Grund, Datum, Entfernen-Button
7. `AddDNCDialog.tsx`: Manuell DNC hinzufügen
8. `DNCConfirmDialog.tsx`: Bestätigungsdialog
9. `CallAttemptTimeline.tsx`: Call-Log Timeline für Lead Detail
10. `CadenceTimeline.tsx`: Vergangene + geplante Touchpoints visualisieren
11. `DispositionSelect.tsx`: Dropdown für Disposition-Auswahl
12. `BulkActions.tsx`: Toolbar für Massenaktionen
13. `ImportLeadsDialog.tsx`: 3-Step CSV-Upload Wizard (Upload → Mapping → Import)
14. `ToCallTodayList.tsx`: Dashboard-Liste fälliger Leads mit Call-Buttons

### Phase 6: Analytics Redesign & Polish
**Dateien:** Analytics, neue Chart-Komponenten

1. **Analytics page.tsx**: 4 Tabs (Überblick, Erreichbarkeit, Einwände, Agenten)
2. **Tab "Erreichbarkeit"**: ConnectionRateOverTime, BestTimeHeatmap, VoicemailTrend, AttemptsDistribution
3. **Tab "Einwände"**: + ObjectionOutcomeMatrix (welche Einwände führen trotzdem zu Demos?)
4. **Tab "Agenten"**: AgentPerformanceKPIs, AgentComparisonChart, AgentPerformanceTable
5. **OutboundFunnel**: Attempts → Connected → Qualified → Demo → Converted
6. **DispositionDonutChart**: Dashboard-Integration
7. Audio Player Integration in EnhancedLeadTable (Compact Mode)
8. Responsive Tests (Mobile Campaign View, Audio Player)

---

## 10. Compliance & DSGVO

### 10.1 B2B Kaltakquise in Deutschland

| Regelung | Anforderung | Umsetzung |
|----------|------------|-----------|
| **UWG § 7 Abs. 2 Nr. 2** | Telefonwerbung bei Geschäftskunden nur bei "mutmaßlicher Einwilligung" | `legal_basis` Feld auf Lead (z.B. "Branchenrelevanz", "Messebesuch") |
| **Art. 6 DSGVO** | Rechtsgrundlage dokumentieren | Jeder Lead braucht dokumentierte Rechtsgrundlage |
| **Art. 15 DSGVO** | Auskunftsrecht | CSV-Export aller personenbezogenen Daten inkl. Transcripts |
| **Aufzeichnungshinweis** | DSGVO-Hinweis zu Gesprächsbeginn | First Message muss Aufzeichnungshinweis enthalten |
| **Widerspruchsrecht** | DNC-Pflicht bei Widerspruch | Automatische DNC-Erkennung + sofortige Umsetzung |

### 10.2 Calling Window Regeln

| Regel | Wert | Durchsetzung |
|-------|------|-------------|
| Werktags | 09:00 - 18:00 (konservativ) | `calling_window_start/end` auf Campaign |
| Samstags | Keine Anrufe | `calling_days` Array (nur Mo-Fr) |
| Sonn-/Feiertage | Keine Anrufe | Feiertags-Check im Orchestrator |
| Timezone | `Europe/Berlin` | `calling_timezone` auf Campaign |

### 10.3 KI-Disclosure

Der System Prompt sollte für Outbound eine kurze KI-Disclosure enthalten:
> "Lisa, KI-gestützte Vertriebsassistentin"

Bei direkter Nachfrage ("Sind Sie ein Roboter?") sollte Lisa ehrlich antworten statt auszuweichen.

---

## 11. Edge Cases & Risiken

### 11.1 Edge Cases

| Szenario | Problem | Lösung |
|----------|---------|--------|
| Lead in mehreren Kampagnen | Doppelte Anrufe am selben Tag | 1:N Beziehung (Lead nur in einer aktiven Kampagne). Globaler Cooldown per Telefonnummer |
| Outbound-Lead ruft zurück | Inbound auf Outbound-Nummer | Vapi erlaubt Inbound-Assistant auf Nummer. Caller-Lookup in `leads` Tabelle, Kontext laden |
| CSV-Import Duplikate | 50 von 500 Leads existieren bereits | UPSERT auf phone/email. Import-Summary: "450 neu, 50 aktualisiert, 3 Fehler" |
| Cadence-Timer während Offline | n8n down, Queue staut sich | Orchestrator prüft `next_call_scheduled_at < NOW()` (past-due). Rate-Limiting bei Recovery |
| Timezone-Konflikte | Lead in Österreich, Kampagne für Deutschland | Phase 1: Alle `Europe/Berlin`. Phase 2: `lead.timezone` Feld |

### 11.2 Technische Risiken

| Risiko | Impact | Mitigation |
|--------|--------|-----------|
| n8n Performance bei 50+ parallelen Calls | Hoch | Rate Limiting im Orchestrator (max 5 Calls/Minute), ggf. n8n Queue Mode |
| `total_score` Column Drop | Hoch | Migration in Single Transaction, vorher auf Branch DB testen |
| Grade-Shift bei bestehenden Leads | Mittel | Dual-Mode Trigger (alte Grenzen wenn score_engagement NULL) |
| Vapi Concurrent Call Limits | Mittel | Plan-Limits prüfen, Orchestrator respektiert Limits |
| LeadsProvider Performance bei 1000+ Leads | Mittel | Pagination einführen (Phase 2), initiale Lazy-Loading Strategie |

### 11.3 Priorisierung (MVP → Phase 2 → Phase 3)

**MVP (2-3 Wochen) — Kern-Outbound-Loop:**
- DB-Migration (neue Tabellen + Spalten inkl. `lead_source`, `follow_up_reason`)
- CSV-Import für Leads (API Route + ImportLeadsDialog)
- Kampagnen CRUD (erstellen, Leads zuordnen, starten/pausieren)
- **Click-to-Call** (API Route + VAPI Integration + CallButton + CallStatusBadge)
- Post-Call Processing: Disposition-Erkennung + **Smart Cadence Berechnung**
- **"Heute anrufen" Liste** auf Dashboard (ToCallTodayList)
- Dashboard KPI-Update (Connection Rate, Demo-Rate, Calls/h)
- Pipeline Kanban Redesign (11 Spalten)
- Call-Log / Anrufhistorie (CallAttemptTimeline in Lead Detail)
- Basis-DNC (manuell)
- **Kein Auto-Dialing** — alle Anrufe manuell per Click-to-Call

**Phase 2 (3-4 Wochen nach MVP):**
- Audio Player + Recording Storage + Waveform
- ActiveCallBanner (Live-Anruf-Banner)
- CadenceTimeline in Lead Detail (vergangene + geplante Touchpoints)
- Automatische DNC-Erkennung (KI im Post-Call)
- Campaign Analytics (per-Campaign Funnel, BestTimeHeatmap)
- Dynamic Scripting (Campaign-level System Prompt Overrides)
- Scoring: 5. Dimension `score_engagement` + Dual-Mode Trigger
- BulkActions (Massenaktionen auf Leads-Seite)
- Agent Performance Tab in Analytics

**Phase 3 (Ongoing):**
- CRM Integration (HubSpot/Salesforce)
- Auto-Dialer / Power Dialer (Cron-basiert, opt-in)
- Talk-to-Listen Ratio (Audio-Analyse)
- Lead Scoring ML (auto-score basierend auf historischen Daten)
- Multi-Agent Support (verschiedene Stimmen/Personas pro Kampagne)
- Warm Transfer (an menschlichen SDR)
- Compliance Audit Trail
- A/B Testing von Pitches

---

## 12. KPI-Definitionen & Benchmarks

### 12.1 KPI-Formeln

| KPI | Formel | B2B Benchmark |
|-----|--------|---------------|
| **Connection Rate** | Erreichte Kontakte / Alle Versuche × 100 | 15-25% |
| **Voicemail Rate** | Voicemail-Dispositions / Alle Versuche × 100 | 30-50% |
| **Demo-Buchungsrate** | Gebuchte Demos / Erreichte Kontakte × 100 | 5-15% |
| **Overall Conversion** | Gebuchte Demos / Alle Versuche × 100 | 2-5% |
| **Ø Versuche bis Connect** | Summe(Versuche bis erste Connection) / Connected Leads | 3-7 |
| **Calls pro Tag** | Anrufversuche pro Tag pro Agent | 50-80 |
| **Talk Time pro Tag** | Summe(call_duration) pro Tag | 2-4 Stunden |
| **Cadence Completion Rate** | Leads mit allen Versuchen / Total in Kampagne × 100 | - |
| **DNC Rate** | DNC-Anfragen / Erreichte Kontakte × 100 | < 5% |
| **Pipeline Velocity** | Ø Tage von erstem Kontakt bis Demo-Buchung | 7-14 Tage |
| **List Penetration** | Leads mit ≥1 Versuch / Total in Kampagne × 100 | - |
| **Right Party Contact Rate** | Entscheider erreicht / Alle Connections × 100 | 30-50% |

### 12.2 KPI-Formel Korrektur

**Wichtig:** Die aktuelle Dashboard-Berechnung der Conversion Rate ist für Outbound FALSCH:

```typescript
// FALSCH (aktuell): Demos / Alle Leads
const conversionRate = (booked / total) * 100;

// RICHTIG (Outbound): Demos / Erreichte Kontakte
const connected = leads.filter(l =>
  ['connected', 'qualified', 'demo_booked', 'callback'].includes(l.disposition_code)
).length;
const conversionRate = connected > 0 ? (booked / connected) * 100 : 0;
```

### 12.3 Fehlende Metriken (Phase 2)

| Metrik | Beschreibung | Phase |
|--------|-------------|-------|
| Speed to Lead | Zeit von Import bis erstem Anruf | Phase 2 |
| Campaign ROI | (Demos × Avg Deal Value) / (Vapi-Minuten × Kosten/Minute) | Phase 2 |
| Abandon Rate | % der Gespräche < 15 Sekunden (schlechter Pitch) | Phase 2 |
| Objection Handle Rate | Einwände die trotzdem zu Demo führen / Alle Einwände | Phase 2 |
| Best Time to Call | Stündliche Heatmap der Connection Rate | Phase 1 (MVP) |

---

## 13. CSV-Upload & Lead-Ingestion

### 13.1 Übersicht

Im Outbound-Modell existieren Leads **vor** dem ersten Anruf. Der primäre Ingestion-Pfad ist CSV-Upload: Ein Sales Manager lädt eine Liste kalter Leads hoch, ordnet sie einer Kampagne zu, und der Voice Agent arbeitet die Liste ab.

### 13.2 Neues Feld auf `leads`: `lead_source`

```sql
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_source TEXT
  DEFAULT 'inbound_call'
  CHECK (lead_source IN ('csv_import', 'manual', 'inbound_call', 'api'));
```

| Wert | Beschreibung |
|------|-------------|
| `csv_import` | Über CSV-Upload importiert |
| `manual` | Manuell im Dashboard erstellt |
| `inbound_call` | Durch eingehenden Anruf entstanden (Legacy/Inbound) |
| `api` | Über externe API (CRM-Sync, Webhook) |

### 13.3 CSV-Format: Fixe Header (B2B-Standard)

Kalte Leads kommen typischerweise aus Tools wie Apollo oder ZoomInfo. Statt eines generischen Spalten-Mapping-Wizards verwendet der Import **3 fixe, case-insensitive CSV-Header**:

| CSV-Header | DB-Feld | Pflicht | Beschreibung |
|------------|---------|---------|-------------|
| `name` | `caller_name` | Nein | Voller Name des Ansprechpartners |
| `email` | `email` | Nein | E-Mail-Adresse |
| `phone` | `phone` | **Ja** | Telefonnummer (wird zu E.164 normalisiert) |

**Muster-CSV Template** (Download-Button im UI):

```csv
name,email,phone
Max Mustermann,max@example.com,+49 171 1234567
Erika Musterfrau,erika@example.com,+49 160 9876543
```

### 13.4 Next.js API Route: `POST /api/leads/import`

**Datei:** `dashboard/src/app/api/leads/import/route.ts` (NEU)

```typescript
// Pseudocode für den Import-Flow
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const campaignId = formData.get('campaign_id') as string | null;

  // 1. CSV parsen (mit papaparse)
  const rows = parseCSV(await file.text());

  // 2. Header validieren (case-insensitive)
  const headers = Object.keys(rows[0]).map(h => h.toLowerCase().trim());
  if (!headers.includes('phone')) {
    return Response.json({ error: 'Pflicht-Header "phone" fehlt' }, { status: 400 });
  }

  // 3. Festes Mapping anwenden (kein User-Mapping nötig)
  const HEADER_MAP: Record<string, string> = {
    'name': 'caller_name',
    'email': 'email',
    'phone': 'phone',
  };

  const results = { created: 0, updated: 0, errors: [] };
  for (const row of rows) {
    // Case-insensitive Header-Zuordnung
    const lead: Record<string, string> = {};
    for (const [csvKey, value] of Object.entries(row)) {
      const dbField = HEADER_MAP[csvKey.toLowerCase().trim()];
      if (dbField && value) lead[dbField] = value.trim();
    }

    // Pflichtfeld: phone
    if (!lead.phone || !isValidPhone(lead.phone)) {
      results.errors.push({ row: row._index, reason: 'Ungültige Telefonnummer' });
      continue;
    }

    // Sanitize: Strip HTML/Script, max 500 chars pro Feld
    sanitizeLeadFields(lead);

    // 4. UPSERT auf phone (Duplikaterkennung)
    const { data, error } = await supabaseAdmin
      .from('leads')
      .upsert({
        ...lead,
        phone: normalizePhone(lead.phone),  // E.164 Format
        campaign_id: campaignId,
        lead_source: 'csv_import',
        call_direction: 'outbound',
        status: 'queued',
        call_attempts: 0,
      }, {
        onConflict: 'phone',
        ignoreDuplicates: false,
      });

    if (error) results.errors.push({ row: row._index, reason: error.message });
    else results.created++;
  }

  // 5. Campaign-Metriken aktualisieren
  if (campaignId) {
    await updateCampaignLeadCount(campaignId);
  }

  return Response.json(results);
}
```

**Telefonnummer-Normalisierung:**
- Eingabe: `+49 171 1234567`, `0171/1234567`, `0049-171-1234567`
- Ausgabe: `+491711234567` (E.164 Format)
- Regex-basiert, mit Ländercode-Default `+49` für deutsche Nummern

**Duplikaterkennung:**
- Primär auf `phone` (normalisiert)
- Bei Duplikat: Bestehenden Lead updaten (Name, Email), aber `status`/`scores`/`transcript` NICHT überschreiben
- Neuer Unique Index: `CREATE UNIQUE INDEX idx_leads_phone_unique ON leads(phone) WHERE phone IS NOT NULL;`

### 13.5 Frontend: `ImportLeadsDialog` Komponente

**Datei:** `dashboard/src/components/leads/ImportLeadsDialog.tsx` (NEU)

**Vereinfachter 2-Step Flow** (kein Spalten-Mapping nötig):

**Step 1: Datei hochladen**
- Drag & Drop Zone oder File-Picker
- Akzeptiert: `.csv` (nur CSV im MVP)
- Max Dateigröße: 5 MB
- **Template-Download Button**: "Muster-CSV herunterladen" — generiert inline:
  ```csv
  name,email,phone
  Max Mustermann,max@example.com,+49 171 1234567
  Erika Musterfrau,erika@example.com,+49 160 9876543
  ```
- Nach Upload: Vorschau der ersten 3 Zeilen als Tabelle
- Header-Validierung: Prüft ob `phone` Header vorhanden (case-insensitive)
- Fehleranzeige wenn Pflicht-Header fehlt

**Step 2: Import-Optionen + Start**
- Kampagne zuordnen: Dropdown (optional, alle Kampagnen im Status `draft`/`active`)
- Duplikat-Strategie: "Bestehende aktualisieren" (default) oder "Überspringen"
- Lead-Anzahl Vorschau: "X Leads werden importiert"
- "Import starten" Button

**Import-Summary (nach Abschluss):**
```
423 Leads importiert
27 bestehende Leads aktualisiert
5 Fehler (3x ungültige Nummer, 2x fehlende Telefonnummer)
```

### 13.6 Call-Log: 1:N Beziehung Lead → Anrufversuche

Die `call_attempts` Tabelle (Abschnitt 2.2) bildet die 1:N Beziehung ab:

```
Lead (id: abc-123)
  ├── CallAttempt #1: 2026-03-01 09:15 | no_answer     | 0s    | --
  ├── CallAttempt #2: 2026-03-02 14:30 | voicemail     | 12s   | 🔊
  ├── CallAttempt #3: 2026-03-04 10:00 | gatekeeper    | 45s   | 🔊
  └── CallAttempt #4: 2026-03-05 11:15 | connected     | 342s  | 🔊 📝
```

**Fetch-Pattern für Call-Log:**
```typescript
// In Lead Detail: Alle Attempts für diesen Lead laden
const { data: attempts } = await supabase
  .from('call_attempts')
  .select('*')
  .eq('lead_id', leadId)
  .order('created_at', { ascending: true });
```

**UI: CallAttemptTimeline** (Abschnitt 8.7 erweitert):
- Vertikale Timeline mit Linie links
- Jeder Eintrag: Datum/Uhrzeit, DispositionBadge, Dauer, Mini-AudioPlayer (wenn recording_url)
- Farbige Dots: grün (connected), grau (no_answer), gelb (voicemail), rot (dnc_request)
- Notizen-Feld pro Attempt (klappbar)

### 13.7 Leads-Seite: Import Button

**Datei:** `dashboard/src/app/(dashboard)/leads/page.tsx` (ANPASSEN)

Neben dem bestehenden CSV-Export Button:
```tsx
<div className="flex gap-2">
  <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>
    <Upload size={14} className="mr-1.5" />
    Import
  </Button>
  <Button size="sm" variant="outline" onClick={handleExport}>
    <Download size={14} className="mr-1.5" />
    Export
  </Button>
</div>
```

---

## 14. Click-to-Call VAPI Integration

### 14.1 Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard (Frontend)                       │
│                                                               │
│  [📞 Call Button] ──→ POST /api/calls/initiate               │
│       │                     │                                 │
│       │                     ▼                                 │
│       │            ┌──────────────────┐                       │
│       │            │ Next.js API Route │                       │
│       │            │ (Server-Side)     │                       │
│       │            └────────┬─────────┘                       │
│       │                     │                                 │
│       │                     ▼                                 │
│       │            ┌──────────────────┐                       │
│       │            │  VAPI Create Call │                       │
│       │            │  POST /call       │                       │
│       │            └────────┬─────────┘                       │
│       │                     │                                 │
│       ▼                     │  call_id zurück                 │
│  [Status: Initiating]       │                                 │
│  [Status: Ringing]          │                                 │
│  [Status: In Progress]      │  ◄── Supabase Realtime          │
│  [Status: Completed]        │       (call_attempts INSERT)     │
│                             │                                 │
│                             ▼                                 │
│            ┌──────────────────────────────┐                   │
│            │  VAPI → n8n Webhook (WF2)     │                  │
│            │  end-of-call-report           │                   │
│            │  → INSERT call_attempts       │                   │
│            │  → UPDATE leads               │                   │
│            └──────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### 14.2 API Route: `POST /api/calls/initiate`

**Datei:** `dashboard/src/app/api/calls/initiate/route.ts` (NEU)

```typescript
import { createClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const { leadId } = await request.json();
  const supabase = createClient();

  // 1. Lead laden (mit allen Kontextdaten)
  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (!lead) return Response.json({ error: 'Lead nicht gefunden' }, { status: 404 });
  if (!lead.phone) return Response.json({ error: 'Keine Telefonnummer' }, { status: 400 });
  if (lead.is_dnc) return Response.json({ error: 'Lead ist auf DNC-Liste' }, { status: 403 });

  // 2. Kampagnen-Kontext laden (falls zugeordnet)
  let campaignContext = '';
  let firstMessageOverride = null;
  if (lead.campaign_id) {
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('name, first_message_override, system_prompt_override')
      .eq('id', lead.campaign_id)
      .single();
    if (campaign) {
      campaignContext = campaign.name;
      firstMessageOverride = campaign.first_message_override;
    }
  }

  // 3. VAPI Create Call
  const vapiResponse = await fetch('https://api.vapi.ai/call', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VAPI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      assistantId: process.env.VAPI_ASSISTANT_ID,
      assistantOverrides: {
        firstMessage: firstMessageOverride ?? undefined,
        variableValues: {
          lead_name: lead.caller_name || 'dort',
          company_name: lead.company || '',
          pain_point: lead.pain_point || '',
          current_stack: lead.current_stack || '',
          campaign_context: campaignContext,
          call_reason: lead.follow_up_reason || 'Erstanruf',
        },
      },
      customer: {
        number: lead.phone,
      },
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
    }),
  });

  if (!vapiResponse.ok) {
    const error = await vapiResponse.text();
    return Response.json({ error: `VAPI Fehler: ${error}` }, { status: 502 });
  }

  const vapiCall = await vapiResponse.json();

  // 4. Lead sofort updaten (Optimistic Update)
  await supabase
    .from('leads')
    .update({
      call_id: vapiCall.id,
      last_call_attempt_at: new Date().toISOString(),
      status: 'attempting',
      call_direction: 'outbound',
    })
    .eq('id', leadId);

  // 5. Neuen Call-Attempt vorab erstellen (Status: initiating)
  await supabase
    .from('call_attempts')
    .insert({
      lead_id: leadId,
      campaign_id: lead.campaign_id,
      call_id: vapiCall.id,
      attempt_number: (lead.call_attempts || 0) + 1,
      disposition_code: 'technical_error',  // Default, wird vom Webhook überschrieben
      direction: 'outbound',
    });

  return Response.json({
    callId: vapiCall.id,
    status: 'initiating',
  });
}
```

### 14.3 VAPI Payload: Dynamische Variablen

Der Schlüssel zur personalisierten Ansprache ist `assistantOverrides.variableValues`. Diese Variablen werden im System Prompt via `{{variable_name}}` referenziert:

```markdown
<!-- Im System Prompt (config/system-prompt.md) ergänzen: -->
## Outbound-Kontext (wenn vorhanden)
Wenn du den Lead anrufst, nutze folgende Informationen:
- Name des Leads: {{lead_name}}
- Firma: {{company_name}}
- Bekanntes Problem: {{pain_point}}
- Aktueller Tech-Stack: {{current_stack}}
- Grund des Anrufs: {{call_reason}}

Beginne das Gespräch mit einer personalisierten Begrüßung:
"Hallo {{lead_name}}, hier ist Lisa von n8n. [DSGVO-Hinweis]. Ich rufe an, weil..."
```

### 14.4 Webhook-Receiver: Call Status Updates

Der bestehende **n8n Workflow 2 (Post-Call Processing)** empfängt bereits VAPI end-of-call Webhooks. Für Click-to-Call werden folgende Anpassungen benötigt:

**Erweiterter Post-Call Flow:**
1. VAPI sendet `end-of-call-report` an `/webhook/vapi-end-of-call`
2. WF2 extrahiert: `call_id`, `transcript`, `duration`, `endedReason`, `recording_url` (NEU!)
3. GPT-Scoring + Disposition-Inferenz (wie in Abschnitt 7.2)
4. **UPDATE `call_attempts`** WHERE `call_id` = vapi_call_id:
   - `disposition_code`: Inferierter Disposition Code
   - `duration_seconds`: Gesprächsdauer
   - `recording_url`: VAPI Recording URL
   - `ended_reason`: VAPI endedReason
5. **UPDATE `leads`**: Scores, Transcript, Disposition, Status, Recording URL
6. **Smart Cadence berechnen** (siehe Abschnitt 15): `next_call_scheduled_at` + `follow_up_reason`

**Recording URL:** VAPI stellt nach Gesprächsende eine `recordingUrl` im end-of-call-report bereit. Diese wird sowohl in `call_attempts.recording_url` als auch in `leads.recording_url` (letzter Anruf) gespeichert.

### 14.5 Frontend: Call-Button Komponente

**Datei:** `dashboard/src/components/ui/CallButton.tsx` (NEU)

```typescript
interface CallButtonProps {
  lead: Lead;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'full';  // icon = nur Icon, full = Icon + Text
  onCallStarted?: (callId: string) => void;
}
```

**Verhalten:**
1. **Idle**: Grüner Telefon-Button (PhoneOutgoing Icon)
2. **Klick**: Bestätigungsdialog "Lead Name anrufen?" mit Telefonnummer
3. **Initiating**: Button wird zu Spinner, grauer Hintergrund
4. **Ringing**: Pulsierendes Telefon-Icon, gelber Hintergrund
5. **In Progress**: Roter "Active Call" Badge mit Dauer-Timer
6. **Completed**: Kurz grüner Checkmark, dann zurück zu Idle

**Deaktiviert wenn:**
- `lead.is_dnc === true` (Tooltip: "Lead ist auf DNC-Liste")
- `lead.phone` ist null/leer (Tooltip: "Keine Telefonnummer")
- Bereits ein Anruf aktiv (global, nur ein Call gleichzeitig in Demo)

**Platzierung:**
- `EnhancedLeadTable.tsx`: Neue erste Spalte mit `CallButton variant="icon" size="sm"`
- `LeadDetailHeader.tsx`: Prominenter `CallButton variant="full" size="lg"` neben dem Lead-Namen
- `PipelineCard.tsx`: Kleines Telefon-Icon oben rechts auf der Karte

### 14.6 Frontend: `CallStatusBadge` Komponente

**Datei:** `dashboard/src/components/ui/CallStatusBadge.tsx` (NEU)

```typescript
type CallStatus = 'idle' | 'initiating' | 'ringing' | 'in_progress' | 'completed' | 'failed';

interface CallStatusBadgeProps {
  status: CallStatus;
  duration?: number;  // Sekunden (nur bei in_progress)
}
```

| Status | Visuell | Animation |
|--------|---------|-----------|
| `idle` | Nicht angezeigt | -- |
| `initiating` | 🔄 "Verbinde..." grau | Spinner |
| `ringing` | 📞 "Klingelt..." gelb | Pulse |
| `in_progress` | 🔴 "Aktiv 0:42" rot | Timer zählt hoch |
| `completed` | ✅ "Beendet" grün | 3s sichtbar, dann fade |
| `failed` | ❌ "Fehler" rot | 5s sichtbar |

### 14.7 Frontend: `ActiveCallBanner` Komponente

**Datei:** `dashboard/src/components/dashboard/ActiveCallBanner.tsx` (NEU)

Ein sticky Banner am oberen Rand des Dashboards, das während eines aktiven Anrufs angezeigt wird:

```tsx
<div className="sticky top-0 z-50 bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
    <span className="text-sm font-medium">
      Aktiver Anruf: {lead.caller_name} ({lead.company})
    </span>
    <span className="text-xs text-muted-foreground">
      {formatDuration(elapsedSeconds)}
    </span>
  </div>
  <Button size="sm" variant="ghost" onClick={navigateToLead}>
    Zum Lead →
  </Button>
</div>
```

**Sichtbarkeit:** Nur wenn ein Anruf `status === 'in_progress'` ist. Verschwindet automatisch nach Anrufende. Wird über einen globalen `ActiveCallProvider` Context gesteuert.

### 14.8 Realtime-Updates via Supabase

Da `call_attempts` bereits Realtime aktiviert hat (Abschnitt 2.2), kann das Dashboard Änderungen sofort reflektieren:

```typescript
// In ActiveCallProvider oder leads-context.tsx
useEffect(() => {
  const channel = supabase
    .channel('active-call')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'call_attempts',
      filter: `call_id=eq.${activeCallId}`,
    }, (payload) => {
      // Update call status when n8n webhook writes disposition
      if (payload.new.disposition_code !== 'technical_error') {
        setCallStatus('completed');
        // Refresh lead data
      }
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [activeCallId]);
```

### 14.9 Umgebungsvariablen (neue)

```env
# dashboard/.env.local (ergänzen)
VAPI_API_KEY=<vapi-api-key-aus-agent-state>
VAPI_ASSISTANT_ID=93b37b58-8912-4b27-9112-34146f3836de
VAPI_PHONE_NUMBER_ID=b30a9e5e-9dc0-430b-a8b0-8dd8207f62da
```

---

## 15. Smart Follow-Up Cadence Engine

### 15.1 Kernprinzip

> **DEMO-RESTRIKTION:** In der aktuellen Demo-Phase gibt es **keinen automatischen Cron-Job**, der Anrufe ausführt. Die Smart Cadence Engine **berechnet Empfehlungen** und setzt `next_call_scheduled_at`. Der eigentliche Anruf erfolgt **ausschließlich manuell** über den Click-to-Call Button (Abschnitt 14).

Die Cadence Engine ersetzt die statischen Intervalle (Abschnitt 5.2) durch intelligente, disposition-basierte Scheduling-Regeln, die auf Verkaufspsychologie basieren.

### 15.2 Neues Feld auf `leads`: `follow_up_reason`

```sql
ALTER TABLE leads ADD COLUMN IF NOT EXISTS follow_up_reason TEXT;
```

Dieses Feld speichert die menschenlesbare Begründung für den nächsten geplanten Anruf, z.B.:
- "Vormittags nicht erreicht — Nachmittag versuchen"
- "War im Meeting — in 4h erneut versuchen"
- "Infomaterial gewünscht — in 7 Tagen nachfassen"
- "Mailbox — 2 Tage warten, andere Tageszeit"

### 15.3 Disposition-basierte Scheduling-Regeln

Die Cadence Engine wird als **Code-Node im n8n Post-Call Workflow (WF2)** implementiert und läuft nach der Disposition-Inferenz:

| Disposition | Tageszeit des Anrufs | Nächster Versuch | `follow_up_reason` |
|-------------|---------------------|-----------------|-------------------|
| `no_answer` | Vormittag (vor 12:00) | **Nächster Werktag, 14:00-16:00** | "Vormittags nicht erreicht — Nachmittag versuchen" |
| `no_answer` | Nachmittag (ab 12:00) | **Nächster Werktag, 09:00-11:00** | "Nachmittags nicht erreicht — Vormittag versuchen" |
| `voicemail` | Egal | **In 2 Werktagen, andere Tageszeit** | "Mailbox erreicht — in 2 Tagen erneut versuchen" |
| `busy` | Egal | **In 2 Stunden** (innerhalb Calling Window) | "Leitung besetzt — in 2h erneut versuchen" |
| `gatekeeper` | Egal | **Nächster Werktag, 08:30** (vor Gatekeeper-Dienstbeginn) | "Gatekeeper — früh morgens versuchen" |
| `callback` | -- | **Exaktes callback_datetime** | "Rückruf vereinbart für [Datum/Zeit]" |
| `not_interested` | -- | **Kein Retry** (Terminal) | -- |
| `dnc_request` | -- | **Kein Retry** (Terminal + DNC) | -- |
| `demo_booked` | -- | **Kein Retry** (Erfolg) | -- |
| `qualified` | -- | **In 1 Werktag** (Follow-up nötig) | "Qualifiziert — Follow-up für Demo-Buchung" |
| `connected` (kein Demo) | -- | **In 3 Werktagen** | "Gespräch geführt — in 3 Tagen nachfassen" |
| `wrong_number` | -- | **Kein Retry** (Terminal) | -- |
| `technical_error` | -- | **In 30 Minuten** | "Technischer Fehler — zeitnah erneut versuchen" |

### 15.4 Implementierung: n8n Code-Node

```javascript
// Code-Node: "Smart Cadence berechnen"
// Wird nach Disposition-Inferenz in WF2 ausgeführt

const disposition = $json.disposition_code;
const callHour = new Date($json.call_started_at).getHours();
const now = new Date();

let nextCall = null;
let reason = null;

function nextWorkday(date, hour, minute = 0) {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  // Nächsten Werktag finden (Mo-Fr)
  do { d.setDate(d.getDate() + 1); }
  while (d.getDay() === 0 || d.getDay() === 6);
  return d.toISOString();
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 3600000).toISOString();
}

switch (disposition) {
  case 'no_answer':
    if (callHour < 12) {
      nextCall = nextWorkday(now, 14 + Math.floor(Math.random() * 2)); // 14-16h
      reason = 'Vormittags nicht erreicht — Nachmittag versuchen';
    } else {
      nextCall = nextWorkday(now, 9 + Math.floor(Math.random() * 2)); // 9-11h
      reason = 'Nachmittags nicht erreicht — Vormittag versuchen';
    }
    break;

  case 'voicemail':
    const vm = new Date(now);
    vm.setDate(vm.getDate() + 2);
    while (vm.getDay() === 0 || vm.getDay() === 6) vm.setDate(vm.getDate() + 1);
    vm.setHours(callHour < 12 ? 15 : 10, 0, 0, 0); // Andere Tageszeit
    nextCall = vm.toISOString();
    reason = 'Mailbox erreicht — in 2 Tagen erneut versuchen';
    break;

  case 'busy':
    nextCall = addHours(now, 2);
    reason = 'Leitung besetzt — in 2h erneut versuchen';
    break;

  case 'gatekeeper':
    nextCall = nextWorkday(now, 8, 30);
    reason = 'Gatekeeper — früh morgens versuchen';
    break;

  case 'callback':
    nextCall = $json.callback_datetime;
    reason = `Rückruf vereinbart für ${formatGerman($json.callback_datetime)}`;
    break;

  case 'qualified':
    nextCall = nextWorkday(now, 10);
    reason = 'Qualifiziert — Follow-up für Demo-Buchung';
    break;

  case 'connected':
    const cu = new Date(now);
    cu.setDate(cu.getDate() + 3);
    while (cu.getDay() === 0 || cu.getDay() === 6) cu.setDate(cu.getDate() + 1);
    cu.setHours(10, 0, 0, 0);
    nextCall = cu.toISOString();
    reason = 'Gespräch geführt — in 3 Tagen nachfassen';
    break;

  case 'technical_error':
    nextCall = addHours(now, 0.5);
    reason = 'Technischer Fehler — zeitnah erneut versuchen';
    break;

  // Terminal: not_interested, dnc_request, demo_booked, wrong_number
  default:
    nextCall = null;
    reason = null;
}

// Max Attempts Check
const maxAttempts = $json.campaign_max_attempts || 5;
if ($json.call_attempts >= maxAttempts) {
  nextCall = null;
  reason = null;
  // Status wird in nächstem Node auf 'exhausted' gesetzt
}

return [{
  json: {
    ...$json,
    next_call_scheduled_at: nextCall,
    follow_up_reason: reason,
  }
}];
```

### 15.5 UI: "Heute anrufen" Liste (Dashboard)

**Datei:** `dashboard/src/components/dashboard/ToCallTodayList.tsx` (NEU)

Eine prominente Liste auf der Dashboard-Startseite, die alle fälligen Leads zeigt:

```typescript
interface ToCallTodayListProps {
  leads: Lead[];  // Gefiltert: next_call_scheduled_at <= now() UND !is_dnc
}
```

**Platzierung:** Auf der Dashboard-Startseite (`page.tsx`), als neue Sektion zwischen den KPI-Karten und dem ConversionChart. Volle Breite.

**Spalten:**
| Spalte | Inhalt |
|--------|--------|
| Priorität | ⬆️ Hoch / ➡️ Normal (basierend auf lead_grade) |
| Name / Firma | `caller_name` + `company` |
| Kampagne | Campaign Name Badge |
| Fällig seit | Relative Zeit ("vor 2h", "seit gestern") |
| Grund | `follow_up_reason` Text |
| Versuche | `call_attempts` Counter |
| Aktion | `CallButton` (Click-to-Call) |

**Sortierung:** A-Leads zuerst, dann nach Fälligkeit (älteste zuerst).

**Query:**
```sql
SELECT * FROM leads
WHERE next_call_scheduled_at <= now()
  AND is_dnc = false
  AND status NOT IN ('converted', 'lost', 'dnc', 'exhausted', 'demo_booked')
  AND call_direction = 'outbound'
ORDER BY
  CASE lead_grade WHEN 'A' THEN 1 WHEN 'B' THEN 2 ELSE 3 END,
  next_call_scheduled_at ASC;
```

### 15.6 UI: Cadence Timeline (Lead Detail)

**Datei:** `dashboard/src/components/lead-detail/CadenceTimeline.tsx` (NEU)

Eine visuelle Timeline in der Lead-Detailansicht, die vergangene Versuche UND den nächsten geplanten Anruf zeigt:

```
──●── 01.03. 09:15  Keine Antwort          (Versuch 1)
  │   "Vormittags nicht erreicht"
  │
──●── 02.03. 14:30  Mailbox               (Versuch 2)
  │   "Mailbox erreicht"
  │
──●── 04.03. 10:00  Gatekeeper            (Versuch 3)
  │   "Gatekeeper — früh morgens versuchen"
  │
──◐── 05.03. 08:30  Geplant               (Versuch 4)
  │   "Gatekeeper — früh morgens versuchen"
  │   [📞 Jetzt anrufen]
```

- Vergangene Versuche: Ausgefüllte Dots (●), farbig nach Disposition
- Geplanter nächster Versuch: Halbgefüllter Dot (◐), gestrichelte Linie
- "Jetzt anrufen" Button direkt in der Timeline
- `follow_up_reason` als Beschreibungstext unter jedem Eintrag

### 15.7 Architektur-Klarstellung: Kein Auto-Dialing

```
┌──────────────────────────────────────────────────────────┐
│                    DEMO-PHASE ARCHITEKTUR                  │
│                                                            │
│  n8n WF2 (Post-Call)                                       │
│    └─→ Smart Cadence berechnen                             │
│         └─→ UPDATE leads SET                               │
│              next_call_scheduled_at = '2026-03-05 08:30'   │
│              follow_up_reason = 'Gatekeeper — früh...'     │
│                                                            │
│  Dashboard                                                 │
│    └─→ "Heute anrufen" Liste                               │
│         └─→ Zeigt fällige Leads                            │
│              └─→ [📞 Call] Button                           │
│                   └─→ POST /api/calls/initiate (manuell!)  │
│                                                            │
│  ❌ KEIN Cron-Job der automatisch anruft                   │
│  ❌ KEIN Auto-Dialer / Power-Dialer                        │
│  ✅ Empfehlungen + manuelle Ausführung                     │
└──────────────────────────────────────────────────────────┘
```

---

## Anhang: Kritische Dateien für die Implementierung

| Datei | Rolle | Änderungstyp |
|-------|-------|-------------|
| **Datenbank** | | |
| `supabase/migrations/003_outbound_transformation.sql` | DB-Schema (campaigns, call_attempts, dnc_list, leads-Erweiterung) | NEU |
| **TypeScript Types & State** | | |
| `dashboard/src/lib/types.ts` | Datenvertrag (Lead, Campaign, CallAttempt, DispositionCode) | ERWEITERN |
| `dashboard/src/lib/leads-context.tsx` | State Management (neue Felder, Filter, Realtime) | ERWEITERN |
| `dashboard/src/lib/campaigns-context.tsx` | Campaign State (Fetch, CRUD, Realtime) | NEU |
| **API Routes** | | |
| `dashboard/src/app/api/calls/initiate/route.ts` | Click-to-Call VAPI Integration | NEU |
| `dashboard/src/app/api/leads/import/route.ts` | CSV-Upload & Lead-Ingestion | NEU |
| **Seiten** | | |
| `dashboard/src/app/(dashboard)/page.tsx` | Dashboard Home (KPIs, ToCallTodayList, Charts) | ANPASSEN |
| `dashboard/src/app/(dashboard)/campaigns/page.tsx` | Kampagnen-Übersicht | NEU |
| `dashboard/src/app/(dashboard)/campaigns/[id]/page.tsx` | Kampagnen-Detail | NEU |
| `dashboard/src/app/(dashboard)/dnc/page.tsx` | DNC-Liste | NEU |
| `dashboard/src/app/(dashboard)/leads/[id]/page.tsx` | Lead Detail (Call-Log, CadenceTimeline, CallButton) | ANPASSEN |
| **Komponenten** | | |
| `dashboard/src/components/Sidebar.tsx` | Navigation (OUTBOUND Sektion) | ANPASSEN |
| `dashboard/src/components/KPICards.tsx` | 6 Outbound-KPIs | ANPASSEN |
| `dashboard/src/components/pipeline/PipelineBoard.tsx` | 11-Spalten Kanban | ANPASSEN |
| `dashboard/src/components/ui/CallButton.tsx` | Click-to-Call Button | NEU |
| `dashboard/src/components/ui/CallStatusBadge.tsx` | Live Call Status | NEU |
| `dashboard/src/components/dashboard/ToCallTodayList.tsx` | "Heute anrufen" Liste | NEU |
| `dashboard/src/components/dashboard/ActiveCallBanner.tsx` | Sticky Anruf-Banner | NEU |
| `dashboard/src/components/lead-detail/CallAttemptTimeline.tsx` | Call Log (1:N Attempts) | NEU |
| `dashboard/src/components/lead-detail/CadenceTimeline.tsx` | Smart Cadence Visualisierung | NEU |
| `dashboard/src/components/leads/ImportLeadsDialog.tsx` | CSV-Import Wizard | NEU |
| **n8n Workflows** | | |
| `n8n-workflows/post-call-processing.json` | Post-Call WF (+ Disposition, + Engagement, + Smart Cadence) | ANPASSEN |
| **Voice Agent** | | |
| `config/system-prompt.md` | Lisa Prompt (+ Outbound-Variablen, + KI-Disclosure) | ANPASSEN |
