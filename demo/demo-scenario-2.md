# Demo-Call Szenario 2 – B-Lead

## Persona
- **Name:** Sarah Müller
- **Alter:** 35
- **Rolle:** Marketing Director
- **Firma:** Digital Spark Agentur GmbH (Online-Marketing-Agentur, 25 Mitarbeiter)
- **Situation:** Arbeitet viel manuell mit Excel und Google Sheets, hat Make kurz ausprobiert aber nie richtig eingeführt. Wurde von einem Kollegen auf n8n aufmerksam gemacht. Ruft an, um sich zu erkundigen. Interesse da, aber kein akuter Druck.

## Deine exakten Sätze als Sarah

### Phase 1: Begrüßung (Schritt 1 – Opening)

> Du rufst bei n8n an. Lisa nimmt ab und spielt ihre Begrüßung.

**Lisa:** "Hallo, hier ist Lisa von n8n, schönen guten Tag! Kurzer Hinweis vorab: Dieses Gespräch wird zur Qualitätssicherung aufgezeichnet. Was kann ich für Sie tun?"

**Sarah:** "Ja, hallo! Müller hier, Digital Spark Agentur. Ein Kollege hat mir n8n empfohlen, und ich wollte mich mal erkundigen, was ihr so anbietet."

> Lisa kennt jetzt Name (Müller) und Firma (Digital Spark Agentur). Sie wird neugierig nachfragen, was der Kollege erzählt hat oder was Sarah sucht.

---

### Phase 2: Bedarfsermittlung (Schritt 2 – Discovery)

> Lisa wird nach der Branche und dem Team fragen.

**Sarah:** "Wir sind eine Online-Marketing-Agentur. Insgesamt sind wir fünfundzwanzig Leute, davon arbeiten acht im Kampagnen-Team."

> Lisa wird nach dem aktuellen Tech-Stack fragen.

**Sarah:** "Wir haben letztes Jahr mal Make ausprobiert für ein kleines Projekt, aber das hat niemand richtig weiterverfolgt. Ansonsten läuft bei uns noch vieles über Excel und Google Sheets. Wir kopieren zum Beispiel Reporting-Daten händisch aus verschiedenen Plattformen zusammen."

> Lisa wird nach dem konkreten Problem fragen.

**Sarah:** "Na ja, das Reporting nervt schon. Wir ziehen Daten aus Google Ads, Meta und LinkedIn und bauen daraus jede Woche Kundenreports. Das dauert pro Kunde bestimmt eine Stunde. Und wir haben zwanzig Kunden. Es wäre schon cool, wenn das automatisch ginge."

> Lisa wird nach dem Zeitrahmen fragen.

**Sarah:** "Hmm, akut ist es nicht. Wir schauen uns gerade verschiedene Optionen an. Ich würde sagen im nächsten Quartal könnten wir damit starten, aber ich muss das noch mit der Geschäftsführung besprechen."

---

### Phase 3: Einwand (Schritt 3 – Terminangebot)

> Lisa wird den Mehrwert zusammenfassen und einen Termin vorschlagen: "Wissen Sie was, ich hätte da eine Idee: Wollen wir mal einen kurzen Demo-Termin machen?"

**Sarah:** "Ich bin mir ehrlich gesagt nicht sicher, ob wir das Ganze intern überhaupt umsetzen können. Wir haben keine Entwickler im Team."

> Lisa wird den Einwand behandeln (No-Code, visueller Editor, Community-Templates). (Einwandbehandlung Versuch 1 von max. 2)

**Sarah:** "Okay, das mit dem visuellen Editor klingt gut. Aber ich müsste das erst intern abstimmen, bevor ich einen Termin mit euch mache."

> Lisa nutzt das "Muss mein Team fragen"-Pattern aus dem System Prompt: "Ja, total! Sollen wir einfach einen Demo-Termin machen, wo Ihr Team gleich mit dabei ist?" (Einwandbehandlung Versuch 2 von max. 2)

**Sarah:** "Na gut, ein kurzes Gespräch kann ja nicht schaden. Dann kann ich das auch besser intern vorstellen."

---

### Phase 4: Terminbuchung

> Lisa sagt "Moment, ich schau mal eben schnell in den Kalender..." `[TOOL: check_availability]`
> Lisa schlägt zwei bis drei Slots vor.

**Sarah:** "Haben Sie auch was am Nachmittag? Vormittags ist bei uns immer voll mit Kundenterminen."

> Lisa bietet Nachmittags-Slots an (falls verfügbar) oder erklärt was es gibt.

**Sarah:** "Okay, dann nehme ich den letzten Termin."

> Lisa fragt nach der E-Mail: "Super! Für die Terminbestätigung bräuchte ich kurz Ihre E-Mail-Adresse."

**Sarah:** "s.mueller@digitalspark.de"

> Lisa liest zurück und fragt nach der Handynummer.

**Sarah:** "Null eins sieben eins, zwei drei vier fünf sechs sieben acht."

> Lisa sagt "Alles klar, Sekunde... ich trag das mal fix ein." `[TOOL: book_appointment]`
> Lisa bestätigt den Termin.

**Sarah:** "Alles klar, danke."

---

### Phase 5: Verabschiedung

> Lisa verabschiedet sich freundlich.
> `[TOOL: save_lead_info — still, nicht angekündigt]`

**Sarah:** "Danke für die Infos, das war hilfreich. Tschüss!"

---

## Erwartetes Ergebnis
- **Lead-Score:** B (8/12)
- **Termin:** Gebucht
- **Qualification:**
  - Company Size: 2 (25 MA = SMB)
  - Tech Stack: 2 (Make kurz ausprobiert, aber hauptsächlich manuell)
  - Pain Point: 2 (Reporting-Problem erkannt, aber nicht akut quantifiziert)
  - Timeline: 2 (Nächstes Quartal, Budget noch nicht genehmigt)
- **Einwände:** "Keine Entwickler im Team", "Muss intern abstimmen"
- **Sentiment:** Neutral bis leicht positiv
- **Drop-off-Risiko:** CLOSING (zögerte beim Termin)
- **Status:** appointment_booked

## Unterschiede zu Szenario 1 (Thomas Weber)

| Aspekt | Thomas (A-Lead) | Sarah (B-Lead) |
|--------|-----------------|-----------------|
| Firmengröße | 80 MA (Enterprise) | 25 MA (SMB) |
| Tech-Stack | Zapier Power-User | Make kurz getestet |
| Pain Point | 6h/Tag Zeitverlust, quantifiziert | "Nervt schon", nicht quantifiziert |
| Timeline | 4 Wochen, Budget genehmigt | Nächstes Quartal, muss abstimmen |
| Einwand | Wechselkosten | Fehlendes Know-how + interne Abstimmung |
| Score | 11-12/12 | 8/12 |

## Was dieser Test prüft
- [ ] Lisa führt die Discovery vollständig durch (ein Thema pro Turn)
- [ ] Einwandbehandlung nutzt die passenden Patterns aus dem System Prompt
- [ ] Maximal 2 Einwandbehandlungs-Versuche
- [ ] Lisa geht auf Nachmittags-Präferenz ein (Flexibilität)
- [ ] `check_availability`, `book_appointment`, `save_lead_info` werden korrekt aufgerufen
- [ ] Post-Call Scoring ergibt B-Lead (7-9/12)

## Tipps für die Aufnahme
- Sarah ist freundlich aber unentschlossen – nicht zu begeistert klingen
- Bewusst vage bleiben bei Zahlen und Zeitangaben
- Kleine Denkpausen einbauen ("Hmm...", "Na ja...")
- Beim Einwand zögerlich klingen, dann langsam überzeugen lassen
- Etwas schneller sprechen als Thomas – Sarah ist jünger und dynamischer
