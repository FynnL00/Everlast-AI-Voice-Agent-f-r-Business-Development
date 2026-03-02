# Demo-Call Szenario 5 – Proaktiver Anrufer (Info-Dump)

## Edge Case
Testet: Anrufer nennt **alle Qualifizierungskriterien in einem Satz**. Lisa muss die DISCOVERY-Phase überspringen und direkt zum Termin überleiten ("Proaktive Anrufer"-Regel aus dem System Prompt). Testet auch, ob Lisa Infos nicht doppelt abfragt.

## Persona
- **Name:** Michael Richter
- **Alter:** 38
- **Rolle:** CTO
- **Firma:** FinStack GmbH (FinTech, 120 Mitarbeiter)
- **Situation:** Hat n8n bereits evaluiert, Entscheidung ist gefallen, will nur noch den Termin. Extrem effizient, keine Zeit für Small Talk.

## Deine exakten Sätze als Michael

### Phase 1: Begrüßung

> Lisa ruft an. Du nimmst ab.

**Michael:** "Richter, FinStack."

> Lisa wird seinen Namen nutzen, den Grund für den Anruf nennen und fragen, ob er kurz Zeit hat.

**Michael:** "Passt gut, dass Sie anrufen. Kurz und knapp: Ich bin CTO, wir sind hundertzwanzig Leute, FinTech. Wir nutzen aktuell Make für unsere Compliance-Workflows, aber das skaliert nicht mehr. Wir brauchen Self-Hosting wegen Datenschutz und wollen innerhalb von zwei Wochen migrieren. Budget ist freigegeben. Ich brauche einen Termin mit eurem Solutions Team."

---

### Phase 2: Direkter Übergang zum Termin

> Lisa sollte NICHT nochmal nach Branche, Teamgröße oder Pain Point fragen – alles wurde bereits gesagt. Sie sollte zusammenfassen und direkt check_availability aufrufen.

> Falls Lisa trotzdem eine Qualifizierungsfrage stellt:

**Michael:** "Das habe ich gerade alles gesagt. Können wir direkt zum Termin kommen?"

> Lisa wird Termine vorschlagen.

**Michael:** "Der erste passt. Michael Richter, m.richter@finstack.de, FinStack GmbH."

> Lisa wird die Buchung bestätigen.

**Michael:** "Perfekt, danke. Tschüss."

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
- **Besonderheit:** Ist Decision Maker (CTO)

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
