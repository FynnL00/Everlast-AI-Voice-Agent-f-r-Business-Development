# n8n Workflows

Dieses Verzeichnis enthält die exportierten n8n-Workflows für den Voice Agent.

## Workflows

### 1. Tool-Call Handler (`tool-call-handler.json`)
- **Trigger:** Vapi Server-URL Webhook
- **Funktion:** Empfängt Tool-Calls vom Voice Agent (check_availability, book_appointment)
- **Routing:** Switch-Node basierend auf Function-Name
- **Output:** Synchrone Antwort an Vapi

### 2. Post-Call Processing (`post-call-processing.json`)
- **Trigger:** Vapi end-of-call-report Webhook
- **Funktion:** Verarbeitet abgeschlossene Calls
- **Schritte:**
  1. Transcript parsen & Zusammenfassung via GPT-4o
  2. Lead-Score berechnen (Code-Node)
  3. Lead-Daten in Supabase speichern
  4. Bestätigungs-E-Mail senden
  5. Slack-Notification

## Import
1. In n8n: Settings → Import Workflow
2. JSON-Datei auswählen
3. Webhook-URLs und API-Keys konfigurieren
