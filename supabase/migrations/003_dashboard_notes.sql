-- Migration 003: Dashboard Notes & KI-Briefing Support
-- Adds fields for manual notes from sales team and cached AI-generated briefings

-- Manual notes from sales team (editable from dashboard)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT;

-- AI-generated demo briefing (cached to avoid repeated API calls)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS briefing TEXT;

-- Timestamp when briefing was last generated (for cache invalidation)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS briefing_generated_at TIMESTAMPTZ;
