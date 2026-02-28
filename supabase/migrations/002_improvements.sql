-- Migration 002: Security, Consistency & Schema Improvements
-- Fixes identified in deep review analysis

-- ============================================
-- 1. FIX RLS POLICIES (CRITICAL)
-- Previous policies used USING(true) for all operations,
-- allowing ANY client (including anon) to INSERT/UPDATE.
-- Now: Only service_role can write, anon/authenticated can read.
-- ============================================

-- Drop overly permissive write policies
DROP POLICY IF EXISTS "Allow insert for service role" ON leads;
DROP POLICY IF EXISTS "Allow update for service role" ON leads;

-- Restrict INSERT to service_role only (n8n webhooks use service_role key)
CREATE POLICY "service_role_insert"
  ON leads FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Restrict UPDATE to service_role only
CREATE POLICY "service_role_update"
  ON leads FOR UPDATE
  USING (auth.role() = 'service_role');

-- Add DELETE policy (was missing entirely)
CREATE POLICY "service_role_delete"
  ON leads FOR DELETE
  USING (auth.role() = 'service_role');

-- NOTE: SELECT policy "Allow read access for authenticated users" remains
-- with USING(true) intentionally — the dashboard uses the anon key to read.
-- For production, this should be restricted to authenticated users only.

-- ============================================
-- 2. AUTO-COMPUTE lead_grade VIA TRIGGER (HIGH)
-- Previously lead_grade was manually set, creating
-- inconsistency risk with the computed total_score.
-- Now: Trigger auto-computes grade from individual scores.
-- ============================================

CREATE OR REPLACE FUNCTION compute_lead_grade()
RETURNS TRIGGER AS $$
DECLARE
  computed_score INT;
BEGIN
  computed_score := COALESCE(NEW.score_company_size, 0) +
                    COALESCE(NEW.score_tech_stack, 0) +
                    COALESCE(NEW.score_pain_point, 0) +
                    COALESCE(NEW.score_timeline, 0);

  -- Only compute grade if at least one score is set
  IF NEW.score_company_size IS NOT NULL OR
     NEW.score_tech_stack IS NOT NULL OR
     NEW.score_pain_point IS NOT NULL OR
     NEW.score_timeline IS NOT NULL THEN
    IF computed_score >= 10 THEN
      NEW.lead_grade := 'A';
    ELSIF computed_score >= 7 THEN
      NEW.lead_grade := 'B';
    ELSE
      NEW.lead_grade := 'C';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_compute_grade
  BEFORE INSERT OR UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION compute_lead_grade();

-- ============================================
-- 3. NEW FIELDS (MEDIUM)
-- Additional fields for better data tracking.
-- ============================================

-- Cal.com booking ID for cancellations/updates
ALTER TABLE leads ADD COLUMN IF NOT EXISTS cal_booking_id TEXT;

-- Actual call start time (created_at != call start for post-call inserts)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS call_started_at TIMESTAMPTZ;

-- Decision maker tracking (important BANT criterion)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_decision_maker BOOLEAN;

-- ============================================
-- 4. COMPOSITE INDEX (LOW)
-- For "A-Leads today" dashboard query
-- ============================================

CREATE INDEX IF NOT EXISTS idx_leads_grade_created
  ON leads(lead_grade, created_at DESC);
