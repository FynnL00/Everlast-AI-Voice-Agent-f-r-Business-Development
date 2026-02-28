/** Tailwind text color class based on score threshold */
export function getScoreColor(score: number): string {
  if (score >= 60) return "text-score-good";
  if (score >= 40) return "text-score-warning";
  return "text-score-danger";
}

/** Tailwind bg + text color class for badges/chips */
export function getScoreBg(score: number): string {
  if (score >= 60) return "bg-score-good-bg text-score-good";
  if (score >= 40) return "bg-score-warning-bg text-score-warning";
  return "bg-score-danger-bg text-score-danger";
}

/** CSS variable reference for inline styles (charts, SVGs) */
export function getScoreVar(score: number): string {
  if (score >= 60) return "var(--score-good)";
  if (score >= 40) return "var(--score-warning)";
  return "var(--score-danger)";
}

/** CSS glow variable reference for hover/accent effects */
export function getScoreGlowVar(score: number | null): string {
  if (score === null) return "var(--glow-neutral)";
  if (score >= 60) return "var(--glow-good)";
  if (score >= 45) return "var(--glow-warning)";
  return "var(--glow-danger)";
}

/** CSS score color variable for inline styles (border-left, accents) */
export function getScoreAccentVar(score: number | null): string {
  if (score === null) return "var(--glow-neutral)";
  if (score >= 60) return "var(--score-good)";
  if (score >= 45) return "var(--score-warning)";
  return "var(--score-danger)";
}

/** SoV color: >= 1.5x fair share = good, >= 1x = warning, < 1x = danger */
export function getSoVColor(sov: number, totalCompanies: number): string {
  const fairShare = totalCompanies > 0 ? 100 / totalCompanies : 20;
  if (sov >= fairShare * 1.5) return "text-score-good";
  if (sov >= fairShare) return "text-score-warning";
  return "text-score-danger";
}

/** SoV color as CSS variable for inline styles */
export function getSoVVar(sov: number, totalCompanies: number): string {
  const fairShare = totalCompanies > 0 ? 100 / totalCompanies : 20;
  if (sov >= fairShare * 1.5) return "var(--score-good)";
  if (sov >= fairShare) return "var(--score-warning)";
  return "var(--score-danger)";
}
