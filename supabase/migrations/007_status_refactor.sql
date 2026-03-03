-- Migration 007: Status System Refactoring
-- Trennt Lead-Status (Pipeline) von Outbound-State (operativ) und DNC (Compliance)
-- Entfernt demo_booked und qualified aus Disposition Codes

BEGIN;

-- 1. Neues Feld: outbound_state (nullable, nur für Outbound-Leads)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS outbound_state TEXT
  CHECK (outbound_state IN ('queued', 'attempting', 'not_reached', 'callback_scheduled', 'exhausted'));

-- 2. Daten migrieren: outbound_state aus status befüllen, status auf Pipeline-Wert setzen
UPDATE leads SET outbound_state = 'queued',            status = 'new'       WHERE status = 'queued';
UPDATE leads SET outbound_state = 'attempting',         status = 'contacted' WHERE status = 'attempting';
UPDATE leads SET outbound_state = 'not_reached',        status = 'new'       WHERE status = 'not_reached';
UPDATE leads SET outbound_state = 'callback_scheduled', status = 'contacted' WHERE status = 'callback_scheduled';
UPDATE leads SET outbound_state = 'exhausted',          status = 'lost'      WHERE status = 'exhausted';

-- 3. rejected → lost
UPDATE leads SET status = 'lost' WHERE status = 'rejected';

-- 4. dnc → is_dnc=true + lost
UPDATE leads SET is_dnc = true WHERE status = 'dnc' AND is_dnc = false;
UPDATE leads SET status = 'lost' WHERE status = 'dnc';

-- 5. Status-Constraint auf 6 Pipeline-Werte
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check
  CHECK (status IN ('new', 'contacted', 'qualified', 'appointment_booked', 'converted', 'lost'));

-- 6. Disposition-Daten migrieren (demo_booked/qualified → connected)
UPDATE leads SET disposition_code = 'connected' WHERE disposition_code IN ('demo_booked', 'qualified');
UPDATE call_attempts SET disposition_code = 'connected' WHERE disposition_code IN ('demo_booked', 'qualified');

-- 7. Disposition-Constraints auf 10 Werte (beide Tabellen)
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_disposition_code_check;
ALTER TABLE leads ADD CONSTRAINT leads_disposition_code_check CHECK (
  disposition_code IN (
    'connected', 'no_answer', 'voicemail', 'busy', 'wrong_number',
    'gatekeeper', 'callback', 'not_interested', 'dnc_request', 'technical_error'
  )
);

ALTER TABLE call_attempts DROP CONSTRAINT IF EXISTS call_attempts_disposition_code_check;
ALTER TABLE call_attempts ADD CONSTRAINT call_attempts_disposition_code_check CHECK (
  disposition_code IN (
    'connected', 'no_answer', 'voicemail', 'busy', 'wrong_number',
    'gatekeeper', 'callback', 'not_interested', 'dnc_request', 'technical_error'
  )
);

-- 8. Index für outbound_state Queries
CREATE INDEX IF NOT EXISTS idx_leads_outbound_state ON leads(outbound_state)
  WHERE outbound_state IS NOT NULL;

COMMIT;
