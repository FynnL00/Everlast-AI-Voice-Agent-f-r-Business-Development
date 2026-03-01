-- Add new status values: not_reached, rejected
-- Drop the existing CHECK constraint and re-create with new values

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check
  CHECK (status IN ('new','contacted','qualified','appointment_booked','converted','lost','not_reached','rejected'));
