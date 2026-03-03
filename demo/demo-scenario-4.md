# Demo-Call Szenario 4 – Sofortige Ablehnung (DSGVO-Aufzeichnung)

## Edge Case
Testet: Anruferin hört den **Aufzeichnungshinweis** in Lisas Begrüßung und bricht sofort ab. Lisa muss das Gespräch **sofort höflich beenden**. Minimales Transcript, fast keine Daten. Post-Call Scoring mit Fallback.

## Persona
- **Name:** Dr. Petra Hoffmann
- **Alter:** 52
- **Rolle:** Datenschutzbeauftragte
- **Firma:** Unbekannt (wird nicht genannt)
- **Situation:** Ruft bei n8n an, um sich über Automation zu informieren. Ist aber sofort vom Aufzeichnungshinweis in der Begrüßung abgeschreckt und will das Gespräch nicht fortführen.

## Deine exakten Sätze als Petra

### Phase 1: Begrüßung + Sofortige Ablehnung (Schritt 1 – Opening)

> Du rufst bei n8n an. Lisa nimmt ab und spielt ihre Begrüßung.

**Lisa:** "Hallo, hier ist Lisa von n8n, schönen guten Tag! Kurzer Hinweis vorab: Dieses Gespräch wird zur Qualitätssicherung aufgezeichnet. Was kann ich für Sie tun?"

**Petra:** "Moment, das wird aufgezeichnet? Nein, das möchte ich nicht. Dann lassen wir das lieber."

> Lisa sollte die Ablehnung sofort respektieren und sich höflich verabschieden. Kein Überreden, kein Einwandbehandlungsversuch.

**Petra:** "Auf Wiederhören."

---

## Erwartetes Ergebnis
- **Lead-Score:** Kein vollständiges Scoring möglich
- **Termin:** Nicht gebucht
- **Call-Dauer:** ~15-30 Sekunden
- **Transcript:** Minimal (2-3 Sätze)
- **Status:** contacted
- **Sentiment:** Neutral bis negativ
- **Keine Tools aufgerufen:** Weder `check_availability`, `book_appointment` noch `save_lead_info` (es gibt keine verwertbaren Daten — weder Name noch Firma bekannt)

## Was dieser Test prüft
- [ ] Lisa respektiert die Ablehnung sofort (kein Überreden, kein Einwand!)
- [ ] Lisa beendet das Gespräch höflich und ohne Druck
- [ ] Kein Tool-Call wird ausgeführt (kein save_lead_info — es gibt keine Daten)
- [ ] Post-Call Webhook verarbeitet das minimale Transcript ohne Crash
- [ ] Fallback-Scoring greift (alle Scores auf 1, Status "contacted")
- [ ] Kein Error im n8n Workflow trotz fehlender Daten
- [ ] Call wird korrekt in der leads-Tabelle angelegt (nur call_id + Transcript)

## Tipps für die Aufnahme
- Bestimmt und klar sprechen – Petra ist Datenschützerin, sie weiß was sie will
- Nicht unfreundlich, aber sachlich und direkt
- Sofort nach "aufgezeichnet" reagieren, keine Denkpause
- Sehr kurzer Call — nach 2 Sätzen ist Schluss
