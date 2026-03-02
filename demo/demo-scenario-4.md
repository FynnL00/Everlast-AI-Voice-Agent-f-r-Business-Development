# Demo-Call Szenario 4 – DSGVO-Ablehnung

## Edge Case
Testet: Gesprächspartner lehnt den Anruf sofort ab. Lisa muss das Gespräch **sofort höflich beenden**. Minimales Transcript, fast keine Daten. Post-Call Scoring mit Fallback.

## Persona
- **Name:** Dr. Petra Hoffmann
- **Alter:** 52
- **Rolle:** Datenschutzbeauftragte
- **Firma:** Unbekannt (wird nicht genannt)
- **Situation:** Wird angerufen, hat aber kein Interesse und lehnt sofort ab.

## Deine exakten Sätze als Petra

### Phase 1: Sofortige Ablehnung

> Lisa ruft an. Du nimmst ab.

**Petra:** "Hoffmann, hallo?"

> Lisa wird sich vorstellen und den Grund für den Anruf nennen.

**Petra:** "Nein danke, kein Interesse. Bitte rufen Sie mich nicht mehr an."

> Lisa sollte die Ablehnung sofort respektieren und sich höflich verabschieden.

**Petra:** "Auf Wiederhören."

---

## Erwartetes Ergebnis
- **Lead-Score:** Kein vollständiges Scoring möglich
- **Termin:** Nicht gebucht
- **Call-Dauer:** ~15-30 Sekunden
- **Transcript:** Minimal (2-3 Sätze)
- **Status:** contacted
- **Keine Tools aufgerufen:** Weder `check_availability`, `book_appointment` noch `save_lead_info`

## Was dieser Test prüft
- [ ] Lisa respektiert die Ablehnung sofort (kein Überreden!)
- [ ] Lisa beendet das Gespräch höflich und ohne Druck
- [ ] Kein Tool-Call wird ausgeführt (kein save_lead_info – es gibt keine Daten)
- [ ] Post-Call Webhook verarbeitet das minimal Transcript ohne Crash
- [ ] Fallback-Scoring greift (alle Scores auf 1, status "contacted")
- [ ] Kein Error im n8n Workflow trotz fehlender Daten

## Tipps für die Aufnahme
- Bestimmt und klar sprechen – Petra ist Datenschützerin, sie weiß was sie will
- Nicht unfreundlich, aber sachlich und direkt
- Keine Pause nach der Ablehnung – sofort "Nein" sagen
