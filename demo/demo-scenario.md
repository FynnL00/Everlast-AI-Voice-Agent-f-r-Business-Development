# Demo-Call Szenario 1 – A-Lead (Full Happy Path)

## Persona
- **Name:** Thomas Weber
- **Alter:** 42
- **Rolle:** Operations Manager
- **Firma:** WebShop Solutions GmbH (E-Commerce, 80 Mitarbeiter)
- **Situation:** Nutzt aktuell Zapier, stößt an Limits, hat von einem Geschäftspartner von n8n gehört. Ruft an, um sich zu informieren.

## Deine exakten Sätze als Thomas

### Phase 1: Begrüßung (Schritt 1 – Opening)

> Du rufst bei n8n an. Lisa nimmt ab und spielt ihre Begrüßung.

**Lisa:** "Hallo, hier ist Lisa von n8n, schönen guten Tag! Kurzer Hinweis vorab: Dieses Gespräch wird zur Qualitätssicherung aufgezeichnet. Was kann ich für Sie tun?"

**Thomas:** "Ja, hallo! Weber hier, WebShop Solutions. Ich hab von einem Geschäftspartner von n8n gehört und wollte mich mal erkundigen, was ihr da so macht."

> Lisa kennt jetzt Name (Weber) und Firma (WebShop Solutions). Sie wird neugierig nachfragen, was sein Interesse geweckt hat.

---

### Phase 2: Bedarfsermittlung (Schritt 2 – Discovery)

> Lisa wird nach dem konkreten Problem fragen.

**Thomas:** "Unser größtes Problem: Wir müssen Bestelldaten aus Shopify manuell in unser ERP-System übertragen. Das kostet drei Mitarbeiter jeweils zwei Stunden am Tag. Also sechs Arbeitsstunden jeden Tag nur für Datenübertragung."

> Lisa wird nach dem aktuellen Tech-Stack fragen.

**Thomas:** "Wir nutzen seit zwei Jahren Zapier, aber das wird ehrlich gesagt immer teurer. Wir haben inzwischen über fünftausend Tasks im Monat und die Kosten explodieren."

> Lisa wird nach der Teamgröße fragen.

**Thomas:** "Wir sind insgesamt ungefähr achtzig Mitarbeiter."

> Lisa wird nach dem Zeitrahmen fragen.

**Thomas:** "Das ist dringend. Wir wollen das innerhalb der nächsten vier Wochen umstellen."

> Lisa wird nach dem Budget fragen.

**Thomas:** "Das Budget steht. Wir haben da schon einen fünfstelligen Betrag für ein Automations-Projekt freigegeben. Enterprise-Lizenzen sind kein Problem."

---

### Phase 3: Einwand (Schritt 3 – Terminangebot)

> Lisa wird den Mehrwert zusammenfassen und einen Termin vorschlagen: "Wissen Sie was, ich hätte da eine Idee: Wollen wir mal einen kurzen Demo-Termin machen?"

**Thomas:** "Klingt grundsätzlich interessant, aber ich bin mir nicht sicher, ob sich der Wechsel wirklich lohnt. Wir haben ja schon alles in Zapier aufgebaut."

> Lisa wird den Einwand behandeln mit dem "Nutzen bereits Sähpier"-Pattern: Kostenersparnis bei hohem Volumen, keine Migration nötig, etc. (Einwandbehandlung Versuch 1 von max. 2)

**Thomas:** "Okay, das klingt überzeugend. Ja, lass uns einen Termin machen."

---

### Phase 4: Terminbuchung

> Lisa sagt "Moment, ich schau mal eben schnell in den Kalender..." `[TOOL: check_availability]`
> Lisa schlägt zwei bis drei Slots vor (deutsche Wörter, kein ISO-String, z.B. "Mittwoch um vierzehn Uhr").

**Thomas:** "Der zweite Termin passt gut, den nehme ich."

> Lisa fragt nach der E-Mail: "Super! Für die Terminbestätigung bräuchte ich kurz Ihre E-Mail-Adresse."

**Thomas:** "t.weber@webshop-solutions.de"

> Lisa liest die E-Mail zurück: "t punkt weber at webshop bindestrich solutions punkt de, richtig?"
> Lisa fragt nach der Handynummer: "Und unter welcher Nummer erreichen wir Sie am besten?"

**Thomas:** "null eins sieben zwei, drei vier fünf sechs sieben acht neun."

> Lisa sagt "Alles klar, Sekunde... ich trag das mal fix ein." `[TOOL: book_appointment]`
> Lisa bestätigt: "Super, das hat geklappt! Also [Tag] um [Uhrzeit], Sie kriegen gleich noch ne Mail mit der Bestätigung."

**Thomas:** "Super, danke."

---

### Phase 5: Verabschiedung

> Lisa fasst kurz zusammen und verabschiedet sich.
> `[TOOL: save_lead_info — still, nicht angekündigt]` mit allen bekannten Daten: caller_name, company, company_size, current_stack, pain_point, timeline, budget, email, phone

**Thomas:** "Vielen Dank, das war sehr hilfreich. Bis dann!"

---

## Erwartetes Ergebnis
- **Lead-Score:** A (14-15/15)
- **Termin:** Gebucht
- **Qualification:**
  - Company Size: 3 (80 MA = Enterprise)
  - Tech Stack: 3 (Zapier-User, sucht Alternative wegen Kosten)
  - Pain Point: 3 (Konkreter Use Case, quantifizierter Zeitaufwand: 6h/Tag)
  - Timeline: 3 (Innerhalb 4 Wochen, dringend)
  - Budget: 3 (Fünfstelliges Projektbudget freigegeben, Enterprise-Lizenzen kein Problem)
- **Einwände:** "Wechselkosten von Zapier" (1 Versuch, erfolgreich behandelt)
- **Sentiment:** Positiv
- **Status:** appointment_booked

## Was dieser Test prüft
- [ ] Lisa erkennt Name + Firma aus dem Opener (fragt nicht nochmal)
- [ ] Discovery deckt alle Felder ab (ein Thema pro Turn)
- [ ] Einwandbehandlung nutzt das "Sähpier"-Pattern aus dem System Prompt
- [ ] `check_availability` wird nach Terminzustimmung aufgerufen
- [ ] `book_appointment` wird nach Slot-Auswahl + Kontaktdaten aufgerufen
- [ ] `save_lead_info` wird still am Ende aufgerufen (nicht angekündigt)
- [ ] E-Mail wird zurückgelesen zur Bestätigung
- [ ] Post-Call Scoring ergibt A-Lead (14-15/15)
- [ ] Termine werden als deutsche Wörter vorgelesen (nicht ISO-Strings)

## Tipps für die Aufnahme
- Ruhige Umgebung, kein Hintergrundlärm
- Natürlich sprechen, nicht wörtlich ablesen – die Sätze oben sind Richtwerte
- Kleine Pausen einbauen bevor du antwortest (wirkt authentischer)
- Lisa braucht manchmal 1-2 Sekunden zum Antworten, einfach warten
- Wenn Lisa etwas Unerwartetes fragt: einfach als Thomas improvisieren
- 2-3 Takes aufnehmen, besten auswählen
