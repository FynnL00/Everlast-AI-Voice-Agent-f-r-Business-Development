-- n8n Voice Agent - Initial Database Schema
-- Supabase (PostgreSQL)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: leads
-- Stores all lead data from voice agent calls
-- ============================================
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Kontakt-Informationen
  caller_name TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,

  -- Qualifizierung
  company_size TEXT,
  current_stack TEXT,
  pain_point TEXT,
  timeline TEXT,

  -- Scoring (1-3 pro Kriterium)
  score_company_size INT CHECK (score_company_size BETWEEN 1 AND 3),
  score_tech_stack INT CHECK (score_tech_stack BETWEEN 1 AND 3),
  score_pain_point INT CHECK (score_pain_point BETWEEN 1 AND 3),
  score_timeline INT CHECK (score_timeline BETWEEN 1 AND 3),
  total_score INT GENERATED ALWAYS AS (
    COALESCE(score_company_size, 0) +
    COALESCE(score_tech_stack, 0) +
    COALESCE(score_pain_point, 0) +
    COALESCE(score_timeline, 0)
  ) STORED,
  lead_grade CHAR(1) CHECK (lead_grade IN ('A', 'B', 'C')),

  -- Call-Daten
  call_id TEXT UNIQUE,
  call_duration_seconds INT,
  transcript TEXT,
  conversation_summary TEXT,
  sentiment TEXT CHECK (sentiment IN ('positiv', 'neutral', 'negativ')),
  objections_raised TEXT[],
  drop_off_point TEXT,

  -- Termin
  appointment_booked BOOLEAN DEFAULT false,
  appointment_datetime TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'appointment_booked', 'converted', 'lost')),
  next_steps TEXT[]
);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX idx_leads_lead_grade ON leads(lead_grade);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_appointment_booked ON leads(appointment_booked);
CREATE INDEX idx_leads_call_id ON leads(call_id);

-- ============================================
-- Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users (dashboard)
CREATE POLICY "Allow read access for authenticated users"
  ON leads FOR SELECT
  USING (true);

-- Allow insert for service role (n8n webhooks)
CREATE POLICY "Allow insert for service role"
  ON leads FOR INSERT
  WITH CHECK (true);

-- Allow update for service role
CREATE POLICY "Allow update for service role"
  ON leads FOR UPDATE
  USING (true);

-- ============================================
-- Realtime subscription
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
