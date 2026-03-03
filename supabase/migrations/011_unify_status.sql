-- Migration 011: Unify Lead Status
-- Merge outbound_state into status field, add 'not_reached' status, drop outbound_state column.

BEGIN;

-- 1. Update status CHECK constraint to include 'not_reached'
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check
  CHECK (status IN ('new', 'not_reached', 'contacted', 'qualified', 'appointment_booked', 'converted', 'lost'));

-- 2. Migrate data (with guards to avoid overwriting advanced pipeline states)
UPDATE leads SET status = 'not_reached'
  WHERE outbound_state = 'not_reached' AND status IN ('new', 'contacted');

UPDATE leads SET status = 'lost'
  WHERE outbound_state = 'exhausted' AND status NOT IN ('lost', 'converted', 'appointment_booked', 'qualified');

-- 3. Drop outbound_state index, constraint, and column
DROP INDEX IF EXISTS idx_leads_outbound_state;
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_outbound_state_check;
ALTER TABLE leads DROP COLUMN IF EXISTS outbound_state;

COMMIT;
