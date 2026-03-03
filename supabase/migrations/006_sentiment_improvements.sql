-- Migration 006: Sentiment-Verbesserungen
-- Numerischer Score + Begründung für feingranulare Sentiment-Analyse

-- Numerischer Sentiment-Score (0.0 = sehr negativ, 1.0 = sehr positiv)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS sentiment_score REAL
  CHECK (sentiment_score >= 0 AND sentiment_score <= 1);

-- Begründung der Sentiment-Einschätzung
ALTER TABLE leads ADD COLUMN IF NOT EXISTS sentiment_reason TEXT;

-- Quotes-Tabelle analog erweitern
ALTER TABLE lead_quotes ADD COLUMN IF NOT EXISTS sentiment_score REAL
  CHECK (sentiment_score >= 0 AND sentiment_score <= 1);

-- Index für Score-basierte Abfragen
CREATE INDEX IF NOT EXISTS idx_leads_sentiment_score
  ON leads(sentiment_score) WHERE sentiment_score IS NOT NULL;
