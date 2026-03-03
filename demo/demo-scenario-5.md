# Demo-Call Szenario 5 – Proaktiver Anrufer (Info-Dump)

## Edge Case
Testet: Anrufer nennt **alle Qualifizierungskriterien in einem Satz**. Lisa muss die DISCOVERY-Phase überspringen und direkt zum Termin überleiten. Testet auch, ob Lisa Infos nicht doppelt abfragt.

## Persona
- **Name:** Michael Richter
- **Alter:** 38
- **Rolle:** CTO
- **Firma:** FinStack GmbH (FinTech, 120 Mitarbeiter)
- **Situation:** Hat n8n bereits intern evaluiert, Entscheidung ist gefallen. Ruft an, um direkt einen Demo-Termin zu buchen. Extrem effizient, keine Zeit für Small Talk.

## Deine exakten Sätze als Michael

### Phase 1: Begrüßung + Info-Dump (Schritt 1 – Opening)

> Du rufst bei n8n an. Lisa nimmt ab und spielt ihre Begrüßung.

**Lisa:** "Hallo, hier ist Lisa von n8n, schönen guten Tag! Kurzer Hinweis vorab: Dieses Gespräch wird zur Qualitätssicherung aufgezeichnet. Was kann ich für Sie tun?"

**Michael:** "Ja, Richter hier, FinStack GmbH. Gut dass ich direkt jemanden erreiche. Kurz und knapp: Ich bin CTO, wir sind hundertzwanzig Leute, FinTech. Wir nutzen aktuell Make für unsere Compliance-Workflows, aber das skaliert nicht mehr. Wir brauchen Self-Hosting wegen Datenschutz und wollen innerhalb von zwei Wochen migrieren. Budget ist freigegeben. Ich brauche einen Termin mit eurem Solutions Team."

> Lisa sollte erkennen, dass alle Discovery-Felder bereits abgedeckt sind (Name, Firma, Rolle, Teamgröße, Tools, Pain Point, Timeline, Budget) und NICHT nochmal nachfragen. Sie sollte kurz zusammenfassen und direkt zu `check_availability` übergehen.

---

### Phase 2: Direkter Übergang zum Termin (Terminbuchung)

> Falls Lisa trotzdem eine Qualifizierungsfrage stellt:

**Michael:** "Das habe ich gerade alles gesagt. Können wir direkt zum Termin kommen?"

> Lisa sagt "Moment, ich schau mal eben schnell in den Kalender..." `[TOOL: check_availability]`
> Lisa schlägt zwei bis drei Slots vor (deutsche Wörter, kein ISO-String).

**Michael:** "Der erste passt. Michael Richter, m.richter@finstack.de, FinStack GmbH."

> Lisa sagt "Alles klar, Sekunde... ich trag das mal fix ein." `[TOOL: book_appointment]`
> Lisa bestätigt: "Super, das hat geklappt! Also [Tag] um [Uhrzeit], Sie kriegen gleich noch ne Mail mit der Bestätigung."

**Michael:** "Perfekt, danke. Tschüss."

> `[TOOL: save_lead_info — still, nicht angekündigt]`

---

## Erwartetes Ergebnis
- **Lead-Score:** A (12/12)
- **Termin:** Gebucht
- **Call-Dauer:** ~60-90 Sekunden (sehr kurz!)
- **Qualification:**
  - Company Size: 3 (120 MA = Enterprise)
  - Tech Stack: 3 (Make Power-User, sucht Self-Hosting-Alternative)
  - Pain Point: 3 (Konkretes Skalierungsproblem + Datenschutz-Anforderung)
  - Timeline: 3 (Innerhalb 2 Wochen, Budget freigegeben)
- **Einwände:** Keine
- **Sentiment:** Positiv
- **Besonderheit:** Ist Decision Maker (CTO) → `is_decision_maker: true`

## Was dieser Test prüft
- [ ] Lisa erkennt den Info-Dump und überspringt die DISCOVERY-Phase
- [ ] Lisa fragt KEINE bereits beantworteten Fragen nochmal
- [ ] Lisa fasst kurz zusammen und geht direkt zu `check_availability`
- [ ] Lisa fragt Name, E-Mail und Firma in EINER Frage (oder nutzt die bereits genannten Daten)
- [ ] Gesamter Call dauert unter 2 Minuten
- [ ] Post-Call ergibt maximalen Score (12/12, A-Lead)
- [ ] `is_decision_maker` wird als `true` erkannt

## Tipps für die Aufnahme
- Schnell und businesslike sprechen – Michael hat keine Zeit
- Den Info-Dump als einen zusammenhängenden Satz sprechen, keine Pausen
- Ungeduldig klingen falls Lisa doch Fragen stellt
- Beim Termin sofort alle Kontaktdaten in einem Satz nennen
