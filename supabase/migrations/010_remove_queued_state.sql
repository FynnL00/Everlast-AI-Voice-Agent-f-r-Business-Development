-- Remove 'queued' outbound state (replaced by NULL = never called yet)

-- Migrate existing 'queued' leads to NULL
UPDATE leads SET outbound_state = NULL WHERE outbound_state = 'queued';

-- Drop and recreate CHECK constraint without 'queued'
ALTER TABLE leads DROP CONSTRAINT leads_outbound_state_check;
ALTER TABLE leads ADD CONSTRAINT leads_outbound_state_check
  CHECK (outbound_state IN ('attempting', 'not_reached', 'callback_scheduled', 'exhausted'));
