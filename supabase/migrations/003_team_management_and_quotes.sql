-- Migration 003: Team Management & Quotes
-- Applied: 2026-03-01

-- Team Members Tabelle
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'sales_rep' CHECK (role IN ('sales_rep', 'manager', 'admin')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Lead-Zuweisung
ALTER TABLE leads ADD COLUMN assigned_to UUID REFERENCES team_members(id);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);

-- Zitate-Tabelle
CREATE TABLE lead_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  quote_text TEXT NOT NULL,
  speaker TEXT CHECK (speaker IN ('agent', 'caller')),
  topic TEXT,
  sentiment TEXT CHECK (sentiment IN ('positiv', 'neutral', 'negativ')),
  context TEXT
);

CREATE INDEX idx_quotes_lead_id ON lead_quotes(lead_id);
CREATE INDEX idx_quotes_sentiment ON lead_quotes(sentiment);

-- RLS fuer neue Tabellen
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_team_members" ON team_members FOR SELECT USING (true);
CREATE POLICY "service_role_write_team" ON team_members FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE lead_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read_quotes" ON lead_quotes FOR SELECT USING (true);
CREATE POLICY "service_role_write_quotes" ON lead_quotes FOR ALL USING (auth.role() = 'service_role');

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE team_members;
ALTER PUBLICATION supabase_realtime ADD TABLE lead_quotes;
