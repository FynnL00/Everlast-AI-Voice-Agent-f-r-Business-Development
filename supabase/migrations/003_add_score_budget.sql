-- Migration 003: Add budget scoring dimension
-- Adds score_budget (1-3) as 5th scoring dimension, updates total_score and lead_grade computation

-- 1. Add budget text field (if not exists)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS budget TEXT;

-- 2. Add score_budget scoring column
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_budget INT CHECK (score_budget BETWEEN 1 AND 3);

-- 3. Recreate total_score GENERATED column to include score_budget
--    Must drop and re-add because GENERATED ALWAYS expression can't be altered
ALTER TABLE leads DROP COLUMN IF EXISTS total_score;
ALTER TABLE leads ADD COLUMN total_score INT GENERATED ALWAYS AS (
  COALESCE(score_company_size, 0) +
  COALESCE(score_tech_stack, 0) +
  COALESCE(score_pain_point, 0) +
  COALESCE(score_timeline, 0) +
  COALESCE(score_budget, 0)
) STORED;

-- 4. Update lead_grade trigger to include score_budget and new thresholds
--    New range: 5-15 (5 dimensions x 1-3 points)
--    A: 13-15, B: 9-12, C: 5-8
CREATE OR REPLACE FUNCTION compute_lead_grade()
RETURNS TRIGGER AS $$
DECLARE
  computed_score INT;
BEGIN
  computed_score := COALESCE(NEW.score_company_size, 0) +
                    COALESCE(NEW.score_tech_stack, 0) +
                    COALESCE(NEW.score_pain_point, 0) +
                    COALESCE(NEW.score_timeline, 0) +
                    COALESCE(NEW.score_budget, 0);

  -- Only compute grade if at least one score is set
  IF NEW.score_company_size IS NOT NULL OR
     NEW.score_tech_stack IS NOT NULL OR
     NEW.score_pain_point IS NOT NULL OR
     NEW.score_timeline IS NOT NULL OR
     NEW.score_budget IS NOT NULL THEN
    IF computed_score >= 13 THEN
      NEW.lead_grade := 'A';
    ELSIF computed_score >= 9 THEN
      NEW.lead_grade := 'B';
    ELSE
      NEW.lead_grade := 'C';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
