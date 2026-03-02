# Demo-Call Szenario 3 – C-Lead / Graceful Exit

## Edge Case
Testet: Niedrige Scores, **kein Termin gebucht**, Graceful-Exit-Flow, `save_lead_info` wird trotzdem aufgerufen.

## Persona
- **Name:** Lukas Vogel
- **Alter:** 28
- **Rolle:** Freelance Webentwickler
- **Firma:** Selbstständig (1 Person)
- **Situation:** Hat einen Blog-Artikel über n8n gelesen und ruft aus Neugier an. Kein konkretes Problem, kein Budget, kein Zeitdruck. Will sich "nur mal informieren".

## Deine exakten Sätze als Lukas

### Phase 1: Begrüßung

> Lisa ruft an. Du nimmst ab.

**Lukas:** "Hallo?"

> Lisa wird sich vorstellen, den Grund für den Anruf nennen und fragen, ob du kurz Zeit hast.

**Lukas:** "Ja, kurz schon. n8n, sagt mir was – ich hab da neulich was drüber gelesen. Aber ich bin nur Freelancer, weiß nicht ob das was für mich ist."

---

### Phase 2: Bedarfsermittlung

> Lisa wird nach einem konkreten Prozess fragen, den er automatisieren möchte.

**Lukas:** "Hmm, nichts Konkretes eigentlich. Ich arbeite als Freelancer und mache Webentwicklung. Manchmal denke ich, es wäre cool, ein paar Sachen zu automatisieren, aber ich hab mich noch nicht wirklich damit beschäftigt."

> Lisa wird nach seinem Tech-Stack fragen.

**Lukas:** "Nee, ich mach eigentlich alles händisch. Also E-Mails, Rechnungen, Kundenverwaltung – alles manuell. Hatte noch nie ein Automation-Tool."

> Lisa wird nach Unternehmensgröße / Branche fragen.

**Lukas:** "Bin nur ich, also Einzelunternehmer. Ab und zu arbeite ich mit ein, zwei Freelancern zusammen, aber meistens allein."

> Lisa wird nach dem Zeitrahmen fragen.

**Lukas:** "Zeitrahmen? Nee, gar keiner. Ich schaue mich einfach mal um. Ist auch keine Eile."

---

### Phase 3: Pitch + Ablehnung

> Lisa wird trotzdem den Mehrwert von n8n pitchen und einen Termin vorschlagen.

**Lukas:** "Klingt schon interessant, aber ehrlich gesagt brauche ich das gerade nicht. Für einen Ein-Mann-Betrieb ist das etwas oversized."

> Lisa wird einen zweiten Anlauf machen (Einwandbehandlung).

**Lukas:** "Nee, wirklich. Ich merke mir das mal vor, aber aktuell ist das nichts für mich."

---

### Phase 4: Graceful Exit (kein Termin)

> Lisa sollte jetzt den Graceful-Exit einleiten: Info-Material anbieten und nach E-Mail fragen.

**Lukas:** "Klar, schicken Sie gerne was. Die E-Mail ist lukas@vogeldev.de."

> Lisa wird save_lead_info aufrufen und sich verabschieden.

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

## Tipps für die Aufnahme
- Entspannt und locker klingen – Lukas hat kein Problem, er ist nur neugierig
- Bei den Ablehnungen freundlich aber bestimmt sein
- Nicht unhöflich – einfach kein Bedarf
