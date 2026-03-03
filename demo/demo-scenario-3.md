# Demo-Call Szenario 3 – C-Lead / Graceful Exit

## Edge Case
Testet: Niedrige Scores, **kein Termin gebucht**, Graceful-Exit-Flow, `save_lead_info` wird trotzdem aufgerufen.

## Persona
- **Name:** Lukas Vogel
- **Alter:** 28
- **Rolle:** Freelance Webentwickler
- **Firma:** Selbstständig (1 Person)
- **Situation:** Hat einen Blogartikel über n8n gelesen und ruft aus Neugier an. Kein konkretes Problem, kein Budget, kein Zeitdruck. Will sich "nur mal informieren".

## Deine exakten Sätze als Lukas

### Phase 1: Begrüßung (Schritt 1 – Opening)

> Du rufst bei n8n an. Lisa nimmt ab und spielt ihre Begrüßung.

**Lisa:** "Hallo, hier ist Lisa von n8n, schönen guten Tag! Kurzer Hinweis vorab: Dieses Gespräch wird zur Qualitätssicherung aufgezeichnet. Was kann ich für Sie tun?"

**Lukas:** "Ah ja, hallo! Ich hab neulich nen Blogartikel über n8n gelesen und wollte mich mal erkundigen. Aber ich bin nur Freelancer, weiß nicht ob das was für mich ist."

> Lisa wird neugierig nachfragen, was ihn interessiert hat.

---

### Phase 2: Bedarfsermittlung (Schritt 2 – Discovery)

> Lisa wird nach einem konkreten Prozess fragen, den er automatisieren möchte.

**Lukas:** "Hmm, nichts Konkretes eigentlich. Ich arbeite als Freelancer und mache Webentwicklung. Manchmal denke ich, es wäre cool, ein paar Sachen zu automatisieren, aber ich hab mich noch nicht wirklich damit beschäftigt."

> Lisa wird nach seinem aktuellen Tech-Stack fragen.

**Lukas:** "Nee, ich mach eigentlich alles händisch. Also E-Mails, Rechnungen, Kundenverwaltung – alles manuell. Hatte noch nie ein Automation-Tool."

> Lisa wird nach Teamgröße fragen.

**Lukas:** "Bin nur ich, also Einzelunternehmer. Ab und zu arbeite ich mit ein, zwei Freelancern zusammen, aber meistens allein."

> Lisa wird nach dem Zeitrahmen fragen.

**Lukas:** "Zeitrahmen? Nee, gar keiner. Ich schaue mich einfach mal um. Ist auch keine Eile."

---

### Phase 3: Terminangebot + Ablehnung (Schritt 3)

> Lisa wird trotzdem den Mehrwert von n8n pitchen und einen Demo-Termin vorschlagen: "Wissen Sie was, ich hätte da eine Idee: Wollen wir mal einen kurzen Demo-Termin machen?"

**Lukas:** "Klingt schon interessant, aber ehrlich gesagt brauche ich das gerade nicht. Für einen Ein-Mann-Betrieb ist das etwas oversized."

> Lisa wird einen zweiten Anlauf machen (Einwandbehandlung, Versuch 1 von max. 2).

**Lukas:** "Nee, wirklich. Ich merke mir das mal vor, aber aktuell ist das nichts für mich."

> Nach 2 gescheiterten Versuchen leitet Lisa den Graceful Exit ein.

---

### Phase 4: Graceful Exit (kein Termin)

> Lisa bietet Info-Material an: "Soll ich Ihnen mal unsere Fallstudien rüberschicken per Mail?"

**Lukas:** "Klar, schicken Sie gerne was. Die E-Mail ist lukas@vogeldev.de."

> Lisa bestätigt die E-Mail und verabschiedet sich freundlich.
> `[TOOL: save_lead_info — still, nicht angekündigt]` mit allen bekannten Daten: caller_name="Lukas Vogel", company_size="1", current_stack="manuell", pain_point="nur informierend", timeline="kein Zeitrahmen", email="lukas@vogeldev.de"

**Lukas:** "Alles klar, danke für die Infos. Tschüss!"

---

## Erwartetes Ergebnis
- **Lead-Score:** C (4/12)
- **Termin:** Nicht gebucht
- **Qualification:**
  - Company Size: 1 (Freelancer, 1 Person)
  - Tech Stack: 1 (Keine Automation-Erfahrung)
  - Pain Point: 1 (Nur informierend, kein konkreter Bedarf)
  - Timeline: 1 (Kein Zeitrahmen)
- **Einwände:** "Brauche das gerade nicht", "Für Ein-Mann-Betrieb oversized"
- **Sentiment:** Neutral
- **Status:** contacted (nicht qualified)
- **Drop-off-Point:** CLOSING

## Was dieser Test prüft
- [ ] Lisa erkennt, dass kein Termin zustande kommt und leitet den Graceful Exit ein
- [ ] Lisa bietet Info-Material / Fallstudien an (statt weiter zu pushen)
- [ ] `save_lead_info` wird trotzdem aufgerufen (auch bei C-Leads!)
- [ ] `check_availability` und `book_appointment` werden NICHT aufgerufen
- [ ] Post-Call Scoring ergibt korrekten C-Lead (4-5 Punkte)
- [ ] Lisa beendet das Gespräch freundlich und ohne Druck
- [ ] Maximal 2 Einwandbehandlungs-Versuche (nicht mehr)

## Tipps für die Aufnahme
- Entspannt und locker klingen – Lukas hat kein Problem, er ist nur neugierig
- Bei den Ablehnungen freundlich aber bestimmt sein
- Nicht unhöflich – einfach kein Bedarf
