-- Migration 003: Add new status values (not_reached, rejected)
-- Extends the CHECK constraint to include statuses for leads that
-- could not be reached or explicitly rejected a demo appointment.

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check
  CHECK (status IN ('new','contacted','qualified','appointment_booked','converted','lost','not_reached','rejected'));
