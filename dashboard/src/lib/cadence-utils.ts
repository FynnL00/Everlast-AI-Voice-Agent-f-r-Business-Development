import type { Lead, CallAttempt, CadenceConfig, DispositionCode } from "./types";

// --- Sales Psychology Cadence ---
// Day offsets based on proven B2B cold calling patterns:
// Day 0: Initial contact
// Day 1: Quick follow-up (recency bias)
// Day 3: Give space, stay present
// Day 5: Mid-week, fresh approach
// Day 8: New week, new context
// Day 12: Final attempt before escalation
export const DEFAULT_CADENCE_DAYS = [0, 1, 3, 5, 8, 12];
export const DEFAULT_MAX_ATTEMPTS = 6;

export type CadenceStepState =
  | "completed_success"
  | "completed_no_answer"
  | "completed_other"
  | "current"
  | "upcoming"
  | "skipped";

export interface CadenceStep {
  stepNumber: number;
  state: CadenceStepState;
  plannedDate: Date;
  actualDate: Date | null;
  disposition: DispositionCode | null;
  duration: number | null;
  dayOffset: number;
  direction: "inbound" | "outbound" | null;
  notes: string | null;
}

const SUCCESS_DISPOSITIONS: DispositionCode[] = ["connected"];
const NO_ANSWER_DISPOSITIONS: DispositionCode[] = [
  "no_answer",
  "busy",
  "voicemail",
];

function getStepState(disposition: DispositionCode): CadenceStepState {
  if (SUCCESS_DISPOSITIONS.includes(disposition)) return "completed_success";
  if (NO_ANSWER_DISPOSITIONS.includes(disposition)) return "completed_no_answer";
  return "completed_other";
}

function intervalsMinutesToDayOffsets(intervals: number[]): number[] {
  const offsets = [0];
  let cumulative = 0;
  for (const minutes of intervals) {
    cumulative += minutes;
    offsets.push(cumulative / 1440); // 1440 minutes per day
  }
  return offsets;
}

export function computeCadenceSteps(
  lead: Lead,
  attempts: CallAttempt[],
  cadenceConfig?: CadenceConfig | null
): CadenceStep[] {
  const maxAttempts = cadenceConfig?.max_attempts ?? DEFAULT_MAX_ATTEMPTS;

  const dayOffsets =
    cadenceConfig?.intervals_minutes
      ? intervalsMinutesToDayOffsets(cadenceConfig.intervals_minutes).slice(0, maxAttempts)
      : DEFAULT_CADENCE_DAYS.slice(0, maxAttempts);

  // Pad if needed
  while (dayOffsets.length < maxAttempts) {
    const last = dayOffsets[dayOffsets.length - 1] ?? 0;
    dayOffsets.push(last + 4);
  }

  // Sort attempts by attempt_number ascending
  const sorted = [...attempts].sort(
    (a, b) => a.attempt_number - b.attempt_number
  );

  // Anchor date = first attempt or lead creation
  const anchorDate =
    sorted.length > 0
      ? new Date(sorted[0].created_at)
      : new Date(lead.created_at);

  const isExhausted = lead.status === "lost";
  const completedCount = sorted.length;

  const steps: CadenceStep[] = [];

  for (let i = 0; i < maxAttempts; i++) {
    const stepNumber = i + 1;
    const dayOffset = dayOffsets[i] ?? 0;
    const plannedDate = new Date(
      anchorDate.getTime() + dayOffset * 24 * 60 * 60 * 1000
    );

    const matchingAttempt = sorted.find((a) => a.attempt_number === stepNumber);

    if (matchingAttempt) {
      steps.push({
        stepNumber,
        state: getStepState(matchingAttempt.disposition_code),
        plannedDate,
        actualDate: new Date(matchingAttempt.created_at),
        disposition: matchingAttempt.disposition_code,
        duration: matchingAttempt.duration_seconds,
        dayOffset,
        direction: matchingAttempt.direction,
        notes: matchingAttempt.notes,
      });
    } else if (!isExhausted && stepNumber === completedCount + 1) {
      steps.push({
        stepNumber,
        state: "current",
        plannedDate,
        actualDate: null,
        disposition: null,
        duration: null,
        dayOffset,
        direction: null,
        notes: null,
      });
    } else if (isExhausted || stepNumber <= completedCount) {
      steps.push({
        stepNumber,
        state: "skipped",
        plannedDate,
        actualDate: null,
        disposition: null,
        duration: null,
        dayOffset,
        direction: null,
        notes: null,
      });
    } else {
      steps.push({
        stepNumber,
        state: "upcoming",
        plannedDate,
        actualDate: null,
        disposition: null,
        duration: null,
        dayOffset,
        direction: null,
        notes: null,
      });
    }
  }

  return steps;
}

const EARLY_STATUSES: Lead["status"][] = ["new", "not_reached", "contacted"];

export function isEarlyStage(lead: Lead): boolean {
  return EARLY_STATUSES.includes(lead.status);
}
