-- Migration 005: Outbound Cold Calling Transformation
-- Adds campaigns, call_attempts, dnc_list tables
-- Extends leads with outbound-specific fields
-- Updates scoring to 5 dimensions (+ score_engagement)

BEGIN;

-- ============================================
-- 1. TABLE: campaigns
-- ============================================
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Identität
  name TEXT NOT NULL,
  description TEXT,

  -- Lifecycle
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),

  -- Ownership
  created_by UUID REFERENCES team_members(id),
  assigned_agent_id TEXT,

  -- Zeitplanung
  start_date DATE,
  end_date DATE,
  calling_window_start TIME DEFAULT '09:00',
  calling_window_end TIME DEFAULT '18:00',
  calling_timezone TEXT DEFAULT 'Europe/Berlin',
  calling_days INT[] DEFAULT '{1,2,3,4,5}',

  -- Cadence
  cadence_config JSONB NOT NULL DEFAULT '{
    "max_attempts": 5,
    "intervals_minutes": [60, 240, 1440, 4320, 10080],
    "voicemail_action": "skip",
    "leave_voicemail_after_attempt": 3
  }'::jsonb,

  -- Zielgruppen-Filter
  target_filter JSONB,

  -- Denormalisierte Metriken
  total_leads INT DEFAULT 0,
  leads_called INT DEFAULT 0,
  leads_connected INT DEFAULT 0,
  leads_converted INT DEFAULT 0,

  -- Prompt Overrides
  system_prompt_override TEXT,
  first_message_override TEXT
);

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON campaigns FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaigns_read" ON campaigns FOR SELECT USING (true);
CREATE POLICY "campaigns_service_write" ON campaigns FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "campaigns_service_update" ON campaigns FOR UPDATE
  USING (auth.role() = 'service_role');
CREATE POLICY "campaigns_service_delete" ON campaigns FOR DELETE
  USING (auth.role() = 'service_role');

ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;

-- ============================================
-- 2. TABLE: call_attempts
-- ============================================
CREATE TABLE call_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),

  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id),
  call_id TEXT,

  attempt_number INT NOT NULL,
  disposition_code TEXT NOT NULL CHECK (disposition_code IN (
    'connected', 'no_answer', 'voicemail', 'busy', 'wrong_number',
    'gatekeeper', 'callback', 'not_interested', 'dnc_request',
    'demo_booked', 'qualified', 'technical_error'
  )),

  duration_seconds INT,
  direction TEXT NOT NULL DEFAULT 'outbound'
    CHECK (direction IN ('inbound', 'outbound')),

  -- Outcome-Details
  gatekeeper_name TEXT,
  callback_datetime TIMESTAMPTZ,
  notes TEXT,

  -- Vapi Metadata
  ended_reason TEXT,
  recording_url TEXT
);

CREATE INDEX idx_call_attempts_lead_id ON call_attempts(lead_id, created_at DESC);
CREATE INDEX idx_call_attempts_campaign_id ON call_attempts(campaign_id);
CREATE INDEX idx_call_attempts_disposition ON call_attempts(disposition_code);
CREATE INDEX idx_call_attempts_call_id ON call_attempts(call_id);

ALTER TABLE call_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "call_attempts_read" ON call_attempts FOR SELECT USING (true);
CREATE POLICY "call_attempts_service_write" ON call_attempts FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "call_attempts_service_update" ON call_attempts FOR UPDATE
  USING (auth.role() = 'service_role');

ALTER PUBLICATION supabase_realtime ADD TABLE call_attempts;

-- ============================================
-- 3. TABLE: dnc_list
-- ============================================
CREATE TABLE dnc_list (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  phone TEXT,
  email TEXT,

  reason TEXT NOT NULL CHECK (reason IN (
    'manual', 'ai_detected', 'customer_request',
    'legal', 'wrong_number', 'competitor'
  )),

  source_call_id TEXT,
  source_lead_id UUID REFERENCES leads(id),
  added_by UUID REFERENCES team_members(id),

  notes TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,

  CONSTRAINT dnc_phone_or_email CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

CREATE UNIQUE INDEX idx_dnc_phone ON dnc_list(phone)
  WHERE phone IS NOT NULL AND is_active = true;
CREATE UNIQUE INDEX idx_dnc_email ON dnc_list(email)
  WHERE email IS NOT NULL AND is_active = true;
CREATE INDEX idx_dnc_created_at ON dnc_list(created_at DESC);

CREATE TRIGGER dnc_list_updated_at
  BEFORE UPDATE ON dnc_list FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

ALTER TABLE dnc_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dnc_read" ON dnc_list FOR SELECT USING (true);
CREATE POLICY "dnc_service_write" ON dnc_list FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "dnc_service_update" ON dnc_list FOR UPDATE
  USING (auth.role() = 'service_role');
CREATE POLICY "dnc_service_delete" ON dnc_list FOR DELETE
  USING (auth.role() = 'service_role');

ALTER PUBLICATION supabase_realtime ADD TABLE dnc_list;

-- ============================================
-- 4. EXTEND leads TABLE
-- ============================================

-- Kampagnen-Zuordnung
ALTER TABLE leads ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id);

-- Call-Richtung
ALTER TABLE leads ADD COLUMN IF NOT EXISTS call_direction TEXT
  DEFAULT 'inbound' CHECK (call_direction IN ('inbound', 'outbound'));

-- Letzte Disposition
ALTER TABLE leads ADD COLUMN IF NOT EXISTS disposition_code TEXT
  CHECK (disposition_code IN (
    'connected', 'no_answer', 'voicemail', 'busy', 'wrong_number',
    'gatekeeper', 'callback', 'not_interested', 'dnc_request',
    'demo_booked', 'qualified', 'technical_error'
  ));

-- Outbound Cadence Tracking
ALTER TABLE leads ADD COLUMN IF NOT EXISTS call_attempts INT DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_call_attempt_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_call_scheduled_at TIMESTAMPTZ;

-- Voicemail & Gatekeeper
ALTER TABLE leads ADD COLUMN IF NOT EXISTS voicemail_left BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS gatekeeper_name TEXT;

-- Callback
ALTER TABLE leads ADD COLUMN IF NOT EXISTS callback_datetime TIMESTAMPTZ;

-- Connection-Qualität
ALTER TABLE leads ADD COLUMN IF NOT EXISTS time_to_connect_seconds INT;

-- DNC
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_dnc BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS dnc_reason TEXT;

-- Recording
ALTER TABLE leads ADD COLUMN IF NOT EXISTS recording_url TEXT;

-- Engagement Score (5. Scoring-Dimension)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_engagement INT
  CHECK (score_engagement BETWEEN 1 AND 3);

-- Compliance
ALTER TABLE leads ADD COLUMN IF NOT EXISTS legal_basis TEXT;

-- Lead-Quelle
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_source TEXT
  DEFAULT 'inbound_call'
  CHECK (lead_source IN ('csv_import', 'manual', 'inbound_call', 'api'));

-- Smart Cadence
ALTER TABLE leads ADD COLUMN IF NOT EXISTS follow_up_reason TEXT;

-- ============================================
-- 5. STATUS CONSTRAINT ERWEITERN
-- ============================================
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads ADD CONSTRAINT leads_status_check CHECK (
  status IN (
    'new', 'contacted', 'qualified', 'appointment_booked',
    'converted', 'lost', 'not_reached', 'rejected',
    'queued', 'attempting', 'exhausted', 'callback_scheduled', 'dnc'
  )
);

-- ============================================
-- 6. total_score NEU BERECHNEN (5 Dimensionen)
-- ============================================
ALTER TABLE leads DROP COLUMN IF EXISTS total_score;
ALTER TABLE leads ADD COLUMN total_score INT GENERATED ALWAYS AS (
  COALESCE(score_company_size, 0) +
  COALESCE(score_tech_stack, 0) +
  COALESCE(score_pain_point, 0) +
  COALESCE(score_timeline, 0) +
  COALESCE(score_engagement, 0)
) STORED;

-- ============================================
-- 7. compute_lead_grade() DUAL-MODE TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION compute_lead_grade()
RETURNS TRIGGER AS $$
DECLARE
  computed_score INT;
  has_any_score BOOLEAN;
BEGIN
  computed_score := COALESCE(NEW.score_company_size, 0) +
                    COALESCE(NEW.score_tech_stack, 0) +
                    COALESCE(NEW.score_pain_point, 0) +
                    COALESCE(NEW.score_timeline, 0) +
                    COALESCE(NEW.score_engagement, 0);

  has_any_score := NEW.score_company_size IS NOT NULL OR
                   NEW.score_tech_stack IS NOT NULL OR
                   NEW.score_pain_point IS NOT NULL OR
                   NEW.score_timeline IS NOT NULL OR
                   NEW.score_engagement IS NOT NULL;

  IF has_any_score THEN
    -- Legacy Inbound (ohne Engagement): alte Grenzen (max 12)
    IF NEW.score_engagement IS NULL THEN
      IF computed_score >= 10 THEN NEW.lead_grade := 'A';
      ELSIF computed_score >= 7 THEN NEW.lead_grade := 'B';
      ELSE NEW.lead_grade := 'C';
      END IF;
    -- Outbound (mit Engagement): neue Grenzen (max 15)
    ELSE
      IF computed_score >= 12 THEN NEW.lead_grade := 'A';
      ELSIF computed_score >= 8 THEN NEW.lead_grade := 'B';
      ELSE NEW.lead_grade := 'C';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. is_dnc() PRÜFFUNKTION
-- ============================================
CREATE OR REPLACE FUNCTION is_dnc(p_phone TEXT, p_email TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM dnc_list
    WHERE is_active = true
      AND (expires_at IS NULL OR expires_at > now())
      AND (
        (phone IS NOT NULL AND phone = p_phone)
        OR (email IS NOT NULL AND p_email IS NOT NULL AND email = p_email)
      )
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 9. NEUE INDIZES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_next_call ON leads(next_call_scheduled_at ASC)
  WHERE next_call_scheduled_at IS NOT NULL AND is_dnc = false;
CREATE INDEX IF NOT EXISTS idx_leads_disposition ON leads(disposition_code);
CREATE INDEX IF NOT EXISTS idx_leads_call_direction ON leads(call_direction);

-- Partial unique index für CSV-Import Duplikaterkennung
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_phone_unique ON leads(phone)
  WHERE phone IS NOT NULL;

COMMIT;
