-- Migration 008: Scoring Evidence Columns
-- Links quotes to scoring dimensions with their score values

ALTER TABLE lead_quotes
  ADD COLUMN IF NOT EXISTS scoring_dimension TEXT
    CHECK (scoring_dimension IN (
      'company_size','tech_stack','pain_point','timeline',
      'engagement','sentiment','objection','general'
    ));

ALTER TABLE lead_quotes
  ADD COLUMN IF NOT EXISTS score_value INT CHECK (score_value BETWEEN 1 AND 3);

CREATE INDEX IF NOT EXISTS idx_quotes_lead_dimension ON lead_quotes(lead_id, scoring_dimension);
