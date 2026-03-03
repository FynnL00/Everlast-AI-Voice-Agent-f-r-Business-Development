-- Migration 009: Add drop_off scoring dimension for conversation drop-off quotes

ALTER TABLE lead_quotes
  DROP CONSTRAINT IF EXISTS lead_quotes_scoring_dimension_check;

ALTER TABLE lead_quotes
  ADD CONSTRAINT lead_quotes_scoring_dimension_check
  CHECK (scoring_dimension IN (
    'company_size','tech_stack','pain_point','timeline',
    'engagement','sentiment','objection','drop_off','general'
  ));
