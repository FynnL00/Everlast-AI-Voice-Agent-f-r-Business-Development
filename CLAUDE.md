# Voice Agent SaaS - Projekt-Kontext

## Ueberblick

Inbound Voice Agent "Lisa" (SDR bei n8n) (Voice-ID:NkMe1eztMQReztnhYfeX) fuer die Everlast AI Vibe Coding Challenge.
Lisa nimmt Anrufe entgegen, qualifiziert Leads (A/B/C Scoring), bucht Demo-Termine
via Cal.com und speichert alles in Supabase. Ein Next.js Dashboard zeigt Live-KPIs.

## Tech-Stack

| Komponente | Tool | Zugriff |
|------------|------|---------|
| Voice-Plattform | Vapi | MCP (`vapi`) |
| LLM | GPT-5-mini via OpenRouter | via Vapi |
| STT | Deepgram Nova-3 | via Vapi |
| TTS | ElevenLabs | via Vapi |
| Orchestrierung | n8n (self-hosted) | MCP (`n8n-mcp`) |
| Datenbank | Supabase (PostgreSQL) | MCP (`supabase`) |
| Kalender | Cal.com | REST API (Key in .agent-state.json) |
| Dashboard | Next.js 15 + shadcn/ui + Recharts | Lokaler Code unter `dashboard/` |

## Projekt-Struktur

```
config/
  agent-config.json          # Vapi Agent-Konfiguration (Voice, LLM, STT, Scoring)
  system-prompt.md           # System Prompt fuer Lisa
  knowledge-base.txt         # n8n Produktwissen
  qualification-criteria.json # Lead-Scoring Regeln mit Keyword-Indikatoren
n8n-workflows/               # n8n Workflow JSON-Exports (muessen erstellt werden)
dashboard/                   # Next.js Dashboard (bereits gebaut, muss deployed werden)
  src/lib/types.ts           # Kanonisches Lead-Interface (Datenvertrag!)
  src/components/            # KPICards, LeadTable, ConversionChart, etc.
supabase/
  migrations/001_initial_schema.sql  # DB-Schema (bereits ausgefuehrt)
  migrations/002_improvements.sql    # RLS-Fix, lead_grade Trigger, neue Felder (bereits ausgefuehrt)
demo/
  demo-scenario.md           # Thomas Weber Demo-Szenario
```

## Shared State: `.agent-state.json`

Alle Teammates lesen und schreiben Credentials und Status in `.agent-state.json`.
Bevor du eine Credential brauchst, lies diese Datei. Nachdem du eine Credential
produziert hast, schreibe sie dort hinein.

## MCP-Server

Drei MCP-Server sind konfiguriert (`.mcp.json`) und stehen allen Teammates zur Verfuegung:

- **`n8n-mcp`**: Workflow-Nodes dokumentieren (`get_node`), Templates suchen (`search_templates`, `get_template`), Workflows validieren (`validate_workflow`). n8n API Zugriff zum Erstellen/Aktivieren/Testen von Workflows.
- **`vapi`**: Assistenten erstellen, Telefonnummern verwalten, Calls starten/stoppen.
- **`supabase`**: SQL ausfuehren, Tabellen verwalten, Migrationen anwenden.

## Daten-Vertraege

### Vapi <-> n8n Wire-Format (Tool-Calls)

Vapi sendet Tool-Call Requests an n8n Webhooks:
```json
{
  "message": {
    "type": "tool-calls",
    "call": { "id": "call-uuid" },
    "toolCallList": [{
      "id": "toolcall-uuid",
      "type": "function",
      "function": {
        "name": "check_availability",
        "arguments": { "date_range": "2026-03-03/2026-03-07" }
      }
    }]
  }
}
```

n8n antwortet synchron:
```json
{
  "results": [{
    "toolCallId": "toolcall-uuid",
    "result": "Ich habe folgende Termine verfuegbar: Mittwoch 14 Uhr, Donnerstag 10 Uhr"
  }]
}
```

### Lead-Datenformat (Supabase Schema = Dashboard Types)

Das kanonische Lead-Interface ist definiert in `dashboard/src/lib/types.ts`.
Das Supabase-Schema in `supabase/migrations/001_initial_schema.sql` matched dieses Interface.
Alle Workflows die Leads schreiben MUESSEN dieses Format einhalten.

## n8n Workflow-Anforderungen

### Daten-Ownership (wer schreibt was in leads-Tabelle)

| Feld | Geschrieben von | Methode |
|------|-----------------|---------|
| caller_name, company, email, phone | save_lead_info (WF1) | UPSERT (ON CONFLICT call_id) |
| company_size, current_stack, pain_point, timeline | save_lead_info (WF1) | UPSERT |
| appointment_booked, appointment_datetime, cal_booking_id | book_appointment (WF1) | UPDATE WHERE call_id |
| score_*, transcript, conversation_summary, sentiment | Post-Call (WF2) | UPSERT |
| objections_raised, drop_off_point, status, call_duration_seconds | Post-Call (WF2) | UPSERT |
| lead_grade | Auto-computed by DB Trigger | Nicht manuell setzen! |

### Pflicht-Patterns fuer alle Workflows

1. **UPSERT statt INSERT**: Alle Writes MUESSEN `ON CONFLICT (call_id) DO UPDATE` nutzen fuer Idempotenz
2. **Error-Handling**: Jeder Webhook-Pfad muss einen Error-Fallback haben der Respond-to-Webhook IMMER erreicht
3. **Webhook-Auth**: Alle Webhooks MUESSEN Header Authentication nutzen (`X-Webhook-Secret`)
4. **Input-Validation**: Code-Node vor Supabase-Write der Payload-Felder validiert (Typ, Laenge, keine Injections)
5. **Cal.com Error-Handling**: Bei 400/409 (Slot vergeben) Fallback-Text an Vapi zurueckgeben statt Crash

### Post-Call Scoring

Lead-Scoring im Post-Call Workflow soll GPT-5-mini via OpenRouter nutzen (nicht Keyword-Matching).
HTTP Request an OpenRouter mit `response_format: { type: "json_object" }`.
Prompt: "Analysiere dieses Transkript und bewerte den Lead nach 4 Kriterien (company_size, tech_stack, pain_point, timeline), je 1-3 Punkte. Antworte als JSON."
Die qualification-criteria.json dient als Referenz fuer die Scoring-Beschreibungen.

## Wichtige Regeln

- **Deutsche Umlaute korrekt schreiben**: Alle deutschen Texte im Code (UI-Labels, Platzhalter, aria-labels, Tooltips) MUESSEN echte Umlaute verwenden: ä, ö, ü, ß. NIEMALS ASCII-Ersetzungen wie "ae", "oe", "ue", "ss" in sichtbaren Texten nutzen. Beispiele: "Übersicht" (nicht "Uebersicht"), "Größe" (nicht "Groesse"), "zurück" (nicht "zurueck"), "Gespräch" (nicht "Gespraech"), "ändern" (nicht "aendern"), "verfügbar" (nicht "verfuegbar"), "hinzufügen" (nicht "hinzufuegen"), "schließen" (nicht "schliessen"), "maßgeschneidert" (nicht "massgeschneidert").
- Bestehende Dashboard-Komponenten NICHT umschreiben - sie funktionieren
- Webhooks MUESSEN `responseMode: "responseNode"` nutzen (fuer synchrone Vapi-Antworten)
- Alle Texte die Lisa spricht sind auf Deutsch
- Separate Webhooks pro Tool-Call (nicht ein einzelner Switch-Webhook)
- Lead-Scoring: A (10-12), B (7-9), C (4-6) Punkte – lead_grade wird automatisch per DB-Trigger berechnet
- BEIDE Supabase-Migrationen (001 + 002) muessen ausgefuehrt werden
- First Message enthaelt DSGVO-Hinweis zur Aufzeichnung
